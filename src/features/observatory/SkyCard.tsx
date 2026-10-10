import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Starfield } from '@/components/brand/Starfield';

/** Entry to the living sky from the home (§Hito8-D). */
export function SkyCard() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate('/sky')}
      className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0C0C16] to-[#07070C] p-4 text-left transition-colors hover:border-white/20"
    >
      <Starfield count={28} className="opacity-70" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="font-display text-lg text-ink">Nuestro cielo</p>
          <p className="mt-0.5 text-sm text-ink-soft">Cada momento que vivimos, una estrella.</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-ink-faint" />
      </div>
    </button>
  );
}
