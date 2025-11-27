# Sample Data Folder

This folder contains sample exported data from the I'm Emo Now app.

## Files

### sample_export.csv
Sample CSV export showing the format of exported emotional data.

**Format:**
```
timestamp,gps_x,gps_y,emo_score
```

**Columns:**
- `timestamp`: ISO 8601 formatted datetime (UTC - Zero timezone). *Note: Will be updated to local time in future releases.*
- `gps_x`: Latitude (decimal degrees)
- `gps_y`: Longitude (decimal degrees)
- `emo_score`: Emotion rating (1-5 scale)

**Emotion Scale:**
- 1: Very Sad 😢
- 2: Sad 😟
- 3: Neutral 😐
- 4: Happy 😊
- 5: Very Happy 😄

## Sample Data Requirements

Per project requirements, sample data must include:
- ✅ 3+ emotion questionnaire responses
- ✅ 3+ GPS coordinate records
- ✅ Time span > 12 hours (first to last entry)

The sample data provided spans from 8:30 AM to 8:45 PM (12+ hours).

## Videos

Videos recorded during check-ins are stored separately in the device's camera roll/photo gallery. They can be located by matching the timestamp with the corresponding CSV entry.

Video naming convention: `imo_emo_now_[timestamp].mp4`

## Real Data Collection

To collect real data:
1. Install and run the app on a physical device
2. Complete check-ins at least 3 times over a 12+ hour period
3. Use the "Export Data" feature in the History screen
4. Save exported CSV and locate videos in your camera roll

## Privacy Note

All sample data uses fictional GPS coordinates (Boston area) for demonstration purposes only. Real user data should be handled according to privacy guidelines and informed consent protocols.
