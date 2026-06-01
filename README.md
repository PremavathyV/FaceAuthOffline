# FaceAuth Offline

Secure, offline facial recognition and liveness detection for React Native.
Supports Android 8.0+ devices with zero internet dependency.

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| JDK | 17 | https://adoptium.net |
| Android Studio | Latest | https://developer.android.com/studio |
| Android SDK | API 33+ | Via Android Studio SDK Manager |

---

## Environment Setup (Windows)

### Set Environment Variables

**New System Variable:**
```
ANDROID_HOME = C:\Users\<YourName>\AppData\Local\Android\Sdk
JAVA_HOME    = C:\Users\<YourName>\AppData\Local\Programs\Eclipse Adoptium\jdk-17.x.x-hotspot
```

**Add to PATH:**
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
%JAVA_HOME%\bin
```

### Create Android Emulator

- Android Studio → Device Manager → Create Virtual Device
- Select: **Pixel 6** → API **33** → Finish
- Start the emulator (▶️ Play button)

---

## Run the App

### Step 1 — Install dependencies
```bash
cd FaceAuthOffline
npm install
```

### Step 2 — Set environment (run every new terminal session)
```powershell
$env:JAVA_HOME = "C:\Users\<YourName>\AppData\Local\Programs\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$env:ANDROID_HOME = "C:\Users\<YourName>\AppData\Local\Android\Sdk"
$env:PATH = $env:PATH + ";$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator"
```

### Step 3 — Bundle JS
```powershell
New-Item -ItemType Directory -Force -Path "android\app\src\main\assets" | Out-Null

node node_modules/react-native/cli.js bundle `
  --platform android `
  --dev false `
  --entry-file index.js `
  --bundle-output android/app/src/main/assets/index.android.bundle `
  --assets-dest android/app/src/main/res
```

### Step 4 — Build APK
```powershell
cd android
.\gradlew app:assembleDebug
cd ..
```

### Step 5 — Install & Launch
```powershell
adb install -r "android\app\build\outputs\apk\debug\app-debug.apk"
adb shell am start -n com.faceauthoffline/.MainActivity
```

---

## Quick Run (All-in-one)

```powershell
$env:JAVA_HOME = "C:\Users\Premavathy\AppData\Local\Programs\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$env:ANDROID_HOME = "C:\Users\Premavathy\AppData\Local\Android\Sdk"
$env:PATH = $env:PATH + ";$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator"

cd C:\Users\Premavathy\Desktop\hack\FaceAuthOffline

New-Item -ItemType Directory -Force -Path "android\app\src\main\assets" | Out-Null
node node_modules/react-native/cli.js bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

cd android; .\gradlew app:assembleDebug; cd ..

adb install -r "android\app\build\outputs\apk\debug\app-debug.apk"
adb shell am start -n com.faceauthoffline/.MainActivity
```

---

## Features

| Feature | Status |
|---------|--------|
| Enroll User | ✅ Working |
| Liveness Challenge (blink/smile/turn) | ✅ Working |
| Face Authentication | ✅ Working |
| Offline Storage | ✅ Working |
| AWS Sync (when online) | 🔧 Configure endpoint |
| TFLite Face Embedding | 🔧 Add model files |

---

## Project Structure

```
src/
├── App.tsx
├── screens/
│   ├── HomeScreen.tsx
│   ├── EnrollScreen.tsx
│   ├── AuthScreen.tsx
│   └── ResultScreen.tsx
└── services/
    ├── faceRecognition.ts
    ├── livenessDetector.ts
    ├── database.ts
    └── syncService.ts
assets/
└── models/
    ├── mobilefacenet.tflite   (~5MB)
    ├── face_detector.tflite   (~0.2MB)
    └── face_landmarker.task   (~3.6MB)
```

---

## Model Footprint

| Model | Size | Purpose |
|-------|------|---------|
| mobilefacenet.tflite | ~5 MB | 128-d face embedding |
| face_detector.tflite | ~0.2 MB | Face presence check |
| face_landmarker.task | ~3.6 MB | Liveness landmarks |
| **Total** | **~9 MB** | Under 20MB target ✅ |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `adb not found` | Add `%ANDROID_HOME%\platform-tools` to PATH |
| `java not found` | Add `%JAVA_HOME%\bin` to PATH, restart terminal |
| `Can't find service: package` | Wait for emulator home screen to fully load |
| App crashes on launch | Run JS bundle step (Step 3) before building |
| Port 8081 in use | Run `taskkill /F /IM node.exe` |

---

## License

All models and libraries used are open-source (Apache 2.0 / MIT).
No proprietary licenses required.
