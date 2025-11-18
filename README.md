# I'm Emo Now

An experience-sampling mobile app that collects multimodal emotional data through daily check-ins. Inspired by the "Emotions on the Go" study from University of Wisconsin-Madison.

## App URI

🚀 **Expo Go URI:** `exp://[your-expo-url]`

📱 **QR Code:** Scan with Expo Go app

*Note: The app URI will be available after running `npx expo start` and publishing to Expo.*

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

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bloggerwang1217/I-m-emo-now.git
   cd I-m-emo-now
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on device:**
   - **iOS (Physical Device):** Scan QR code with Camera app, opens in Expo Go
   - **Android (Physical Device):** Scan QR code with Expo Go app
   - **iOS Simulator:** Press `i` in terminal
   - **Android Emulator:** Press `a` in terminal

### Building for Production

To create a standalone build for production:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
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

## Data Privacy

- ✅ All data stored locally on your device
- ✅ No cloud storage or external servers
- ✅ Location only captured during check-ins (no background tracking)
- ✅ You control data export and sharing
- ✅ Videos saved to your device camera roll
- ✅ Can delete individual entries anytime

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

## H-AI Interaction History

This project was developed with assistance from Claude AI (Anthropic). The interaction history has been documented and is available in the repository under `H-AI-INTERACTION.md`.

Key areas where AI assistance was utilized:
- Architecture planning and project structure
- SQLite database design and implementation
- Navigation setup with Expo Router
- Design system implementation
- Code review and optimization
- Debugging and error handling

## Sample Data

Sample data exports are available in the `/data` folder:
- 3+ emotion questionnaire responses
- 3+ GPS coordinate records
- Time span: > 12 hours between first and last entry

Videos are stored in the device camera roll and referenced by timestamp in the CSV export.

## Development Timeline

- **Phase 1-2:** Project setup and emotion UI (3 hours)
- **Phase 3-4:** Camera and GPS implementation (4 hours)
- **Phase 5:** Notifications system (2 hours)
- **Phase 6:** History screen (2 hours)
- **Phase 7:** Data export (2 hours)
- **Phase 8:** UI/UX polish (2 hours)
- **Phase 9:** Testing and data collection (12+ hours)
- **Phase 10:** Documentation (1 hour)

**Total:** ~28 hours including real-world testing

## Known Issues

- Camera recording may require device restart after first permission grant on some Android devices
- iOS simulator does not support camera, must test on physical device
- Notification delivery reliability varies by device/OS settings

## Future Enhancements

### More Input Variables (More Xs)
- Additional emotion dimensions (arousal, dominance)
- Contextual questions (activity, social context)
- Voice memo option
- Photo capture of environment
- Weather data integration
- Step count/movement data

### Better Analysis (Better Ys)
- Data visualization dashboard
- Emotion trends over time
- Location-based emotion patterns
- Time-of-day analysis
- Weekly/monthly reports
- Cloud backup and sync
- Multi-user support for research studies

## Credits

- **Inspiration:** "Emotions on the Go" study (University of Wisconsin-Madison)
- **Design:** Flexoki and One Hunter color palettes
- **Icons:** Ionicons
- **Framework:** Expo and React Native
- **Development:** Assisted by Claude AI (Anthropic)

## License

MIT License - See LICENSE file for details

## Contact

For questions or feedback, please open an issue on the GitHub repository.

---

**Built with ❤️ for Psychoinformatics & Neuroinformatics course**
