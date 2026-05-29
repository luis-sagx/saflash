// saflash — Pronunciation button
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { speak } from '../services/audioService';

export default function PronunciationButton({ word, size = 32, color = COLORS.accentOrange }) {
  const handlePress = () => {
    if (word) speak(word);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button} activeOpacity={0.7}>
      <Ionicons name="volume-high" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
