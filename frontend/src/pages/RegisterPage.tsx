import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { api } from "@/lib/api";

const schema = z.object({
  email: z.string().trim().email("Zadej platný email"),
  password: z.string().min(8, "Heslo musí mít alespoň 8 znaků"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Hesla se neshodují",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await api.register(form.email, form.password);
      navigate("/login", { state: { flash: "Registrace proběhla úspěšně. Teď se přihlas." } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registrace se nezdařila";
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
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

        <div className="bg-background rounded-2xl shadow-surface p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Vytvoř si účet</h2>
          {errors.form && (
            <div className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm mb-4 text-center">
              {errors.form}
            </div>
          )}
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
                placeholder="Heslo (min. 8 znaků)"
                value={form.password}
                onChange={set("password")}
                className={`w-full px-4 py-3 rounded-xl border text-sm bg-background text-foreground placeholder:text-muted-foreground transition-colors ${
                  errors.password ? "border-destructive" : "border-input"
                }`}
              />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>
            <div>
              <input
                type="password"
                placeholder="Zopakuj heslo"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                className={`w-full px-4 py-3 rounded-xl border text-sm bg-background text-foreground placeholder:text-muted-foreground transition-colors ${
                  errors.confirmPassword ? "border-destructive" : "border-input"
                }`}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl btn-gradient text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Zaregistrovat se
            </button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Už máš účet?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Přihlas se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
