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
  await Speech.stop();
  isSpeaking = false;
}

/**
 * Speaks several English texts back to back (e.g. word → meaning → example).
 * Skips empty parts and inserts a short natural pause between them. Resolves
 * when the whole sequence finishes (or is interrupted).
 */
export async function speakSequence(parts, options = {}) {
  if (!soundEnabled) return;

  const items = (parts || []).filter(p => p && String(p).trim().length > 0);
  if (items.length === 0) return;

  await Speech.stop();
  isSpeaking = true;

  for (let i = 0; i < items.length; i += 1) {
    // Stop early if a newer speech request took over.
    if (!isSpeaking) return;

    await new Promise(resolve => {
      Speech.speak(String(items[i]), {
        language: 'en-US',
        pitch: 1.0,
        rate: options.rate || 0.85,
        onDone: resolve,
        onStopped: resolve,
        onError: resolve,
      });
    });

    // Brief pause between segments so they don't run together.
    if (i < items.length - 1 && isSpeaking) {
      await new Promise(resolve => setTimeout(resolve, 350));
    }
  }

  isSpeaking = false;
}

/**
 * Speak with slower rate for beginners (useful for first-time exposure).
 */
export async function speakSlow(text) {
  return speak(text, { rate: 0.7 });
}
