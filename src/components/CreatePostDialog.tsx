import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PenSquare } from 'lucide-react';
import { useClubs } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const CreatePostDialog = () => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [clubId, setClubId] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: clubs } = useClubs();
  const { profileId } = useAuth();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!content.trim() || !clubId || !profileId) {
      toast.error('Preencha todos os campos');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('posts').insert({
      content: content.trim(),
      club_id: clubId,
      author_id: profileId,
    });
    setLoading(false);
    if (error) {
      toast.error('Erro ao publicar');
      return;
    }
    toast.success('Post publicado!');
    setContent('');
    setClubId('');
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
          <PenSquare className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Post</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <Select value={clubId} onValueChange={setClubId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um clube" />
            </SelectTrigger>
            <SelectContent>
              {(clubs || []).map((club) => (
                <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="O que você quer compartilhar?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSubmit} disabled={loading || !content.trim() || !clubId}>
            {loading ? 'Publicando...' : 'Publicar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
