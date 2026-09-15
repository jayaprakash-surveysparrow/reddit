import { useVote } from '../votes/useVote';
import { VoteControl } from '../votes/VoteControl';

export function PostVote({ post, orientation = 'vertical', size = 'md' }) {
  const { value, score, vote, isPending } = useVote('post', post);
  return (
    <VoteControl
      value={value}
      score={score}
      onVote={vote}
      disabled={isPending}
      orientation={orientation}
      size={size}
    />
  );
}
