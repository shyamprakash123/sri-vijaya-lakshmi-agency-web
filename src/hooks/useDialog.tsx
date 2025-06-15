import React, { createContext, useContext, useState, ReactNode } from 'react';
import Dialog, { DialogProps } from "../components/ui/Dialog"

interface DialogContextType {
  showDialog: (options: Omit<DialogProps, 'isOpen' | 'onClose'>) => Promise<boolean>;
  showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => Promise<void>;
  showConfirm: (title: string, message: string, confirmText?: string, cancelText?: string) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

interface DialogProviderProps {
  children: ReactNode;
}

export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    props: Omit<DialogProps, 'isOpen' | 'onClose'>;
    resolve?: (value: boolean) => void;
  }>({
    isOpen: false,
    props: { title: '', message: '' }
  });

  const showDialog = (options: Omit<DialogProps, 'isOpen' | 'onClose'>): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        props: options,
        resolve
      });
    });
  };

  const showAlert = (
    title: string, 
    message: string, 
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): Promise<void> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        props: {
          title,
          message,
          type,
          onConfirm: () => {
            closeDialog();
            resolve();
          }
        }
      });
    });
  };

  const showConfirm = (
    title: string, 
    message: string, 
    confirmText: string = 'Confirm', 
    cancelText: string = 'Cancel'
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        props: {
          title,
          message,
          type: 'confirm',
          confirmText,
          cancelText,
          showCancel: true,
          onConfirm: () => {
            closeDialog();
            resolve(true);
          },
          onCancel: () => {
            closeDialog();
            resolve(false);
          }
        }
      });
    });
  };

  const closeDialog = () => {
    setDialogState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  const handleClose = () => {
    if (dialogState.resolve) {
      dialogState.resolve(false);
    }
    closeDialog();
  };

  const handleConfirm = () => {
    if (dialogState.props.onConfirm) {
      dialogState.props.onConfirm();
    } else if (dialogState.resolve) {
      dialogState.resolve(true);
      closeDialog();
    }
  };

  const handleCancel = () => {
    if (dialogState.props.onCancel) {
      dialogState.props.onCancel();
    } else if (dialogState.resolve) {
      dialogState.resolve(false);
      closeDialog();
    }
  };

  return (
    <DialogContext.Provider value={{ showDialog, showAlert, showConfirm }}>
      {children}
      <Dialog
        {...dialogState.props}
        isOpen={dialogState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

// Convenience functions for direct use
export const dialog = {
  alert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => {
    // This will be replaced by the hook version when used within components
    console.warn('Dialog not initialized. Use within DialogProvider.');
    return Promise.resolve();
  },
  confirm: (title: string, message: string, confirmText?: string, cancelText?: string) => {
    // This will be replaced by the hook version when used within components
    console.warn('Dialog not initialized. Use within DialogProvider.');
    return Promise.resolve(false);
  }
};