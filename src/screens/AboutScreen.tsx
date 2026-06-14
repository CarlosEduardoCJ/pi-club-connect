import { Link } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const AboutScreen = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/settings" className="hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-extrabold tracking-tight">Sobre o App</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 flex flex-col gap-4">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-[var(--radius)] p-6 text-center"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">PI Club</h2>
          <p className="text-sm text-muted-foreground">Versão 1.0.0</p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card rounded-[var(--radius)] p-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-sm text-foreground leading-relaxed">
            PI Club é a plataforma oficial de clubes escolares do estado do Piauí.
            Conecte-se com colegas, participe de clubes, acompanhe competições
            acadêmicas e olimpíadas, e interaja em tempo real com sua comunidade escolar.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card rounded-[var(--radius)] p-6 flex items-center justify-center"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <a
            href="https://www.instagram.com/_pi_club?igsh=NmVyOTFqem03Ymk1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <InstagramIcon className="w-5 h-5" />
            Siga-nos no Instagram
          </a>
        </motion.section>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-sm italic text-muted-foreground mt-auto pt-8"
        >
          Isso também é seu, Zetasu.
        </motion.p>
      </main>
    </div>
  );
};

export default AboutScreen;
