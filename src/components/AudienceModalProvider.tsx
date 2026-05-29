'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import AudienceModal from './AudienceModal';

export type AudienceModalEntry = 'audience' | 'parent' | 'school';

interface AudienceModalContextValue {
  openModal: (entry?: AudienceModalEntry) => void;
  closeModal: () => void;
}

const AudienceModalContext = createContext<AudienceModalContextValue | null>(null);

export function AudienceModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [entry, setEntry] = useState<AudienceModalEntry>('audience');

  const value = useMemo(
    () => ({
      openModal: (entry: AudienceModalEntry = 'audience') => {
        setEntry(entry);
        setIsOpen(true);
      },
      closeModal: () => setIsOpen(false),
    }),
    []
  );

  return (
    <AudienceModalContext.Provider value={value}>
      {children}
      <AudienceModal open={isOpen} entry={entry} onClose={value.closeModal} />
    </AudienceModalContext.Provider>
  );
}

export function useAudienceModal() {
  const context = useContext(AudienceModalContext);
  if (!context) {
    throw new Error('useAudienceModal must be used within AudienceModalProvider');
  }
  return context;
}
