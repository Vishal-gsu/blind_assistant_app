
import axios from 'axios';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Speech from 'expo-speech';
import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button, Card, Provider as PaperProvider, Paragraph } from 'react-native-paper';
import { create } from 'zustand';

// --- Zustand State Management ---
interface AppState {
  isLoading: boolean;
  lastResponseText: string;
  setIsLoading: (loading: boolean) => void;
  setLastResponseText: (text: string) => void;
}

const useStore = create<AppState>((set) => ({
  isLoading: false,
  lastResponseText: 'Press "Describe Scene" to start.',
  setIsLoading: (loading) => set({ isLoading: loading }),
  setLastResponseText: (text) => set({ lastResponseText: text }),
}));

// --- Main App Component ---
function ScoutApp() {
  const { isLoading, lastResponseText, setIsLoading, setLastResponseText } = useStore();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // --- Server Configuration ---
  // IMPORTANT: REPLACE 'YOUR_LAPTOP_IP_HERE' WITH YOUR LAPTOP'S ACTUAL WI-FI IP ADDRESS
  const PROFESSOR_SERVER_URL = 'http://192.168.1.19:8000'; // <-- EXAMPLE IP, CHANGE THIS

  const handleDescribeScene = async () => {
    if (!cameraRef.current) {
      const errorMsg = "Camera is not ready. Please wait a moment.";
      setLastResponseText(errorMsg);
      Speech.speak(errorMsg);
      return;
    }

    setIsLoading(true);
    setLastResponseText('Capturing image...');

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      setLastResponseText('Sending to Professor...');
      
      if (!photo.base64) {
          throw new Error("Failed to get Base64 data from the photo.");
      }

      const response = await axios.post(`${PROFESSOR_SERVER_URL}/process_data`, {
        task: 'describe_scene',
        image_data: photo.base64,
      });

      const resultText = response.data.result_text;
      setLastResponseText(resultText);
      Speech.speak(resultText);

    } catch (error) {
      console.error(error);
      const errorMessage = "Sorry, I couldn't connect to the Professor server.";
      setLastResponseText(errorMessage);
      Speech.speak(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!permission) {
    // Camera permissions are still loading
    return <View style={styles.container}><ActivityIndicator /></View>;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera.</Text>
        <Button onPress={requestPermission} mode="contained" style={{ marginTop: 10 }}>
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing={"back"} />
      
      <Card style={styles.responseCard}>
        <Card.Content>
          {isLoading ? (
            <ActivityIndicator animating={true} />
          ) : (
            <Paragraph>{lastResponseText}</Paragraph>
          )}
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained"
          onPress={handleDescribeScene} 
          disabled={isLoading}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          icon="camera-iris"
        >
          {isLoading ? 'Processing...' : 'Describe Scene'}
        </Button>
      </View>
    </View>
  );
}

// --- Main Export with PaperProvider ---
export default function App() {
    return (
        <PaperProvider>
            <ScoutApp />
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30, // Make it rounded
  },
  buttonLabel: {
    fontSize: 18,
  },
  responseCard: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
  },
});
