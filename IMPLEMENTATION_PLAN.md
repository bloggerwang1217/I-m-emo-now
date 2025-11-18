# I'm Emo Now - Implementation Plan

## Project Overview
**Goal:** Replicate or go beyond EmoGo - Create an experience-sampling app that collects multimodal emotional data

**Inspiration:** The "Emotions on the Go" study from University of Wisconsin-Madison

## Sprint Goal
Create an experience-sampling app with local storage that collects emotional and contextual data 3 times per day and allows users to export their data.

---

## Core Features

### 1. Data Collection (3 times per day)

#### A. Simple Sentiment Questionnaire
**Type:** Structured active/foreground data
- 5-point emotion scale (very happy → very sad)
- Visual representation with emoji faces
- Slider or button selection interface
- Additional dimensions could include:
  - Arousal level (relaxed ↔ awake)
  - Valence (happy ↔ sad)
  - Energy level

#### B. 1-Second Vlog Recorder
**Type:** Unstructured active/foreground data
- Short video recording (1 second)
- Camera access and recording capability
- Local storage of video files
- Associated with timestamp and session

#### C. GPS Coordinates
**Type:** Structured passive/background data
- Latitude and longitude capture
- Automatic collection when user submits data
- Location permissions handling
- Privacy considerations

### 2. Data Storage
- Local SQLite database for structured data (questionnaire responses, GPS, timestamps)
- Local file system for unstructured data (video files)
- Data schema design for relational structure

### 3. Data Export
- Export functionality to share collected data
- Export all data types together
- Format: CSV for structured data, bundled videos
- Share via native sharing interface

### 4. Notifications
- Schedule 3 daily notifications to prompt data collection
- User-customizable notification times
- Reminder system implementation

---

## Technical Requirements

### Required Expo Packages

1. **expo-notifications**
   - Purpose: Triggering app 3x daily
   - Features: Schedule local notifications, handle notification responses

2. **expo-sqlite**
   - Purpose: Storing structured data
   - Features: Create tables for sessions, responses, locations

3. **expo-camera**
   - Purpose: Recording 1-second vlogs
   - Features: Camera access, video recording, save to local storage

4. **expo-file-system** OR **expo-media-library**
   - Purpose: Video file storage and management
   - Features: Save videos, retrieve videos for export

5. **expo-sharing**
   - Purpose: Exporting collected data
   - Features: Native share dialog for exporting data bundle

6. **expo-location**
   - Purpose: Getting GPS coordinates (lat, lng)
   - Features: Request permissions, get current location

### Additional Recommended Packages

7. **expo-router**
   - Purpose: Navigation/routing
   - Features: File-based routing system (Drawer + Stack navigation)

8. **@react-native-async-storage/async-storage**
   - Purpose: Store user preferences (notification times, settings)

---

## App Architecture

### File Structure (Expo Router)
```
app/
├── (drawer)/
│   ├── _layout.tsx          # Drawer navigation wrapper
│   ├── index.tsx             # Home screen (data entry)
│   ├── history.tsx           # View past entries
│   └── settings.tsx          # Notification settings, preferences
├── _layout.tsx               # Root layout
└── camera.tsx                # Camera screen (stack navigation)
```

### Navigation Pattern
- **Drawer Navigation:** Main app sections (Home, History, Settings)
- **Stack Navigation:** For modal-like screens (Camera view)

---

## Data Schema

### SQLite Tables

