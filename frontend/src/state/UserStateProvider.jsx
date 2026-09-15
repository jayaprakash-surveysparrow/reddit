import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/authContext';
import { UserStateContext } from './userStateContext';

// The API exposes no `user_vote` on posts/comments and no `is_member` on communities,
// so the caller's own vote direction and joined communities are only knowable from the
// responses to their own mutations. We persist that per user to survive reloads.
const EMPTY = { votes: { post: {}, comment: {} }, memberships: [] };

function storageKey(userId) {
  return `reddit_clone_user_state:${userId}`;
}

function readState(userId) {
  if (!userId) return EMPTY;
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      votes: {
        post: parsed?.votes?.post ?? {},
        comment: parsed?.votes?.comment ?? {},
      },
      memberships: Array.isArray(parsed?.memberships) ? parsed.memberships : [],
    };
  } catch {
    return EMPTY;
  }
}

export function UserStateProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [state, setState] = useState(() => readState(userId));

  useEffect(() => {
    setState(readState(userId));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(state));
    } catch {
      // Storage unavailable; vote/membership hints stay in memory for this session.
    }
  }, [userId, state]);

  const value = useMemo(
    () => ({
      getVote: (kind, id) => state.votes[kind]?.[id],
      applyVote: (kind, id, next) =>
        setState((current) => {
          const kindVotes = { ...current.votes[kind] };
          if (next) kindVotes[id] = next;
          else delete kindVotes[id];
          return { ...current, votes: { ...current.votes, [kind]: kindVotes } };
        }),
      memberships: state.memberships,
      isMember: (name) => state.memberships.includes(name),
      setMembership: (name, joined) =>
        setState((current) => {
          const has = current.memberships.includes(name);
          if (joined === has) return current;
          return {
            ...current,
            memberships: joined
              ? [...current.memberships, name].sort((a, b) => a.localeCompare(b))
              : current.memberships.filter((entry) => entry !== name),
          };
        }),
      // The personalized feed only contains communities the caller has joined, so the
      // community names it returns are a reliable source of membership hints.
      noteMemberships: (names) =>
        setState((current) => {
          const missing = names.filter((name) => name && !current.memberships.includes(name));
          if (!missing.length) return current;
          return {
            ...current,
            memberships: [...current.memberships, ...missing].sort((a, b) => a.localeCompare(b)),
          };
        }),
    }),
    [state]
  );

  return <UserStateContext.Provider value={value}>{children}</UserStateContext.Provider>;
}
