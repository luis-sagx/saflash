// saflash — Session summary (shown after completing a study session)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, Rating } from '../theme/colors';
import { RADIUS, SPACING, SHADOW } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';

export default function SessionSummary({ easy = 0, medium = 0, hard = 0, durationSecs = 0, onContinue, onViewProgress }) {
  const total = easy + medium + hard;
  const mins = Math.floor(durationSecs / 60);
  const secs = durationSecs % 60;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.congrats}>🎉 ¡Sesión completada!</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statLabel}>Tarjetas</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{mins}:{secs.toString().padStart(2, '0')}</Text>
            <Text style={styles.statLabel}>Duración</Text>
          </View>
        </View>

        <View style={styles.ratingsRow}>
          <View style={[styles.ratingPill, { backgroundColor: Rating.easy + '20' }]}>
            <Ionicons name="checkmark-circle" size={16} color={Rating.easy} />
            <Text style={[styles.ratingText, { color: Rating.easy }]}>{easy} Fácil</Text>
          </View>
          <View style={[styles.ratingPill, { backgroundColor: Rating.medium + '20' }]}>
            <Ionicons name="remove-circle" size={16} color={Rating.medium} />
            <Text style={[styles.ratingText, { color: Rating.medium }]}>{medium} Bien</Text>
          </View>
          <View style={[styles.ratingPill, { backgroundColor: Rating.hard + '20' }]}>
            <Ionicons name="close-circle" size={16} color={Rating.hard} />
            <Text style={[styles.ratingText, { color: Rating.hard }]}>{hard} Difícil</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={onContinue} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>Seguir estudiando</Text>
        </TouchableOpacity>

        {onViewProgress && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onViewProgress} activeOpacity={0.7}>
            <Text style={styles.secondaryButtonText}>Ver mi progreso</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.warmParchment,
    padding: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...SHADOW.card,
  },
  congrats: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 26,
    color: COLORS.deepOlive,
    marginBottom: SPACING.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.xl,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 28,
    color: COLORS.oliveInk,
  },
  statLabel: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  ratingsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
    gap: 4,
  },
  ratingText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 13,
  },
  primaryButton: {
    backgroundColor: COLORS.deepOlive,
    borderRadius: RADIUS.sm,
    paddingVertical: 14,
    paddingHorizontal: SPACING.xxl,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  primaryButtonText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 16,
    color: COLORS.surfaceWhite,
  },
  secondaryButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 15,
    color: COLORS.accentOrange,
  },
});
