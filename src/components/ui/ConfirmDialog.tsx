import type { ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: ReactNode;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  loading?: boolean;
}

/** A soft confirmation for meaningful actions (§53) — never a harsh "are you sure". */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '¿Seguro?',
  message,
  confirmLabel = 'Sí, continuar',
  cancelLabel = 'Cancelar',
  tone = 'default',
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {message && <p className="mb-5 text-sm leading-relaxed text-ink-soft">{message}</p>}
      <div className="flex gap-3">
        <Button variant="subtle" fullWidth onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={tone === 'danger' ? 'danger' : 'primary'}
          fullWidth
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
