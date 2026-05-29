// saflash — Loading card skeleton
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { RADIUS } from '../theme/spacing';

export default function LoadingCard({ style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.container, style, { opacity }]}>
      <View style={styles.badge} />
      <View style={styles.image} />
      <View style={styles.word} />
      <View style={styles.phonetic} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: 420,
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: RADIUS.xl,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  badge: {
    width: 100,
    height: 24,
    backgroundColor: COLORS.sageCream,
    borderRadius: RADIUS.pill,
    marginBottom: 16,
  },
  image: {
    width: 180,
    height: 180,
    backgroundColor: COLORS.sageCream,
    borderRadius: RADIUS.lg,
    marginBottom: 16,
  },
  word: {
    width: 160,
    height: 40,
    backgroundColor: COLORS.sageCream,
    borderRadius: RADIUS.sm,
    marginBottom: 8,
  },
  phonetic: {
    width: 100,
    height: 20,
    backgroundColor: COLORS.sageCream,
    borderRadius: RADIUS.sm,
  },
});
