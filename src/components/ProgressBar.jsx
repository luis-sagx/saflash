// saflash — Progress bar component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';

export default function ProgressBar({
  current = 0,
  total = 1,
  color = COLORS.successGreen,
  backgroundColor = COLORS.sageCream,
  showLabel = true,
  height = 8,
  style,
}) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.track, { backgroundColor, height, borderRadius: height / 2 }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              height,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.label}>
          {current} / {total}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  track: {
    flex: 1,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  label: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 13,
    color: COLORS.textSecondary,
    minWidth: 56,
    textAlign: 'right',
  },
});
