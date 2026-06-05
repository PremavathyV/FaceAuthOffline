# FaceAuth Offline

Secure, offline facial recognition and liveness detection for React Native.
Supports Android 8.0+ devices with zero internet dependency.

---

## How It Works

```
📷 Capture Face
      ↓
🧠 MobileFaceNet TFLite (native Kotlin)
      ↓
📐 128-d Face Embedding
      ↓
📊 Cosine Similarity (threshold: 0.60)
      ↓
✅ ACCESS GRANTED / ❌ ACCESS DENIED
```

---

## Features

| Feature | Status |
|---------|--------|
| Real face enrollment | ✅ TFLite MobileFaceNet |
| Real face authentication | ✅ Cosine similarity matching |
| Liveness challenge (blink/smile/turn) | ✅ Active challenge UI |
| Offline storage | ✅ In-memory (session) |
| Professional result screen | ✅ Name + ID + Time |
| AWS sync stub | ✅ Ready to configure |
| Android 8.0+ | ✅ Supported |
| iOS | ✅ Source ready (Mac needed to build) |

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| JDK | 17 | https://adoptium.net |
| Android Studio | Latest | https://developer.android.com/studio |
| Android SDK | API 33+ | Via Android Studio SDK Manager |

---

## Quick Install (Android)

Download APK from [Releases](../../releases) and install on Android device.

---

## Build & Run (Android)

### Set Environment Variables (Windows)
```powershell
$env:JAVA_HOME = "C:\Users\<YourName>\AppData\Local\Programs\Eclipse Adoptium\jdk-17.x.x-hotspot"
$env:ANDROID_HOME = "C:\Users\<YourName>\AppData\Local\Android\Sdk"
$env:PATH = $env:PATH + ";$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator"
```

### One-command build & run
```powershell
cd FaceAuthOffline

# 1. Install dependencies
npm install

# 2. Bundle JS
New-Item -ItemType Directory -Force -Path "android\app\src\main\assets" | Out-Null
node node_modules/react-native/cli.js bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# 3. Build APK
cd android; .\gradlew app:assembleDebug; cd ..

# 4. Install on device/emulator
adb install -r "android\app\build\outputs\apk\debug\app-debug.apk"
adb shell am start -n com.faceauthoffline/.MainActivity
```

---

## Build & Run (iOS — Mac only)

```bash
cd FaceAuthOffline
npm install
cd ios
pod install
cd ..
npx react-native run-ios
```

---

## Project Structure

```
src/
├── App.tsx                          # Root navigation
├── screens/
│   ├── HomeScreen.tsx               # Entry point
│   ├── EnrollScreen.tsx             # Face enrollment
│   ├── AuthScreen.tsx               # Face authentication
│   └── ResultScreen.tsx             # Professional result display
├── services/
│   ├── faceRecognition.ts           # TFLite embedding + matching
│   ├── livenessDetector.ts          # Challenge detection
│   ├── database.ts                  # Offline storage
│   └── syncService.ts               # AWS sync stub
└── utils/
    └── camera.ts                    # Camera capture utility

android/
└── app/src/main/java/com/faceauthoffline/
    ├── MainActivity.kt
    ├── MainApplication.kt
    ├── CameraModule.kt              # Native camera intent
    ├── CameraPackage.kt
    ├── FaceRecognitionModule.kt     # TFLite MobileFaceNet inference
    └── FaceRecognitionPackage.kt

assets/models/
    ├── mobilefacenet.tflite         # 128-d face embedding (~5MB)
    ├── face_detector.tflite         # BlazeFace detector (~0.2MB)
    └── face_landmarker.task         # MediaPipe landmarks (~3.6MB)
```

---

## Model Details

| Model | Size | Input | Output |
|-------|------|-------|--------|
| MobileFaceNet | ~5 MB | 112×112×3 normalized | 128-d embedding |
| BlazeFace | ~0.2 MB | 128×128×3 | Detection scores |
| FaceLandmarker | ~3.6 MB | Face crop | 478 landmarks |
| **Total** | **~9 MB** | | Under 20MB ✅ |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `adb not found` | Add `%ANDROID_HOME%\platform-tools` to PATH |
| `java not found` | Add `%JAVA_HOME%\bin` to PATH |
| `Can't find service: package` | Wait for emulator home screen |
| App crashes on launch | Run JS bundle step before building |
| Camera blank in emulator | Use real Android device or set webcam in AVD settings |

---

## License

Open-source (Apache 2.0 / MIT). No proprietary licenses required.
