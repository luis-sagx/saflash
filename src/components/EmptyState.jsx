// saflash — Empty state component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';

export default function EmptyState({ icon = 'book-outline', title, subtitle, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={COLORS.textPlaceholder} style={styles.icon} />
      <Text style={styles.title}>{title || 'No hay nada aquí'}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.button}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonLabel}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  icon: {
    marginBottom: SPACING.base,
    opacity: 0.5,
  },
  title: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: COLORS.textPlaceholder,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.deepOlive,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 6,
  },
  buttonLabel: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 15,
    color: COLORS.surfaceWhite,
  },
});
