import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SubscriptionContextType {
  activePaidUser: boolean;
  setActivePaidUser: (value: boolean) => void;
  isLoading: boolean;
  subscriptionType: 'weekly' | 'yearly' | null;
  setSubscriptionType: (type: 'weekly' | 'yearly' | null) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [activePaidUser, setActivePaidUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionType, setSubscriptionType] = useState<
    'weekly' | 'yearly' | null
  >(null);

  // Load subscription status from storage on app start
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem('subscriptionStatus');
        const storedType = await AsyncStorage.getItem('subscriptionType');

        if (storedStatus === 'active') {
          setActivePaidUser(true);
        }

        if (storedType === 'weekly' || storedType === 'yearly') {
          setSubscriptionType(storedType as 'weekly' | 'yearly');
        }
      } catch (error) {
        console.error('Error loading subscription status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscriptionStatus();
  }, []);

  // Persist subscription status when it changes
  useEffect(() => {
    const saveSubscriptionStatus = async () => {
      try {
        await AsyncStorage.setItem(
          'subscriptionStatus',
          activePaidUser ? 'active' : 'inactive'
        );

        if (subscriptionType) {
          await AsyncStorage.setItem('subscriptionType', subscriptionType);
        } else {
          await AsyncStorage.removeItem('subscriptionType');
        }
      } catch (error) {
        console.error('Error saving subscription status:', error);
      }
    };

    saveSubscriptionStatus();
  }, [activePaidUser, subscriptionType]);

  return (
    <SubscriptionContext.Provider
      value={{
        activePaidUser,
        setActivePaidUser,
        isLoading,
        subscriptionType,
        setSubscriptionType,
      }}>
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
