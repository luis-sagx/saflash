// saflash — Home screen
import React, { useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING, SHADOW } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';
import { useProgress } from '../hooks/useProgress';
import useAppStore from '../store/appStore';
import StreakBadge from '../components/StreakBadge';
import ProgressBar from '../components/ProgressBar';
import StatsCard from '../components/StatsCard';
import { formatNumber, formatProgress } from '../utils/formatters';
import { getCurrentMonthYear } from '../utils/dateUtils';
import { getKnownWordsCount } from '../database/wordsRepository';
import { getKnownPhrasesCount } from '../database/phrasesRepository';

export default function HomeScreen({ navigation }) {
  const {
    study,
    todayStudied,
    streak,
    totalStudied,
    dailyGoal,
    totalWords,
    totalPhrases,
    loading,
    refresh,
  } = useProgress();

  const dailyGoalStore = useAppStore(s => s.dailyGoal);
  const goal = dailyGoalStore || dailyGoal || 20;

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola! 👋</Text>
          <Text style={styles.date}>{getCurrentMonthYear()}</Text>
        </View>
        <StreakBadge days={streak} />
      </View>

      {/* Daily goal */}
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>Meta diaria</Text>
          <Text style={styles.goalCount}>{todayStudied} / {goal}</Text>
        </View>
        <ProgressBar current={todayStudied} total={goal} color={COLORS.successGreen} />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatsCard icon="today" value={todayStudied} label="Hoy" color={COLORS.accentOrange} />
        <StatsCard icon="flame" value={`${streak}`} label="Racha" color={COLORS.amberGold} />
        <StatsCard icon="checkmark-done" value={formatNumber(study.knownCount)} label="Conocidas" color={COLORS.successGreen} />
      </View>

      {/* Study cards */}
      <TouchableOpacity
        style={[styles.studyCard, { backgroundColor: COLORS.deepOlive }]}
        onPress={() => navigation.navigate('WordsNavigator', { screen: 'StudyWords' })}
        activeOpacity={0.9}
      >
        <View style={styles.studyCardContent}>
          <View>
            <Text style={styles.studyCardTitle}>📚 Palabras</Text>
            <Text style={styles.studyCardSubtitle}>{formatNumber(totalWords)} palabras</Text>
            <Text style={styles.studyCardProgress}>
              {formatProgress(study.knownCount, totalWords)} aprendidas
            </Text>
          </View>
          <TouchableOpacity
            style={styles.studyButton}
            onPress={() => navigation.navigate('WordsNavigator', { screen: 'StudyWords' })}
          >
            <Text style={styles.studyButtonText}>Estudiar</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.deepOlive} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.studyCard, { backgroundColor: COLORS.successGreen }]}
        onPress={() => navigation.navigate('PhrasesNavigator', { screen: 'StudyPhrases' })}
        activeOpacity={0.9}
      >
        <View style={styles.studyCardContent}>
          <View>
            <Text style={styles.studyCardTitle}>💬 Frases</Text>
            <Text style={styles.studyCardSubtitle}>{formatNumber(totalPhrases)} frases</Text>
          </View>
          <TouchableOpacity
            style={styles.studyButton}
            onPress={() => navigation.navigate('PhrasesNavigator', { screen: 'StudyPhrases' })}
          >
            <Text style={styles.studyButtonText}>Estudiar</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.deepOlive} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Quick links */}
      <View style={styles.quickLinks}>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => navigation.navigate('WordsNavigator')}
        >
          <Ionicons name="book" size={20} color={COLORS.oliveInk} />
          <Text style={styles.quickLinkText}>Explorar palabras</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => navigation.navigate('PhrasesNavigator')}
        >
          <Ionicons name="chatbubbles" size={20} color={COLORS.oliveInk} />
          <Text style={styles.quickLinkText}>Explorar frases</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => navigation.navigate('Progress')}
        >
          <Ionicons name="bar-chart" size={20} color={COLORS.oliveInk} />
          <Text style={styles.quickLinkText}>Ver progreso</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmParchment,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.base,
  },
  greeting: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 24,
    color: COLORS.deepOlive,
  },
  date: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  goalCard: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderSage,
    padding: SPACING.base,
    marginBottom: SPACING.base,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  goalTitle: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  goalCount: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 14,
    color: COLORS.oliveInk,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  studyCard: {
    marginHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    ...SHADOW.card,
  },
  studyCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studyCardTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 22,
    color: COLORS.surfaceWhite,
    marginBottom: 4,
  },
  studyCardSubtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: COLORS.surfaceWhite,
    opacity: 0.8,
  },
  studyCardProgress: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 13,
    color: COLORS.surfaceWhite,
    opacity: 0.9,
    marginTop: 4,
  },
  studyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceWhite,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
  },
  studyButtonText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 14,
    color: COLORS.deepOlive,
  },
  quickLinks: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderSage,
    padding: SPACING.base,
    gap: SPACING.md,
  },
  quickLinkText: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 15,
    color: COLORS.oliveInk,
  },
});
