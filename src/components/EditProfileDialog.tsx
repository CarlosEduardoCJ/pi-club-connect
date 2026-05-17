import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AvatarPicker from '@/components/AvatarPicker';
import ProfileAvatar from '@/components/ProfileAvatar';
import { buildAvatarValue, parseAvatar } from '@/lib/presetAvatars';

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
  const [avatarValue, setAvatarValue] = useState<string | null>(profile.avatar || null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const selectedPreset = parseAvatar(avatarValue);

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
        avatar: avatarValue,
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
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          {/* Avatar atual */}
          <div className="flex flex-col items-center gap-2">
            <ProfileAvatar
              src={avatarValue}
              alt={name}
              className="w-24 h-24 rounded-full"
              fallback={<span className="text-2xl font-extrabold text-primary">{getInitials(name)}</span>}
            />
            <p className="text-xs text-muted-foreground">
              {selectedPreset ? `Avatar: ${selectedPreset.label}` : 'Escolha um avatar abaixo'}
            </p>
          </div>

          {/* Galeria */}
          <div className="space-y-2">
            <Label>Galeria de avatares</Label>
            <AvatarPicker
              selectedId={selectedPreset?.id}
              onSelect={(a) => setAvatarValue(buildAvatarValue(a.id))}
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
