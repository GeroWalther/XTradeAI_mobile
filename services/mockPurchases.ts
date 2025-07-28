// Mock RevenueCat Purchases service for development
// This file provides the same interface as react-native-purchases for testing

export interface MockCustomerInfo {
  entitlements: {
    active: {
      [key: string]: boolean;
    };
  };
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  latestExpirationDate: string | null;
  originalApplicationVersion: string;
  requestDate: string;
}

export interface MockOfferings {
  current: {
    availablePackages: MockPurchasesPackage[];
    serverDescription: string;
    metadata: Record<string, any>;
  };
}

export interface MockPurchasesPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    description: string;
    title: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
}

class MockPurchases {
  private static isConfigured = false;
  private static mockProAccess: boolean | null = null; // null = use dev config, boolean = override
  private static hasBeenPurchased = false; // Track if user made a purchase

  // Initialize with dev config value
  private static initializeMockProAccess(): void {
    if (this.mockProAccess === null) {
      // Only import here to avoid circular dependency
      const { DEV_CONFIG } = require('../constants/dev');
      this.mockProAccess = DEV_CONFIG.MOCK_HAS_PRO_ACCESS;
      console.log(
        '🧪 Mock RevenueCat initialized with pro access:',
        this.mockProAccess
      );
    }
  }

  // Configuration method
  static async configure(options: { apiKey: string }): Promise<void> {
    console.log(
      '🧪 Mock RevenueCat configured with API key:',
      options.apiKey.substring(0, 10) + '...'
    );
    this.isConfigured = true;
    return Promise.resolve();
  }

  // Get mock offerings
  static async getOfferings(): Promise<MockOfferings> {
    console.log('🧪 Mock RevenueCat: Getting offerings');

    return {
      current: {
        availablePackages: [
          {
            identifier: 'pro_monthly',
            packageType: 'MONTHLY',
            product: {
              identifier: 'pro_monthly',
              description: 'Monthly Pro Access',
              title: 'Pro Monthly',
              price: 9.99,
              priceString: '$9.99',
              currencyCode: 'USD',
            },
          },
          {
            identifier: 'pro_yearly',
            packageType: 'ANNUAL',
            product: {
              identifier: 'pro_yearly',
              description: 'Yearly Pro Access',
              title: 'Pro Yearly',
              price: 99.99,
              priceString: '$99.99',
              currencyCode: 'USD',
            },
          },
        ],
        serverDescription: 'Mock Pro Subscription',
        metadata: {},
      },
    };
  }

  // Get mock customer info
  static async getCustomerInfo(): Promise<MockCustomerInfo> {
    this.initializeMockProAccess();
    console.log(
      '🧪 Mock RevenueCat: Getting customer info - pro access:',
      this.mockProAccess
    );

    return {
      entitlements: {
        active: {
          pro: this.mockProAccess || false,
        },
      },
      activeSubscriptions: this.mockProAccess ? ['pro_monthly'] : [],
      allPurchasedProductIdentifiers: this.mockProAccess ? ['pro_monthly'] : [],
      latestExpirationDate: this.mockProAccess ? '2025-12-31T23:59:59Z' : null,
      originalApplicationVersion: '1.0',
      requestDate: new Date().toISOString(),
    };
  }

  // Mock purchase package
  static async purchasePackage(
    pkg: MockPurchasesPackage
  ): Promise<MockCustomerInfo> {
    console.log('🧪 Mock RevenueCat: Purchasing package:', pkg.identifier);

    // Simulate successful purchase - this overrides dev config
    this.mockProAccess = true;
    this.hasBeenPurchased = true;
    console.log('🧪 Mock purchase successful - pro access granted');

    return this.getCustomerInfo();
  }

  // Mock restore purchases
  static async restorePurchases(): Promise<MockCustomerInfo> {
    console.log('🧪 Mock RevenueCat: Restoring purchases');

    // Import dev config here to avoid circular dependency
    const { DEV_CONFIG } = require('../constants/dev');
    const hasRestoredPurchases = DEV_CONFIG.MOCK_HAS_RESTORED_PURCHASES;

    if (hasRestoredPurchases) {
      console.log('🧪 Mock restore successful - pro access granted');
      this.mockProAccess = true;
      this.hasBeenPurchased = true;
    } else {
      console.log('🧪 Mock restore - no purchases found');
    }

    return this.getCustomerInfo();
  }

  // Helper method to manually set pro access (for runtime control)
  static setMockProAccess(hasPro: boolean): void {
    console.log('🧪 Mock RevenueCat: Manually setting pro access to:', hasPro);
    this.mockProAccess = hasPro;
  }

  // Helper method to get current pro status
  static getMockProAccess(): boolean {
    this.initializeMockProAccess();
    return this.mockProAccess || false;
  }

  // Helper method to reset to dev config (useful for testing)
  static resetToDevConfig(): void {
    console.log('🧪 Mock RevenueCat: Resetting to dev config');
    this.mockProAccess = null;
    this.hasBeenPurchased = false;
    this.initializeMockProAccess();
  }
}

export default MockPurchases;
