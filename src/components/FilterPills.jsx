// saflash — Filter pills (horizontal scrollable)
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';

export default function FilterPills({ options, selected, onSelect, style }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, style]}
      contentContainerStyle={styles.content}
    >
      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected ? COLORS.deepOlive : COLORS.sageCream,
                borderColor: isSelected ? COLORS.deepOlive : COLORS.borderSage,
              },
            ]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.label,
                { color: isSelected ? COLORS.surfaceWhite : COLORS.textSecondary },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 44,
  },
  content: {
    paddingHorizontal: SPACING.base,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  label: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 13,
  },
});
