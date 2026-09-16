// Web Audio API generator for ambient study noise and timer chimes
let audioCtx: AudioContext | null = null;
let currentSourceNode: AudioNode | null = null;
let gainNode: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export type AmbientSoundType = "none" | "white_noise" | "rain" | "calm_drone" | "stream";

export function playAmbientSound(type: AmbientSoundType, volume = 0.3) {
  stopAmbientSound();
  if (type === "none") return;

  try {
    const ctx = getAudioContext();
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.connect(ctx.destination);

    if (type === "white_noise" || type === "rain" || type === "stream") {
      // Generate buffer with filtered noise
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === "rain") {
          // Brown/pink noise filter
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        } else if (type === "stream") {
          // Soft pink noise
          data[i] = (lastOut + 0.05 * white) / 1.05;
          lastOut = data[i];
          data[i] *= 2.5;
        } else {
          // Standard white noise
          data[i] = white * 0.4;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Filter to soften the frequencies
      const filter = ctx.createBiquadFilter();
      filter.type = type === "rain" ? "lowpass" : type === "stream" ? "bandpass" : "lowpass";
      filter.frequency.setValueAtTime(type === "rain" ? 800 : type === "stream" ? 1200 : 2500, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gainNode);
      noise.start();
      currentSourceNode = noise;
    } else if (type === "calm_drone") {
      // Sine wave cluster for relaxing focus drone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(174, ctx.currentTime); // Solfeggio 174 Hz (deep relaxation)
      osc2.frequency.setValueAtTime(178, ctx.currentTime); // Slight binaural beat

      const merger = ctx.createChannelMerger(2);
      osc1.connect(merger, 0, 0);
      osc2.connect(merger, 0, 1);

      merger.connect(gainNode);
      osc1.start();
      osc2.start();

      currentSourceNode = osc1;
    }
  } catch (err) {
    console.warn("Audio Context playback error:", err);
  }
}

export function stopAmbientSound() {
  if (currentSourceNode) {
    try {
      (currentSourceNode as any).stop?.();
      currentSourceNode.disconnect();
    } catch {}
    currentSourceNode = null;
  }
  if (gainNode) {
    try {
      gainNode.disconnect();
    } catch {}
    gainNode = null;
  }
}

export function playTimerCompletionChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const chimeNotes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chimeNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      noteGain.gain.setValueAtTime(0, now + idx * 0.12);
      noteGain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.2);

      osc.connect(noteGain);
      noteGain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.3);
    });
  } catch (err) {
    console.warn("Chime error:", err);
  }
}
