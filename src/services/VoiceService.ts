import { BuiltInKeywords, PorcupineManager } from '@picovoice/porcupine-react-native';
import { Camera } from 'expo-camera';

// Access key is loaded from environment variables
const ACCESS_KEY = process.env.EXPO_PUBLIC_PICOVOICE_ACCESS_KEY || process.env.PICOVOICE_ACCESS_KEY;

/**
 * A singleton service to handle wake word detection.
 */
class VoiceService {
  private static instance: VoiceService;
  private porcupineManager: PorcupineManager | null = null;

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
    if (!ACCESS_KEY) {
      console.error('Picovoice access key not found. Please set PICOVOICE_ACCESS_KEY in your .env file.');
      return;
    }

    const micPermission = await Camera.requestMicrophonePermissionsAsync();
    if (micPermission.status !== 'granted') {
      console.error('Microphone permission not granted');
      return;
    }

    try {
      console.log('Initializing Porcupine wake word engine...');
      this.porcupineManager = await PorcupineManager.fromBuiltInKeywords(
        ACCESS_KEY,
        [BuiltInKeywords.BUMBLEBEE],
        (keywordIndex: number) => {
          if (keywordIndex === 0) {
            onWakeWord();
          }
        }
      );

      await this.porcupineManager.start();
      console.log('Porcupine started! Listening for "Bumblebee"...');

    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Stops the wake word engine.
   */
  public async stop() {
    if (this.porcupineManager) {
      await this.porcupineManager.stop();
      console.log('Porcupine stopped.');
    }
  }

  /**
   * Starts the wake word engine.
   */
  public async start() {
    if (this.porcupineManager) {
      await this.porcupineManager.start();
      console.log('Porcupine started! Listening for "Bumblebee"...');
    }
  }

  /**
   * Cleans up resources.
   */
  public async destroy() {
    if (this.porcupineManager) {
      await this.porcupineManager.stop();
      await this.porcupineManager.delete();
    }
  }
}

export default VoiceService.getInstance();