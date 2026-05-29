// saflash — FlashCard component (front + back with flip animation)
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  interpolate,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../theme/colors';
import { RADIUS, SHADOW, LAYOUT } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';
import CardImage from './CardImage';
import RatingButtons from './RatingButtons';
import PronunciationButton from './PronunciationButton';
import { formatCategoryName } from '../utils/formatters';

export default function FlashCard({ card, cardType = 'word', onRatingPress }) {
  const rotation = useSharedValue(0);
  const [flipped, setFlipped] = useState(false);

  const flip = useCallback(() => {
    rotation.value = withTiming(flipped ? 0 : 180, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
    setFlipped(prev => !prev);
  }, [flipped, rotation]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [0, 180])}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` }],
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }));

  if (!card) return null;

  const wordText = cardType === 'word' ? card.english_word : card.phrase_en;
  const transText = cardType === 'word' ? card.spanish_trans : card.phrase_es;

  return (
    <TouchableOpacity onPress={flip} activeOpacity={1} style={styles.container}>
      {/* ── FRONT ─────────────────────────── */}
      <Animated.View style={[styles.card, styles.cardFront, frontStyle]}>
        {card.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {formatCategoryName(card.category).toUpperCase()}
            </Text>
          </View>
        )}

        {card.image_url && cardType === 'word' && (
          <CardImage uri={card.image_url} style={styles.image} />
        )}

        <Text style={styles.wordText} numberOfLines={2}>
          {wordText}
        </Text>

        {cardType === 'word' && card.phonetic && (
          <Text style={styles.phoneticText}>{card.phonetic}</Text>
        )}

        <PronunciationButton word={wordText} size={32} color={COLORS.accentOrange} />

        <Text style={styles.tapHint}>Toca para ver la traducción</Text>
      </Animated.View>

      {/* ── BACK ──────────────────────────── */}
      <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
        <Text style={styles.wordTextBack} numberOfLines={2}>
          {wordText}
        </Text>

        <Text style={styles.translationText} numberOfLines={3}>
          {transText}
        </Text>

        <View style={styles.divider} />

        {cardType === 'word' && card.example_en && (
          <Text style={styles.exampleText}>"{card.example_en}"</Text>
        )}
        {cardType === 'word' && card.example_es && (
          <Text style={styles.exampleTransText}>{card.example_es}</Text>
        )}

        {cardType === 'phrase' && card.context && (
          <Text style={styles.contextText}>{card.context}</Text>
        )}

        {flipped && (
          <RatingButtons onPress={onRatingPress} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: LAYOUT.cardWidth,
    height: LAYOUT.flashcardHeight,
    alignSelf: 'center',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.xl,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
  // ── Front ────────────────────────────
  cardFront: {
    backgroundColor: COLORS.cardFrontBg,
  },
  categoryBadge: {
    backgroundColor: COLORS.badgeBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    marginBottom: 12,
  },
  categoryText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 12,
    color: COLORS.badgeText,
  },
  image: {
    marginBottom: 16,
  },
  wordText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 38,
    color: COLORS.cardFrontText,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  phoneticText: {
    fontFamily: FONT_FAMILY.light,
    fontSize: 16,
    color: COLORS.textPlaceholder,
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 8,
  },
  tapHint: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 13,
    color: COLORS.textPlaceholder,
    marginTop: 12,
  },
  // ── Back ─────────────────────────────
  cardBack: {
    backgroundColor: COLORS.cardBackBg,
  },
  wordTextBack: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 26,
    color: COLORS.textPlaceholder,
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  translationText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 36,
    color: COLORS.cardBackText,
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: '#5F6368',
    marginBottom: 16,
  },
  exampleText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 17,
    color: COLORS.sageCream,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  exampleTransText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 15,
    color: COLORS.textPlaceholder,
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  contextText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 15,
    color: COLORS.sageCream,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 10,
    lineHeight: 22,
  },
});
