import { useState, type ReactNode } from 'react';
import { Drawer } from 'vaul';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './Icon';
import { useIsWide } from '../lib/hooks';

/**
 * A bottom sheet on mobile / a centered dialog on wide screens, backed by Vaul's
 * real drag-to-dismiss physics. `onClose` fires only once the closing animation
 * has actually finished, so callers can safely unmount right away.
 */
export function Sheet({
  title,
  onClose,
  headerLeft,
  children,
  footer,
}: {
  title?: string;
  onClose: () => void;
  headerLeft?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const wide = useIsWide();

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(v) => setOpen(v)}
      onAnimationEnd={(v) => { if (!v) onClose(); }}
      shouldScaleBackground={false}
      handleOnly={wide}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="pk-scrim" />
        <Drawer.Content
          className="pk-sheet"
          style={wide ? { left: '50%', right: 'auto', bottom: 'auto', top: '50%', width: 440, borderRadius: 26, transform: 'translate(-50%, -50%)' } : undefined}
          aria-describedby={undefined}
          onScroll={(e) => {
            // .pk-sheet is overflow:hidden purely to clip rounded corners; it should
            // never actually scroll. Clicking a button deep inside it can trigger the
            // browser's default focus-scroll-into-view on this container even though
            // overflow:hidden blocks real user scrolling — reset it if that happens.
            if (e.currentTarget.scrollTop !== 0) e.currentTarget.scrollTop = 0;
          }}
        >
          <Drawer.Title className="pk-sr">{title ?? 'Dialog'}</Drawer.Title>
          {/* On wide screens the sheet is a centered dialog, not a drawer — it
              shouldn't be draggable at all. handleOnly (above) restricts dragging
              to this Handle, and hiding it here removes the only way to trigger it. */}
          <Drawer.Handle className="pk-grab" style={wide ? { visibility: 'hidden', pointerEvents: 'none', height: 6, padding: 0 } : undefined}>
            <span />
          </Drawer.Handle>
          <div className="pk-sheethead">
            <div>{headerLeft}</div>
            {title ? <span className="pk-sheettitle">{title}</span> : <span />}
            <Drawer.Close asChild>
              <button type="button" className="pk-circle pk-plain pk-press" aria-label="Close">
                <Icon id="close" className="pk-ico-s" />
              </button>
            </Drawer.Close>
          </div>
          <div className="pk-sheetbody pk-scroll">{children}</div>
          {footer}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function AlertDialog({
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <AnimatePresence onExitComplete={onCancel}>
      {open && (
        <>
          <motion.div
            className="pk-scrim"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          <motion.div
            className="pk-alert"
            role="alertdialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 34 }}
          >
            <h2>{title}</h2>
            <p>{message}</p>
            <button type="button" className={'pk-btn pk-press ' + (danger ? 'pk-btn-danger' : 'pk-btn-primary')} style={{ width: '100%' }} onClick={onConfirm}>
              {confirmLabel}
            </button>
            <button type="button" className="pk-btn pk-press" style={{ width: '100%', background: 'none' }} onClick={() => setOpen(false)} autoFocus>
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
