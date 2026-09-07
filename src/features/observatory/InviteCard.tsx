import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { GlassCard, Button, Spinner } from '@/components/ui';
import { Nedi } from '@/components/nedi';
import { useInvite } from '@/features/onboarding/useInvite';
import { useToast } from '@/providers/ToastProvider';

/**
 * First experience (§31, §70): the cosmos has one member. Invite the second.
 * "Este espacio todavía es nuestro" — not "no data".
 */
export function InviteCard() {
  const { code, loading } = useInvite(true);
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  async function share() {
    if (!code) return;
    const text = `Únete a nuestro cosmos ✨ Código: ${code}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'COSMOS', text });
      } else {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success('Código copiado');
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled share — no-op */
    }
  }

  async function copy() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Código copiado');
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <GlassCard glow="blossom" className="text-center">
      <div className="flex justify-center">
        <Nedi state="observing" size={110} glow />
      </div>
      <h2 className="mt-3 font-display text-xl text-ink">Este espacio todavía es nuestro</h2>
      <p className="mx-auto mt-1 max-w-xs text-sm text-ink-soft">
        Invita a la otra persona para empezar su pequeño universo juntos.
      </p>

      <div className="mt-5">
        {loading ? (
          <div className="flex justify-center py-3">
            <Spinner />
          </div>
        ) : code ? (
          <button
            type="button"
            onClick={copy}
            className="mx-auto flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-5 py-3 font-display text-2xl tracking-[0.3em] text-ink transition-colors hover:bg-black/40"
          >
            {code}
            {copied ? <Check className="h-5 w-5 text-aura" /> : <Copy className="h-5 w-5 text-ink-faint" />}
          </button>
        ) : (
          <p className="text-sm text-blossom-soft">No se pudo generar el código.</p>
        )}
      </div>

      <div className="mt-5">
        <Button variant="blossom" onClick={share} disabled={!code}>
          <Share2 className="h-4 w-4" />
          Compartir invitación
        </Button>
      </div>
    </GlassCard>
  );
}
