import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDeveloper } from '@/hooks/useDeveloper';
import { useSchoolView } from '@/hooks/useSchoolView';

const DevSchoolSelector = () => {
  const { isDeveloper, loading } = useDeveloper();
  const { selectedSchool, setSelectedSchool } = useSchoolView();
  const [schools, setSchools] = useState<string[]>([]);

  useEffect(() => {
    if (!isDeveloper) return;
    supabase
      .from('schools')
      .select('name')
      .order('name')
      .then(({ data }) => {
        setSchools((data || []).map((s: any) => s.name));
      });
  }, [isDeveloper]);

  if (loading || !isDeveloper) return null;

  return (
    <div
      className="flex items-center gap-2 bg-card rounded-[var(--radius)] p-3 mb-4 border border-accent/30"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <Eye className="w-4 h-4 text-accent shrink-0" />
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Modo desenvolvedor — visualizar como
        </span>
        <select
          value={selectedSchool ?? ''}
          onChange={(e) => setSelectedSchool(e.target.value || null)}
          className="bg-transparent text-sm text-foreground outline-none mt-0.5"
        >
          <option value="">Minha escola (padrão)</option>
          {schools.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DevSchoolSelector;
