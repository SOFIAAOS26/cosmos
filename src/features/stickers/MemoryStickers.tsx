import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, RotateCw, Minus, Trash2, X } from 'lucide-react';
import { StickerTray } from './StickerTray';
import {
  listMemoryStickers,
  addMemorySticker,
  updateMemorySticker,
  deleteMemorySticker,
  isEmojiSticker,
  stickerEmoji,
} from './api';
import { cn } from '@/utils/cn';
import type { MemorySticker, Sticker } from '@/types/database';

interface MemoryStickersProps {
  memoryId: string;
  cosmosId: string;
  editable?: boolean;
  stickersById: Record<string, Sticker>;
  /** Base sticker size in px (before scale). */
  base?: number;
}

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

/**
 * Interactive sticker layer over a memory (§16): drag, resize, rotate, delete,
 * with persistence. Fills its (relative) parent.
 */
export function MemoryStickers({
  memoryId,
  cosmosId,
  editable = false,
  stickersById,
  base = 46,
}: MemoryStickersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<MemorySticker[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [trayOpen, setTrayOpen] = useState(false);
  const dragging = useRef<{ id: string } | null>(null);

  const load = useCallback(async () => {
    setPlaced(await listMemoryStickers(memoryId));
  }, [memoryId]);
  useEffect(() => {
    void load();
  }, [load]);

  const maxZ = useMemo(() => placed.reduce((m, s) => Math.max(m, s.z), 0), [placed]);

  function pointerToXY(clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: clamp((clientX - rect.left) / rect.width), y: clamp((clientY - rect.top) / rect.height) };
  }

  function onPointerDown(e: React.PointerEvent, s: MemorySticker) {
    if (!editable) return;
    e.stopPropagation();
    setSelected(s.id);
    dragging.current = { id: s.id };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const xy = pointerToXY(e.clientX, e.clientY);
    if (!xy) return;
    setPlaced((prev) => prev.map((p) => (p.id === dragging.current!.id ? { ...p, ...xy } : p)));
  }

  async function onPointerUp() {
    const d = dragging.current;
    dragging.current = null;
    if (!d) return;
    const s = placed.find((p) => p.id === d.id);
    if (s) await updateMemorySticker(s.id, { x: s.x, y: s.y }).catch(() => undefined);
  }

  async function pick(sticker: Sticker) {
    const created = await addMemorySticker({ cosmosId, memoryId, stickerId: sticker.id, z: maxZ + 1 });
    setPlaced((p) => [...p, created]);
    setSelected(created.id);
  }

  async function transform(s: MemorySticker, patch: Partial<MemorySticker>) {
    const next = { ...s, ...patch };
    setPlaced((prev) => prev.map((p) => (p.id === s.id ? next : p)));
    await updateMemorySticker(s.id, patch).catch(() => undefined);
  }

  async function remove(s: MemorySticker) {
    setPlaced((prev) => prev.filter((p) => p.id !== s.id));
    setSelected(null);
    await deleteMemorySticker(s.id).catch(() => undefined);
  }

  const selectedSticker = placed.find((p) => p.id === selected) ?? null;

  return (
    <>
      <div
        ref={containerRef}
        className="absolute inset-0"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClick={() => editable && setSelected(null)}
        style={{ touchAction: editable ? 'none' : 'auto' }}
      >
        {placed.map((s) => {
          const sticker = stickersById[s.sticker_id];
          if (!sticker) return null;
          const isSel = editable && selected === s.id;
          return (
            <div
              key={s.id}
              onPointerDown={(e) => onPointerDown(e, s)}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'absolute flex select-none items-center justify-center',
                editable ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none',
                isSel && 'rounded-lg ring-2 ring-blossom/70',
              )}
              style={{
                left: `${s.x * 100}%`,
                top: `${s.y * 100}%`,
                width: base,
                height: base,
                transform: `translate(-50%, -50%) rotate(${s.rotation}deg) scale(${s.scale})`,
                zIndex: s.z + 1,
                fontSize: base * 0.8,
                lineHeight: 1,
              }}
            >
              {isEmojiSticker(sticker.url) ? (
                <span>{stickerEmoji(sticker.url)}</span>
              ) : (
                <img src={sticker.url} alt={sticker.name} className="h-full w-full object-contain" draggable={false} />
              )}
            </div>
          );
        })}
      </div>

      {/* Edit controls */}
      {editable && (
        <>
          <button
            type="button"
            onClick={() => setTrayOpen(true)}
            className="absolute right-2 top-2 z-30 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-xs text-ink backdrop-blur"
          >
            <Plus className="h-3.5 w-3.5" /> Sticker
          </button>

          {selectedSticker && (
            <div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/70 px-2 py-1.5 backdrop-blur">
              <Ctrl label="Más pequeño" onClick={() => transform(selectedSticker, { scale: Math.max(0.4, +(selectedSticker.scale - 0.15).toFixed(2)) })}>
                <Minus className="h-4 w-4" />
              </Ctrl>
              <Ctrl label="Más grande" onClick={() => transform(selectedSticker, { scale: Math.min(3, +(selectedSticker.scale + 0.15).toFixed(2)) })}>
                <Plus className="h-4 w-4" />
              </Ctrl>
              <Ctrl label="Rotar" onClick={() => transform(selectedSticker, { rotation: (selectedSticker.rotation + 15) % 360 })}>
                <RotateCw className="h-4 w-4" />
              </Ctrl>
              <Ctrl label="Quitar" onClick={() => remove(selectedSticker)}>
                <Trash2 className="h-4 w-4 text-blossom-soft" />
              </Ctrl>
              <Ctrl label="Deseleccionar" onClick={() => setSelected(null)}>
                <X className="h-4 w-4" />
              </Ctrl>
            </div>
          )}
        </>
      )}

      <StickerTray open={trayOpen} onClose={() => setTrayOpen(false)} onPick={pick} />
    </>
  );
}

function Ctrl({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-white/10 active:scale-90"
    >
      {children}
    </button>
  );
}
