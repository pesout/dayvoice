import { Trash2 } from "lucide-react";
import type { Recording } from "@/lib/api";

interface RecordingCardProps {
  recording: Recording;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }) + ", " + d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
}

export function RecordingCard({ recording, onClick, onDelete }: RecordingCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card rounded-2xl shadow-surface p-4 transition-all duration-200 ease-smooth hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            {formatDate(recording.createdAt)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDuration(recording.durationSeconds)}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
          className="p-2 -m-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          aria-label="Smazat nahrávku"
        >
          <Trash2 size={16} />
        </button>
      </div>
      {recording.summary && (
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 text-pretty">
          {recording.summary}
        </p>
      )}
    </button>
  );
}
