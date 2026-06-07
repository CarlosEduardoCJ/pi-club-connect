import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReportDialogProps {
  targetType: "post" | "message";
  targetId: string;
  trigger: React.ReactNode;
}

export default function ReportDialog({ targetType, targetId, trigger }: ReportDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!user) { toast.error("Faça login para denunciar."); return; }
    if (reason.trim().length < 5) { toast.error("Descreva o motivo (mín. 5 caracteres)."); return; }
    setLoading(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason: reason.trim().slice(0, 500),
    });
    setLoading(false);
    if (error) { toast.error("Erro ao enviar denúncia."); return; }
    toast.success("Denúncia enviada. Obrigado!");
    setOpen(false);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Denunciar {targetType === "post" ? "publicação" : "mensagem"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Textarea
            placeholder="Descreva o motivo da denúncia..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
          />
          <Button onClick={submit} disabled={loading}>{loading ? "Enviando..." : "Enviar denúncia"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
