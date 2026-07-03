// saflash — Study phrases screen
import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../theme/colors";
import { SPACING } from "../theme/spacing";
import { FONT_FAMILY } from "../theme/typography";
import { useStudySession } from "../hooks/useStudySession";
import { CARD_TYPE, SESSION_SIZE } from "../utils/constants";
import FlashCard from "../components/FlashCard";
import ProgressBar from "../components/ProgressBar";
import LoadingCard from "../components/LoadingCard";
import SessionSummary from "../components/SessionSummary";

export default function StudyPhrasesScreen({ navigation, route }) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const {
    cards,
    currentCard,
    currentIndex,
    totalCards,
    loading,
    error,
    sessionStats,
    isComplete,
    scoreCard,
    finishSession,
    resetSession,
  } = useStudySession(
    CARD_TYPE.PHRASE,
    SESSION_SIZE,
    route.params?.category ?? null,
    route.params?.difficulty ?? null,
  );

  // Guards against a stale confirm modal if this screen is re-focused
  // (e.g. re-entering a session) without a fresh mount.
  useFocusEffect(
    useCallback(() => {
      setShowExitConfirm(false);
    }, []),
  );

  const handleExit = () => {
    if (currentIndex > 0 && !isComplete) {
      setShowExitConfirm(true);
    } else {
      navigation.goBack();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    navigation.goBack();
  };

  const handleContinue = () => {
    resetSession();
  };

  const handleViewProgress = () => {
    finishSession();
    navigation.navigate("MainTabs", { screen: "Progress" });
  };

  // Session complete
  if (isComplete) {
    const durationSecs = sessionStats.sessionStart
      ? Math.floor((Date.now() - sessionStats.sessionStart) / 1000)
      : 0;

    return (
      <SessionSummary
        easy={sessionStats.easy}
        medium={sessionStats.medium}
        hard={sessionStats.hard}
        durationSecs={durationSecs}
        onContinue={handleContinue}
        onViewProgress={handleViewProgress}
      />
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleExit}>
            <Ionicons name="close" size={28} color={COLORS.oliveInk} />
          </TouchableOpacity>
        </View>
        <LoadingCard />
      </SafeAreaView>
    );
  }

  if (error || totalCards === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleExit}>
            <Ionicons name="close" size={28} color={COLORS.oliveInk} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="chatbubbles-outline"
            size={64}
            color={COLORS.textPlaceholder}
          />
          <Text style={styles.emptyTitle}>
            {error || "No hay frases disponibles"}
          </Text>
          <Text style={styles.emptySubtitle}>
            ¡Excelente! Ya practicaste todas las frases pendientes.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit}>
          <Ionicons name="close" size={28} color={COLORS.oliveInk} />
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressBar
            current={currentIndex}
            total={totalCards}
            color={COLORS.deepOlive}
            height={4}
          />
        </View>
        <Text style={styles.counter}>
          {currentIndex + 1} / {totalCards}
        </Text>
      </View>

      <View style={styles.cardArea}>
        <FlashCard
          card={currentCard}
          cardType="phrase"
          onRatingPress={scoreCard}
        />
      </View>

      <Text style={styles.hint}>Toca la tarjeta para ver la traducción</Text>

      <Modal
        visible={showExitConfirm}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowExitConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>¿Salir de la sesión?</Text>
            <Text style={styles.modalText}>
              Vas a perder el progreso de esta sesión.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: COLORS.sageCream },
                ]}
                onPress={() => setShowExitConfirm(false)}
              >
                <Text
                  style={[styles.modalButtonText, { color: COLORS.oliveInk }]}
                >
                  Continuar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: COLORS.dangerOrange },
                ]}
                onPress={handleConfirmExit}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: COLORS.surfaceWhite },
                  ]}
                >
                  Salir
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.warmParchment },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  progressWrapper: { flex: 1 },
  counter: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cardArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  hint: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 13,
    color: COLORS.textPlaceholder,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xxl,
    gap: SPACING.base,
  },
  emptyTitle: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: COLORS.textPlaceholder,
    textAlign: "center",
    lineHeight: 20,
  },
  backButton: {
    marginTop: SPACING.base,
    backgroundColor: COLORS.deepOlive,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: 6,
  },
  backButtonText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 15,
    color: COLORS.surfaceWhite,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: 16,
    padding: SPACING.xl,
    width: "85%",
    maxWidth: 340,
  },
  modalTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 18,
    color: COLORS.deepOlive,
    marginBottom: SPACING.sm,
  },
  modalText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  modalButtons: { flexDirection: "row", gap: SPACING.md },
  modalButton: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: { fontFamily: FONT_FAMILY.semiBold, fontSize: 15 },
});
