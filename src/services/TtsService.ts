import * as Speech from 'expo-speech';

/**
 * A singleton service to handle text-to-speech.
 */
class TtsService {
  private static instance: TtsService;

  private constructor() {}

  /**
   * Returns the singleton instance of the TtsService.
   * @returns {TtsService} The singleton instance.
   */
  public static getInstance(): TtsService {
    if (!TtsService.instance) {
      TtsService.instance = new TtsService();
    }
    return TtsService.instance;
  }

  /**
   * Speaks the given text.
   * @param {string} text The text to speak.
   */
  public speak(text: string, onDone: () => void) {
    Speech.speak(text, { language: 'en-US', onDone });
  }

  /**
   * Stops the speech.
   */
  public stop() {
    Speech.stop();
  }
}

export default TtsService.getInstance();
