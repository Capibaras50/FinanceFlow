import { createContext, useState, useCallback, useContext, type ReactNode } from 'react';
import { Snackbar } from '../components/ui/Snackbar';

interface SnackbarConfig {
  message: string;
  type?: 'error' | 'success';
}

interface SnackbarContextType {
  showSnackbar: (config: SnackbarConfig) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<SnackbarConfig>({ message: '' });

  const showSnackbar = useCallback((cfg: SnackbarConfig) => {
    setConfig(cfg);
    setVisible(true);
  }, []);

  const showError = useCallback((message: string) => {
    showSnackbar({ message, type: 'error' });
  }, [showSnackbar]);

  const showSuccess = useCallback((message: string) => {
    showSnackbar({ message, type: 'success' });
  }, [showSnackbar]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, showError, showSuccess }}>
      {children}
      <Snackbar
        message={config.message}
        type={config.type}
        visible={visible}
        onDismiss={handleDismiss}
      />
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}
