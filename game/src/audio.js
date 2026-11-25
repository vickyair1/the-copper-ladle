// The Copper Ladle — synthesized sound: every effect is made live with the
// Web Audio API, so the game ships no audio files and makes no requests.

let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function audioContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, durMs, type, gain, whenMs = 0, slideTo = null) {
  if (muted) return;
  const ac = audioContext();
  if (!ac) return;
  const start = ac.currentTime + whenMs / 1000;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + durMs / 1000);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + durMs / 1000);
  osc.connect(amp).connect(ac.destination);
  osc.start(start);
  osc.stop(start + durMs / 1000 + 0.05);
}

function noiseBurst(durMs, gain, lowFreq) {
  if (muted) return;
  const ac = audioContext();
  if (!ac) return;
  const len = Math.floor((ac.sampleRate * durMs) / 1000);
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = lowFreq;
  const amp = ac.createGain();
  amp.gain.value = gain;
  src.connect(filter).connect(amp).connect(ac.destination);
  src.start();
}

export const sfx = {
  take() { tone(520, 70, 'triangle', 0.12); },
  chop() { noiseBurst(60, 0.22, 900); tone(180, 60, 'square', 0.06); },
  sizzle() { noiseBurst(240, 0.08, 2400); },
  ding() { tone(880, 160, 'sine', 0.16); tone(1318, 220, 'sine', 0.12, 90); },
  serve() {
    tone(523, 120, 'triangle', 0.16);
    tone(659, 120, 'triangle', 0.16, 100);
    tone(784, 220, 'triangle', 0.18, 200);
  },
  mistake() { tone(220, 180, 'sawtooth', 0.1, 0, 140); },
  lost() { tone(330, 200, 'sine', 0.14, 0, 196); tone(196, 320, 'sine', 0.14, 160, 130); },
  click() { tone(700, 40, 'triangle', 0.08); },
  win() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 260, 'triangle', 0.16, i * 130));
  },
};

export function unlockAudio() {
  audioContext();
}
