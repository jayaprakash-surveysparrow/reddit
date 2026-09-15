import { CommentResultRow } from './CommentResultRow';
import { CommunityResultRow } from './CommunityResultRow';
import { PostResultRow } from './PostResultRow';
import { ProfileResultRow } from './ProfileResultRow';
import { ResultList } from './ResultList';

const ROW_RENDERERS = {
  posts: (item) => <PostResultRow key={item.id} post={item} />,
  communities: (item) => <CommunityResultRow key={item.id} community={item} />,
  comments: (item) => <CommentResultRow key={item.id} comment={item} />,
  profiles: (item) => <ProfileResultRow key={item.id} profile={item} />,
};

export function SearchResultGroup({ kind, items, label }) {
  const renderRow = ROW_RENDERERS[kind];
  if (!renderRow || items.length === 0) return null;
  return <ResultList label={label}>{items.map(renderRow)}</ResultList>;
}
