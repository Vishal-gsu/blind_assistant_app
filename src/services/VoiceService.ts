import { BuiltInKeywords, PorcupineManager } from '@picovoice/porcupine-react-native';
import Voice from '@react-native-voice/voice';
import { useStore } from '../store';

// TODO: Replace with your actual AccessKey from Picovoice Console
const ACCESS_KEY = 'YOUR_ACCESS_KEY_HERE';

/**
 * A singleton service to handle wake word detection and voice commands.
 */
class VoiceService {
  private static instance: VoiceService;
  private porcupineManager: PorcupineManager | null = null;
  private isListeningAfterWakeWord = false;

  private constructor() {
    Voice.onSpeechStart = () => useStore.getState().setListening(true);
    Voice.onSpeechEnd = () => useStore.getState().setListening(false);
  }

  /**
   * Returns the singleton instance of the VoiceService.
   * @returns {VoiceService} The singleton instance.
   */
  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  /**
   * Initializes the wake word engine.
   */
  public async init() {
    if (ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
      console.error('Please provide your Picovoice AccessKey in VoiceService.ts');
      return;
    }

    try {
      this.porcupineManager = await PorcupineManager.fromBuiltInKeywords(
        ACCESS_KEY,
        [BuiltInKeywords.PORCUPINE],
        (keywordIndex: number) => {
          if (keywordIndex === 0) {
            // Wake word detected
            this.isListeningAfterWakeWord = true;
            useStore.getState().setListening(true);
            this.startListening();
          }
        }
      );

      await this.porcupineManager.start();

    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Starts listening for voice commands.
   */
  public async startListening() {
    try {
      await Voice.start('en-US');
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Stops listening for voice commands.
   */
  public async stopListening() {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
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