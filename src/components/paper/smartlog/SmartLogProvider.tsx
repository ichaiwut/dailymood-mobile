/**
 * Hosts the single Smart Log sheet instance and exposes openSmartLog(moodId?)
 * to the whole tab tree (FAB, greeting picker, composer all open the same sheet).
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { SmartLogSheet } from './SmartLogSheet';

interface SmartLogApi {
  open: (moodId?: string | null) => void;
}

const SmartLogContext = createContext<SmartLogApi | null>(null);

export function SmartLogProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [moodId, setMoodId] = useState<string | null>(null);

  const open = useCallback((id?: string | null) => {
    setMoodId(id ?? null);
    setVisible(true);
  }, []);

  return (
    <SmartLogContext.Provider value={{ open }}>
      {children}
      <SmartLogSheet visible={visible} onClose={() => setVisible(false)} initialMoodId={moodId} />
    </SmartLogContext.Provider>
  );
}

export function useSmartLog(): SmartLogApi {
  const ctx = useContext(SmartLogContext);
  if (!ctx) throw new Error('useSmartLog must be used within SmartLogProvider');
  return ctx;
}
