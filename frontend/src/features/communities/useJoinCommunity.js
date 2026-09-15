import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { joinCommunity, leaveCommunity } from '../../api/communities';
import { useAuth } from '../../auth/authContext';
import { getErrorMessage, getErrorStatus } from '../../lib/errors';
import { queryKeys } from '../../lib/queryKeys';
import { useUserState } from '../../state/userStateContext';
import { useToast } from '../../toast/toastContext';

export function useJoinCommunity(name) {
  const { user } = useAuth();
  const { isMember, setMembership } = useUserState();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const joined = isMember(name);

  // The direction travels as the mutation variable rather than being read from
  // this closure: onMutate flips the membership optimistically, which re-renders
  // this hook, and a closure-based mutationFn would then call the opposite endpoint.
  const mutation = useMutation({
    mutationFn: (nextJoined) => (nextJoined ? joinCommunity(name) : leaveCommunity(name)),
    onMutate: (nextJoined) => {
      const previous = isMember(name);
      setMembership(name, nextJoined);
      return { previous };
    },
    onSuccess: (data, nextJoined) => {
      if (data?.name) queryClient.setQueryData(queryKeys.community(name), data);
      else queryClient.invalidateQueries({ queryKey: queryKeys.community(name) });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      toast.success(nextJoined ? `You joined r/${name}.` : `You left r/${name}.`);
    },
    onError: (error, nextJoined, context) => {
      // 409 means the server already holds the state we optimistically moved to,
      // so the optimistic value is correct and must be kept.
      if (getErrorStatus(error) === 409) {
        toast.info(
          nextJoined
            ? `You are already a member of r/${name}.`
            : `You were not a member of r/${name}.`
        );
        queryClient.invalidateQueries({ queryKey: queryKeys.community(name) });
        return;
      }
      setMembership(name, context?.previous ?? joined);
      toast.error(getErrorMessage(error));
    },
  });

  const toggle = () => {
    if (!user) {
      toast.info('Log in to join communities.');
      navigate('/login', { state: { from: location } });
      return;
    }
    if (mutation.isPending) return;
    mutation.mutate(!isMember(name));
  };

  return { joined, toggle, isPending: mutation.isPending };
}
