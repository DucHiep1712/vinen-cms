import React from 'react';
import ReactDOM from 'react-dom';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from './alert-dialog';

interface RowActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function RowActionsMenu({ onEdit, onDelete }: RowActionsMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

  React.useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 140, // adjust for menu width
      });
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="relative flex items-center justify-end">
      <button
        ref={buttonRef}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted-foreground/10 transition-colors cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        aria-label="Hành động"
        tabIndex={0}
        disabled={confirmOpen}
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="19" cy="12" r="2" fill="currentColor" />
        </svg>
      </button>
      {open && typeof window !== 'undefined' && ReactDOM.createPortal(
        <div
          ref={menuRef}
          className="z-[9999] min-w-[120px] rounded-md border border-gray-200 bg-white shadow-lg py-1 flex flex-col fixed"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          <button
            className="px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors text-primary cursor-pointer"
            onClick={() => { setOpen(false); onEdit(); }}
          >
            Sửa
          </button>
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <button
                className="px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors text-destructive cursor-pointer"
                onClick={() => { setOpen(false); setConfirmOpen(true); }}
              >
                Xóa
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa sự kiện</AlertDialogTitle>
                <AlertDialogDescription>Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Xóa</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>,
        document.body
      )}
    </div>
  );
} 