// Development configuration for feature flags and testing
// Toggle these flags to switch between real and mock implementations

export const DEV_CONFIG = {
  // Set to true to use mock RevenueCat (no native modules needed)
  // Set to false to use real RevenueCat (requires native build)
  USE_MOCK_PURCHASES: true,

  // Mock purchase settings (only used when USE_MOCK_PURCHASES: true)
  MOCK_HAS_PRO_ACCESS: false, // Initial pro status on app start
  MOCK_HAS_RESTORED_PURCHASES: false, // Whether restore purchases succeeds
  // Note: Making a mock purchase will grant pro access regardless of MOCK_HAS_PRO_ACCESS

  // Other development flags
  ENABLE_DEBUG_LOGS: true,
};
