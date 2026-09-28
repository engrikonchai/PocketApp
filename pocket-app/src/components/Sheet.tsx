import type { ReactNode } from 'react';
import { Icon } from './Icon';

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
  return (
    <>
      <div className="pk-scrim" onClick={onClose} />
      <div className="pk-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="pk-grab"><span /></div>
        <div className="pk-sheethead">
          <div>{headerLeft}</div>
          {title ? <span className="pk-sheettitle">{title}</span> : <span />}
          <button type="button" className="pk-circle pk-plain pk-press" aria-label="Close" onClick={onClose}>
            <Icon id="close" className="pk-ico-s" />
          </button>
        </div>
        <div className="pk-sheetbody pk-scroll">{children}</div>
        {footer}
      </div>
    </>
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
  return (
    <>
      <div className="pk-scrim" onClick={onCancel} />
      <div className="pk-alert" role="alertdialog" aria-modal="true">
        <h2>{title}</h2>
        <p>{message}</p>
        <button type="button" className={'pk-btn pk-press ' + (danger ? 'pk-btn-danger' : 'pk-btn-primary')} style={{ width: '100%' }} onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button type="button" className="pk-btn pk-press" style={{ width: '100%', background: 'none' }} onClick={onCancel} autoFocus>
          Cancel
        </button>
      </div>
    </>
  );
}
