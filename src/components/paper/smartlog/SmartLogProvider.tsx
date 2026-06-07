/**
 * Hosts the single Smart Log sheet instance and exposes openSmartLog(moodId?)
 * to the whole tab tree (FAB, greeting picker, composer all open the same sheet).
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { SmartLogSheet } from './SmartLogSheet';

export interface SmartLogOpenOpts {
  moodId?: string | null;
  date?: string;
  note?: string;
  autoAnalyze?: boolean;
}

interface SmartLogApi {
  /** Open the sheet, optionally preselecting a mood, date, prefilled note, and auto-analyzing. */
  open: (opts?: SmartLogOpenOpts) => void;
}

const SmartLogContext = createContext<SmartLogApi | null>(null);

export function SmartLogProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [opts, setOpts] = useState<SmartLogOpenOpts>({});

  const open = useCallback((next?: SmartLogOpenOpts) => {
    setOpts(next ?? {});
    setVisible(true);
  }, []);

  return (
    <SmartLogContext.Provider value={{ open }}>
      {children}
      <SmartLogSheet
        visible={visible}
        onClose={() => setVisible(false)}
        initialMoodId={opts.moodId ?? null}
        initialDate={opts.date}
        initialNote={opts.note}
        autoAnalyze={opts.autoAnalyze}
      />
    </SmartLogContext.Provider>
  );
}

export function useSmartLog(): SmartLogApi {
  const ctx = useContext(SmartLogContext);
  if (!ctx) throw new Error('useSmartLog must be used within SmartLogProvider');
  return ctx;
}
