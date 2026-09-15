import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { removePostVote, votePost } from '../../api/posts';
import { removeCommentVote, voteComment } from '../../api/comments';
import { useAuth } from '../../auth/authContext';
import { getErrorMessage } from '../../lib/errors';
import { useUserState } from '../../state/userStateContext';
import { useToast } from '../../toast/toastContext';

const ACTIONS = {
  post: { cast: votePost, remove: removePostVote },
  comment: { cast: voteComment, remove: removeCommentVote },
};

export function useVote(kind, target) {
  const { user } = useAuth();
  const { getVote, applyVote } = useUserState();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const overlay = getVote(kind, target.id);
  const value = overlay?.value ?? 0;
  const score = overlay?.score ?? target.score ?? 0;

  const mutation = useMutation({
    mutationFn: (next) =>
      next === 0 ? ACTIONS[kind].remove(target.id) : ACTIONS[kind].cast(target.id, next),
    onMutate: (next) => {
      applyVote(kind, target.id, { value: next, score: score + (next - value) });
      return { previous: overlay ?? null };
    },
    onError: (error, _next, context) => {
      applyVote(kind, target.id, context?.previous ?? null);
      toast.error(getErrorMessage(error));
    },
    onSuccess: (data, next) => {
      applyVote(kind, target.id, { value: data?.value ?? next, score: data?.score ?? score });
    },
  });

  const vote = (direction) => {
    if (!user) {
      toast.info('Log in to vote on posts and comments.');
      navigate('/login', { state: { from: location } });
      return;
    }
    if (mutation.isPending) return;
    mutation.mutate(value === direction ? 0 : direction);
  };

  return { value, score, vote, isPending: mutation.isPending };
}
