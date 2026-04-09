import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    id: string;
    name: string;
    username: string;
    bio: string | null;
    grade: string | null;
    avatar: string | null;
  };
}

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2);

const EditProfileDialog = ({ open, onOpenChange, profile }: EditProfileDialogProps) => {
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio || '');
  const [grade, setGrade] = useState(profile.grade || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx. 2MB)');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error('Erro ao enviar foto');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
    setUploading(false);
    toast.success('Foto atualizada!');
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Nome não pode ficar vazio');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        name: trimmedName,
        username: username.trim(),
        bio: bio.trim(),
        grade: grade.trim(),
        avatar: avatarUrl || null,
      })
      .eq('id', profile.id);

    if (error) {
      toast.error('Erro ao salvar perfil');
    } else {
      toast.success('Perfil atualizado!');
      queryClient.invalidateQueries({ queryKey: ['profile', profile.id] });
      onOpenChange(false);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold text-primary">{getInitials(name)}</span>
              )}
              <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-background" />
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs font-semibold text-accent hover:underline"
            >
              {uploading ? 'Enviando...' : 'Alterar foto'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* Fields */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="Seu nome" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-username">Nome de usuário</Label>
            <Input id="edit-username" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={30} placeholder="@usuario" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea id="edit-bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} placeholder="Fale um pouco sobre você..." rows={3} />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-grade">Série / Turma</Label>
            <Input id="edit-grade" value={grade} onChange={(e) => setGrade(e.target.value)} maxLength={50} placeholder="Ex: 3º ano A" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
