// saflash — Lesson path node.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DifficultyColors } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';

export default function LessonNode({ lesson, current, align = 'left', showConnector = false, onPress }) {
  const locked = lesson.status === 'locked';
  const completed = lesson.status === 'completed';
  const color = DifficultyColors[lesson.level] || COLORS.deepOlive;

  return (
    <View style={[styles.row, align === 'right' && styles.rowRight]}>
      {showConnector && (
        <View
          pointerEvents="none"
          style={[
            styles.connector,
            align === 'right' ? styles.connectorRight : styles.connectorLeft,
          ]}
        />
      )}
      <TouchableOpacity
        style={[
          styles.node,
          { borderColor: current ? color : COLORS.borderSage },
          completed && { backgroundColor: color, borderColor: color },
          locked && styles.locked,
        ]}
        disabled={locked}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Ionicons
          name={locked ? 'lock-closed' : completed ? 'checkmark' : 'play'}
          size={22}
          color={completed ? COLORS.surfaceWhite : locked ? COLORS.textPlaceholder : color}
        />
      </TouchableOpacity>
      <View style={styles.meta}>
        <Text style={styles.title}>Lección {lesson.lesson_index + 1}</Text>
        <Text style={styles.state}>
          {locked ? 'Bloqueada' : completed ? `${lesson.stars || 1} estrellas` : 'Actual'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    position: 'relative',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  node: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.pill,
    borderWidth: 3,
    backgroundColor: COLORS.surfaceWhite,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  connector: {
    position: 'absolute',
    top: 62,
    width: 220,
    height: 7,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accentOrange,
    opacity: 0.82,
    zIndex: 0,
  },
  connectorLeft: {
    left: 66,
    transform: [{ rotate: '17deg' }],
  },
  connectorRight: {
    right: 66,
    transform: [{ rotate: '-17deg' }],
  },
  locked: {
    backgroundColor: COLORS.sageCream,
    borderColor: COLORS.borderSage,
  },
  meta: {
    width: 116,
    zIndex: 2,
  },
  title: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 14,
    color: COLORS.oliveInk,
  },
  state: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
