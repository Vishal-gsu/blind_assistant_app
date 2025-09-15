import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BOX_SIZE = 50;

interface TapTheBoxProps {
  onBack: () => void;
}

export function TapTheBox({ onBack }: TapTheBoxProps) {
  const [score, setScore] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const randomizePosition = () => {
    const x = Math.floor(Math.random() * (screenWidth - BOX_SIZE));
    const y = Math.floor(Math.random() * (screenHeight - BOX_SIZE - 250)) + 50;
    setPosition({ x, y });
  };

  useEffect(() => {
    randomizePosition();
  }, []);

  const handleTap = () => {
    setScore(score + 1);
    randomizePosition();
  };

  return (
    <View style={styles.container}>
      <Button title="< Back to Menu" onPress={onBack} />
      <ThemedText style={styles.title}>Tap the Box!</ThemedText>
      <ThemedText style={styles.score}>Score: {score}</ThemedText>
      <View style={styles.gameArea}>
        <TouchableOpacity
          style={[styles.box, { left: position.x, top: position.y }]}
          onPress={handleTap}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  score: {
    fontSize: 20,
    marginBottom: 20,
  },
  gameArea: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    backgroundColor: 'tomato',
    position: 'absolute',
  },
});
