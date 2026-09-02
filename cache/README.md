# Caching

Redis-backed caching for read (`GET`) endpoints. Two independent questions decide what happens on any given request, and they're kept deliberately separate:

1. **Is this endpoint even allowed to be cached, and for how long?** — a static, business-reasoned decision (`config.js`).
2. **Is this *specific* resource popular enough right now to actually bother caching?** — a dynamic, traffic-driven decision (`hotness.js`).

TTL answers "how fast does this data go stale." Popularity answers "is anyone asking for it repeatedly enough that caching it saves real work." Conflating the two is a common mistake — a rarely-viewed post shouldn't get cached just because `/posts/:id` as a route is busy in aggregate, and a hot resource's TTL shouldn't get longer just because it's popular.

## Files

| File | Responsibility |
|---|---|
| `../db/redis.js` | The Redis client (singleton, mirrors `db/sequelize.js`) |
| `config.js` | Which endpoints are eligible, their TTL, and how to build their cache key |
| `hotness.js` | Per-resource request counter — decides if a resource is "hot" |
| `version.js` | Version counters, for invalidating list-style caches without `SCAN` |
| `cacheMiddleware.js` | The read path — wired into route files as `cacheRoute('name')` |
| `invalidate.js` | The write path — called from controllers right after a mutation |

## How a request flows through it

```
GET request → cacheMiddleware
  1. Build the "hotness key" for this exact resource (config.buildKeyBase)
  2. Increment its hit counter for this window (hotness.js)
  3. Below threshold? → skip caching entirely, X-Cache: SKIP, hit the DB normally
  4. At/above threshold (hot):
       - Resolve the storage key (hotness key, +version suffix if versioned)
       - Cache hit  → X-Cache: HIT,  return cached JSON, DB never touched
       - Cache miss → X-Cache: MISS, let the controller run, cache its
                       response on the way out
```

The `X-Cache` response header (`SKIP` / `MISS` / `HIT`) is there for exactly this kind of debugging — check it in Postman/curl to see what actually happened.

**Hotness is tracked on the un-versioned base key, never the storage key.** If it were tracked on the versioned key, every invalidating mutation would reset a resource's popularity to zero, and a frequently-edited-but-popular resource (an active community's post feed, say) would rarely accumulate enough hits to ever get cached at all.

## What's cached, and why

| Endpoint | TTL | Reasoning | Invalidation |
|---|---|---|---|
| `GET /communities` | 30s | Rarely changes, not personalized | TTL only |
| `GET /communities/:name` | 30s | Changes only on update/delete/join/leave | Direct delete |
| `GET /communities/:name/members` | 20s | Changes on join/leave | Version bump |
| `GET /communities/:name/posts` | 15s | The "subreddit front page" — classic read-heavy case, reads vastly outnumber writes | Version bump on post create/delete |
| `GET /posts/:id` (includes comments) | 10s | High read-to-write ratio, but score/comments change often enough to need a short TTL | Direct delete on post edit/delete, any vote, any comment create/update/delete |
| `GET /posts/:id/comments` | 10s | Same reasoning as above | Same triggers |
| `GET /users/:username` | 60s | Profile data barely changes | Direct delete on that user's own profile update |
| `GET /users/:username/posts` | 30s | Changes only when that user posts/deletes a post | Version bump |
| `GET /users/:username/comments` | 30s | Changes only when that user comments/deletes a comment | Version bump |
| `GET /feed` | 30s | Personalized (keyed per-user) — see note below | TTL only |

**Never cached, deliberately:**
- Every `POST`/`PATCH`/`PUT`/`DELETE` — caching a write doesn't mean anything here.
- `GET /users/me` — low request volume per user, and you expect to see your own just-made edit immediately. The correctness risk isn't worth the benefit.
- `GET /audit-logs` — an audit trail is read for its freshness, not its speed, and it isn't a hot path.

## The two invalidation strategies

**Direct delete** — for single-resource views where there's exactly one canonical cache key (a post, a community, a user profile). The mutation deletes that one key immediately. Simple, precise, no staleness window at all beyond the moment the write commits.

**Version bump** — for list views (a community's posts, sorted N ways × paginated M ways). There's no single key to delete — potentially dozens of sort/page combinations could be cached at once. Instead, each mutation increments a small counter (`version:<namespace>` in Redis), and that counter is baked into every list cache key for that namespace. Bumping it doesn't touch the old cached pages at all — they simply stop being looked up (nothing will ever ask for `:v3` again once the counter is `4`) and expire naturally via their own TTL. This avoids Redis `SCAN`/pattern-delete, which is a known anti-pattern in production (it can block the whole Redis instance on a large keyspace).

## Known, deliberate limitation: the feed has no active invalidation

`GET /feed` is personalized (cache key includes the requesting user's id), so it only ever speeds up repeat requests from the *same* user — pagination, pull-to-refresh — not shared traffic across everyone the way `GET /communities/:name/posts` is. That's still worth caching, but it's a different economic case.

More importantly: correctly invalidating it would mean, the instant a new post lands in a community, fanning out to bump the feed cache for *every member of that community* — potentially thousands of writes to Redis for one post creation. That cost was judged not worth it here, so the feed relies on its 30s TTL alone. A user can see a stale feed for up to 30 seconds after a new post appears in a community they're in. This is a conscious tradeoff, not an oversight.

## Configuration

Set in `.env`:

```
REDIS_URL=redis://localhost:6379
CACHE_HOT_THRESHOLD=5        # requests needed within the window to be "hot"
CACHE_HOT_WINDOW_SECONDS=60  # the rolling window (fixed-window approximation)
```

`CACHE_HOT_THRESHOLD`/`CACHE_HOT_WINDOW_SECONDS` are global defaults, not per-route — every eligible endpoint currently shares the same hotness bar. Per-route overrides would be a small, natural extension of `config.js` (each entry could carry its own `threshold`/`windowSeconds`) if some endpoint ever needed a different bar — nothing about the design assumes a single global threshold, it's just what's configured today.

## Adding a new cached endpoint

1. Add an entry to `routes` in `config.js`: `ttlSeconds`, `buildKeyBase(req)`, and `versionNamespace(req)` if it's a list-style view.
2. Wire `cacheRoute('yourEntryName')` into the route file, before the controller.
3. If anything mutates the data that endpoint reads, call the matching `invalidate*` helper (or add a new one to `invalidate.js`) right after that mutation commits.

## Resilience

Every Redis operation in `cacheMiddleware.js` and `invalidate.js` is wrapped so a Redis failure (unreachable, timeout, whatever) never breaks the actual request — a caching error just falls through to serving the request uncached, or leaves a cache entry stale until its TTL expires. Caching should only ever make things faster; it should never be a new way for the API to go down.
