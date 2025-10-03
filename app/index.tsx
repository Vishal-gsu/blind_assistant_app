import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import CameraService from '../src/services/CameraService';
import IntentService from '../src/services/IntentService';
import NetworkService from '../src/services/NetworkService';
import TtsService from '../src/services/TtsService';
import VoiceService from '../src/services/VoiceService';
import { useStore } from '../src/store';


import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

// This store is now centralized in src/store.ts

// --- Main App Component ---
export default function ScoutApp() {
  const { appState, lastResponseText, setAppState, setLastResponseText } = useStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [showTestPanel, setShowTestPanel] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Test buttons configuration
  const testButtons = [
    { text: 'Test Wake Word', command: 'WAKE_WORD_TEST' },
    { text: 'Describe Scene', command: 'describe the scene' },
    { text: 'Read Text', command: 'read this text' },
    { text: 'Find Object', command: 'find my keys' },
    { text: 'Who Is This', command: 'who is this person' },
    { text: 'Save Face', command: 'save this person as John' },
    { text: 'What Time', command: 'what time is it' },
    { text: 'Weather', command: "what's the weather" },
    { text: 'Help', command: 'what can you do' },
    { text: 'Question', command: 'how many people are here?' },
    { text: 'Conversation', command: 'hello how are you' }
  ];

  // --- Handler Functions ---
  const handleSpeechDone = () => {
    console.log('🔄 Speech done, restarting listening in 0.5 seconds...');
    setIsProcessingWakeWord(false); // Reset the processing flag
    setTimeout(async () => {
      console.log('🎤 Restarting voice listening...');
      try {
        // Simple restart - just start listening again
        await VoiceService.start();
        setAppState('listening');
      } catch (error) {
        console.error('❌ Error restarting voice listening:', error);
        // If simple restart fails, try full reinit
        try {
          console.log('🔄 Attempting full VoiceService reinit...');
          await VoiceService.destroy();
          await VoiceService.init(handleWakeWord);
          await VoiceService.start();
          setAppState('listening');
        } catch (reinitError) {
          console.error('❌ Full reinit also failed:', reinitError);
          setAppState('error');
        }
      }
    }, 500); // 0.5-second delay
  };

  const handleTimeIntent = async () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    const response = `It's currently ${timeString} on ${dateString}`;
    
    setAppState('speaking');
    setLastResponseText(response);
    TtsService.speak(response, handleSpeechDone);
  };

  const handleWeatherIntent = async (city?: string) => {
    const location = city || 'your location';
    const response = `Weather information for ${location} is not available yet. This feature requires weather API integration.`;
    
    setAppState('speaking');
    setLastResponseText(response);
    TtsService.speak(response, handleSpeechDone);
  };

  const handleSetCityIntent = async (cityName: string) => {
    // TODO: Implement city storage in local storage or state
    const response = `I've set your default location to ${cityName}. This will be used for weather and location-based services.`;
    
    setAppState('speaking');
    setLastResponseText(response);
    TtsService.speak(response, handleSpeechDone);
  };

  const handleHelpIntent = async () => {
    const helpText = `I can help you with:
      - Describing what I see in front of you
      - Reading text from documents or signs
      - Finding specific objects
      - Recognizing faces
      - Telling you the current time
      - Weather information
      - And answering questions about what you're looking at
      
      Just say "Bumblebee" followed by your request!`;
    
    setAppState('speaking');
    setLastResponseText(helpText);
    TtsService.speak(helpText, handleSpeechDone);
  };

  const handleConversationIntent = async (queryText: string) => {
    // For now, provide a simple conversational response
    const response = `I heard you say "${queryText}". I'm here to help you with visual assistance. What would you like me to look at?`;
    
    setAppState('speaking');
    setLastResponseText(response);
    TtsService.speak(response, handleSpeechDone);
  };

  const handleVisualIntent = async (intent: any) => {
    setLastResponseText(`Got it. ${intent.task.replace('_', ' ')}...`);
    
    const imageData = await CameraService.takePicture();
    if (!imageData) {
      setAppState('error');
      setLastResponseText("Sorry, I couldn't take a picture.");
      TtsService.speak("Sorry, I couldn't take a picture.", handleSpeechDone);
      return;
    }

    // Send to professor's API for visual processing
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

  const handleIntent = async (intent: any) => {
    try {
      switch (intent.task) {
        case 'time':
          await handleTimeIntent();
          break;
        
        case 'weather':
          await handleWeatherIntent(intent.city);
          break;
        
        case 'set_city':
          await handleSetCityIntent(intent.city_name);
          break;
        
        case 'help':
          await handleHelpIntent();
          break;
        
        case 'general_conversation':
          await handleConversationIntent(intent.query_text);
          break;
        
        // Visual intents that require image
        case 'describe_scene':
        case 'read_text':
        case 'find_object':
        case 'answer_question':
        case 'face_detect':
        case 'save_face':
          await handleVisualIntent(intent);
          break;
        
        default:
          setAppState('error');
          setLastResponseText("Sorry, I don't know how to handle that yet.");
          TtsService.speak("Sorry, I don't know how to handle that yet.", handleSpeechDone);
      }
    } catch (error) {
      console.error('Error handling intent:', error);
      setAppState('error');
      setLastResponseText("Sorry, something went wrong.");
      TtsService.speak("Sorry, something went wrong.", handleSpeechDone);
    }
  };

  const [isProcessingWakeWord, setIsProcessingWakeWord] = useState(false);

  const handleWakeWord = async () => {
    if (isProcessingWakeWord) {
      console.log('⚠️ Wake word already being processed, ignoring...');
      return;
    }
    
    console.log('🎯 WAKE WORD DETECTED! Callback triggered');
    setIsProcessingWakeWord(true);
    
    try {
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

      // Handle different intent types
      await handleIntent(intent);
    } finally {
      setIsProcessingWakeWord(false);
    }
  };

  // Test functions for different intents
  const testIntent = async (intentText: string) => {
    if (intentText === 'WAKE_WORD_TEST') {
      console.log('🧪 Testing wake word handler manually');
      await handleWakeWord();
      return;
    }

    await VoiceService.stop();
    setAppState('processing');
    setLastResponseText('Testing intent...');
    
    console.log(`Testing intent with text: "${intentText}"`);
    const intent = await IntentService.getIntent(intentText);
    
    if (intent.task === 'unknown') {
      setAppState('error');
      setLastResponseText("Intent not recognized.");
      TtsService.speak("Intent not recognized.", handleSpeechDone);
      return;
    }
    
    await handleIntent(intent);
  };

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
    try {
      // TODO: Implement expo-audio properly when needed
      // For now, disable sound to avoid expo-av deprecation warning
      console.log(`Playing sound: ${sound}`);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  };

  // --- App Logic ---
  // Handle permissions separately to avoid re-initialization
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    const init = async () => {
      if (!permission?.granted) {
        console.log('Permissions not granted yet, skipping init.');
        return;
      }
      
      try {
        console.log('🚀 Initializing Scout1 app...');
        setAppState('initializing');
        setLastResponseText('Initializing...');

        await VoiceService.init(handleWakeWord);
        CameraService.setCameraRef(cameraRef.current);
        
        console.log('🎤 Starting voice listening...');
        await VoiceService.start();
        
        setAppState('listening');
        setLastResponseText('Listening for "Bumblebee"...');
        console.log('✅ App initialization complete - ready to listen!');
      } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        setAppState('error');
        setLastResponseText('Failed to initialize voice detection');
      }
    };

    init();

    return () => {
      // Cleanup logic when the component unmounts
      console.log('🧹 Component unmounting, destroying VoiceService.');
      VoiceService.destroy();
    };
  }, [permission?.granted]); // Re-run init if permission status changes

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
        
        {/* Listening Status */}
        {appState === 'listening' && (
          <View style={styles.listeningIndicator}>
            <Text style={styles.listeningText}>
              🎤 Listening for "Bumblebee"...
            </Text>
            <Text style={styles.listeningSubtext}>
              Say the wake word to activate
            </Text>
          </View>
        )}
      </View>
      
      {/* Test Panel Toggle Button */}
      <TouchableOpacity 
        style={styles.testToggleButton}
        onPress={() => setShowTestPanel(!showTestPanel)}
      >
        <Text style={styles.testToggleText}>
          {showTestPanel ? '✕' : 'TEST'}
        </Text>
      </TouchableOpacity>
      
      {/* Test Panel */}
      {showTestPanel && (
        <View style={styles.testPanel}>
          <ScrollView style={styles.testScrollView}>
            <Text style={styles.testTitle}>Intent Testing</Text>
            {testButtons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={styles.testButton}
                onPress={() => testIntent(button.command)}
                disabled={appState === 'processing' || appState === 'speaking'}
              >
                <Text style={styles.testButtonText}>{button.text}</Text>
                <Text style={styles.testCommandText}>"{button.command}"</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
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
  listeningIndicator: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
  },
  listeningText: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listeningSubtext: {
    color: '#88ff88',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
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
  testToggleButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  testToggleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  testPanel: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 20,
    maxHeight: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 10,
  },
  testScrollView: {
    maxHeight: 280,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 5,
    marginBottom: 5,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  testCommandText: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.8,
  },
});
