import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const flash = (location.state as { flash?: string } | null)?.flash;
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.email.trim()) errs.email = "Vyplň email";
    if (!form.password.trim()) errs.password = "Vyplň heslo";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    // TODO: napojit na API (POST /auth/login)
    setTimeout(() => {
      localStorage.setItem("isAuthenticated", "true");
      navigate("/");
    }, 800);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="lg" />
          <p className="text-sm text-muted-foreground mt-1">Tvůj den, tvůj hlas.</p>
        </div>

        {flash && (
          <div className="bg-success/10 text-success rounded-xl px-4 py-3 text-sm mb-4 text-center">
            {flash}
          </div>
        )}

        <div className="bg-background rounded-2xl shadow-surface p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Přihlas se</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Tvůj email"
                value={form.email}
                onChange={set("email")}
                className={`w-full px-4 py-3 rounded-xl border text-sm bg-background text-foreground placeholder:text-muted-foreground transition-colors ${
                  errors.email ? "border-destructive" : "border-input"
                }`}
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <input
                type="password"
                placeholder="Heslo"
                value={form.password}
                onChange={set("password")}
                className={`w-full px-4 py-3 rounded-xl border text-sm bg-background text-foreground placeholder:text-muted-foreground transition-colors ${
                  errors.password ? "border-destructive" : "border-input"
                }`}
              />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl btn-gradient text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Přihlásit se
            </button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Nemáš účet?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Zaregistruj se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
