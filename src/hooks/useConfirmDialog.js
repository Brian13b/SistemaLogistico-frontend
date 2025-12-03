import { useState } from 'react';

const useConfirmDialog = () => {
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: null,
    onCancel: null,
    isLoading: false
  });

  const showDialog = (options) => {
    setDialog({
      isOpen: true,
      title: options.title || 'Confirmar acción',
      message: options.message || '¿Estás seguro?',
      type: options.type || 'warning',
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      onConfirm: options.onConfirm || (() => {}),
      onCancel: options.onCancel || (() => {}),
      isLoading: false
    });
  };

  const hideDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const setLoading = (loading) => {
    setDialog(prev => ({ ...prev, isLoading: loading }));
  };

  const handleConfirm = async () => {
    if (dialog.onConfirm) {
      setLoading(true);
      try {
        await dialog.onConfirm();
        hideDialog();
      } catch (error) {
        console.error('Error en la confirmación:', error);
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    if (dialog.onCancel) {
      dialog.onCancel();
    }
    hideDialog();
  };

  return {
    dialog,
    showDialog,
    hideDialog,
    setLoading,
    handleConfirm,
    handleCancel
  };
};

export default useConfirmDialog;
