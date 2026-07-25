// saflash — Lesson path node.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DifficultyColors } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';

export default function LessonNode({ lesson, current, align = 'left', showConnector = false, onPress }) {
  const locked = lesson.status === 'locked';
  const completed = lesson.status === 'completed';
  const color = DifficultyColors[lesson.level] || COLORS.deepOlive;
  const { width } = useWindowDimensions();
  const rowWidth = Math.max(width - SPACING.xl * 2, 280);

  return (
    <View style={[styles.row, align === 'right' && styles.rowRight]}>
      {showConnector && <PathConnector align={align} rowWidth={rowWidth} />}
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

function PathConnector({ align, rowWidth }) {
  const points = buildConnectorPoints(rowWidth, align);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {points.map((point, index) => (
        <View
          key={index}
          style={[styles.connectorDot, { left: point.x, top: point.y }]}
        />
      ))}
    </View>
  );
}

function buildConnectorPoints(rowWidth, align) {
  const leftNodeExit = { x: 36, y: 88 };
  const leftNodeEntry = { x: 28, y: 158 };
  const rightNodeCenterX = rowWidth - 152;
  const rightNodeExit = { x: rightNodeCenterX, y: 84 };
  const rightNodeEntry = { x: rightNodeCenterX, y: 158 };

  const start = align === 'right' ? rightNodeExit : leftNodeExit;
  const end = align === 'right' ? leftNodeEntry : rightNodeEntry;
  const controlA = align === 'right'
    ? { x: start.x, y: start.y + 46 }
    : { x: start.x - 2, y: start.y + 52 };
  const controlB = {
    x: end.x,
    y: end.y - 46,
  };
  const steps = 64;

  return Array.from({ length: steps }, (_, index) => {
    const t = index / (steps - 1);
    const x =
      (1 - t) ** 3 * start.x +
      3 * (1 - t) ** 2 * t * controlA.x +
      3 * (1 - t) * t ** 2 * controlB.x +
      t ** 3 * end.x;
    const y =
      (1 - t) ** 3 * start.y +
      3 * (1 - t) ** 2 * t * controlA.y +
      3 * (1 - t) * t ** 2 * controlB.y +
      t ** 3 * end.y;

    return { x, y };
  });
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    minHeight: 124,
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
  connectorDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accentOrange,
    opacity: 0.8,
    zIndex: 0,
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
