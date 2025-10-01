# Scout1 - Voice-Controlled Assistant for Visual Accessibility

Scout1 is a React Native mobile application that provides voice-controlled assistance for visually impaired users. The app uses wake word detection to listen for commands, processes them using AI, and provides audio feedback about the user's environment.

## 🎯 Features

- **Wake Word Detection**: Always listening for "Bumblebee" to activate
- **Voice Commands**: Supports "describe the scene" and more
- **Camera Integration**: Takes photos and processes them with AI
- **Text-to-Speech**: Provides audio feedback to users
- **Real-time Processing**: Connects to AI server for scene analysis

## 🛠️ Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Picovoice Porcupine** for wake word detection
- **Expo Camera** for image capture
- **Expo Speech** for text-to-speech
- **Zustand** for state management

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- A Picovoice Access Key ([Get free key](https://console.picovoice.ai/))

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd scout1
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file and configure it:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```env
# Get your free key from https://console.picovoice.ai/
PICOVOICE_ACCESS_KEY=your_picovoice_access_key_here
EXPO_PUBLIC_PICOVOICE_ACCESS_KEY=your_picovoice_access_key_here

# Replace with your actual server IP address
EXPO_PUBLIC_PROFESSOR_SERVER_URL=http://YOUR_IP_ADDRESS:8000/process_data
```

### 4. Test Network Connection (Optional)
```bash
# Install test dependency
npm install dotenv --save-dev

# Create temporary test file
node -e "
const axios = require('axios');
require('dotenv').config();
const url = process.env.EXPO_PUBLIC_PROFESSOR_SERVER_URL || 'http://localhost:8000/process_data';
console.log('Testing:', url);
axios.post(url, {task:'describe_scene',image_data:'test'}).then(r=>console.log('✅ Connected')).catch(e=>console.log('❌ Server not accessible:', e.message));
"
```

### 5. Run the Application

#### For Development (Expo Go)
```bash
npm start
# Scan QR code with Expo Go app
```

#### For Production Build (Recommended)
```bash
# Android
npm run android

# iOS (macOS only)
npm run ios
```

## 🏗️ Project Structure

```
scout1/
├── app/                    # Main app screens (Expo Router)
│   ├── index.tsx          # Main camera/voice interface
│   └── _layout.tsx        # App layout
├── src/
│   ├── services/          # Core business logic
│   │   ├── VoiceService.ts    # Wake word detection
│   │   ├── IntentService.ts   # Command recognition
│   │   ├── CameraService.ts   # Photo capture
│   │   ├── NetworkService.ts  # AI server communication
│   │   └── TtsService.ts      # Text-to-speech
│   └── types.d.ts         # TypeScript declarations
├── assets/                # Images, sounds, models
├── android/              # Android native config
└── ios/                  # iOS native config (if applicable)
```

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PICOVOICE_ACCESS_KEY` | Picovoice API key for wake word detection | `abc123...` |
| `EXPO_PUBLIC_PICOVOICE_ACCESS_KEY` | Same key for Expo public access | `abc123...` |
| `EXPO_PUBLIC_PROFESSOR_SERVER_URL` | Your AI server endpoint | `http://192.168.1.100:8000/process_data` |

### Professor Server Setup

The app requires a separate AI server (called "Professor") that processes images and returns descriptions. Ensure your server:

1. **Accepts POST requests** to `/process_data`
2. **Expects JSON payload**:
   ```json
   {
     "task": "describe_scene",
     "image_data": "base64_encoded_image_string",
     "query_text": "optional_text"
   }
   ```
3. **Returns JSON response**:
   ```json
   {
     "result_text": "Description of the scene..."
   }
   ```

## 📱 Usage

1. **Launch the app** on your device
2. **Grant permissions** for camera and microphone
3. **Say "Bumblebee"** to activate the assistant
4. **Give a command** like "describe the scene"
5. **Listen to the audio response**

## 🔒 Security Notes

- **Never commit `.env`** - Contains sensitive API keys
- **API keys are required** - App won't work without valid Picovoice key
- **Network access needed** - App must reach your Professor server
- **Permissions required** - Camera and microphone access essential

## 🛠️ Development

### Adding New Voice Commands

1. **Update `IntentService.ts`** to recognize new phrases
2. **Handle new intents** in `app/index.tsx`
3. **Add corresponding server support** in your Professor server

### Testing Changes

```bash
# Run in development mode
npm start

# Check logs for debugging
# Look for wake word detection and intent recognition logs
```

## 📦 Building for Production

### Android APK
```bash
# Generate development build
expo build:android

# For distribution
expo build:android --type app-bundle
```

### iOS App
```bash
# Generate development build
expo build:ios

# For App Store
expo build:ios --type archive
```

## 🔍 Troubleshooting

### Common Issues

1. **"Wake word not detected"**
   - Check microphone permissions
   - Verify Picovoice access key in `.env`
   - Ensure you're saying "Bumblebee" clearly

2. **"Network error"**
   - Confirm Professor server is running
   - Check IP address in `.env` file
   - Ensure device and server on same network

3. **"App crashes on startup"**
   - Run `npm install` to ensure dependencies
   - Check environment variables are set
   - Review expo logs for specific errors

### Debug Commands
```bash
# Check environment variables
npm start --dev

# Clear cache
npx expo r -c

# Check network connectivity
ping YOUR_SERVER_IP
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test thoroughly with a real device
4. Submit a pull request

## 📄 License

[Add your license information here]

## 🔗 Related Projects

- [Professor Server](link-to-your-ai-server-repo) - AI backend for image processing
- [Picovoice](https://picovoice.ai/) - Wake word detection service

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review logs in Expo development tools
- Ensure all prerequisites are met

---

**Note**: This app requires a physical device for proper testing of camera and microphone features. The iOS Simulator and Android Emulator have limited sensor support.
