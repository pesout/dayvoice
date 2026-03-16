import { Logo } from "@/components/Logo";
import { AudioRecorder } from "@/components/AudioRecorder";
import { BottomNav } from "@/components/BottomNav";

export default function RecordPage() {
  return (
    <div className="flex flex-col min-h-screen max-w-[480px] mx-auto">
      <header className="px-5 pt-6 pb-2">
        <Logo size="sm" />
      </header>
      <main className="flex-1 flex flex-col px-5">
        <AudioRecorder />
      </main>
      <div className="h-16" />
      <BottomNav />
    </div>
  );
}
