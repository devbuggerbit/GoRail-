import { createContext, useContext, useState, ReactNode } from 'react';

export type Page =
  | 'passenger-login'
  | 'staff-login'
  | 'register'
  | 'dashboard'
  | 'search-train'
  | 'book-ticket'
  | 'station-map'
  | 'order-food'
  | 'cleaning-request'
  | 'file-complaint'
  | 'technical-issue'
  | 'train-updates'
  | 'my-bookings'
  | 'pnr-status'
  | 'staff-cleaning'
  | 'staff-tc'
  | 'staff-police'
  | 'staff-electrical'
  | 'staff-pilot'
  | 'staff-station-master';

interface NavState {
  page: Page;
  params?: Record<string, string>;
}

interface NavigationContextType {
  current: NavState;
  navigate: (page: Page, params?: Record<string, string>) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<NavState[]>([{ page: 'passenger-login' }]);

  const current = history[history.length - 1];

  const navigate = (page: Page, params?: Record<string, string>) => {
    setHistory(prev => [...prev, { page, params }]);
  };

  const goBack = () => {
    setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  };

  return (
    <NavigationContext.Provider value={{ current, navigate, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}
