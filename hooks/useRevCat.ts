import { Platform } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DEV_CONFIG } from '../constants/dev';
import MockPurchases from '../services/mockPurchases';

// Track if RevenueCat has been configured to avoid multiple configurations
let isRevenueCatConfigured = false;

async function configureRevenueCat() {
  if (isRevenueCatConfigured) return;

  const Purchases = require('react-native-purchases').default;

  if (Platform.OS === 'android') {
    await Purchases.configure({
      apiKey: process.env.EXPO_PUBLIC_ANDROID_REVCAT_KEY || '',
    });
  } else {
    await Purchases.configure({
      apiKey: 'appl_ICdHUkDsuyvsNNWDwBOMSNddvyt',
    });
  }

  isRevenueCatConfigured = true;
  console.log('✅ Real RevenueCat configured for', Platform.OS);
}

function useRevenueCat() {
  const queryClient = useQueryClient();
  const changeSubStatus = () => {
    queryClient.invalidateQueries({ queryKey: ['customerInfo'] });
  };

  const { data: currentOffering, isLoading: isOfferingLoading } = useQuery({
    queryKey: ['currentOffering'],
    queryFn: fetchCurrentOffering,
  });

  const { data: customerInfo, isLoading: isCustomerInfoLoading } = useQuery({
    queryKey: ['customerInfo'],
    queryFn: fetchCustomerInfo,
  });

  const isProMember = customerInfo?.entitlements?.active?.pro;

  async function fetchCurrentOffering(): Promise<any> {
    if (DEV_CONFIG.USE_MOCK_PURCHASES) {
      // Use mock purchases service
      if (DEV_CONFIG.ENABLE_DEBUG_LOGS) {
        console.log('🧪 Using Mock RevenueCat for offerings');
      }
      const offerings = await MockPurchases.getOfferings();
      return offerings.current;
    }

    // Real RevenueCat code for production - dynamic import to avoid native module dependency
    await configureRevenueCat();
    const Purchases = require('react-native-purchases').default;
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  }

  async function fetchCustomerInfo(): Promise<any> {
    if (DEV_CONFIG.USE_MOCK_PURCHASES) {
      // Use mock purchases service
      if (DEV_CONFIG.ENABLE_DEBUG_LOGS) {
        console.log('🧪 Using Mock RevenueCat for customer info');
      }
      // MockPurchases now handles initialization internally
      return await MockPurchases.getCustomerInfo();
    }

    // Real RevenueCat code for production - dynamic import to avoid native module dependency
    await configureRevenueCat();
    const Purchases = require('react-native-purchases').default;
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  }

  return {
    currentOffering,
    customerInfo,
    isProMember,
    isOfferingLoading,
    isCustomerInfoLoading,
    changeSubStatus,
  };
}

export default useRevenueCat;
