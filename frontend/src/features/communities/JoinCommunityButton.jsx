import { Button } from '../../components/ui/Button';
import { useJoinCommunity } from './useJoinCommunity';

export function JoinCommunityButton({ name, size = 'sm', className = '' }) {
  const { joined, toggle, isPending } = useJoinCommunity(name);

  return (
    <Button
      variant={joined ? 'outline' : 'primary'}
      size={size}
      onClick={toggle}
      loading={isPending}
      className={className}
    >
      {joined ? 'Leave' : 'Join'}
    </Button>
  );
}
