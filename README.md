# KinScribe

KinScribe is a genealogy research and family-history writing app. It helps organize family records and turn research, photographs, and oral memories into a cited manuscript. The interface is designed for phones and tablets, with adjustable text size and Android packaging through Capacitor.

## Features

- Write and organize manuscript chapters, with rich-text formatting and PDF export.
- Keep ancestor profiles, family relationships, timelines, sources, citations, and research notes together.
- Import family trees in GEDCOM format and manuscripts in supported document formats.
- Review conflicting records, compare evidence, and mark important discoveries.
- Review each chapter's word count and inserted citations, alongside open family-record conflicts.
- Export and restore a JSON backup containing manuscript, research, citations, and scrapbook items.
- Open FamilySearch and Ancestry sign-in pages in Android's native browser tab.
- Search FamilySearch and Ancestry using the built-in query assistant.
- Record oral histories with browser speech recognition when the device/browser supports it.
- Organize family photographs, link them to ancestors, and restore photos locally on the device.
- Explore family timelines, maps, and thematic insights.
- Automatically save app data to the browser or installed app's local storage.

Verify historical claims against original records, and review restored photos against the originals.

## Requirements

- Node.js and npm
- Android Studio and the Android SDK for building or running the Android app
- Optional: a Google Maps Platform API key for map features

## Run Locally

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). KinScribe's core features run locally and do not require a hosted API or API key. FamilySearch/Ancestry searches need an internet connection. To enable maps, copy `.env.example` to `.env` and add a Google Maps Platform API key; maps also need an internet connection.

## Build for Android

The Capacitor Android project is in `android/`. Build the web assets and copy them into the native project with:

```sh
npm run android:sync
```

Then open the project in Android Studio:

```sh
npm run android:open
```

In Android Studio, select an emulator or connected device and run the app. The `android:run` script also builds and syncs the web assets, then opens Android Studio; it does not itself launch the app on a device.

Capacitor packages the app locally. Writing, family records, citations, backups, GEDCOM import, and local photo restoration do not require a website or API server. FamilySearch/Ancestry sign-in, external searches, and map tiles require an internet connection.

### Download an Android APK from GitHub

The Android APK workflow builds an installable debug APK when changes are pushed to `main`, when a pull request targets `main`, or when manually started from the GitHub Actions tab. To download a build, open the completed **Android APK** workflow run and download the `kinscribe-android-debug` artifact. Extract the ZIP on your Android phone and open the APK; Android may ask you to allow installs from that source.

To publish an APK on a GitHub Release, push a version tag such as `v0.1.0`:

```sh
git tag v0.1.0
git push origin v0.1.0
```

After the workflow completes, the APK will be attached to that tag's GitHub Release. These are debug builds for testing and direct installation, not Play Store releases. The installed app does not need a KinScribe backend.

Provider sign-in opens each service in a secure browser tab. KinScribe does not collect provider passwords or authenticate to either service directly, and signing in does not connect or synchronize account data with KinScribe. Family trees can be imported separately from a GEDCOM file.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development app on port 3000 |
| `npm run build` | Create the production web assets in `dist/` |
| `npm run preview` | Preview the Vite production build |
| `npm run lint` | Run the TypeScript compiler without emitting files |
| `npm test` | Run focused component tests |
| `npm run android:sync` | Build the web app and sync it to Capacitor Android |
| `npm run android:open` | Open the Android project in Android Studio |

## Data and Privacy

Manuscript content, ancestors, citations, and research state are autosaved in local storage on the current browser or app installation. This is local to that browser/app profile; it is not automatically synchronized across devices. Clearing browser or app data can remove locally saved work, so keep separate backups of important material.

Use **More Options → Back Up Family History** to download a KinScribe JSON backup. **Restore a Backup** replaces the saved work on the current device and reloads the app after confirmation. User-added scrapbook photos are resized for local storage and included in the backup. The Chapter Review checklist counts citation markers inserted in the active chapter and reports pending conflicts across the family file; it cannot determine whether every statement is supported by evidence.

KinScribe stores family history on the current browser or app installation; it does not synchronize data to a KinScribe server.
