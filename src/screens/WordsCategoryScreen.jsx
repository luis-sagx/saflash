// saflash — Words category screen (word list)
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';
import { useCategoryWords } from '../hooks/useWords';
import { getCategoryImage } from '../database/wordsRepository';
import { formatCategoryName, formatDifficulty } from '../utils/formatters';
import EmptyState from '../components/EmptyState';

export default function WordsCategoryScreen({ route, navigation }) {
  const { category } = route.params;
  const { words, loading } = useCategoryWords(category);

  const handleStudy = () => {
    navigation.navigate('StudyWords', { category });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{formatCategoryName(category)}</Text>
        <Text style={styles.count}>{words.length} palabras</Text>
      </View>

      {/* Word list */}
      <FlatList
        data={words}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon="book-outline"
              title="Sin palabras en esta categoría"
              subtitle="Volvé más tarde o explorá otra categoría."
            />
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.wordRow}
            activeOpacity={0.7}
          >
            <View style={styles.wordInfo}>
              <Text style={styles.englishWord}>{item.english_word}</Text>
              <Text style={styles.spanishWord}>{item.spanish_trans}</Text>
              {item.phonetic && (
                <Text style={styles.phonetic}>{item.phonetic}</Text>
              )}
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleStudy} activeOpacity={0.8}>
        <Ionicons name="play" size={20} color={COLORS.surfaceWhite} />
        <Text style={styles.fabText}>Estudiar esta categoría</Text>
      </TouchableOpacity>
    </View>
  );
}

function getDifficultyColor(difficulty) {
  const colors = {
    A1: COLORS.successGreen,
    A2: COLORS.amberGold,
    B1: COLORS.accentOrange,
    B2: '#D32F2F',
    C1: '#7B1FA2',
  };
  return colors[difficulty] || COLORS.textSecondary;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmParchment,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.base,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSage,
  },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 22,
    color: COLORS.deepOlive,
  },
  count: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
    paddingBottom: 80,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderSage,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  wordInfo: {
    flex: 1,
  },
  englishWord: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 16,
    color: COLORS.oliveInk,
  },
  spanishWord: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  phonetic: {
    fontFamily: FONT_FAMILY.light,
    fontSize: 13,
    color: COLORS.textPlaceholder,
    fontStyle: 'italic',
    marginTop: 2,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    marginLeft: SPACING.sm,
  },
  difficultyText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 11,
    color: COLORS.surfaceWhite,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: COLORS.deepOlive,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    gap: SPACING.sm,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fabText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 15,
    color: COLORS.surfaceWhite,
  },
});
