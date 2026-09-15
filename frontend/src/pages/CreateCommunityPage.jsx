import { CommunityForm } from '../features/communities/CommunityForm';

export function CreateCommunityPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 border-b border-line pb-3">
        <h1 className="text-lg font-bold text-content">Create a community</h1>
        <p className="text-sm text-muted">
          You become its first member and can start posting right away.
        </p>
      </div>
      <CommunityForm />
    </div>
  );
}
