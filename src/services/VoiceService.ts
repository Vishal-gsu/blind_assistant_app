import { VoiceProcessor } from '@picovoice/react-native-voice-processor';
import { Porcupine, BuiltInKeywords } from '@picovoice/porcupine-react-native';
import Voice from '@react-native-community/voice';
import { useStore } from '../store';

// TODO: Replace with your actual AccessKey from Picovoice Console
const ACCESS_KEY = 'YOUR_ACCESS_KEY_HERE';

/**
 * A singleton service to handle wake word detection and voice commands.
 */
class VoiceService {
  private static instance: VoiceService;
  private porcupine: Porcupine | null = null;
  private voiceProcessor: VoiceProcessor | null = null;
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
      this.porcupine = await Porcupine.create(ACCESS_KEY, [BuiltInKeywords.Porcupine], (keywordIndex) => {
        if (keywordIndex === 0) {
          // Wake word detected
          this.isListeningAfterWakeWord = true;
          useStore.getState().setListening(true);
          this.startListening();
        }
      });

      this.voiceProcessor = VoiceProcessor.get(this.porcupine.frameLength, this.porcupine.sampleRate);
      this.voiceProcessor.addFrameListener((frame) => {
        if (this.porcupine) {
            this.porcupine.process(frame).catch((e) => {
                console.error('Error processing frame by Porcupine', e);
            });
        }
      });

      await this.voiceProcessor.start();

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
    await this.voiceProcessor?.stop();
    await this.porcupine?.delete();
    this.voiceProcessor?.removeFrameListeners();
  }
}

export default VoiceService.getInstance();
