import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Loader2 } from "lucide-react";
import { api, type Recording } from "@/lib/api";
import { RecordingCard } from "@/components/RecordingCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getRecordings()
      .then(setRecordings)
      .catch(() => toast.error("Nepodařilo se načíst nahrávky"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteRecording(deleteId);
      setRecordings((prev) => prev.filter((r) => r.id !== deleteId));
    } catch {
      toast.error("Smazání se nezdařilo");
    }
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-[480px] mx-auto">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Nahrávky</h1>
      </header>
      <main className="flex-1 px-5 pb-20">
        {loading ? (
          <div className="flex justify-center pt-12">
            <Loader2 size={32} className="text-primary animate-spin" />
          </div>
        ) : recordings.length === 0 ? (
          <EmptyState
            icon={Mic}
            title="Zatím nemáš žádné nahrávky."
            description="Klikni na mikrofon a nahraj svou první poznámku!"
            action={
              <button
                onClick={() => navigate("/")}
                className="btn-gradient text-primary-foreground rounded-xl px-6 py-2.5 text-sm font-medium"
              >
                Nahrát
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {recordings.map((rec) => (
              <RecordingCard
                key={rec.id}
                recording={rec}
                onClick={() => navigate(`/recordings/${rec.id}`)}
                onDelete={() => setDeleteId(rec.id)}
              />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
      <ConfirmDialog
        open={!!deleteId}
        title="Smazat nahrávku?"
        description="Opravdu chceš smazat tuto nahrávku? Tato akce je nevratná."
        confirmLabel="Smazat"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
