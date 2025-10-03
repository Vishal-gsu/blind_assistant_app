/**
 * @file IntentService.ts
 * @description This service is responsible for understanding user intent from text input.
 *              Implements comprehensive intent analysis based on professor's specification.
 */

// TODO: Uncomment when you have custom Rhino model
// import { RhinoManager } from '@picovoice/rhino-react-native';

type Intent = 
  | { task: 'describe_scene' }
  | { task: 'read_text' }
  | { task: 'find_object'; query_text: string }
  | { task: 'answer_question'; query_text: string }
  | { task: 'face_detect' }
  | { task: 'save_face'; person_name: string }
  | { task: 'time' }
  | { task: 'weather'; city?: string }
  | { task: 'set_city'; city_name: string }
  | { task: 'general_conversation'; query_text: string }
  | { task: 'help' };

/**
 * A singleton service to handle intent recognition from user input.
 */
class IntentService {
  private static instance: IntentService;
  // TODO: Add when you have custom Rhino model
  // private rhinoManager: RhinoManager | null = null;
  private isRhinoAvailable = false;

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
   * TODO: Replace with actual Rhino initialization when you have custom model
   */
  public async init() {
    try {
      // TODO: When you have custom Rhino model, implement this:
      /*
      const contextAsset = Asset.fromModule(require('../../assets/models/your-intent-model.rhn'));
      await contextAsset.downloadAsync();
      
      this.rhinoManager = await RhinoManager.create(
        process.env.EXPO_PUBLIC_PICOVOICE_ACCESS_KEY!, // Use environment variable
        contextAsset.localUri!,
        (inference) => {
          console.log('Rhino inference:', inference);
          // Handle inference result
        }
      );
      
      this.isRhinoAvailable = true;
      console.log('Rhino initialized with custom context model.');
      */
      
      console.log('IntentService initialized (using pattern matching fallback).');
    } catch (error) {
      console.warn('Failed to initialize Rhino, using pattern matching fallback:', error);
      this.isRhinoAvailable = false;
    }
  }

  /**
   * Determines the user's intent from a given text string.
   * Implements comprehensive intent analysis based on professor's specification.
   * @param {string} text The user's input text.
   * @returns {Promise<Intent | { task: 'unknown' }>}
   */
  public async getIntent(text: string): Promise<Intent | { task: 'unknown' }> {
    console.log(`getIntent called with: "${text}".`);
    
    // If Rhino is available, use it
    if (this.isRhinoAvailable) {
      // TODO: Implement Rhino-based intent recognition when you have the model
      // For now, fall back to pattern matching
    }
    
    // Enhanced pattern matching based on professor's intent analysis
    const lowerText = text.toLowerCase().trim();
    
    // 1. VISION & SCENE ANALYSIS
    if (this.matchesSceneDescription(lowerText)) {
      console.log('Recognized intent: describe_scene');
      return { task: 'describe_scene' };
    }
    
    // 2. TEXT RECOGNITION (OCR)
    if (this.matchesTextReading(lowerText)) {
      console.log('Recognized intent: read_text');
      return { task: 'read_text' };
    }
    
    // 3. OBJECT DETECTION & SEARCH
    if (this.matchesObjectSearch(lowerText)) {
      const query = text; // Use original text for query
      console.log('Recognized intent: find_object');
      return { task: 'find_object', query_text: query };
    }
    
    // 5. FACE RECOGNITION
    if (this.matchesFaceRecognition(lowerText)) {
      console.log('Recognized intent: face_detect');
      return { task: 'face_detect' };
    }
    
    // 6. FACE MANAGEMENT (Save Face)
    const personName = this.extractPersonName(text, lowerText);
    if (personName && this.matchesFaceSaving(lowerText)) {
      console.log('Recognized intent: save_face');
      return { task: 'save_face', person_name: personName };
    }
    
    // 7. TIME & DATE
    if (this.matchesTimeRequest(lowerText)) {
      console.log('Recognized intent: time');
      return { task: 'time' };
    }
    
    // 8. WEATHER INFORMATION
    const cityName = this.extractCityName(text, lowerText);
    if (this.matchesWeatherRequest(lowerText)) {
      console.log('Recognized intent: weather');
      return { task: 'weather', city: cityName };
    }
    
    // 9. LOCATION SETTINGS
    const setCityName = this.extractSetCityName(text, lowerText);
    if (setCityName && this.matchesCitySetting(lowerText)) {
      console.log('Recognized intent: set_city');
      return { task: 'set_city', city_name: setCityName };
    }
    
    // Help intents
    if (this.matchesHelpRequest(lowerText)) {
      console.log('Recognized intent: help');
      return { task: 'help' };
    }
    
    // 4. VISUAL QUESTION ANSWERING (high confidence questions)
    if (this.matchesVisualQuestion(lowerText)) {
      console.log('Recognized intent: answer_question');
      return { task: 'answer_question', query_text: text };
    }
    
    // 10. CONVERSATIONAL AI (fallback for general conversation)
    if (this.matchesGeneralConversation(lowerText)) {
      console.log('Recognized intent: general_conversation');
      return { task: 'general_conversation', query_text: text };
    }
    
    console.log('Intent not recognized, returning unknown');
    return { task: 'unknown' };
  }

