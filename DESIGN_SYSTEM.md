# Design System

> _cinematic editorial dark mode + subtle astronomy + glassmorphism._
> The magic rule (§65): on every screen ask — _does this look like an app, or like a
> little universe?_ If it looks like a generic app, improve it. When in doubt,
> **remove one thing** (§66).

## Color (`tailwind.config.ts`)

| Token             | Value     | Use                                    |
| ----------------- | --------- | -------------------------------------- |
| `void`            | `#0F0F11` | Base — almost black, never black       |
| `surface`         | `#18181B` | Cards & solid surfaces                 |
| `surface.elevated`| `#27272A` | Raised surfaces                        |
| `line`            | `#3F3F46` | Borders / hairlines                    |
| `ink`             | `#F4F4F5` | Primary text                           |
| `ink.soft`        | `#A1A1AA` | Secondary text                         |
| `blossom`         | `#F472B6` | User 2 identity / warmth               |
| `blossom.soft`    | `#F9A8D4` | Soft blossom                           |
| `blossom.faint`   | `#FBCFE8` | Faint blossom                          |
| `noir`            | `#E4E4E7` | User 1 identity                        |
| `aura`            | `#67E8F9` | Nedi's glow / events                   |

### Identities (`src/theme/identity.ts`)

- **Noir** = User 1 — sober, elegant, cinematic.
- **Blossom** = User 2 — soft, warm, luminous (never an aggressive pink).
- **Together** = the two worlds merging — a **gradient** Noir→Blossom
  (`TOGETHER_GRADIENT`, `.together-text`), never a flat third color (§8).
- Identity is **never the only signal** (§39): avatars also show initials and a
  `Noir`/`Blossom` label.

## Typography

- **Display**: Fraunces (editorial serif) — logo, titles, key numbers.
- **Interface**: Inter — everything else. Modern, highly legible, not sci-fi (§9).

## Glassmorphism (§10)

`.glass` = translucent `surface`, `backdrop-blur`, subtle border, soft inner light +
deep shadow. Used **sparingly** — photography and important content keep visual
hierarchy; not everything is glass.

## Motion grammar (`src/theme/motion.ts`, §38)

| Tier      | Duration   | For                          |
| --------- | ---------- | ---------------------------- |
| Micro     | 100–180 ms | taps, toggles                |
| Standard  | 180–300 ms | sheets, cards, transitions   |
| Emotional | 300–600 ms | reveals, celebrations, boot  |

Easing `cosmos` = `cubic-bezier(0.22, 1, 0.36, 1)`; springs (`soft`, `sheet`, `pop`)
for natural movement. Everything respects `prefers-reduced-motion`.

## Primitives (`src/components/ui`)

`Button` · `IconButton` · `Card` · `GlassCard` · `Badge` · `Chip` · `Avatar` ·
`Input` · `Textarea` · `Modal` · `BottomSheet` · `ConfirmDialog` · `Toast` ·
`Skeleton` · `Divider` · `Spinner` · `EmptyState`. All share spacing, radius,
typography, motion and accessible focus states; touch targets are large (§8, §39).

## Mobile-first (§8, §11)

Bottom navigation, bottom sheets (drag to dismiss), big touch targets, gestures
(swipe months), safe-area insets, `100dvh`. Desktop gets a sidebar but keeps the
intimate aesthetic — never a corporate dashboard (§40).

## Nedi (§3–§7, §67)

A small inhabitant of the universe — ambient, emotional, contextual. States:
`idle · happy · celebrating · thinking · observing · sleeping · curious · supporting
· waiting · error`, mapped to art in `nedi.config.ts` (5 renders ship; others reuse
the nearest). Nedi appears **only when he adds emotion, context or personality**, can
disappear entirely, and never blocks the user or uses big speech bubbles.

## Empty & error states (§41, §42, §64)

Empty states feel like _"this space is still ours"_, not _"no data"_:

- Memories → _"Todavía no hay estrellas aquí."_
- Future → _"El futuro está esperando."_
- Tasks → _"Todo tranquilo por aquí."_

Errors keep the tone: _"Algo salió mal. Tu universo sigue aquí. Inténtalo otra vez."_
(the real error is still logged for developers).

## Microcopy (§64)

Emotional but not corny. Prefer _"Guardado en COSMOS."_, _"Mucho éxito hoy ♡"_,
_"El futuro está esperando."_ — avoid _"¡Felicidades, usuario!"_ or _"Operación
exitosa."_

## Internationalization (§56)

MVP ships in Spanish. Avoid hardcoding strings deep in shared logic so a future i18n
layer can lift them out.
