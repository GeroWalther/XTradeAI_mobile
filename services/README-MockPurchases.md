# Mock RevenueCat System

This system allows you to easily switch between real RevenueCat and mock implementations during development.

## How to Use

### 1. Toggle Mock Mode

Edit `constants/dev.ts` to control the behavior:

```typescript
export const DEV_CONFIG = {
  USE_MOCK_PURCHASES: true, // Set to false to use real RevenueCat
  MOCK_HAS_PRO_ACCESS: false, // Initial pro status on app start
  MOCK_HAS_RESTORED_PURCHASES: false, // Whether restore purchases succeeds
  ENABLE_DEBUG_LOGS: true, // Set to false to disable debug logs
};
```

### 2. Testing Different Scenarios

#### Test Free User (Default)

```typescript
MOCK_HAS_PRO_ACCESS: false;
```

- App starts with no pro access
- Shows paywall and subscription options

#### Test Pro User on App Start

```typescript
MOCK_HAS_PRO_ACCESS: true;
```

- App starts with pro access already granted
- Skips paywall, shows pro features

#### Test Purchase Flow

- Set `MOCK_HAS_PRO_ACCESS: false` (start as free user)
- Select any package in the app
- Mock purchase **automatically grants pro access** (overrides the flag)
- User gets redirected to Home screen
- **Pro access persists** until app restart

#### Test Successful Restore

```typescript
MOCK_HAS_RESTORED_PURCHASES: true;
```

- Shows "Subscription restored!" success alert
- Grants pro access
- Navigates to Home screen

#### Test Failed Restore

```typescript
MOCK_HAS_RESTORED_PURCHASES: false;
```

- Shows "No subscriptions found" alert
- Keeps current access level

### 3. Production Mode

To switch to real RevenueCat for production:

```typescript
USE_MOCK_PURCHASES: false;
```

**That's it!** No code changes needed. The system automatically:

- Uses dynamic imports to load RevenueCat only when needed
- Avoids native module dependencies in mock mode
- Preserves all production functionality when toggled

### 4. Runtime Control

You can also control mock behavior at runtime:

```typescript
import MockPurchases from '../services/mockPurchases';

// Manually grant pro access
MockPurchases.setMockProAccess(true);

// Check current status
const hasProAccess = MockPurchases.getMockProAccess();

// Reset to dev config (useful for testing)
MockPurchases.resetToDevConfig();
```

## Flow Logic

### Mock Purchase Behavior:

1. **App starts**: Uses `MOCK_HAS_PRO_ACCESS` value
2. **User makes purchase**: Grants pro access (overrides flag)
3. **Pro access persists**: Until app restart or manual reset
4. **App restart**: Returns to `MOCK_HAS_PRO_ACCESS` value

### Mock Restore Behavior:

1. **Check `MOCK_HAS_RESTORED_PURCHASES` flag**
2. **If true**: Grant pro access + show success
3. **If false**: Keep current state + show "no subscriptions"

## Features

- ✅ Mock offerings with realistic package data
- ✅ Mock customer info with pro/free states
- ✅ Mock purchase functionality that **persists until restart**
- ✅ Mock restore purchases with configurable success/failure
- ✅ **One-flag toggle** between real/mock
- ✅ **No code changes needed** for production
- ✅ Dynamic imports avoid native module errors
- ✅ Debug logging with 🧪 emoji
- ✅ Runtime configuration and reset capabilities

## Benefits

- **Fast Development**: No need for real purchases during development
- **Easy Testing**: Test all subscription scenarios quickly
- **Works in Expo Go**: No development builds needed for testing
- **One-Click Production**: Just toggle `USE_MOCK_PURCHASES: false`
- **No Code Changes**: Production switch requires zero code modifications
- **Realistic Flow**: Purchases behave like real transactions (persist until restart)
- **Type Safe**: Full TypeScript support for both modes
