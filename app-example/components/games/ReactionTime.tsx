import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface ReactionTimeProps {
  onBack: () => void;
}

type GameState = 'waiting' | 'ready' | 'tapped' | 'tooSoon';

export function ReactionTime({ onBack }: ReactionTimeProps) {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);

  useEffect(() => {
    if (gameState === 'waiting') {
      const timeout = setTimeout(() => {
        setGameState('ready');
        setStartTime(Date.now());
      }, Math.random() * 3000 + 2000); // Wait for 2-5 seconds

      return () => clearTimeout(timeout);
    }
  }, [gameState]);

  const handlePress = () => {
    if (gameState === 'ready') {
      const endTime = Date.now();
      setReactionTime(endTime - startTime);
      setGameState('tapped');
    } else if (gameState === 'waiting') {
      setGameState('tooSoon');
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setReactionTime(0);
  };

  const renderContent = () => {
    switch (gameState) {
      case 'waiting':
        return <ThemedText style={styles.prompt}>Wait for green...</ThemedText>;
      case 'ready':
        return <ThemedText style={styles.prompt}>Tap Now!</ThemedText>;
      case 'tapped':
        return (
          <>
            <ThemedText style={styles.result}>{reactionTime} ms</ThemedText>
            <Button title="Try Again" onPress={resetGame} />
          </>
        );
      case 'tooSoon':
        return (
          <>
            <ThemedText style={styles.prompt}>Too soon!</ThemedText>
            <Button title="Try Again" onPress={resetGame} />
          </>
        );
    }
  };

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'waiting':
        return 'crimson';
      case 'ready':
        return 'limegreen';
      case 'tapped':
      case 'tooSoon':
        return '#333';
    }
  }

  return (
    <View style={styles.container}>
      <Button title="< Back to Menu" onPress={onBack} />
      <ThemedText style={styles.title}>Reaction Time</ThemedText>
      <TouchableOpacity style={[styles.touchArea, { backgroundColor: getBackgroundColor() }]} onPress={handlePress} activeOpacity={0.8}>
        {renderContent()}
      </TouchableOpacity>
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
  touchArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prompt: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
  },
  result: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
