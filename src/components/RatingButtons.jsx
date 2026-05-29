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
        <Text style={styles.label}>Difícil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: Rating.medium }]}
        onPress={() => onPress(RATING.MEDIUM)}
        activeOpacity={0.8}
      >
        <Text style={styles.label}>Bien</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: Rating.easy }]}
        onPress={() => onPress(RATING.EASY)}
        activeOpacity={0.8}
      >
        <Text style={styles.label}>Fácil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    marginTop: 20,
  },
  button: {
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 90,
    alignItems: 'center',
  },
  label: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