  // Intent matching methods based on professor's keywords

  private matchesSceneDescription(text: string): boolean {
    const keywords = ['what do you see', 'describe the scene', 'what\'s in front of me', 
                     'tell me about my surroundings', 'what\'s happening around me',
                     'describe', 'scene', 'see', 'look', 'surroundings'];
    return keywords.some(keyword => text.includes(keyword));
  }

  private matchesTextReading(text: string): boolean {
    const keywords = ['read this text', 'what does this say', 'read the document',
                     'what\'s written here', 'read the sign', 'read the menu',
                     'what does this paper say', 'read', 'text', 'document', 'sign', 'menu', 'says'];
    return keywords.some(keyword => text.includes(keyword));
  }

  private matchesObjectSearch(text: string): boolean {
    const keywords = ['find my', 'where is the', 'look for a', 'is there a',
                     'find the', 'where\'s my', 'look for', 'find', 'where', 'locate', 'search'];
    return keywords.some(keyword => text.includes(keyword));
  }

  private matchesFaceRecognition(text: string): boolean {
    const keywords = ['who is this person', 'who do you see', 'recognize this face',
                     'who\'s in front of me', 'is this', 'do you know this person',
                     'who', 'person', 'face', 'recognize'];
    return keywords.some(keyword => text.includes(keyword));
  }

  private matchesFaceSaving(text: string): boolean {
    const keywords = ['save this person as', 'remember this face', 'add this person to database',
                     'register this face as', 'learn this person', 'store this face',
                     'save', 'remember', 'add', 'register', 'learn', 'store'];
    return keywords.some(keyword => text.includes(keyword));
  }

  private matchesTimeRequest(text: string): boolean {
    const keywords = ['what time is it', 'tell me the time', 'what\'s the current time',
                     'time please', 'what time do you have', 'time', 'clock', 'date'];
    return keywords.some(keyword => text.includes(keyword));
  }

  private matchesWeatherRequest(text: string): boolean {
    const keywords = ['what\'s the weather', 'weather in', 'is it raining',
                     'temperature today', 'weather forecast', 'how\'s the weather',
                     'weather', 'temperature', 'rain', 'sunny', 'forecast'];
    return keywords.some(keyword => text.includes(keyword));
  }

  private matchesCitySetting(text: string): boolean {
    const keywords = ['set my location to', 'change city to', 'my location is',
                     'set default city', 'change my city', 'set location', 'location'];
    return keywords.some(keyword => text.includes(keyword));
  }

  private matchesHelpRequest(text: string): boolean {
    const keywords = ['what can you help me with', 'what can you do', 'help', 'commands'];
    return keywords.some(keyword => text.includes(keyword));
  }

  private matchesVisualQuestion(text: string): boolean {
    const visualQuestions = ['how many', 'what color', 'is the', 'what\'s on the',
                           'are there any', 'what time does', 'is it'];
    return text.includes('?') && visualQuestions.some(keyword => text.includes(keyword));
  }

  private matchesGeneralConversation(text: string): boolean {
    const conversational = ['how are you', 'tell me a joke', 'good morning',
                          'thank you', 'hello', 'hi', 'thanks'];
    return conversational.some(keyword => text.includes(keyword));
  }

  // Extraction methods

  private extractPersonName(originalText: string, lowerText: string): string | undefined {
    // Look for patterns like "save this person as John", "register this face as Mom"
    const patterns = [
      /save this person as (\w+)/i,
      /register this face as (\w+)/i,
      /remember this face as (\w+)/i,
      /add this person as (\w+)/i,
      /this is (\w+)/i
    ];
    
    for (const pattern of patterns) {
      const match = originalText.match(pattern);
      if (match) return match[1];
    }
    return undefined;
  }

  private extractCityName(originalText: string, lowerText: string): string | undefined {
    // Look for patterns like "weather in New York", "how's the weather in London"
    const patterns = [
      /weather in ([a-zA-Z\s]+)/i,
      /weather for ([a-zA-Z\s]+)/i,
      /how's the weather in ([a-zA-Z\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = originalText.match(pattern);
      if (match) return match[1].trim();
    }
    return undefined;
  }

  private extractSetCityName(originalText: string, lowerText: string): string | undefined {
    // Look for patterns like "set my location to Boston", "change city to Paris"
    const patterns = [
      /set my location to ([a-zA-Z\s]+)/i,
      /change city to ([a-zA-Z\s]+)/i,
      /my location is ([a-zA-Z\s]+)/i,
      /set location to ([a-zA-Z\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = originalText.match(pattern);
      if (match) return match[1].trim();
    }
    return undefined;
  }

  /**
   * Cleanup method (for Rhino when implemented)
   */
  public async cleanup() {
    // TODO: When you have Rhino, add cleanup:
    // if (this.rhinoManager) {
    //   await this.rhinoManager.delete();
    //   this.rhinoManager = null;
    // }
    console.log('IntentService cleaned up.');
  }
}

export default IntentService.getInstance();