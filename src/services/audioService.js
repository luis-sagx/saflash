// saflash — Audio / TTS service
import * as Speech from 'expo-speech';

let isSpeaking = false;
let soundEnabled = true;

export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

/**
 * Speak a word or phrase using device TTS.
 * Expo Speech uses the device's built-in engine.
 */
export async function speak(text, options = {}) {
  if (!soundEnabled) return;

  // Stop any current speech
  if (isSpeaking) {
    await Speech.stop();
  }

  isSpeaking = true;

  await Speech.speak(text, {
    language: 'en-US',
    pitch: 1.0,
    rate: options.rate || 0.9,
    onDone: () => {
      isSpeaking = false;
    },
    onError: () => {
      isSpeaking = false;
    },
  });
}

export async function stopSpeaking() {
  if (isSpeaking) {
    await Speech.stop();
    isSpeaking = false;
  }
}

/**
 * Speak with slower rate for beginners (useful for first-time exposure).
 */
export async function speakSlow(text) {
  return speak(text, { rate: 0.7 });
}
