import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SubscriptionContextType {
  activePaidUser: boolean;
  setActivePaidUser: (value: boolean) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [activePaidUser, setActivePaidUser] = useState(false);

  return (
    <SubscriptionContext.Provider value={{ activePaidUser, setActivePaidUser }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      'useSubscription must be used within a SubscriptionProvider'
    );
  }
  return context;
}
