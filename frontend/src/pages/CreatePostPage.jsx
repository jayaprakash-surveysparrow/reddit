import { useParams } from 'react-router-dom';
import { PostForm } from '../features/posts/PostForm';

export function CreatePostPage() {
  const { communityName } = useParams();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-3 border-b border-line pb-3 text-lg font-bold text-content">
        Create a post
      </h1>
      <PostForm
        mode="create"
        defaultCommunity={communityName ?? ''}
        lockCommunity={Boolean(communityName)}
      />
    </div>
  );
}
