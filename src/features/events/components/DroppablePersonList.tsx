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
        'rounded-panel border border-slate-200 bg-slate-50 p-4 transition-colors',
        isOver && 'border-teal-400 bg-teal-50',
      )}
    >
      <header className="mb-3">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </header>
      <div className="grid gap-2">{children}</div>
    </section>
  );
};
