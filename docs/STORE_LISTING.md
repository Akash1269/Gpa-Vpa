# Store Listings

## App Name

**GPA-VPA: CGPA & GPA Calculator** (30 characters, the Google Play limit)

The launcher name on the phone is **GPA-VPA** (`name` in `app.json`). The longer title above is only the store listing title; it carries the search keywords.

## Short Description (80 chars)

Plan your CGPA and reach your goal. Private, offline, no ads.

## Full Description (App Store & Google Play)

GPA-VPA is a private GPA and CGPA tracker for college students. Add your courses, see your semester and cumulative GPA update instantly, and plan the grades you need to reach your target. Everything stays on your phone.

**Works with your university's grading system**

• US 4.0 scale (A to F)
• Indian 10-point CGPA scale (O to F)
• Your own custom scale for universities with different grades and points

The app suggests a scale from your phone's time zone and region the first time you open it. It never uses your location. You can change it any time in Settings, and your grades and goals can be converted to the new scale.

**Features**

• Instant GPA and CGPA — credit-weighted, per semester and overall
• Goal planner — set a target CGPA and see the average GPA you need each semester to reach it
• CGPA to percentage — an estimate using the formula your university uses (CGPA × 9.5, CGPA × 10, (CGPA − 0.75) × 10, or your own)
• Semester organization — courses are grouped by semester with a progress chart
• Credit goal — track progress to your degree's total credits
• Achievements — ten milestones, with a little celebration from Vee, the owl
• Dark mode — light, dark or follow your phone
• Hide grades — keep your grades out of sight when others are around
• Export — save your records as CSV or a JSON backup

**Private by design**

• No account, no sign-up
• No ads, no tracking, no analytics
• Your data never leaves your device

Whether you are in your first semester or planning your final CGPA, GPA-VPA helps you stay on top of your goals.

## Keywords (Apple, 100 chars)

cgpa,gpa,calculator,grades,college,university,semester,tracker,percentage,goal,student

## App Review Notes

This app calculates GPA locally on the device. No network requests are made and no account is required. All data is stored in on-device storage (AsyncStorage). The app does not collect, store, or transmit any personal data.

On first launch the app reads the device's time zone and language setting, on the device only, to suggest a grading system (US 4.0 or India 10-point). Nothing is sent anywhere and no location permission is requested.

The first launch loads sample courses so that the screens are not empty. Settings → Clear All Data removes them.

## Privacy Details

- Data Not Collected
- No tracking
- No third-party analytics
- No advertising

### Google Play Data safety form

| Question | Answer |
|----------|--------|
| Does your app collect or share any of the required user data types? | No |
| Is all of the user data collected by your app encrypted in transit? | Not applicable (no data is collected) |
| Do you provide a way for users to request that their data is deleted? | Not applicable; users can delete everything in Settings → Clear All Data |
| Does the app contain ads? | No |
| Does the app use the advertising ID? | No |

### Permissions (Android)

The release build requests only `INTERNET` (declared by the React Native runtime; the app makes no network calls) and `VIBRATE` (haptic feedback). Overlay and external storage permissions are blocked in `app.json` (`android.blockedPermissions`).

## Category

Education

## Age Rating

4+ (no objectionable content). On Google Play the content rating questionnaire should come out as "Everyone".

## Store Graphics

All files are in this repository.

| Asset | File | Size | Notes |
|-------|------|------|-------|
| App icon | `docs/store/icon-512.png` | 512×512 | Opaque, no rounded corners (the store applies its own mask) |
| Feature graphic | `docs/store/feature-graphic.png` | 1024×500 | Keep important content in the middle 80% |
| Phone screenshots | `docs/screenshots/*.png` | 1080×2160 | Exactly 2:1, the maximum aspect ratio Play accepts |

Suggested screenshot order for Google Play (2 to 8 allowed):

1. `dashboard.png` — hero GPA, percentage, goals
2. `grading-system.png` — choose US, India or your own scale
3. `goals.png` — plan the grades you need
4. `academic-record.png` — semester chart
5. `achievements.png` — milestones
6. `courses.png` — course list
7. `dashboard-dark.png` — dark mode

`settings.png` is used by the README only. The screenshots show sample data on the India 10-point scale, with a clean status bar (9:41, full battery).

## Privacy Policy URLs

- **In-App:** Settings → Privacy Policy
- **GitHub (public):** https://github.com/Akash1269/Gpa-Vpa/blob/main/docs/PRIVACY_POLICY.md
- **Web App:** https://akash1269.github.io/Gpa-Vpa/privacy-policy

Use the GitHub URL for the Apple App Store and Google Play store submission forms.
