import axios from 'axios';
  
// IMPORTANT: Replace with your actual laptop's IP address.
const PROFESSOR_URL = 'http://192.168.1.6:8000/process_data';

export type ProcessRequest = {
  task: 'describe_scene' | 'read_text' | 'find_object' | 'answer_question';
  image_data: string;
  query_text?: string;
};

export type ProcessResponse = {
  result_text: string;
  structured_data?: any;
};

/**
 * A singleton service to handle network requests to the Professor server.
 */
class NetworkService {
  private static instance: NetworkService;

  private constructor() {}

  /**
   * Returns the singleton instance of the NetworkService.
   * @returns {NetworkService} The singleton instance.
   */
  public static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  /**
   * Sends the image and task to the Professor server for processing.
   * @param {ProcessRequest} data The request data.
   * @returns {Promise<ProcessResponse | null>} The response from the server or null if an error occurs.
   */
  public async processImage(data: ProcessRequest): Promise<ProcessResponse | null> {
    try {
      const response = await axios.post(PROFESSOR_URL, data);
      return response.data;
    } catch (error) {
      console.error("Failed to process image:", error);
    }
    return null;
  }
}

export default NetworkService.getInstance();
