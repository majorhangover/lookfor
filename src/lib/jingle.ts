/**
 * A short, gentle "jingle" made in the browser (no sound file): a shake of
 * sleigh bells under the first notes of Jingle Bells (a public-domain tune).
 * Browsers only allow sound after the visitor has clicked or typed, which is
 * always true here because gifts arrive after they send a message.
 */
let ctx: AudioContext | null = null;

export function playJingle(volume = 0.18) {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    const ac = ctx;
    if (ac.state === "suspended") void ac.resume();
    const now = ac.currentTime + 0.05;
    const master = ac.createGain();
    master.gain.value = volume;
    master.connect(ac.destination);

    // Bell notes: E E E (half-time), then E G C D E is too long; keep it short and sweet.
    const E5 = 659.25, G5 = 783.99, C5 = 523.25, D5 = 587.33;
    const notes: [number, number][] = [
      [E5, 0], [E5, 0.2], [E5, 0.4],
      [E5, 0.75], [G5, 0.95], [C5, 1.15], [D5, 1.3], [E5, 1.5],
    ];
    for (const [freq, at] of notes) bell(ac, master, freq, now + at);

    // Sleigh bells: quick bursts of bright noise.
    for (let i = 0; i < 10; i++) shake(ac, master, now + i * 0.19 + (i % 2) * 0.03);
  } catch {
    // Sound is a nice extra; never let it break the page.
  }
}

/**
 * For every occasion except Christmas: a soft rising chime (no sleigh bells,
 * no Christmas tune), so a Valentine's or birthday gift still gets a little
 * "ta-da".
 */
export function playChime(volume = 0.16) {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    const ac = ctx;
    if (ac.state === "suspended") void ac.resume();
    const now = ac.currentTime + 0.05;
    const master = ac.createGain();
    master.gain.value = volume;
    master.connect(ac.destination);
    // C, E, G, then a high C: a bright major arpeggio.
    const notes: [number, number][] = [[523.25, 0], [659.25, 0.12], [783.99, 0.24], [1046.5, 0.4]];
    for (const [freq, at] of notes) bell(ac, master, freq, now + at);
  } catch {
    // Sound is a nice extra; never let it break the page.
  }
}

function bell(ac: AudioContext, out: AudioNode, freq: number, at: number) {
  // A bell is a few bright partials that fade quickly.
  for (const [mult, level] of [[1, 0.6], [2.76, 0.25], [5.4, 0.12]] as const) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * mult;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(level, at + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.9 / mult + 0.25);
    osc.connect(g).connect(out);
    osc.start(at);
    osc.stop(at + 1.3);
  }
}

let noise: AudioBuffer | null = null;
function shake(ac: AudioContext, out: AudioNode, at: number) {
  if (!noise) {
    noise = ac.createBuffer(1, ac.sampleRate * 0.15, ac.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ac.createBufferSource();
  src.buffer = noise;
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 6000;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.35, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
  src.connect(hp).connect(g).connect(out);
  src.start(at);
  src.stop(at + 0.15);
}
