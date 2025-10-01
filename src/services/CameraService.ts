import { CameraView } from 'expo-camera';

/**
 * A singleton service to handle camera-related functionalities.
 */
class CameraService {
  private static instance: CameraService;
  private cameraRef: CameraView | null = null;

  private constructor() {}

  /**
   * Returns the singleton service instance.
   */
  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  /**
   * Sets the camera reference from the UI component.
   * @param {CameraView | null} ref The camera component instance.
   */
  public setCameraRef(ref: CameraView | null) {
    this.cameraRef = ref;
  }

  /**
   * Takes a picture and returns the base64 encoded image.
   * @returns {Promise<string | undefined>} The base64 encoded image or undefined.
   */
  public async takePicture(): Promise<string | undefined> {
    if (this.cameraRef) {
      try {
        const photo = await this.cameraRef.takePictureAsync({ base64: true });
        return photo?.base64;
      } catch (error) {
        console.error("Failed to take picture:", error);
        return undefined;
      }
    } else {
      console.warn("Camera reference not set. Cannot take picture.");
      return undefined;
    }
  }
}

export default CameraService.getInstance();