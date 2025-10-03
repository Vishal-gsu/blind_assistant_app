import { BuiltInKeywords, PorcupineManager } from '@picovoice/porcupine-react-native';
import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';

// Access key is loaded from environment variables
const ACCESS_KEY = process.env.EXPO_PUBLIC_PICOVOICE_ACCESS_KEY || process.env.PICOVOICE_ACCESS_KEY;

// TODO: When you have your custom "Hey Iris" model, uncomment this and update the path:
// const CUSTOM_WAKE_WORD_MODEL = require('../../assets/models/hey-iris_en_android_v3_0_0.ppn');

/**
 * A singleton service to handle wake word detection.
 * Currently using built-in "Bumblebee" keyword.
 * Ready for custom "Hey Iris" model integration.
 */
class VoiceService {
  private static instance: VoiceService;
  private porcupineManager: PorcupineManager | null = null;
  private useCustomModel = false; // Set to true when you have compatible custom model
  private isInitialized = false;
  private isListening = false;
  private isInitializing = false; // Prevent concurrent initialization
  private isStarting = false; // Prevent concurrent start operations

  private constructor() {}

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  /**
   * Initializes the wake word engine.
   * @param onWakeWord - A callback function to be executed when the wake word is detected.
   */
  public async init(onWakeWord: () => void) {
    if (this.isInitialized) {
      console.log('⚠️ VoiceService already initialized, skipping...');
      return;
    }

    if (this.isInitializing) {
      console.log('⚠️ VoiceService initialization already in progress, waiting...');
      // Wait for current initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isInitializing = true;

    try {
      if (!ACCESS_KEY) {
        console.error('Picovoice access key not found. Please set PICOVOICE_ACCESS_KEY in your .env file.');
        throw new Error('Picovoice access key is required');
      }

      console.log('🔧 Initializing VoiceService...');
      
      // Request both camera and microphone permissions
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        throw new Error('Camera permission is required for audio processing');
      }

      // Request microphone/audio recording permissions
      await Audio.requestPermissionsAsync();
      const { status: micStatus } = await Audio.getPermissionsAsync();
      if (micStatus !== 'granted') {
        console.warn('Microphone permission not granted, wake word detection may not work');
      }

      if (this.useCustomModel) {
        // TODO: When you have your custom model working, enable this:
        /*
        console.log('Loading custom "Hey Iris" wake word model...');
        const modelAsset = Asset.fromModule(CUSTOM_WAKE_WORD_MODEL);
        await modelAsset.downloadAsync();
        
        this.porcupineManager = await PorcupineManager.fromKeywordPaths(
          ACCESS_KEY,
          [modelAsset.localUri!],
          onWakeWord
        );
        console.log('Custom "Hey Iris" model loaded successfully!');
        */
      } else {
        // Using built-in "Bumblebee" keyword (stable fallback)
        console.log('Using built-in "Bumblebee" wake word...');
        this.porcupineManager = await PorcupineManager.fromBuiltInKeywords(
          ACCESS_KEY,
          [BuiltInKeywords.BUMBLEBEE],
          onWakeWord
        );
        console.log('Built-in "Bumblebee" model loaded successfully!');
      }
      
      this.isInitialized = true;
      console.log('✅ VoiceService initialization complete');
    } catch (error) {
      console.error('Failed to initialize Porcupine:', error);
      this.isInitialized = false;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Stops the wake word engine.
   */
  public async stop() {
    if (this.porcupineManager && this.isListening) {
      await this.porcupineManager.stop();
      this.isListening = false;
      console.log('🛑 Porcupine stopped.');
    }
  }

  /**
   * Starts the wake word engine.
   */
  public async start() {
    if (!this.isInitialized) {
      console.error('❌ Cannot start Porcupine: not initialized');
      return;
    }

    if (this.isStarting) {
      console.log('⚠️ Porcupine start already in progress, waiting...');
      while (this.isStarting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    if (this.isListening) {
      console.log('⚠️ Porcupine already listening');
      return;
    }
    
    this.isStarting = true;
    
    try {
      if (this.porcupineManager) {
        await this.porcupineManager.start();
        this.isListening = true;
        console.log('🎤 Porcupine started! Listening for "Bumblebee"...');
      } else {
        console.error('❌ Cannot start Porcupine: manager not initialized');
      }
    } catch (error) {
      console.error('❌ Failed to start Porcupine:', error);
      this.isListening = false;
    } finally {
      this.isStarting = false;
    }
  }

  /**
   * Cleans up resources.
   */
  public async destroy() {
    if (this.porcupineManager) {
      try {
        if (this.isListening) {
          await this.porcupineManager.stop();
          this.isListening = false;
        }
        await this.porcupineManager.delete();
        this.porcupineManager = null;
        this.isInitialized = false;
        this.isInitializing = false;
        this.isStarting = false;
        console.log('🧹 Porcupine resources cleaned up.');
      } catch (error) {
        console.error('Error cleaning up Porcupine:', error);
      }
    }
  }
}

export default VoiceService.getInstance();