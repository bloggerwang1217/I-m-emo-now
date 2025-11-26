# I'm Emo Now

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/1M59WghA)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=21773999&assignment_repo_type=AssignmentRepo)

An experience-sampling mobile app that collects multimodal emotional data through daily check-ins. Inspired by the "Emotions on the Go" study from University of Wisconsin-Madison.

## App URI

🚀 [Android Preview Build](https://expo.dev/accounts/bloggerwang1217/projects/Im-emo-now/builds/9788ccbe-e2c4-4d44-bc99-60e600fcf28d)

📱 **QR Code:** Scan it to download the apk.

## Project Description

**I'm Emo Now** is a React Native mobile application built with Expo that helps users track their emotional states throughout the day. The app prompts users three times daily to:

- **Rate their emotions** on a 1-5 scale using an interactive emoji slider
- **Record a 1-second vlog** capturing their emotional state visually
- **Automatically capture GPS coordinates** of their location during check-in

All data is stored locally on the device and can be exported as a CSV file for analysis.

### Design Philosophy

The app features an **"Atmospheric Sci-Fi"** design system inspired by the Flexoki and One Hunter color palettes:

- **Minimalist & Introspective:** Clean, focused interface without distractions
- **Dark Theme:** Inky dark backgrounds with soft, desaturated colors
- **Text-Centric:** Clear typography using the Inter font family
- **Subtle Interactions:** Minimal animations and elegant transitions

## Features

### Core Functionality

✅ **Emotion Questionnaire**
- 5-point emotion scale with emoji slider (😢 😟 😐 😊 😄)
- Visual, touch-friendly interface
- Single emotion score (1-5) stored per session

✅ **1-Second Vlog Recorder**
- Quick video capture using device camera
- Front/back camera toggle
- Auto-save to device camera roll/photo gallery
- Countdown timer for recording preparation

✅ **GPS Location Tracking**
- Location captured ONLY during check-in submission
- No continuous background tracking
- Latitude and longitude stored with each session
- Privacy-focused design

✅ **Daily Notifications**
- 3 customizable notification times per day
- Local notification delivery (no backend required)
- Enable/disable notifications in settings
- Test notification feature

✅ **History & Data Visualization**
- View all past check-ins in chronological order
- Display emotion, timestamp, and location for each entry
- Delete individual entries
- Refresh to update data

✅ **Data Export**
- Export all data as CSV format
- Share via native device sharing (email, cloud storage, etc.)
- CSV format: `timestamp,gps_x,gps_y,emo_score`
- Videos stored separately in device camera roll

### Technical Stack

- **Framework:** React Native with Expo SDK 54
- **Navigation:** Expo Router with Drawer + Stack navigation
- **Database:** SQLite for local data storage
- **UI Components:** Custom components with Atmospheric Sci-Fi design system
- **Notifications:** expo-notifications (local push notifications)
- **Camera:** expo-camera for video recording
- **Location:** expo-location for GPS capture
- **Media:** expo-media-library for saving videos to camera roll

## Installation Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app (iOS/Android) or development build

### How to run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bloggerwang1217/I-m-emo-now.git
   cd I-m-emo-now
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npx expo start --tunnel
   ```

3. Open the app on a device or emulator using the Expo dev tools.


### Building for Development

For faster development iteration, create a development build that connects to your Metro bundler:

```bash
# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Login to Expo
eas login

# Build development version for Android
eas build --profile development --platform android

# Or for iOS
eas build --profile development --platform ios
```

**Development Build Workflow:**

1. **One-Time Setup:** Build and install the development APK/IPA on your device (wait ~10-20 minutes)
2. **Daily Development:**
   - Start Metro bundler: `npx expo start`
   - Scan QR code with your development build app
   - Make code changes → Press `r` in terminal to reload
   - No need to rebuild unless you change native dependencies or app.json

**When to rebuild:**
- ✅ Adding/removing native packages (e.g., expo-camera)
- ✅ Modifying app.json native configurations (permissions, plugins)
- ❌ NOT needed for TypeScript/JavaScript/UI changes (just press `r`)

**Comparison:**

| Build Type | Use Case | Reload Time | Sharing |
|:-----------|:---------|:------------|:--------|
| **Development** | Active development | Instant (press `r`) | Requires your computer |
| **Preview** | Testing & sharing | ~15 min rebuild | Standalone APK |
| **Production** | App store release | ~20 min rebuild | Store-ready |


### Building for Production

To create a standalone build for production:

```bash
# Install Expo-Dev-Client
npx expo install expo-dev-client

# Install EAS CLI
npm install -g eas-cli

# Login (or Sign up)
eas login

# Initiation
eas init

# Configure EAS project
eas build:configure

# Build for iOS
eas build --platform ios --profile preview

# Build for Android
eas build --platform android --profile preview
```

## Usage Instructions

### First Launch

1. **Grant Permissions:** The app will request the following permissions:
   - 📸 Camera (for recording vlogs)
   - 🎤 Microphone (for video audio)
   - 📍 Location (for GPS during check-ins)
   - 📱 Notifications (for daily reminders)
   - 🖼️ Media Library (for saving videos)

2. **Configure Notifications:** Open the Settings screen to customize your three daily notification times.

### Daily Check-In Flow

1. **Receive Notification:** You'll get a notification at your scheduled times
2. **Open App:** Tap the notification or open the app manually
3. **Select Emotion:** Use the emoji slider to rate your current emotion (1-5)
4. **Record Vlog (Optional):** Tap "Record Video" to capture a 1-second video
5. **Submit:** Tap "Submit Check-In" - your location will be automatically captured
6. **Confirmation:** You'll see a success message

### Viewing History

1. Open the **History** screen from the drawer menu
2. Scroll through your past entries
3. Pull down to refresh the list
4. Tap the trash icon to delete an entry

### Exporting Data

1. Open the **History** screen
2. Tap **"Export Data (CSV)"**
3. Choose where to share the data (email, cloud storage, etc.)
4. Videos are stored separately in your camera roll

### Settings

1. **Enable/Disable Notifications:** Toggle the switch
2. **Customize Times:** Tap on each time slot to change notification times
3. **Save Settings:** Tap "Save Times" after making changes
4. **Test Notifications:** Send a test notification to verify setup

## Project Structure

```
I-m-emo-now/
├── app/
│   ├── (drawer)/
│   │   ├── _layout.tsx      # Drawer navigation
│   │   ├── index.tsx         # Home/Check-in screen
│   │   ├── history.tsx       # History screen
│   │   └── settings.tsx      # Settings screen
│   ├── camera.tsx            # Camera modal screen
│   └── _layout.tsx           # Root layout
├── constants/
│   └── theme.ts              # Design system (colors, typography, spacing)
├── utils/
│   ├── database.ts           # SQLite database operations
│   ├── notifications.ts      # Notification scheduling
│   └── location.ts           # GPS location capture
├── assets/
│   └── images/               # App icons and images
├── app.json                  # Expo configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## Database Schema

### Sessions Table
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  emotion_score INTEGER NOT NULL,
  latitude REAL,
  longitude REAL,
  video_filename TEXT
);
```

### Settings Table
```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY,
  notification_time_1 TEXT DEFAULT '09:00',
  notification_time_2 TEXT DEFAULT '14:00',
  notification_time_3 TEXT DEFAULT '20:00',
  notifications_enabled INTEGER DEFAULT 1
);
```

## Color Palette

| Color Name | Hex Code | Usage |
|:-----------|:---------|:------|
| Inky Dark | `#1D2021` | Background |
| Ivory | `#E6E0C2` | Primary text |
| Slate Grey | `#928374` | Secondary text, metadata |
| Muted Gold | `#D79921` | Primary buttons, accent |
| Desaturated Teal | `#458588` | Links, highlights |
| Muted Green | `#98971A` | Success states, positive emotions |
| Soft Rust | `#CC241D` | Alerts, negative emotions |

## Sample Data

Sample data exports are available in the `/data` folder:
- 3+ emotion questionnaire responses
- 3+ GPS coordinate records
- Time span: > 12 hours between first and last entry

Videos are stored in the device camera roll and referenced by timestamp in the CSV export.

## Credits

- **Inspiration:** "Emotions on the Go" study (University of Wisconsin-Madison)
- **Design:** Flexoki and One Hunter color palettes
- **Icons:** Ionicons
- **Framework:** Expo and React Native
- **Development:** Assisted by Claude AI (Anthropic)

## License

MIT License

## Contact

For questions or feedback, please open an issue on the GitHub repository.

---

**Built with ❤️ for Psychoinformatics & Neuroinformatics course**
