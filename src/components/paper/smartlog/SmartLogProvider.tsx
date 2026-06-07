/**
 * Hosts the single Smart Log sheet instance and exposes openSmartLog(moodId?)
 * to the whole tab tree (FAB, greeting picker, composer all open the same sheet).
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { SmartLogSheet } from './SmartLogSheet';

interface SmartLogApi {
  /** Open the sheet, optionally preselecting a mood and/or a target date (ICT, YYYY-MM-DD). */
  open: (opts?: { moodId?: string | null; date?: string }) => void;
}

const SmartLogContext = createContext<SmartLogApi | null>(null);

export function SmartLogProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [moodId, setMoodId] = useState<string | null>(null);
  const [date, setDate] = useState<string | undefined>(undefined);

  const open = useCallback((opts?: { moodId?: string | null; date?: string }) => {
    setMoodId(opts?.moodId ?? null);
    setDate(opts?.date);
    setVisible(true);
  }, []);

  return (
    <SmartLogContext.Provider value={{ open }}>
      {children}
      <SmartLogSheet
        visible={visible}
        onClose={() => setVisible(false)}
        initialMoodId={moodId}
        initialDate={date}
      />
    </SmartLogContext.Provider>
  );
}

export function useSmartLog(): SmartLogApi {
  const ctx = useContext(SmartLogContext);
  if (!ctx) throw new Error('useSmartLog must be used within SmartLogProvider');
  return ctx;
}
