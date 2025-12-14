# Premium Status Synchronization Guide

## Overview
This document explains how the premium status synchronization works between the frontend website and mobile app after the recent fixes.

## The Problem (Fixed)
Previously, when users purchased premium access on the frontend website, their mobile app would remain locked because the premium status wasn't properly synchronized between systems.

## The Solution

### Backend Improvements

1. **Enhanced Premium Updates**: 
   - All premium endpoints now consistently update `premiumActive`, `premiumBalance`, `premiumExpiry`, and `isTrialUsed`
   - Premium expiry is set to 1 year from purchase date
   - Better error handling and logging

2. **New Refresh Endpoint**: 
   - `POST /api/user/premium/refresh/:userId` - Forces premium status refresh
   - Called automatically after successful payments

3. **Improved Payment Verification**: 
   - Payment verification now sets proper premium expiry dates
   - Marks trial as used when premium is purchased

### Mobile App Improvements

1. **Force Server Refresh**: 
   - App now forces server refresh instead of relying on cached data
   - Clears premium cache when refreshing status
   - Auto-refreshes when app resumes (user returning from payment)

2. **Better User Feedback**: 
   - Improved status messages with expiry dates
   - Clear instructions for users who just purchased premium
   - Visual indicators (green/orange) for status

3. **Manual Refresh**: 
   - Enhanced "Refresh Status" button that clears cache
   - Helpful instruction text for users

### Frontend Improvements

1. **Post-Payment Sync**: 
   - Automatically calls refresh endpoint after successful payment
   - Advises users to restart mobile app for immediate effect

## Testing the Fix

### For Users:
1. Purchase premium on the website
2. Open the mobile app
3. If still locked, tap "Refresh Status" button
4. Premium access should now be available

### For Developers:
1. Check browser console for "Premium status refreshed for mobile sync" message
2. Check mobile logs for "Premium status refreshed from server" message
3. Verify database shows correct `premiumActive=true` and `premiumExpiry` date

## API Endpoints

- `GET /api/user/details/:userId` - Get user details including premium status
- `POST /api/user/premium/add` - Add premium funds (used by payment system)
- `POST /api/user/premium/refresh/:userId` - Force refresh premium status
- `POST /api/payments/verify/:reference` - Verify payment and update premium

## Mobile App Cache Management

The app now properly manages cache by:
- Clearing premium cache on manual refresh
- Force-fetching from server on app resume
- Using cached data only as fallback

## Troubleshooting

### If Premium Still Not Syncing:
1. Check server logs for payment processing errors
2. Verify database shows correct premium status
3. Ensure mobile app has network connection
4. Try manual "Refresh Status" in app
5. Restart mobile app completely

### Common Issues:
- **Cached Data**: Old cached data can prevent updates → Clear app cache
- **Network Issues**: Poor connection during payment → Retry refresh
- **Database Inconsistency**: Backend update failed → Check server logs

## Database Fields Used

```sql
-- User table premium fields
premiumActive: BOOLEAN      -- Whether premium is currently active
premiumBalance: FLOAT       -- Premium credit balance
premiumExpiry: DATETIME     -- When premium expires (NULL = unlimited)
premiumDeduction: FLOAT     -- Cost per premium action
isTrialUsed: BOOLEAN        -- Whether trial period was used
trialStartDate: DATETIME    -- When trial started
trialExpiry: DATETIME       -- When trial expires
```

## Implementation Details

### Backend Controller Changes:
- `addPremiumFunds()` - Now sets proper expiry and marks trial used
- `verifyPayment()` - Enhanced with consistent premium field updates
- `refreshPremiumStatusController()` - New dedicated refresh endpoint

### Mobile App Changes:
- `_forceRefreshAndCheckAccess()` - Forces server refresh
- `_checkPremiumStatus()` - Clears cache before refresh
- Better lifecycle management for app resume events

This comprehensive fix ensures reliable premium status synchronization between all platforms.