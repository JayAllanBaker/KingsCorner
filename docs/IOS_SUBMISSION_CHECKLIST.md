# iOS App Store Submission Checklist

## Pre-Submission Requirements

### Assets Created
- [x] App Icon (1024x1024 master)
- [x] All iOS icon sizes (16, 32, 72, 96, 120, 128, 144, 152, 167, 180, 192, 384, 512)
- [x] Splash screens (portrait and landscape)
- [x] PWA manifest.json configured

### Documentation
- [x] App Store description
- [x] Privacy Policy (in-app and web page)
- [x] Terms of Service (in-app and web page)
- [x] Support page (in-app)
- [x] Keywords and metadata

### Technical Requirements
- [x] iOS viewport configuration
- [x] Safe area support
- [x] Touch-optimized UI
- [x] Haptic feedback integration
- [x] PWA standalone mode
- [x] Apple touch icons
- [x] Splash screen links

---

## App Store Connect Setup

### 1. App Information
- **App Name:** Kings Corner Arena
- **Subtitle:** The Ultimate Card Game
- **Primary Language:** English (US)
- **Bundle ID:** com.kingscornerarena.app (choose your own)
- **SKU:** KINGSCORNER001

### 2. Pricing and Availability
- **Price:** Free
- **Availability:** All territories

### 3. App Privacy
Submit privacy details based on PRIVACY_POLICY.md:

**Data Types Collected:**
- Identifiers (User ID)
- Contact Info (Email - optional)
- Usage Data (Game scores, play history)

**Data Use:**
- App Functionality
- Analytics

**Data Not Collected:**
- Health & Fitness
- Financial Info
- Location
- Contacts
- Browsing History

### 4. Age Rating
- **Rating:** 4+
- **Gambling:** No (no real money)
- **Violence:** None
- **Sexual Content:** None

### 5. App Review Information
- **Demo Account:** Not required (guest play available)
- **Notes for Reviewer:**
  > Kings Corner Arena is a classic card game with AI opponents. No in-app purchases. Tap "Play as Guest" to start immediately, or sign in with Apple for progress sync. All gameplay is local with server sync for leaderboards.

---

## Screenshots Required

### iPhone 6.7" Display (1290 x 2796)
Required for iPhone 14 Pro Max, 15 Plus
1. Landing/Home screen
2. Gameplay view
3. Daily Challenge view
4. Victory screen

### iPhone 6.5" Display (1284 x 2778)
Required for iPhone 11/12/13 Pro Max
Same as above

### iPhone 5.5" Display (1242 x 2208)
Required for iPhone 8 Plus
Same as above

### iPad Pro 12.9" (2048 x 2732)
Required for iPad Pro 3rd/4th/5th gen
Same as above

### iPad Pro 11" (1668 x 2388)
Required for iPad Pro
Same as above

---

## App Store Screenshots Guidance

### Screenshot 1: Home Screen
Capture the landing page showing:
- Kings Corner Arena title
- Sign In button
- Play as Guest button
- Daily Challenge button

### Screenshot 2: Gameplay
Capture an active game showing:
- Full 3x3 grid layout
- Cards in hand at bottom
- Score and moves counter
- At least one card on tableau

### Screenshot 3: Daily Challenge
Capture the challenge view showing:
- Leaderboard rankings
- Today's challenge
- User's score/position

### Screenshot 4: Victory
Capture the win overlay showing:
- Victory message
- Final score
- Play Again button

---

## Post-Submission

### After App Store Approval
1. [ ] Update support email in privacy policy
2. [ ] Set up customer support inbox
3. [ ] Monitor App Store Connect for reviews
4. [ ] Respond to any App Review feedback

### Version 1.1 Planning
- Friend lobbies and PvP matchmaking
- Game Center achievements
- Additional card themes
- Sound effects and music

---

## PWA Installation Instructions (Alternative to App Store)

Users can install Kings Corner Arena as a PWA on iOS:

1. Open Safari on iPhone/iPad
2. Navigate to the game URL
3. Tap the Share button (square with arrow)
4. Scroll down and tap "Add to Home Screen"
5. Tap "Add" in the top right

The app will appear on the home screen with the full app icon and launch in standalone mode without browser chrome.
