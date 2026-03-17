import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Loader2 } from "lucide-react";
import { api, type Digest } from "@/lib/api";
import { DigestCard } from "@/components/DigestCard";
import { EmptyState } from "@/components/EmptyState";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";

export default function DigestsPage() {
  const navigate = useNavigate();
  const [digests, setDigests] = useState<Digest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDigests()
      .then(setDigests)
      .catch(() => toast.error("Nepodařilo se načíst přehledy"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen max-w-[480px] mx-auto">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Denní přehledy</h1>
      </header>
      <main className="flex-1 px-5 pb-20">
        {loading ? (
          <div className="flex justify-center pt-12">
            <Loader2 size={32} className="text-primary animate-spin" />
          </div>
        ) : digests.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Zatím nemáš žádné denní přehledy."
            description="Přehledy se generují automaticky ze tvých nahrávek."
          />
        ) : (
          <div className="space-y-3">
            {digests.map((digest) => (
              <DigestCard
                key={digest.id}
                digest={digest}
                onClick={() => navigate(`/digests/${digest.id}`)}
              />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
