import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { create } from 'zustand';

import CameraService from '../src/services/CameraService';
import IntentService from '../src/services/IntentService';
import NetworkService from '../src/services/NetworkService';
import TtsService from '../src/services/TtsService';
import VoiceService from '../src/services/VoiceService';

import { Asset } from 'expo-asset';
import { Audio } from 'expo-av';

import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

// --- Zustand State Management ---
interface AppState {
  appState: 'initializing' | 'listening' | 'processing' | 'speaking' | 'error';
  lastResponseText: string;
}

const useStore = create<AppState>((set) => ({
  appState: 'initializing',
  lastResponseText: 'Initializing...',
}));

// --- Main App Component ---
function ScoutApp() {
  const { appState, lastResponseText } = useStore();
  const setAppState = (state: AppState['appState']) => useStore.setState({ appState: state });
  const setLastResponseText = (text: string) => useStore.setState({ lastResponseText: text });

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // --- Animations ---
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    if (appState === 'listening') {
      scale.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);
    } else {
      scale.value = withTiming(1, { duration: 500 });
    }
  }, [appState, scale]);

  // --- Sound Effects ---
  const playSound = async (sound: 'listening' | 'success' | 'error') => {
    const sounds = {
      listening: Asset.fromModule(require('../assets/sounds/listening.mp3')),
      success: Asset.fromModule(require('../assets/sounds/success.mp3')),
      error: Asset.fromModule(require('../assets/sounds/error.mp3')),
    };
    await sounds[sound].downloadAsync();
    const { sound: soundObject } = await Audio.Sound.createAsync(sounds[sound]);
    await soundObject.playAsync();
  };

  // --- App Logic ---
  useEffect(() => {
    const handleSpeechDone = () => {
      setTimeout(() => {
        VoiceService.start();
        setAppState('listening');
      }, 500); // 0.5-second delay
    };

    const handleWakeWord = async () => {
      await VoiceService.stop();
      setAppState('processing');
      setLastResponseText('Understanding...');

      // Placeholder for speech-to-text. We will replace this with Picovoice Cheetah.
      const simulatedUserText = 'describe the scene';
      console.log(`Wake word detected! Simulating user said: "${simulatedUserText}"`);

      const intent = await IntentService.getIntent(simulatedUserText);

      if (intent.task === 'unknown') {
        setAppState('error');
        setLastResponseText("Sorry, I didn't understand that.");
        TtsService.speak("Sorry, I didn't understand that.", handleSpeechDone);
        return;
      }

      setLastResponseText(`Got it. ${intent.task.replace('_', ' ')}...`);
      const imageData = await CameraService.takePicture();
      if (!imageData) {
        setAppState('error');
        setLastResponseText("Sorry, I couldn't take a picture.");
        TtsService.speak("Sorry, I couldn't take a picture.", handleSpeechDone);
        return;
      }

      const response = await NetworkService.processImage({ ...intent, image_data: imageData });
      if (response && response.result_text) {
        setAppState('speaking');
        setLastResponseText(response.result_text);
        TtsService.speak(response.result_text, handleSpeechDone);
      } else {
        setAppState('error');
        setLastResponseText("Sorry, I couldn't get a response from the server.");
        TtsService.speak("Sorry, I couldn't get a response from the server.", handleSpeechDone);
      }
    };

    const init = async () => {
      await VoiceService.init(handleWakeWord);

      CameraService.setCameraRef(cameraRef.current);

      setAppState('listening');
      setLastResponseText('Listening for wake word...');
    };

    if (permission && permission.granted) {
      init();
    }

    return () => {
      VoiceService.destroy();
    };
  }, [permission]);

  useEffect(() => {
    if (appState === 'listening') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playSound('listening');
    } else if (appState === 'speaking') {
      playSound('success');
    } else if (appState === 'error') {
      playSound('error');
    }
  }, [appState]);

  if (!permission) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera.</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing={"back"} />
      <View style={styles.overlay}>
        <Animated.View style={[styles.indicator, animatedStyle]} />
        <Text style={styles.statusText}>{lastResponseText}</Text>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  indicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  statusText: {
    marginTop: 20,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
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
});
