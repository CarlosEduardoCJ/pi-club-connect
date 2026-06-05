import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

const getDevIdentity = (email: string) => {
  const base = email.split("@")[0]?.trim().toLowerCase() || "developer";
  const safeBase = base.replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 24) || "developer";
  const suffix = crypto.randomUUID().slice(0, 8);

  return {
    name: safeBase,
    username: `${safeBase}-${suffix}`,
  };
};

export default function DevSetupScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"master" | "form">("master");
  const [masterPassword, setMasterPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const identity = getDevIdentity(email);
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            ...identity,
            dev_setup_password: masterPassword,
          },
          emailRedirectTo: `${window.location.origin}/dev-login`,
        },
      });

      if (error) throw error;

      await supabase.auth.signOut();
      toast.success("Conta desenvolvedor criada com sucesso.");
      navigate("/dev-login", { replace: true });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Configurar Desenvolvedor</CardTitle>
        </CardHeader>
        <CardContent>
          {step === "master" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!masterPassword) return;
                setStep("form");
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="master">Senha mestra</Label>
                <Input id="master" type="password" value={masterPassword} onChange={(e) => setMasterPassword(e.target.value)} required autoFocus />
              </div>
              <Button type="submit" className="w-full">Continuar</Button>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha (mín. 8)</Label>
                <Input id="password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Criando..." : "Criar conta desenvolvedor"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