#### 1. Sessions Table
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  emotion_score INTEGER,          -- 1-5 scale
  latitude REAL,
  longitude REAL,
  video_filename TEXT
);
```

#### 2. Settings Table
```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY,
  notification_time_1 TEXT,
  notification_time_2 TEXT,
  notification_time_3 TEXT,
  notifications_enabled INTEGER DEFAULT 1
);
```

---

## User Flow

### Main Flow
1. **Notification Received** → User opens app
2. **Home Screen** → Shows emotion questionnaire
3. **Select Emotion** → Choose from 5-point scale
4. **Record Vlog** → Navigate to camera, record 1-second video
5. **Auto-capture GPS** → Location captured in background
6. **Submit** → All data saved to local storage
7. **Confirmation** → User sees confirmation, can view history

### Export Flow
1. **History Screen** → User views all collected data
2. **Export Button** → Tap to export
3. **Data Preparation** → Bundle SQLite data (CSV) + video files
4. **Share Dialog** → Native share interface appears
5. **Export Complete** → Data shared via email, drive, etc.

---

## Implementation Phases

### Phase 1: Project Setup & Core Infrastructure
- [ ] Initialize Expo project with Router
- [ ] Set up folder structure for file-based routing
- [ ] Install all required packages
- [ ] Configure TypeScript (.tsx files)
- [ ] Set up SQLite database and create tables
- [ ] Test database connection and basic CRUD operations

### Phase 2: Emotion Questionnaire UI
- [ ] Create home screen with emotion scale component
- [ ] Design 5-point emotion selector (emoji faces + slider)
- [ ] Implement state management for emotion selection
- [ ] Add timestamp capture
- [ ] Create submit button with validation

### Phase 3: Camera & Video Recording
- [ ] Create camera screen component
- [ ] Request camera permissions
- [ ] Implement 1-second video recording
- [ ] Auto-stop recording after 1 second
- [ ] Save video to local file system
- [ ] Generate unique filenames for videos
- [ ] Link video filename to session in database

### Phase 4: GPS Location Tracking
- [ ] Request location permissions
- [ ] Implement location capture on data submission
- [ ] Handle location errors/fallbacks
- [ ] Store lat/lng in database with session
- [ ] Privacy considerations and user communication

### Phase 5: Notifications System
- [ ] Request notification permissions
- [ ] Create notification scheduler (3x daily)
- [ ] Implement settings screen for customizing notification times
- [ ] Handle notification tap to open app
- [ ] Test notification delivery on device

### Phase 6: Data History & Visualization
- [ ] Create history screen
- [ ] Query and display all sessions from database
- [ ] Show emotion, timestamp, location for each entry
- [ ] Implement video playback for vlogs
- [ ] Add date filtering/sorting options

### Phase 7: Data Export Functionality
- [ ] Create export function to query all data
- [ ] Convert SQLite data to CSV format
- [ ] Bundle video files with structured data
- [ ] Implement sharing via expo-sharing
- [ ] Test export on real device

### Phase 8: UI/UX Polish
- [ ] Improve visual design and consistency
- [ ] Add loading states and error handling
- [ ] Implement smooth transitions and animations
- [ ] Add user feedback (toasts, confirmations)
- [ ] Accessibility improvements

### Phase 9: Testing & Data Collection
- [ ] Test complete flow multiple times
- [ ] Collect 3+ data entries over 12+ hours
- [ ] Verify data export works correctly
- [ ] Test on both iOS and Android if possible
- [ ] Bug fixes and refinements

### Phase 10: Deployment & Documentation
- [ ] ~~Publish using `npx expo publish`~~ (Note: This is crossed out in slides)
- [ ] Build development build or use Expo Go
- [ ] Update README.md with app URI from https://expo.dev/
- [ ] Include H-AI interaction history in repo
- [ ] Create "data" folder with 3+ sample exports
- [ ] Ensure Tlast - T1st > 12 hours for sample data
- [ ] Commit and push all code to GitHub

---

## Submission Checklist

Based on slide 12, the GitHub repository must contain:

✅ **README.md** with:
- App URI @ https://expo.dev/...
- Project description
- Installation instructions
- Usage instructions

✅ **Source Code:**
- All React Native/TypeScript source code
- Properly organized with Expo Router structure

✅ **H-AI Interaction History:**
- Document showing how you used AI assistance
- ChatGPT conversations, Claude conversations, etc.

✅ **Data Folder:**
- Folder named "data" in repository
- Contains exported sample data
- Must have 3+ records for EACH data type:
  - 3+ sentiment questionnaire responses
  - 3+ vlog videos (1-second each)
  - 3+ GPS coordinate records
- Time requirement: Tlast - T1st > 12 hours
  - Example: First entry at 8 AM, last entry after 8 PM same day

---

## Going Beyond EmoGo (Enhancement Ideas)

### More Xs (More Input Variables)
- Add additional emotion dimensions (arousal, dominance)
- Include contextual questions (activity, social context)
- Voice memo option alongside video
- Photo capture of environment
- Weather data from API
- Step count/movement data
- Audio recording of ambient sound

### Better Ys (Better Output/Analysis)
- Data visualization dashboard (charts, graphs)
- Emotion trends over time
- Location-based emotion patterns
- Time-of-day analysis
- Weekly/monthly reports
- Export to standard research formats (BIDS, etc.)
- Cloud backup and sync
- Multi-user support for research studies

---

## Key Technical Considerations

### Permissions
- Camera permission (for vlogs)
- Microphone permission (for video audio)
- Location permission (for GPS)
- Notification permission (for 3x daily prompts)
- Handle permission denials gracefully

### Data Privacy
- All data stored locally (no cloud by default)
- User controls export and sharing
- Clear privacy policy in README
- Location data anonymization options

### Storage Management
- Monitor storage usage (videos can accumulate)
- Implement data cleanup options
- Warn user about storage space

### Cross-Platform Considerations
- Test on both iOS and Android
- Handle platform-specific permission flows
- Camera behavior differences
- File system path differences

### Performance
- Optimize video file size (1-second should be small)
- Efficient database queries
- Lazy loading for history view
- Background task optimization for GPS

---

## Timeline Estimate

- **Phase 1-2:** 2-3 hours (Setup + Emotion UI)
- **Phase 3-4:** 3-4 hours (Camera + GPS)
- **Phase 5:** 2 hours (Notifications)
- **Phase 6:** 2 hours (History view)
- **Phase 7:** 2 hours (Export)
- **Phase 8:** 2 hours (Polish)
- **Phase 9:** 12+ hours (Real-world testing with 3+ entries)
- **Phase 10:** 1 hour (Documentation & submission)

**Total:** ~26-28 hours including real-world data collection

---

## Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo SQLite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Expo Camera Documentation](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Router Documentation](https://expo.github.io/router/docs/)
- [EmoGo Study Reference](https://www.healthyminds.org) (Original inspiration)

---

## Success Criteria

The app is complete when:
1. ✅ User receives 3 notifications per day
2. ✅ User can record emotion + vlog + GPS for each session
3. ✅ Data is stored locally in SQLite + file system
4. ✅ User can view history of all entries
5. ✅ User can export all data via share dialog
6. ✅ Repository contains all required elements (code, README with URI, H-AI history, data folder)
7. ✅ Data folder has 3+ complete records spanning 12+ hours

---

*This plan is based on the requirements from info_11_slides.pdf (Week 11, Psychoinformatics & Neuroinformatics course)*
