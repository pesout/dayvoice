import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic } from "lucide-react";
import { mockRecordings, type Recording } from "@/mocks/data";
import { RecordingCard } from "@/components/RecordingCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { BottomNav } from "@/components/BottomNav";

export default function RecordingsPage() {
  // TODO: napojit na API (GET /recordings)
  const [recordings, setRecordings] = useState<Recording[]>(mockRecordings);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDelete = () => {
    if (!deleteId) return;
    // TODO: napojit na API (DELETE /recordings/:id)
    setRecordings((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-[480px] mx-auto">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Nahrávky</h1>
      </header>
      <main className="flex-1 px-5 pb-20">
        {recordings.length === 0 ? (
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
