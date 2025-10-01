# Project Documentation: Scout1

This document provides a comprehensive overview of the Scout1 mobile application for other Large Language Models (LLMs). It covers the project's purpose, structure, and core functionalities from the client-side perspective.

## 1. Project Overview

Scout1 is a voice-controlled mobile application built with React Native and Expo. It is designed to assist visually impaired users by allowing them to interact with their environment through voice commands. The app listens for a wake word, processes commands, and provides voice feedback.

- **Name:** `scout1`
- **Version:** `1.0.0`
- **Platform:** iOS and Android (managed by Expo)

## 2. Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo CLI
- A Picovoice Access Key (see Configuration section)

### Installation

1.  Clone the repository.
2.  Install the dependencies:

    ```bash
    npm install
    ```

### Running the Application

-   **Start the development server:**

    ```bash
    npm start
    ```

-   **Run on Android:**

    ```bash
    npm run android
    ```

-   **Run on iOS:**

    ```bash
    npm run ios
    ```

## 3. Project Structure

Here is a breakdown of the key files and directories in the project:

```
C:\project\scout1\
├───.gitignore
├───app.json                 # Expo configuration file
├───package.json             # Project dependencies and scripts
├───tsconfig.json            # TypeScript configuration
├───app\
│   ├───_layout.tsx          # Main layout for the app
│   └───index.tsx            # The main screen of the application
├───assets\
│   ├───sounds\
│   │   ├───listening.mp3
│   │   ├───success.mp3
│   │   └───error.mp3
│   └───... 
├───src\
│   ├───services\
│   │   ├───CameraService.ts
│   │   ├───IntentService.ts
│   │   ├───NetworkService.ts
│   │   ├───TtsService.ts
│   │   └───VoiceService.ts
│   └───store.ts               # Zustand store for state management
└───... (other directories)
```

## 4. Core Functionality: Voice-First Experience

The application operates in a "hands-free" mode, constantly listening for a wake word. Once the wake word is detected, it listens for a command, processes it, and provides voice feedback.

### Initialization

- On app start, all services are initialized (`VoiceService`, `IntentService`, `TtsService`, `CameraService`).
- The app immediately starts listening for the wake word.

### Wake Word Detection

- The `VoiceService` (using Picovoice Porcupine) listens for the wake word.
- Upon detection, the app gives haptic feedback, plays a sound, and starts listening for a voice command.

### Voice Command and Intent Recognition

- `VoiceService` (using `@react-native-voice/voice`) captures the user\'s command.
- The command is passed to the `IntentService`, which uses a TensorFlow Lite model to determine the user\'s intent.

### Action Execution

- Based on the intent, the app performs an action (e.g., `describe_scene`, `read_text`).
- This involves using the `CameraService` to take a picture and the `NetworkService` to send it to the Professor server.

### Voice and Audio Feedback

- The `TtsService` provides voice feedback for responses and errors.
- The `expo-av` library is used to play short sound effects for different states (listening, success, error).

## 5. Configuration

To get the application running, you need to configure two things:

### 1. Picovoice Access Key

The application uses the Picovoice wake word engine. You will need to get a free Access Key from the [Picovoice Console](https://console.picovoice.ai/).

1.  Open the file `src/services/VoiceService.ts`.
2.  On line 7, replace `'YOUR_ACCESS_KEY_HERE'` with your actual Access Key.

### 2. Professor Server URL

1.  Open the file `src/services/NetworkService.ts`.
2.  On line 4, replace the example IP address with the actual IP address of your Professor server.

## 6. Sound Effects

The application uses sound effects to provide feedback to the user. The sound files are located in the `assets/sounds` directory. The current files are placeholders. You should replace them with your own sound files.

- `listening.mp3`: Played when the app is listening for a command.
- `success.mp3`: Played when an action is successful.
- `error.mp3`: Played when an error occurs.

## 7. Troubleshooting and Current Status (As of 2025-09-19)

The project underwent a significant debugging session to resolve a series of cascading build and runtime errors. This section summarizes the fixes applied and the current stable state of the application.

### Problems Encountered
1.  **Native Build Failures (`react-native-fast-tflite`):** The initial project state suffered from a critical native build failure. The `react-native-fast-tflite` library was unable to link against the core TensorFlow Lite libraries, causing the Android build to fail completely. Multiple attempts to fix this via Gradle configuration were unsuccessful.
2.  **Native Module Errors (`@react-native-voice/voice`):** After bypassing the TFLite issue, a persistent runtime error `TypeError: Cannot read property 'startSpeech' of null` occurred. This indicated that the `@react-native-voice/voice` native module was not initializing correctly, likely due to permission or linking issues that even a full project clean and rebuild could not resolve.
3.  **Asset Loading Errors:** The app also failed to load `.ppn` (Porcupine model) and `.mp3` (sound effect) files because the Metro bundler was not configured to recognize these file extensions as assets.

### Solutions Implemented
To achieve a stable, working application, the following steps were taken:

1.  **Removed Problematic Libraries:** The two libraries causing intractable errors were removed:
    - `react-native-fast-tflite` was uninstalled.
    - `@react-native-voice/voice` was uninstalled.
2.  **Updated Metro Configuration:** The `metro.config.js` file was updated to include `ppn` and `mp3` in the `assetExts` array, allowing the bundler to correctly handle these files.
3.  **Fixed Permissions:** The `RECORD_AUDIO` permission was added to the `android.permissions` array in `app.json` and a runtime permission request was added to ensure the audio system could be initialized.
4.  **Refactored Services:**
    - `IntentService.ts` was replaced with a placeholder class.
    - `VoiceService.ts` was rewritten to only handle wake word detection (using Picovoice Porcupine) and provide a callback to the UI.
    - `app/(tabs)/index.tsx` was updated to use the new `VoiceService` and to simulate the application flow after the wake word is detected.

### Current Status
- The application is **stable and runs without crashing**.
- It successfully initializes all services.
- It listens for and detects the built-in wake word **"Bumblebee"**.
- Upon hearing "Bumblebee", it simulates the rest of the application flow (pretending the user said "describe the scene").
- All previously identified build and runtime errors have been resolved.

## 8. Future Plans

- **Integrate Picovoice Rhino:** Replace the placeholder `IntentService` with a real implementation using `@picovoice/rhino-react-native` for robust intent recognition.
- **Integrate Picovoice Cheetah:** Implement `@picovoice/cheetah-react-native` for high-quality, on-device speech-to-text, replacing the removed `@react-native-voice/voice` functionality.
- **Implement Custom Wake Word:** After confirming the stability with the built-in "Bumblebee", switch back to a custom wake word (e.g., "Hey Iris") by using a valid, re-downloaded `.ppn` model file for the Android platform.