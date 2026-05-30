import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DroppablePersonListProps {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const DroppablePersonList = ({
  id,
  title,
  subtitle,
  children,
}: DroppablePersonListProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'rounded-2xl border border-brand-200 bg-brand-50 p-4 transition-colors',
        isOver && 'border-brand-400 bg-brand-100',
      )}
    >
      <header className="mb-3">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <p className="text-xs text-mute">{subtitle}</p>
      </header>
      <div className="grid gap-2">{children}</div>
    </section>
  );
};
