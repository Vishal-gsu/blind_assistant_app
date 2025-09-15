/**
 * @file IntentService.ts
 * @description This service is responsible for understanding user intent from text input using a local TensorFlow Lite model.
 */

import { Asset } from 'expo-asset';
import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite';

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
  private model: TensorflowModel | undefined;
  private labels: string[] = [];

  private constructor() {
    this.loadModel();
  }

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
   * Loads the TFLite model and labels from the app's assets.
   */
  private async loadModel() {
    try {
      console.log('Loading TFLite model and labels from assets...');

      // Load the model
      const modelAsset = Asset.fromModule(require('../../assets/models/intent-model.tflite'));
      await modelAsset.downloadAsync();
      const modelPath = modelAsset.localUri;

      if (!modelPath) {
        throw new Error('Failed to get local URI for the model.');
      }

      // Load the labels
      const labelsAsset = Asset.fromModule(require('../../assets/models/labels.txt'));
      await labelsAsset.downloadAsync();
      const labelsPath = labelsAsset.localUri;

      if (!labelsPath) {
        throw new Error('Failed to get local URI for the labels.');
      }
      
      const response = await fetch(labelsPath);
      const text = await response.text();
      this.labels = text.split('\n').filter(Boolean);

      // Initialize the TFLite model
      this.model = await loadTensorflowModel({ url: modelPath });
      console.log('TFLite model loaded successfully.');

    } catch (error: any) {
      console.error('Failed to load model or labels:', error);
      console.log("Please make sure 'intent-model.tflite' and 'labels.txt' exist in the 'assets/models' directory.");
    }
  }

  /**
   * Determines the user's intent from a given text string using the loaded TFLite model.
   *
   * @param {string} text The user's input text.
   * @returns {Promise<Intent | { task: 'unknown' }>}
   */
  public async getIntent(text: string): Promise<Intent | { task: 'unknown' }> {
    if (!this.model || this.labels.length === 0) {
      console.error('TFLite model or labels are not loaded.');
      // Fallback to simple keyword matching if the model is not available
      return this.getIntentFallback(text);
    }

    // The input tensor should be a string, but the model expects a tensor of shape [1].
    // We'll wrap the text in an array.
    const input = [text] as any;
    const output = await this.model.run(input);

    if (!output || !output.length) {
        console.error('Inference resulted in undefined or empty output');
        return { task: 'unknown' };
    }

    const probabilities = Array.from(output[0] as Float32Array); // Assuming the output is an array of probabilities

    let maxProb = 0;
    let maxIndex = -1;
    for (let i = 0; i < probabilities.length; i++) {
        if (probabilities[i] > maxProb) {
        maxProb = probabilities[i];
        maxIndex = i;
        }
    }

    const CONFIDENCE_THRESHOLD = 0.7; // Adjust this threshold as needed

    if (maxProb < CONFIDENCE_THRESHOLD || maxIndex === -1) {
        return { task: 'unknown' };
    }

    const intentName = this.labels[maxIndex];

    if (intentName === 'find_object' || intentName === 'answer_question') {
        // Basic logic to extract a query. You may need a more sophisticated approach.
        const query = text.toLowerCase().replace(intentName.replace('_', ' '), '').trim();
        return { task: intentName, query_text: query };
    } else {
        return { task: intentName as 'read_text' | 'describe_scene' };
    }
  }

  /**
   * A fallback method for intent recognition if the TFLite model fails to load.
   * This uses simple keyword matching.
   */
  private getIntentFallback(text: string): Intent {
    const lowerCaseText = text.toLowerCase();

    if (lowerCaseText.includes('read') || lowerCaseText.includes('what does this say')) {
      return { task: 'read_text' };
    }

    if (lowerCaseText.includes('find') || lowerCaseText.includes('where is my')) {
        const query = lowerCaseText.replace('find', '').replace('where is my', '').trim();
        return { task: 'find_object', query_text: query };
    }

    if (lowerCaseText.includes('describe') || lowerCaseText.includes('what is this')) {
      return { task: 'describe_scene' };
    }

    return { task: 'answer_question', query_text: text };
  }
}

export default IntentService.getInstance();
