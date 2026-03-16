import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { mockDigests } from "@/mocks/data";
import { DigestCard } from "@/components/DigestCard";
import { EmptyState } from "@/components/EmptyState";
import { BottomNav } from "@/components/BottomNav";

export default function DigestsPage() {
  const navigate = useNavigate();
  // TODO: napojit na API (GET /digests)
  const digests = mockDigests;

  return (
    <div className="flex flex-col min-h-screen max-w-[480px] mx-auto">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Denní přehledy</h1>
      </header>
      <main className="flex-1 px-5 pb-20">
        {digests.length === 0 ? (
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
