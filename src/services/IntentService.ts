/**
 * @file IntentService.ts
 * @description This service is responsible for understanding user intent from text input.
 *              (This is a placeholder to be implemented with Picovoice Rhino)
 */

type Intent = 
  | { task: 'read_text' }
  | { task: 'find_object'; query_text: string }
  | { task: 'describe_scene' }
  | { task: 'answer_question'; query_text: string };

/**
 * A singleton service to handle intent recognition from user input.
 */
class IntentService {
  private static instance: IntentService;

  private constructor() {}

  /**
   * Returns the singleton instance of the IntentService.
   * @returns {IntentService} The singleton instance.
   */
  public static getInstance(): IntentService {
    if (!IntentService.instance) {
      IntentService.instance = new IntentService();
    }
    return IntentService.instance;
  }

  /**
   * Initializes the intent recognition engine.
   */
  public async init() {
    // TODO: Initialize Picovoice Rhino here
    console.log('IntentService initialized (placeholder).');
  }

  /**
   * Determines the user's intent from a given text string.
   * @param {string} text The user's input text.
   * @returns {Promise<Intent | { task: 'unknown' }>}
   */
  public async getIntent(text: string): Promise<Intent | { task: 'unknown' }> {
    console.log(`getIntent called with: "${text}".`);
    
    // Simple pattern matching for testing (TODO: Replace with Picovoice Rhino)
    const lowerText = text.toLowerCase().trim();
    
    if (lowerText.includes('describe') && lowerText.includes('scene')) {
      console.log('Recognized intent: describe_scene');
      return { task: 'describe_scene' };
    }
    
    if (lowerText.includes('read') && lowerText.includes('text')) {
      console.log('Recognized intent: read_text');
      return { task: 'read_text' };
    }
    
    console.log('Intent not recognized, returning unknown');
    return { task: 'unknown' };
  }
}

export default IntentService.getInstance();