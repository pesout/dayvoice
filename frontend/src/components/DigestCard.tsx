import type { Digest } from "@/mocks/data";

interface DigestCardProps {
  digest: Digest;
  onClick: () => void;
}

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DigestCard({ digest, onClick }: DigestCardProps) {
  const count = digest.recordingIds.length;
  const label = count === 1 ? "nahrávka" : count < 5 ? "nahrávky" : "nahrávek";

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card rounded-2xl shadow-surface p-4 transition-all duration-200 ease-smooth hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-foreground">
            {formatDateLong(digest.date)}
          </p>
          <p className="text-sm text-muted-foreground">{digest.dayName}</p>
        </div>
        <span className="text-sm text-primary font-medium">
          {count} {label}
        </span>
      </div>
    </button>
  );
}
