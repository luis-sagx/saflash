// saflash — Pronunciation button
// Plays a single word, or a full English sequence (word → meaning → example)
// when given `parts`. Shows a subtle active state while speaking.
import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { speak, speakSequence, stopSpeaking } from '../services/audioService';

export default function PronunciationButton({
  word,
  parts,
  size = 32,
  color = COLORS.accentOrange,
  style,
}) {
  const [active, setActive] = useState(false);

  const handlePress = async () => {
    if (active) {
      await stopSpeaking();
      setActive(false);
      return;
    }
    setActive(true);
    try {
      if (Array.isArray(parts) && parts.length > 0) {
        await speakSequence(parts);
      } else if (word) {
        await speak(word);
      }
    } finally {
      setActive(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, style]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Detener audio' : 'Reproducir pronunciación'}
    >
      <Ionicons
        name={active ? 'stop-circle' : 'volume-high'}
        size={size}
        color={color}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});
