# Custom Model Creation Guide

This guide will help you create custom Picovoice models for your Scout1 assistant app.

## Prerequisites

- Internet connection
- Picovoice Console account (free at console.picovoice.ai)
- Your Picovoice access key (already in your .env file)

## Creating Custom Wake Word Model ("Hey Iris")

### 1. Visit Picovoice Console
- Go to [https://console.picovoice.ai/](https://console.picovoice.ai/)
- Sign in or create a free account

### 2. Create Wake Word Model
1. Navigate to "Porcupine" section
2. Click "Train Model"
3. Enter wake word: `Hey Iris`
4. Select target platform: `Android`
5. Choose language: `English`
6. Train the model (this may take a few minutes)
7. Download the `.ppn` file

### 3. Install in Your App
1. Save the downloaded `.ppn` file to: `assets/models/hey-iris-custom.ppn`
2. Open `src/services/VoiceService.ts`
3. Update the model path:
   ```typescript
   const CUSTOM_WAKE_WORD_MODEL = require('../../assets/models/hey-iris-custom.ppn');
   ```
4. Set `useCustomModel = true` in the VoiceService class
5. Uncomment the custom model loading code

## Creating Custom Intent Model (Multiple Commands)

### 1. Design Your Intents
Plan what voice commands you want to support:

**Scene Description:**
- "Describe the scene"
- "What do you see"
- "Tell me what's in front of me"

**Text Reading:**
- "Read the text"
- "What does it say"
- "Read this for me"

**Object Finding:**
- "Find the [object]"
- "Where is the [object]"
- "Look for [object]"

**Navigation:**
- "Which way should I go"
- "Help me navigate"
- "Where am I"

**Help:**
- "What can you do"
- "Help me"
- "List commands"

### 2. Create Rhino Context Model
1. In Picovoice Console, go to "Rhino" section
2. Click "Create Context"
3. Define your intents and slots:

```yaml
context:
  expressions:
    describeScene:
      - "describe the scene"
      - "what do you see"
      - "tell me what's in front of me"
    
    readText:
      - "read the text"
      - "what does it say"
      - "read this for me"
    
    findObject:
      - "find the $object:object"
      - "where is the $object:object"
      - "look for $object:object"
    
    navigate:
      - "which way should I go"
      - "help me navigate"
      - "where am I"
    
    help:
      - "what can you do"
      - "help me"
      - "list commands"

  slots:
    object:
      - "door"
      - "chair"
      - "table"
      - "person"
      - "sign"
      - "stairs"
      - "exit"
      # Add more objects as needed
```

4. Train and download the `.rhn` file

### 3. Install Intent Model
1. Save the `.rhn` file to: `assets/models/scout-intents.rhn`
2. Open `src/services/IntentService.ts`
3. Uncomment the Rhino import and initialization code
4. Update the model path:
   ```typescript
   const contextAsset = Asset.fromModule(require('../../assets/models/scout-intents.rhn'));
   ```
5. Set `isRhinoAvailable = true` after successful initialization

## Installation Steps

### 1. Install Rhino Dependency
```bash
npm install @picovoice/rhino-react-native
```

### 2. Update Metro Config
The `metro.config.js` is already configured to handle `.ppn` and `.rhn` files.

### 3. Test Your Models
1. Run the app: `npx expo start`
2. Test wake word detection with "Hey Iris"
3. Test voice commands after wake word detection

## Troubleshooting

### Model Compatibility Issues
- Ensure the model version matches your Porcupine/Rhino library version
- Check console logs for specific error messages
- Verify model files are in the correct asset directories

### Access Key Issues
- Make sure your `.env` file contains the correct Picovoice access key
- The key should have permissions for both Porcupine and Rhino

### Permission Issues
- Ensure camera and microphone permissions are granted
- Check that the app has necessary audio processing permissions

## Testing Without Internet

Once you've created and downloaded your models:
1. The models work offline
2. No internet connection required for wake word or intent detection
3. Only the AI image processing (Professor server) requires internet

## Next Steps

After creating your models:
1. Update the VoiceService to use your custom wake word
2. Update the IntentService to use your custom intent model
3. Test thoroughly with various voice commands
4. Add more intents and objects as needed

## Model Updates

To update your models:
1. Create new versions in Picovoice Console
2. Download updated files
3. Replace the files in your assets/models/ directory
4. Rebuild the app

Your app is now ready for custom model integration! Create your models when you have internet access and then follow the installation steps above.