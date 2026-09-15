import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { compactNumber } from '../../lib/format';

const SCORE_TONES = {
  1: 'text-upvote',
  '-1': 'text-downvote',
  0: 'text-content',
};

export function VoteControl({
  value,
  score,
  onVote,
  disabled = false,
  orientation = 'vertical',
  size = 'md',
}) {
  const iconClass = size === 'sm' ? 'size-4' : 'size-5';
  const vertical = orientation === 'vertical';

  return (
    <div
      className={
        vertical ? 'flex flex-col items-center gap-0.5' : 'flex items-center gap-0.5'
      }
    >
      <button
        type="button"
        aria-label="Upvote"
        aria-pressed={value === 1}
        disabled={disabled}
        onClick={() => onVote(1)}
        className={`rounded p-1 transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50 ${
          value === 1 ? 'text-upvote' : 'text-muted hover:text-upvote'
        }`}
      >
        <ArrowBigUp
          aria-hidden="true"
          className={iconClass}
          fill={value === 1 ? 'currentColor' : 'none'}
        />
      </button>

      <span
        className={`text-center text-xs font-bold tabular-nums ${SCORE_TONES[value] ?? 'text-content'} ${
          vertical ? 'min-w-8' : 'min-w-6'
        }`}
      >
        {compactNumber(score)}
      </span>

      <button
        type="button"
        aria-label="Downvote"
        aria-pressed={value === -1}
        disabled={disabled}
        onClick={() => onVote(-1)}
        className={`rounded p-1 transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50 ${
          value === -1 ? 'text-downvote' : 'text-muted hover:text-downvote'
        }`}
      >
        <ArrowBigDown
          aria-hidden="true"
          className={iconClass}
          fill={value === -1 ? 'currentColor' : 'none'}
        />
      </button>
    </div>
  );
}
