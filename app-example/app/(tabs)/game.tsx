import React, { useState } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TapTheBox } from '@/components/games/TapTheBox';
import { ReactionTime } from '@/components/games/ReactionTime';

type Game = 'tap-the-box' | 'reaction-time';

export default function GameMenuScreen() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  if (selectedGame === 'tap-the-box') {
    return <TapTheBox onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'reaction-time') {
    return <ReactionTime onBack={() => setSelectedGame(null)} />;
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Game Center</ThemedText>
      <View style={styles.buttonContainer}>
        <Button title="Tap the Box" onPress={() => setSelectedGame('tap-the-box')} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Reaction Time" onPress={() => setSelectedGame('reaction-time')} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '60%',
  },
});