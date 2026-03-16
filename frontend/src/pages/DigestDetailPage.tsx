import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { mockDigests } from "@/mocks/data";
import { TodoList } from "@/components/TodoList";
import { BottomNav } from "@/components/BottomNav";

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DigestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TODO: napojit na API (GET /digests/:id)
  const digest = mockDigests.find((d) => d.id === id);

  if (!digest) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Přehled nenalezen.
      </div>
    );
  }

  const count = digest.recordingIds.length;
  const label = count === 1 ? "nahrávky" : count < 5 ? "nahrávek" : "nahrávek";

  return (
    <div className="flex flex-col min-h-screen max-w-[480px] mx-auto">
      <header className="flex items-center px-3 pt-4 pb-2">
        <button
          onClick={() => navigate("/digests")}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="flex-1 text-center text-sm font-medium text-foreground">
          {formatDateLong(digest.date)} — {digest.dayName}
        </span>
        <div className="w-10" />
      </header>

      <main className="flex-1 px-5 pb-20">
        <h1 className="text-xl font-bold text-foreground mt-2">
          {formatDateLong(digest.date)} — {digest.dayName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vytvořeno z {count} {label}
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Shrnutí dne</h3>
            <div className="space-y-1.5">
              {digest.summary.split("\n").filter(Boolean).map((line, i) => (
                <p
                  key={i}
                  className={`text-sm text-pretty ${
                    line.startsWith("•")
                      ? "text-foreground pl-1"
                      : "text-muted-foreground"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          {digest.todos.length > 0 && (
            <TodoList todos={digest.todos} storageKey={`todos-digest-${digest.id}`} />
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
