import { Camera } from 'expo-camera';

/**
 * A singleton service to handle camera-related functionalities.
 */
class CameraService {
  private static instance: CameraService;
  private cameraRef: React.RefObject<Camera> | null = null;

  private constructor() {}

  /**
   * Returns the singleton instance of the CameraService.
   * @returns {CameraService} The singleton instance.
   */
  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  /**
   * Sets the camera reference.
   * @param {React.RefObject<Camera>} ref The camera reference.
   */
  public setCameraRef(ref: React.RefObject<Camera>) {
    this.cameraRef = ref;
  }

  /**
   * Takes a picture and returns the base64 encoded image.
   * @returns {Promise<string | null>} The base64 encoded image or null if an error occurs.
   */
  public async takePicture(): Promise<string | null> {
    if (this.cameraRef && this.cameraRef.current) {
      try {
        const photo = await this.cameraRef.current.takePictureAsync({ base64: true });
        return photo.base64;
      } catch (error) {
        console.error("Failed to take picture:", error);
      }
    }
    return null;
  }
}

export default CameraService.getInstance();
