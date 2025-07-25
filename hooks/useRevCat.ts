import { Platform } from 'react-native';
import Purchases, { CustomerInfo, Offerings } from 'react-native-purchases';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

  async function fetchCurrentOffering(): Promise<Offerings['current']> {
    if (Platform.OS === 'android') {
      await Purchases.configure({
        apiKey: process.env.EXPO_PUBLIC_ANDROID_REVCAT_KEY || '',
      });
    } else {
      await Purchases.configure({
        apiKey: 'appl_ICdHUkDsuyvsNNWDwBOMSNddvyt',
      });
    }
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  }

  async function fetchCustomerInfo(): Promise<CustomerInfo> {
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
