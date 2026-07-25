// saflash — Unit header for the guided path.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';

export default function UnitHeader({ unit }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{unit.icon}</Text>
      <View>
        <Text style={styles.level}>{unit.level}</Text>
        <Text style={styles.title}>{unit.unit_title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    marginBottom: SPACING.base,
  },
  icon: {
    fontSize: 24,
  },
  level: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 12,
    color: COLORS.accentOrange,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 18,
    color: COLORS.deepOlive,
  },
});
