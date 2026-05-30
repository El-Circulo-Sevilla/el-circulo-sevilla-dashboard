import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface DraggablePersonCardProps {
  id: string;
  name: string;
  email: string;
  age?: number;
  interests: string[];
  compatibilityScore?: number;
  attendanceStatus: string;
  disabled?: boolean;
}

export const DraggablePersonCard = ({
  id,
  name,
  email,
  age,
  interests,
  compatibilityScore,
  attendanceStatus,
  disabled = false,
}: DraggablePersonCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border border-brand-200 bg-white p-3 transition-all',
        isDragging ? 'shadow-xl ring-2 ring-brand-400' : 'shadow-sm',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-grab active:cursor-grabbing',
      )}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink">{name}</p>
          <p className="text-xs text-mute">{email}</p>
        </div>
        <Badge variant="info">{attendanceStatus.toUpperCase()}</Badge>
      </div>

      <div className="mt-2 grid gap-1 text-xs text-mute">
        <p>Edad: {age ?? '-'}</p>
        <p>Intereses: {interests.join(', ')}</p>
        {compatibilityScore ? <p>Compatibilidad: {compatibilityScore}%</p> : null}
      </div>
    </article>
  );
};
