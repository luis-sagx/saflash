// saflash — Streak badge
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';
import { formatStreak } from '../utils/formatters';

export default function StreakBadge({ days = 0, style }) {
  const hasStreak = days > 0;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: hasStreak ? COLORS.amberGold + '20' : COLORS.sageCream },
        style,
      ]}
    >
      <Text style={styles.icon}>🔥</Text>
      <Text
        style={[
          styles.text,
          { color: hasStreak ? COLORS.amberGold : COLORS.textPlaceholder },
        ]}
      >
        {formatStreak(days)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
    gap: SPACING.xs,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 14,
  },
});
