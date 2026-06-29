// saflash — CardImage component
// Shows a real photo when one is available; otherwise (or on load error) falls
// back to a large, friendly per-word emoji inside a soft colored circle. This
// guarantees every card has a clear visual, offline, with zero cost.
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { RADIUS } from '../theme/spacing';
import { COLORS } from '../theme/colors';
import { getEmoji } from '../utils/emojiMap';

const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

export default function CardImage({ uri, word, category, style, size = 180 }) {
  const [hasError, setHasError] = useState(false);

  // Reset the error flag when the image source changes (new card).
  useEffect(() => {
    setHasError(false);
  }, [uri]);

  const boxStyle = {
    width: size,
    height: size,
    borderRadius: RADIUS.lg,
  };

  if (hasError || !uri) {
    const emoji = getEmoji(word, category);
    return (
      <View style={[styles.emojiBox, boxStyle, style]}>
        <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>{emoji}</Text>
      </View>
    );
  }

  return (
    <ExpoImage
      source={uri}
      style={[boxStyle, style]}
      contentFit="cover"
      placeholder={{ blurhash }}
      transition={300}
      onError={() => setHasError(true)}
    />
  );
}

const styles = StyleSheet.create({
  emojiBox: {
    backgroundColor: COLORS.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});
