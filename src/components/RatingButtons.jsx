// saflash — Rating buttons for flashcard evaluation
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, Rating } from '../theme/colors';
import { RADIUS } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';
import { RATING } from '../utils/constants';

export default function RatingButtons({ onPress }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: Rating.hard }]}
        onPress={() => onPress(RATING.HARD)}
        activeOpacity={0.8}
      >
        <Text style={styles.label}>Hard</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: Rating.medium }]}
        onPress={() => onPress(RATING.MEDIUM)}
        activeOpacity={0.8}
      >
        <Text style={styles.label}>Good</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: Rating.easy }]}
        onPress={() => onPress(RATING.EASY)}
        activeOpacity={0.8}
      >
        <Text style={styles.label}>Easy</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  label: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
