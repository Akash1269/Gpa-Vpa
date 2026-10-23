# Google Play Launch Guide — GPA-VPA

A step-by-step playbook for taking GPA-VPA from this repository to a live Google Play listing, starting with creating an independent (personal) developer account. Follow it top to bottom and tick the boxes as you go.

For background and generic reference, see [ANDROID_PUBLISH_GUIDE.md](ANDROID_PUBLISH_GUIDE.md). The ready-to-paste store text, answers and asset list are in [STORE_LISTING.md](STORE_LISTING.md).

> Google changes its console screens, fees and testing numbers from time to time. Where this guide gives a number or a button name, treat it as correct at the time of writing and trust the Play Console if it differs.

---

## Contents

1. [The big picture](#1-the-big-picture)
2. [Before you start](#2-before-you-start)
3. [Create the developer account](#3-create-the-developer-account)
4. [Verify your identity and devices](#4-verify-your-identity-and-devices)
5. [Build the release bundle](#5-build-the-release-bundle)
6. [Create the app in Play Console](#6-create-the-app-in-play-console)
7. [Fill in the store listing](#7-fill-in-the-store-listing)
8. [Complete the App content forms](#8-complete-the-app-content-forms)
9. [Closed testing (required for new personal accounts)](#9-closed-testing-required-for-new-personal-accounts)
10. [Apply for production and release](#10-apply-for-production-and-release)
11. [After launch](#11-after-launch)
12. [Releasing updates](#12-releasing-updates)
13. [Optional: automate uploads with EAS Submit](#13-optional-automate-uploads-with-eas-submit)
14. [Troubleshooting](#14-troubleshooting)
15. [Master checklist](#15-master-checklist)

---

## 1. The big picture

| Stage | What happens | Who does it | Rough time |
|-------|--------------|-------------|------------|
| Account | Sign up, pay the fee, verify identity | You | A few hours to a few days |
| Build | Create the signed `.aab` with EAS | You | About 15–30 minutes |
| Set up | Create the app, store listing, App content forms | You | 1–2 hours |
| Closed test | At least 12 testers for 14 days in a row | You and your testers | **14+ days** |
| Production review | Google reviews the app | Google | A few days |

Plan for **three to four weeks** from signing up to a public listing. The closed test is the long part, so recruit testers as soon as the account is verified.

Fixed facts about this app:

| Item | Value |
|------|-------|
| Package name (application ID) | `com.akash1269.gpavpa` (**cannot be changed after the first upload**) |
| Launcher name | GPA-VPA |
| Store title | GPA-VPA: CGPA & GPA Calculator (30 characters, the limit) |
| Price | Free, no ads, no in-app purchases |
| Category | Education |
| Target API level | 36 |

---

## 2. Before you start

Have these ready:

- [ ] **A Google account** to own the developer account. Use a dedicated one for your apps if you can, because the owner is hard to change later.
- [ ] **A government photo ID**: passport, national ID or driving licence. Your name on it must match what you enter at sign-up.
- [ ] **A credit or debit card** for the one-time **US$25** registration fee.
- [ ] **A phone number** that can receive an SMS code.
- [ ] **An Android phone** with the Google Play Console app available. New personal accounts must verify they have one.
- [ ] **An Expo account** for building with EAS (free): https://expo.dev/signup
- [ ] **Node.js 22**, the project dependencies (`npm ci`) and the EAS CLI: `npm install -g eas-cli`
- [ ] The code **committed and pushed to `main`**, so that the privacy policy URL works.
- [ ] `npm run lint`, `npx tsc --noEmit` and `npm test` all pass.

---

## 3. Create the developer account

Sign up at **https://play.google.com/console/signup** while signed in to the Google account you chose.

### 3.1 Choose the account type

| Choice | Pick it if | Notes |
|--------|-----------|-------|
| **Yourself** (personal) | You are an individual with no registered business | This guide. Faster to set up, but subject to the closed-test rule |
| An organization | You have a registered company | Needs a D-U-N-S number and business documents; skips the closed-test rule |

Choose **Yourself** unless you have a company. Switching later is a hassle.

### 3.2 What to enter

| Field | What to enter | Visible to the public? |
|-------|---------------|-----------------------|
| **Developer name** | The name shown under your app on Google Play. Your own name or a small brand name, one you will be happy to keep for every app | **Yes** |
| **Legal name** (payments profile) | Your full legal name **exactly as on your ID**. A mismatch is the most common reason verification fails | No |
| **Legal address** | Your real residential address | Not shown for a free app with no purchases. Google may show it if you later sell apps or in-app items |
| **Contact name** | Your name | No |
| **Contact email** | An address you check regularly. Google uses it for policy and verification messages | No |
| **Contact phone** | Your number; it is verified by SMS | No |
| **Developer email** (public) | A support address for users. It appears on your store listing, so use one you are happy to publish | **Yes** |
| **Website** (optional) | For example your GitHub Pages site for the app | Yes |

Do not use a nickname as the legal name and do not enter someone else's address or details.

### 3.3 Finish sign-up

1. [ ] Answer the short "about you" questions honestly (experience, number of apps planned, whether you will earn money). For GPA-VPA the app is free, with no ads and no purchases.
2. [ ] Accept the Developer Distribution Agreement.
3. [ ] Pay the **US$25** fee.

---

## 4. Verify your identity and devices

1. [ ] **Verify email and phone** with the codes Google sends.
2. [ ] **Upload your ID** when asked and wait for review. This usually takes from a few hours to a few days. Fix any rejection and resubmit; the usual causes are a name mismatch or a blurry photo.
3. [ ] **Verify an Android device:** install the **Google Play Console** app on an Android phone, sign in with the same account and follow the prompt.
4. [ ] When the account shows as verified, open the Play Console.

While you wait for verification you can already do [section 5](#5-build-the-release-bundle) and start lining up testers (section 9).

---

## 5. Build the release bundle

Google Play needs an **Android App Bundle (`.aab`)**, not an APK. The `production` profile in [eas.json](../eas.json) builds one.

### 5.1 One-time EAS setup

```bash
npm install -g eas-cli
eas login            # your Expo account
```

The project is already linked to EAS (`extra.eas.projectId` in `app.json`). If you use a different Expo account, run `eas init` instead.

### 5.2 Check the version

In [app.json](../app.json):

| Field | Current | Rule |
|-------|---------|------|
| `version` | `0.1.3` | What users see. Consider `1.0.0` for the public release |
| `android.versionCode` | `2` | Must go **up** on every upload. `autoIncrement: true` in the production profile bumps it for you |

### 5.3 Build

```bash
eas build --platform android --profile production
```

- The first time, EAS asks to generate an **Android keystore**. Say **yes** and let EAS manage it.
- When the build finishes, download the `.aab` from the link, or from https://expo.dev under *Builds*.
- **Back up the credentials:** run `eas credentials -p android` and download the keystore. Store it somewhere safe and **never commit it** (`*.jks` is already in `.gitignore`).
- `autoIncrement` edits `versionCode` in `app.json` after the build. Commit that change.

### 5.4 About app signing

Use **Play App Signing** (the default). Google keeps the key that signs the apps users install, and the keystore EAS holds is only your **upload key**. If you ever lose the upload key, Google can reset it. Never turn Play App Signing off.

### 5.5 Check the build before uploading

- [ ] The `.aab` is well under Google Play's size limits (the app is a few tens of MB; the base download limit is far higher).
- [ ] You tested the same code as an APK on a real phone: `eas build --platform android --profile preview`
- [ ] The permissions are only `INTERNET` and `VIBRATE`. For a local check, build the release APK and run `aapt2 dump permissions app-release.apk`.

---

## 6. Create the app in Play Console

1. [ ] In the Play Console choose **Create app**.
2. [ ] Fill in:

| Field | Value |
|-------|-------|
| App name | `GPA-VPA: CGPA & GPA Calculator` |
| Default language | English (United States) or English (India), whichever you prefer |
| App or game | **App** |
| Free or paid | **Free** (this cannot be changed to paid later) |

3. [ ] Tick the declarations (Developer Program Policies and US export laws) and choose **Create app**.
4. [ ] Open the **Dashboard**. It lists every task you need to complete; sections 7 and 8 cover them.

The package name is fixed when you upload the first bundle. Make sure it is `com.akash1269.gpavpa`.

---

## 7. Fill in the store listing

Go to **Grow → Store presence → Main store listing**. Everything to paste is in [STORE_LISTING.md](STORE_LISTING.md).

| Field | Value or file |
|-------|---------------|
| App name | GPA-VPA: CGPA & GPA Calculator |
| Short description (80 chars) | Plan your CGPA and reach your goal. Private, offline, no ads. |
| Full description | The "Full Description" section of STORE_LISTING.md |
| App icon | `docs/store/icon-512.png` (512×512) |
| Feature graphic | `docs/store/feature-graphic.png` (1024×500) |
| Phone screenshots | `docs/screenshots/*.png` (1080×2160). Order: `dashboard`, `grading-system`, `goals`, `academic-record`, `achievements`, `courses`, `dashboard-dark` |
| Category | Education |
| Contact email | Your public developer email |
| Privacy policy URL | https://github.com/Akash1269/Gpa-Vpa/blob/main/docs/PRIVACY_POLICY.md |

Screenshots must be between 320 and 3840 px on each side, with the longer side **at most twice** the shorter. The supplied images are exactly 2:1. A raw 1080×2400 emulator screenshot would be rejected as too tall.

Tablet screenshots are optional. If you want the app to look good on tablets, add 7-inch and 10-inch screenshots later.

---

## 8. Complete the App content forms

Go to **Policy and programs → App content** and complete every item. The answers for GPA-VPA:

| Form | Answer |
|------|--------|
| **Privacy policy** | The URL from section 7 |
| **Ads** | No, the app does not contain ads |
| **App access** | All functionality is available without any login |
| **Content rating** | Start the questionnaire, answer **No** to violence, sexual content, language, drugs, gambling and user-generated content. Choose the category for reference or educational apps. The result should be "Everyone" |
| **Target audience and content** | Pick age groups that fit college students (16 and over). Avoid selecting under-13 groups, which brings in Google's Families policy. Confirm the app is not designed to appeal to children |
| **Data safety** | **No data collected, none shared.** Full answers are in the "Google Play Data safety form" table in STORE_LISTING.md |
| **Advertising ID** | The app does not use it |
| **Government apps, financial features, health, news** | None apply |
| **Trader status (EU Digital Services Act)** | Declare as a **non-trader** while the app is free and you earn nothing from it. If you later add paid features, revisit this and expect to publish contact details |

The Data safety answers are accurate because the app stores everything on the device. If you ever add analytics, crash reporting, cloud backup or ads, update this form and the privacy policy **before** releasing that version.

When every task on the Dashboard shows a green tick, you are ready to test.

---

## 9. Closed testing (required for new personal accounts)

Personal accounts created after November 2023 cannot publish straight to production. You must first run a **closed test** with **at least 12 testers** who stay opted in for **14 continuous days**. (Check the Play Console for the current numbers.)

### 9.1 Recruit testers

- [ ] Find **15 or more** people so that a few drop-outs do not restart the clock. Classmates, hostel mates, friends and family all work.
- [ ] Each tester needs a **Google account** and an **Android phone**.
- [ ] Collect their Gmail addresses (or create a Google Group and add them to it).

### 9.2 Set up the test

1. [ ] Go to **Test and release → Testing → Closed testing** and create a track.
2. [ ] Under **Testers**, create a list (email addresses or a Google Group).
3. [ ] Create a release: **Create new release** → upload the `.aab` from section 5 → add release notes (for example "First test release") → **Save** → **Review release** → **Start rollout to Closed testing**.
4. [ ] Google may review the release first. When it is live, copy the **opt-in link** from the track's Testers tab.

### 9.3 Run the test

1. [ ] Send testers the opt-in link. They open it on their phone, tap **Become a tester** and then install the app from the Play Store.
2. [ ] Ask them to **open the app a few times over the two weeks** and report any bugs.
3. [ ] Check the tester count in the Play Console every few days. It must stay at 12 or more for **14 days in a row**.
4. [ ] Fix problems as they come in and upload new builds to the closed track. Keep going while the clock runs.

Message you can send:

> I'm testing my GPA/CGPA tracker app on Google Play and need a few people to install it. Please open this link on your Android phone, tap "Become a tester", then install the app, and open it now and then over the next two weeks: [link]. Tell me if anything looks wrong. Thanks!

---

## 10. Apply for production and release

1. [ ] After 14 days with 12+ testers, open the **Dashboard** and choose **Apply for production access**.
2. [ ] Answer the questions about how you tested and what feedback you acted on. Be specific and honest.
3. [ ] Wait for Google's decision, which typically takes a few days.
4. [ ] When approved, go to **Test and release → Production → Create new release**.
5. [ ] Upload the `.aab` (or promote the tested release), add release notes, and choose **Review release** → **Start rollout to Production**.
6. [ ] Optional: use a **staged rollout** (for example 20%, then 50%, then 100%) so a problem reaches fewer people.
7. [ ] Wait for review. The first public review usually takes a few days. You are notified by email.

---

## 11. After launch

- [ ] Open the listing on a phone and check the icon, screenshots, name and description.
- [ ] Watch **Quality → Android vitals** for crashes and ANRs. Aim for crash rate under about 1% and ANR rate under about 0.5%.
- [ ] Read and answer reviews. Replying helps with ratings.
- [ ] Track installs, uninstalls and ratings under **Statistics**. This is how you measure growth without adding analytics to the app.
- [ ] Share the Play link in student communities (see the promotion strategy).

---

## 12. Releasing updates

1. Change the code and make sure `npm run lint`, `npx tsc --noEmit` and `npm test` pass.
2. Bump `version` in `app.json` for user-visible changes. (`versionCode` is bumped by `autoIncrement`.)
3. Build: `eas build --platform android --profile production`
4. Upload the new `.aab` in **Test and release → Production → Create new release**, add release notes (keep them short and under 500 characters), and roll out. Consider a staged rollout.

| Change | Example `version` |
|--------|-------------------|
| Bug fix | 1.0.1 |
| New feature | 1.1.0 |
| Big change | 2.0.0 |

If you add analytics, ads, accounts or any network use, update the **Data safety** form and the **privacy policy** first.

---

## 13. Optional: automate uploads with EAS Submit

You can upload builds from the command line instead of through the console. The first release must still be uploaded by hand.

1. [ ] In Google Cloud Console create a **service account** and download its **JSON key**.
2. [ ] In Play Console go to **Users and permissions → Invite new users**, add the service account's email and give it release permissions for this app.
3. [ ] Save the key as `google-play-service-account.json` in the project root. This path is set in [eas.json](../eas.json). The file is a **secret**: it is listed in `.gitignore` and must never be committed or shared.
4. [ ] Submit: `eas submit --platform android --profile production`. The default track is `internal`; change `track` in `eas.json` if you want a different one.
5. [ ] Or build and submit together: `eas build --platform android --profile production --auto-submit`

---

## 14. Troubleshooting

| Problem | Likely cause and fix |
|---------|----------------------|
| Identity verification rejected | The legal name does not match the ID, or the photo is unclear. Correct the name and re-upload |
| "Version code already exists" | `versionCode` was not increased. Keep `autoIncrement: true`, or raise it in `app.json` |
| "Package name already in use" | Another app has that ID. Package names are global, so you must pick another one **before** the first upload |
| "You uploaded an APK" | Play needs an `.aab`. Use the `production` profile (`buildType: app-bundle`), not `preview` |
| Upload signed with the wrong key | You must keep using the same upload keystore. Restore it from your backup, or ask Google to reset the upload key |
| Screenshots rejected | A side is outside 320–3840 px, or the shape is taller than 2:1. Use the files in `docs/screenshots/` |
| Cannot apply for production | The closed test has not had 12 testers for 14 continuous days. Check the tester count and wait |
| Rejected for permissions | Check the merged release manifest (`aapt2 dump permissions`). `app.json` already blocks the ones this app does not need |
| Rejected for a privacy policy | The URL does not load, or the policy does not match the Data safety form. Open it in a private window and compare |
| Data safety mismatch | Something in the app collects data that the form says it does not. Update the form and the policy |
| Build fails with out-of-memory | Use a larger EAS build resource class for the production profile (see the EAS Build configuration docs) |

---

## 15. Master checklist

**Account**
- [ ] Google account chosen
- [ ] Developer account created ("Yourself"), US$25 paid
- [ ] Identity, phone, email and Android device verified

**Build**
- [ ] Code committed and pushed to `main`, checks passing
- [ ] `eas build --platform android --profile production` succeeded
- [ ] Keystore backed up (not committed)

**Play Console setup**
- [ ] App created (package `com.akash1269.gpavpa`, free)
- [ ] Store listing: text, icon, feature graphic, 2–8 screenshots
- [ ] Privacy policy URL works
- [ ] Ads, app access, content rating, target audience, Data safety and Advertising ID completed
- [ ] Dashboard shows no outstanding tasks

**Testing and release**
- [ ] Closed test live with 12+ testers
- [ ] 14 continuous days completed
- [ ] Applied for production access and approved
- [ ] Production release rolled out
- [ ] Listing checked on a real phone

**After launch**
- [ ] Android vitals and reviews monitored
- [ ] Update process understood (section 12)
