import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, MicOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type RecorderState = "idle" | "recording" | "processing" | "error";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const MAX_DURATION = 30 * 60;

export function AudioRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop();
    mediaRecorder.current?.stream.getTracks().forEach((t) => t.stop());
    mediaRecorder.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const handleProcess = useCallback(() => {
    setState("processing");
    setElapsed(0);
    // TODO: napojit na API (POST /recordings — odeslání audio souboru)
    setTimeout(() => {
      navigate("/recordings/rec-1");
    }, 2000);
  }, [navigate]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorder.current = recorder;
      recorder.start();
      setState("recording");
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= MAX_DURATION) {
            stopRecording();
            handleProcess();
            toast("Nahrávka dosáhla maximální délky 30 minut a byla automaticky ukončena.");
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      recorder.onstop = () => {
        handleProcess();
      };
    } catch {
      setState("error");
    }
  }, [stopRecording, handleProcess]);

  const handleMicClick = useCallback(() => {
    if (state === "idle" || state === "error") {
      startRecording();
    } else if (state === "recording") {
      stopRecording();
    }
  }, [state, startRecording, stopRecording]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorder.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6">
        <div className="bg-card rounded-2xl shadow-surface p-8 text-center max-w-xs w-full">
          <MicOff size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-foreground font-medium mb-1">
            Přístup k mikrofonu zamítnut
          </p>
          <p className="text-sm text-muted-foreground mb-6 text-pretty">
            Pro nahrávání potřebujeme přístup k mikrofonu. Povol ho v nastavení prohlížeče.
          </p>
          <button
            onClick={() => setState("idle")}
            className="btn-gradient text-primary-foreground rounded-xl px-6 py-2.5 text-sm font-medium"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  if (state === "processing") {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <Loader2 size={40} className="text-primary opacity-50 animate-spin" />
        <p className="text-sm text-muted-foreground">Zpracovávám nahrávku...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6">
      <button
        onClick={handleMicClick}
        disabled={state === "processing"}
        className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-200 ease-smooth ${
          state === "recording"
            ? "bg-destructive shadow-mic-active animate-recording-pulse"
            : "btn-gradient shadow-surface hover:shadow-mic-active hover:scale-105"
        }`}
      >
        {state === "recording" ? (
          <Square size={36} className="text-destructive-foreground" />
        ) : (
          <Mic size={36} className="text-primary-foreground" />
        )}
      </button>

      {state === "recording" ? (
        <div className="text-center">
          <p className="text-2xl font-mono font-bold text-foreground">
            {formatTime(elapsed)}
          </p>
          <p className="text-sm text-destructive mt-1">Nahrávám...</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Klikni a mluv</p>
      )}
    </div>
  );
}
