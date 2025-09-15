import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { Camera, useCameraPermissions } from 'expo-camera';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import Voice from '@react-native-voice/voice';

import CameraService from '../../src/services/CameraService';
import IntentService from '../../src/services/IntentService';
import NetworkService, { ProcessRequest } from '../../src/services/NetworkService';
import TtsService from '../../src/services/TtsService';
import VoiceService from '../../src/services/VoiceService';
import { useStore } from '../../src/store';

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<Camera>(null);

  const { 
    isListening, 
    isSending, 
    isSpeaking, 
    lastResponseText, 
    setListening, 
    setSending, 
    setSpeaking, 
    setLastResponseText 
  } = useStore();

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (cameraRef.current) {
      CameraService.setCameraRef(cameraRef);
    }
  }, [cameraRef]);

  useEffect(() => {
    VoiceService.init();

    Voice.onSpeechResults = async (e) => {
      setListening(false);
      const text = e.value?.[0] || '';
      if (text) {
        setSending(true);
        const intent = await IntentService.getIntent(text);
        const imageData = await CameraService.takePicture();

        if (imageData) {
          const requestData: ProcessRequest = {
            task: intent.task as ProcessRequest['task'],
            image_data: imageData,
            query_text: (intent as any).query_text,
          };
          const response = await NetworkService.processImage(requestData);
          if (response) {
            setLastResponseText(response.result_text);
            setSpeaking(true);
            TtsService.speak(response.result_text, () => setSpeaking(false));
          }
        }
        setSending(false);
      }
    };

    return () => {
      VoiceService.destroy();
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    if (isListening) {
      scale.value = withRepeat(withSpring(1.2), -1, true);
      opacity.value = withTiming(0.8, { duration: 500, easing: Easing.inOut(Easing.ease) });
    } else if (isSending) {
      scale.value = withRepeat(withSpring(1.5), -1, true);
      opacity.value = withTiming(0.5, { duration: 200, easing: Easing.inOut(Easing.ease) });
    } else {
      scale.value = withSpring(1);
      opacity.value = withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) });
    }
  }, [isListening, isSending]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef} />
      <View style={styles.overlay}>
        <Animated.View style={[styles.indicator, animatedStyle]} />
        <View style={styles.responseContainer}>
          <Text style={styles.responseText}>{lastResponseText}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    position: 'absolute',
  },
  responseContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 15,
    borderRadius: 10,
  },
  responseText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
});
