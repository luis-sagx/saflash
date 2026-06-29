// saflash — FlashCard component (front + back with flip animation)
import React, { useState, useEffect, useCallback } from 'react';
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
import { enrichWord } from '../services/enrichmentService';
import { speak } from '../services/audioService';

export default function FlashCard({ card, cardType = 'word', onRatingPress }) {
  const rotation = useSharedValue(0);
  const [flipped, setFlipped] = useState(false);
  // Local copy so real (enriched) content can replace placeholder data live.
  const [data, setData] = useState(card);

  // Sync + reset whenever a new card comes in.
  useEffect(() => {
    setData(card);
    setFlipped(false);
    rotation.value = 0;
  }, [card?.id, cardType]);

  // Auto-play pronunciation when a new card appears (front side).
  useEffect(() => {
    if (!card) return;
    const text = cardType === 'word' ? card.english_word : card.phrase_en;
    if (text) speak(text);
  }, [card?.id, cardType]);

  // Fetch real definition / example / phonetic / audio / photo on first view.
  useEffect(() => {
    let alive = true;
    if (cardType === 'word' && card && !card.enriched) {
      enrichWord(card).then(updated => {
        if (alive && updated) setData(prev => ({ ...prev, ...updated }));
      });
    }
    return () => {
      alive = false;
    };
  }, [card?.id, cardType]);

  const flip = useCallback(() => {
    rotation.value = withTiming(flipped ? 0 : 180, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
    setFlipped(prev => !prev);
  }, [flipped, rotation]);

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotation.value, [0, 180], [0, 180])}deg` },
    ],
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` },
    ],
  }));

  if (!data) return null;

  const isWord = cardType === 'word';
  const wordText = isWord ? data.english_word : data.phrase_en;
  const transText = isWord ? data.spanish_trans : data.phrase_es;

  // Full English audio sequence: word → meaning → example.
  const sequenceParts = isWord
    ? [wordText, data.definition_en, data.example_en].filter(Boolean)
    : [wordText, data.context].filter(Boolean);

  return (
    <TouchableOpacity onPress={flip} activeOpacity={1} style={styles.container}>
      {/* ── FRONT ─────────────────────────── */}
      <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
        {data.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {formatCategoryName(data.category).toUpperCase()}
            </Text>
          </View>
        )}

        {isWord && (
          <CardImage
            uri={data.image_url}
            word={wordText}
            category={data.category}
            style={styles.image}
          />
        )}

        <Text style={styles.wordText} numberOfLines={2}>
          {wordText}
        </Text>

        {isWord && data.phonetic && (
          <Text style={styles.phoneticText}>{data.phonetic}</Text>
        )}

        <PronunciationButton word={wordText} size={32} color={COLORS.accentOrange} />

        <Text style={styles.tapHint}>Toca para ver el significado</Text>
      </Animated.View>

      {/* ── BACK ──────────────────────────── */}
      <Animated.View style={[styles.card, styles.cardBack, styles.cardBackAbsolute, backAnimatedStyle]}>
        <View style={styles.backContent}>
          <View style={styles.backHeader}>
            <Text style={styles.wordTextBack} numberOfLines={1}>
              {wordText}
            </Text>
            <PronunciationButton
              parts={sequenceParts}
              size={26}
              color={COLORS.accentOrange}
              style={styles.backAudioBtn}
            />
          </View>

          <Text style={styles.translationText} numberOfLines={3}>
            {transText}
          </Text>

          {/* Real English definition (the "meaning"), when available */}
          {isWord && data.definition_en && (
            <Text style={styles.definitionText} numberOfLines={3}>
              {data.definition_en}
            </Text>
          )}

          <View style={styles.divider} />

          {isWord && data.example_en && (
            <Text style={styles.exampleText}>"{data.example_en}"</Text>
          )}
          {isWord && data.example_es && (
            <Text style={styles.exampleTransText}>{data.example_es}</Text>
          )}

          {!isWord && data.context && (
            <Text style={styles.contextText}>{data.context}</Text>
          )}

          <Text style={styles.playHint}>🔊 Toca el altavoz para escuchar todo</Text>
        </View>

        {/* Rating buttons always pinned to the bottom for a stable position */}
        <View style={styles.ratingSlot}>
          {flipped && <RatingButtons onPress={onRatingPress} />}
        </View>
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
    backfaceVisibility: 'hidden',
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
    backfaceVisibility: 'hidden',
    justifyContent: 'flex-start',
  },
  cardBackAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingSlot: {
    width: '100%',
    minHeight: 68,
    justifyContent: 'flex-end',
  },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  wordTextBack: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 24,
    color: COLORS.textPlaceholder,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  backAudioBtn: {
    padding: 2,
  },
  translationText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 20,
    color: COLORS.textPlaceholder,
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  definitionText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 15,
    color: COLORS.sageCream,
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 21,
    marginBottom: 12,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: '#5F6368',
    marginBottom: 14,
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
  playHint: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    color: COLORS.textPlaceholder,
    marginTop: 12,
    textAlign: 'center',
  },
});
