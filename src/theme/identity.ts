/**
 * Noir & Blossom — the two complementary identities of a COSMOS.
 * Noir = User 1 (sober, elegant, cinematic).
 * Blossom = User 2 (soft, warm, luminous).
 * Together = the two worlds merging (gradient, never a flat third color).
 *
 * We never rely on color alone to distinguish users (accessibility, §39):
 * every identity also carries a label and an initial.
 */
export type Identity = 'noir' | 'blossom';

export interface IdentityStyle {
  key: Identity;
  label: string;
  /** Primary accent (text / icon / ring). */
  accent: string;
  /** Soft accent for fills and auras. */
  soft: string;
  /** Tailwind ring class for focus/selection. */
   ring: string;
  /** Tailwind text class. */
  text: string;
  /** Subtle translucent background fill. */
  fill: string;
}

export const IDENTITY: Record<Identity, IdentityStyle> = {
  noir: {
    key: 'noir',
    label: 'Noir',
    accent: '#E4E4E7',
    soft: '#A1A1AA',
    ring: 'ring-noir/60',
    text: 'text-noir',
    fill: 'bg-white/5',
  },
  blossom: {
    key: 'blossom',
    label: 'Blossom',
    accent: '#F472B6',
    soft: '#F9A8D4',
    ring: 'ring-blossom/60',
    text: 'text-blossom',
    fill: 'bg-blossom/10',
  },
};

/** The "together" gradient used for shared entities. */
export const TOGETHER_GRADIENT = 'linear-gradient(100deg, #E4E4E7 0%, #F9A8D4 55%, #F472B6 100%)';

export function identityOf(key: Identity | null | undefined): IdentityStyle {
  return key === 'blossom' ? IDENTITY.blossom : IDENTITY.noir;
}
