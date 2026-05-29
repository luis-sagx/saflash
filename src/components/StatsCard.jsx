// saflash — Stats card (home screen mini cards)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';

export default function StatsCard({ icon, value, label, color = COLORS.oliveInk, style }) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderSage,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  value: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 20,
  },
  label: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
