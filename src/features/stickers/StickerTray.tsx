import { useEffect, useState } from 'react';
import { BottomSheet } from '@/components/ui';
import { listGlobalStickers, isEmojiSticker, stickerEmoji } from './api';
import type { Sticker } from '@/types/database';

interface StickerTrayProps {
  open: boolean;
  onClose: () => void;
  onPick: (sticker: Sticker) => void;
}

/** The sticker library — tap one to drop it on the memory (§16). */
export function StickerTray({ open, onClose, onPick }: StickerTrayProps) {
  const [stickers, setStickers] = useState<Sticker[]>([]);

  useEffect(() => {
    if (open) void listGlobalStickers().then(setStickers);
  }, [open]);

  return (
    <BottomSheet open={open} onClose={onClose} title="Stickers">
      {stickers.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-faint">
          Corre la migración 0005 para cargar la biblioteca de stickers.
        </p>
      ) : (
        <div className="grid grid-cols-6 gap-2 py-2 sm:grid-cols-8">
          {stickers.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onPick(s);
                onClose();
              }}
              className="flex aspect-square items-center justify-center rounded-xl bg-white/5 text-2xl transition-colors hover:bg-white/10 active:scale-95"
              title={s.name}
            >
              {isEmojiSticker(s.url) ? (
                stickerEmoji(s.url)
              ) : (
                <img src={s.url} alt={s.name} className="h-8 w-8 object-contain" />
              )}
            </button>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
