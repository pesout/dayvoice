import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Play, FileText, Sparkles } from "lucide-react";
import { mockRecordings } from "@/mocks/data";
import { TabSwitcher, type TabItem } from "@/components/TabSwitcher";
import { TodoList } from "@/components/TodoList";
import { BottomNav } from "@/components/BottomNav";

const tabs: TabItem[] = [
  { id: "audio", label: "Audio", icon: Play },
  { id: "transcript", label: "Přepis", icon: FileText },
  { id: "summary", label: "Shrnutí", icon: Sparkles },
];

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

export default function RecordingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("audio");

  // TODO: napojit na API (GET /recordings/:id)
  const recording = mockRecordings.find((r) => r.id === id);

  if (!recording) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Nahrávka nenalezena.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-[480px] mx-auto">
      <header className="flex items-center px-3 pt-4 pb-2">
        <button
          onClick={() => navigate("/recordings")}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="flex-1 text-center text-sm font-medium text-foreground">
          {formatDate(recording.createdAt)}
        </span>
        <div className="w-10" />
      </header>

      <div className="px-5 mb-4">
        <TabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <main className="flex-1 px-5 pb-20">
        {activeTab === "audio" && (
          <div className="space-y-3">
            <audio controls className="w-full rounded-xl" src={recording.audioUrl}>
              Audio soubor není k dispozici.
            </audio>
            <p className="text-sm text-muted-foreground">
              Délka: {formatDuration(recording.durationSeconds)}
            </p>
          </div>
        )}

        {activeTab === "transcript" && (
          <div>
            {recording.transcript ? (
              <p className="text-base leading-relaxed text-foreground text-pretty">
                {recording.transcript}
              </p>
            ) : (
              <p className="text-muted-foreground">Nebyl rozpoznán žádný text.</p>
            )}
          </div>
        )}

        {activeTab === "summary" && (
          <div className="space-y-6">
            {recording.summary && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Shrnutí</h3>
                <div className="space-y-1.5">
                  {recording.summary.split(/[.–—]/).filter(Boolean).map((point, i) => (
                    <div key={i} className="flex gap-2 text-sm text-foreground">
                      <span className="text-primary mt-0.5">›</span>
                      <span className="text-pretty">{point.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {recording.todos.length > 0 && (
              <TodoList todos={recording.todos} storageKey={`todos-rec-${recording.id}`} />
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
