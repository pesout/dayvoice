import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <Icon size={64} className="text-muted-foreground opacity-30 mb-4" />
      <p className="text-foreground font-medium text-lg">{title}</p>
      {description && (
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
