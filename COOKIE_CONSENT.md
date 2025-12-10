# Cookie Consent Framework

This document describes the cookie consent framework implemented for the Tonttujahti game.

## Overview

The cookie consent framework is GDPR-compliant and provides users with clear choices about cookie usage. It supports two types of cookies:

1. **Välttämättömät evästeet (Essential Cookies)** - Required for game functionality (scores, game state)
2. **Analytiikkaevästeet (Analytics Cookies)** - Optional analytics via Vercel Analytics

## Components

### 1. `CookieConsent.tsx`
The main cookie consent banner that appears on first visit. Features:
- Appears at the bottom of the screen with smooth animation
- Three action buttons: Settings, Essential Only, Accept All
- Settings modal for granular control
- Finnish language (Finnish game)
- Styled with Tailwind CSS and Framer Motion

### 2. `CookieConsentProvider.tsx`
Context provider for managing cookie preferences across the app:
- Provides `useCookieConsent()` hook
- Syncs preferences across browser tabs
- Stores preferences in localStorage

### 3. `ConditionalAnalytics.tsx`
Wrapper for Vercel Analytics that only loads when user has consented:
- Checks analytics consent status
- Only renders `<Analytics />` if consent is given
- Automatically updates when preferences change

### 4. `CookieSettingsButton.tsx`
Reusable button component to open cookie settings from anywhere:
- Can be placed in footer, menu, or any other location
- Opens the same settings modal as the main banner
- Customizable label and className

## Usage

### Basic Setup (Already Implemented)

The framework is automatically active in `/app/layout.tsx`:

```tsx
<CookieConsentProvider>
  {children}
  <CookieConsent />
  <ConditionalAnalytics />
</CookieConsentProvider>
```

### Adding Cookie Settings Link

To add a settings link in your UI (e.g., footer):

```tsx
import CookieSettingsButton from '@/app/components/CookieSettingsButton';

<CookieSettingsButton
  label="🍪 Evästeasetukset"
  className="text-sm underline"
/>
```

### Checking Consent in Your Code

To conditionally run code based on consent:

```tsx
import { useCookieConsent } from '@/app/components/CookieConsentProvider';

function MyComponent() {
  const { analyticsEnabled, preferences, hasConsent } = useCookieConsent();

  useEffect(() => {
    if (analyticsEnabled) {
      // Run analytics code
    }
  }, [analyticsEnabled]);
}
```

## Storage

Cookie preferences are stored in localStorage under the key: `tonttujahti-cookie-consent`

Format:
```json
{
  "essential": true,
  "analytics": true,
  "timestamp": 1702400000000
}
```

## Styling

The consent UI uses:
- Tailwind CSS for styling
- Framer Motion for animations
- Christmas theme colors (red-600 to green-600 gradient)
- Fully responsive design

## Compliance

The framework is designed to be GDPR and ePrivacy Directive compliant:
- ✅ Clear information about cookie types
- ✅ Explicit consent required before non-essential cookies
- ✅ Easy way to withdraw consent
- ✅ Privacy notice included
- ✅ Granular control (per cookie category)
- ✅ No cookies set before consent (except essential)

## Customization

### Change Cookie Categories

Edit `CookiePreferences` interface in `CookieConsent.tsx`:

```tsx
export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;  // Add new category
  timestamp: number;
}
```

### Change Text/Translation

All text is in Finnish. To change to another language, edit the text strings in:
- `CookieConsent.tsx` - Main banner and modal
- `CookieSettingsButton.tsx` - Settings button modal

### Change Styling

Modify Tailwind classes in the components. Key color scheme:
- Primary gradient: `from-red-600 to-green-600` (Christmas theme)
- Background: `bg-white`
- Text: `text-gray-900`, `text-gray-700`

## Testing

To test the cookie consent:

1. Open the site in a new incognito window
2. Banner should appear at the bottom
3. Test "Vain välttämättömät" - Only essential cookies should be set
4. Clear localStorage and refresh
5. Test "Hyväksy kaikki" - Analytics should be enabled
6. Open settings modal to test granular controls
7. Test in multiple tabs to verify sync

## Future Enhancements

Potential improvements:
- Add more cookie categories (marketing, social media)
- Implement cookie audit/scanner
- Add cookie expiration renewal prompt (e.g., after 12 months)
- A/B test different consent UI designs
- Track consent rates in analytics (for opted-in users)
