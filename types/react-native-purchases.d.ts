declare module 'react-native-purchases' {
  export interface PurchasesPackage {
    identifier: string;
    product: {
      title: string;
      description: string;
      price: number;
      priceString: string;
    };
  }

  export interface CustomerInfo {
    entitlements: {
      active: {
        pro?: {
          isActive: boolean;
          willRenew: boolean;
          expirationDate: string;
        };
      };
    };
    activeSubscriptions: string[];
  }

  export interface PurchaserInfo {
    customerInfo: CustomerInfo;
  }

  export interface Offerings {
    current: {
      identifier: string;
      availablePackages: PurchasesPackage[];
    } | null;
  }

  export type PurchaseError = {
    userCancelled: boolean;
    message: string;
  };

  export default class Purchases {
    static configure(options: { apiKey: string }): Promise<void>;
    static getOfferings(): Promise<Offerings>;
    static getCustomerInfo(): Promise<CustomerInfo>;
    static purchasePackage(pkg: PurchasesPackage): Promise<PurchaserInfo>;
    static restorePurchases(): Promise<CustomerInfo>;
  }
}
