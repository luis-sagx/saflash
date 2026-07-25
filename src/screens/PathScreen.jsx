// saflash — Guided lesson path.
import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING, SHADOW } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';
import { useProgress } from '../hooks/useProgress';
import { useLessonPath } from '../hooks/useLessonPath';
import useAppStore from '../store/appStore';
import HomeHeader from '../components/HomeHeader';
import UnitHeader from '../components/UnitHeader';
import LessonNode from '../components/LessonNode';
import LoadingCard from '../components/LoadingCard';
import { LEVEL_LABELS, LEVEL_SELF_DESCRIPTIONS } from '../utils/constants';
import { getFirstLessonForLevel, unlockUpTo } from '../database/lessonsRepository';
import { setCurrentLesson, setLevel, setPlacementDone } from '../database/sessionRepository';

export default function PathScreen({ navigation }) {
  const progress = useProgress();
  const { units, currentLesson, config, loading, error, refresh } = useLessonPath();
  const setStoreLevel = useAppStore(s => s.setLevel);
  const goal = useAppStore(s => s.dailyGoal) || progress.dailyGoal || 20;

  useFocusEffect(
    useCallback(() => {
      refresh();
      progress.refresh();
    }, [refresh, progress.refresh])
  );

  const chooseLevel = async (level) => {
    await setLevel(level);
    await setPlacementDone();
    await unlockUpTo(level);
    const current = await getFirstLessonForLevel(level);
    if (current) await setCurrentLesson(current.id);
    setStoreLevel(level);
    await refresh();
    if (current) navigation.navigate('StudyLesson', { lessonId: current.id });
  };

  const startLesson = (lesson) => {
    if (!lesson || lesson.status === 'locked') return;
    navigation.navigate('StudyLesson', { lessonId: lesson.id });
  };

  const needsLevel = config && config.placement_done !== 1;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <HomeHeader
          streak={progress.streak}
          todayStudied={progress.todayStudied}
          goal={goal}
          knownCount={progress.study.knownCount}
        />

        {needsLevel && (
          <View style={styles.pickPanel}>
            <Text style={styles.pickTitle}>Elegí tu nivel para ubicar la ruta</Text>
            <View style={styles.pickOptions}>
              {Object.keys(LEVEL_SELF_DESCRIPTIONS).map(level => (
                <TouchableOpacity key={level} style={styles.pickButton} onPress={() => chooseLevel(level)}>
                  <Text style={styles.pickLevel}>{level}</Text>
                  <Text style={styles.pickLabel}>{LEVEL_LABELS[level]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.pathHeader}>
          <Text style={styles.pathTitle}>Ruta de niveles</Text>
          <Text style={styles.pathSubtitle}>{config?.level || 'A1'} · {LEVEL_LABELS[config?.level || 'A1']}</Text>
        </View>

        {loading && <LoadingCard />}
        {error && <Text style={styles.error}>{error}</Text>}

        {!loading && units.map(unit => (
          <View key={`${unit.level}-${unit.unit_index}`} style={styles.unit}>
            <UnitHeader unit={unit} />
            {unit.lessons.map((lesson, index) => (
              <LessonNode
                key={lesson.id}
                lesson={lesson}
                current={currentLesson?.id === lesson.id}
                align={index % 2 === 0 ? 'left' : 'right'}
                onPress={() => startLesson(lesson)}
              />
            ))}
          </View>
        ))}

        <View style={{ height: 96 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, !currentLesson && styles.disabledButton]}
          disabled={!currentLesson}
          onPress={() => startLesson(currentLesson)}
        >
          <Ionicons name="play" size={18} color={COLORS.surfaceWhite} />
          <Text style={styles.continueText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmParchment,
  },
  content: {
    paddingBottom: SPACING.xl,
  },
  pickPanel: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.base,
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderSage,
    padding: SPACING.base,
  },
  pickTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    color: COLORS.deepOlive,
    marginBottom: SPACING.md,
  },
  pickOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  pickButton: {
    minWidth: '47%',
    backgroundColor: COLORS.sageCream,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  pickLevel: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    color: COLORS.deepOlive,
  },
  pickLabel: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pathHeader: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.sm,
  },
  pathTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 22,
    color: COLORS.deepOlive,
  },
  pathSubtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  unit: {
    paddingHorizontal: SPACING.xl,
  },
  error: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: COLORS.dangerOrange,
    paddingHorizontal: SPACING.xl,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.base,
    backgroundColor: COLORS.warmParchment,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSage,
  },
  continueButton: {
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.deepOlive,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    ...SHADOW.button,
  },
  disabledButton: {
    backgroundColor: COLORS.textPlaceholder,
  },
  continueText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    color: COLORS.surfaceWhite,
  },
});
