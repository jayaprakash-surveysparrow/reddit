import { useVote } from '../votes/useVote';
import { VoteControl } from '../votes/VoteControl';

export function CommentVote({ comment }) {
  const { value, score, vote, isPending } = useVote('comment', comment);
  return (
    <VoteControl
      value={value}
      score={score}
      onVote={vote}
      disabled={isPending}
      orientation="horizontal"
      size="sm"
    />
  );
}
