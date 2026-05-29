// saflash — Onboarding screen (3 slides)
import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';
import OnboardingSlide from '../components/OnboardingSlide';
import { setOnboardingDone, incrementTotalStudied } from '../database/sessionRepository';
import useAppStore from '../store/appStore';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: '5,000 Palabras en Inglés',
    description: 'Aprendé el vocabulario más usado del mundo con tarjetas inteligentes.',
  },
  {
    title: 'Frases Listas para Usar',
    description: 'Conversaciones reales para cada situación. Saludá, viajá, trabajá.',
  },
  {
    title: 'Seguí Tu Progreso',
    description: 'El sistema recuerda lo que ya sabés y te muestra cuándo repasar.',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const setOnboardingDoneStore = useAppStore(s => s.setOnboardingDone);

  const handleSkip = async () => {
    await setOnboardingDone();
    setOnboardingDoneStore(true);
    navigation.replace('MainTabs');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleFinish = async () => {
    await setOnboardingDone();
    setOnboardingDoneStore(true);
    navigation.replace('MainTabs');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={styles.container}>
      {/* Skip button (slides 0 and 1) */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Saltar</Text>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item, index }) => (
          <OnboardingSlide index={index} title={item.title} description={item.description} />
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i === currentIndex ? COLORS.deepOlive : COLORS.borderSage }]}
          />
        ))}
      </View>

      {/* Bottom button */}
      <View style={styles.bottom}>
        {currentIndex === slides.length - 1 ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleFinish} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Empezar a Aprender</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Siguiente</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmParchment,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: SPACING.xl,
    zIndex: 10,
    padding: SPACING.sm,
  },
  skipText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bottom: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxxl,
  },
  primaryButton: {
    backgroundColor: COLORS.deepOlive,
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 16,
    color: COLORS.surfaceWhite,
  },
});
