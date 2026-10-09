const state = {
  bpm: 116,
  currentStep: 0,
  isPlaying: false,
  nextNoteTime: 0,
  stepDuration: 0,
  selectedStyle: 'Lo-fi',
  pianoRoll: createEmptyPianoRoll(),
  tracks: [
    { name: 'Kick', color: '#ffd166', pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0] },
    { name: 'Bass', color: '#ff7b54', pattern: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0] },
    { name: 'Chords', color: '#7bdff2', pattern: [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1] },
    { name: 'Arp', color: '#b9fbc0', pattern: [0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0] }
  ]
};

const audio = {
  ctx: null,
  masterGain: null,
  analyser: null,
  schedulerTimer: null,
  nextScheduler: null,
};

const getStepDuration = () => (60 / state.bpm) / 2;

function createEmptyPianoRoll() {
  const rows = 12;
  const cols = 16;
  const roll = [];
  for (let y = 0; y < rows; y += 1) {
    roll.push(Array(cols).fill(0));
  }
  return roll;
}

function ensureAudio() {
  if (!audio.ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      alert('Web Audio is not supported in this browser.');
      return null;
    }
    audio.ctx = new AudioCtx();
    audio.masterGain = audio.ctx.createGain();
    audio.masterGain.gain.value = 0.55;
    audio.analyser = audio.ctx.createAnalyser();
    audio.analyser.fftSize = 2048;
    audio.masterGain.connect(audio.analyser);
    audio.analyser.connect(audio.ctx.destination);
  }
  if (audio.ctx.state === 'suspended') {
    audio.ctx.resume();
  }
  return audio.ctx;
}

function updateBPM() {
  state.bpm = Number(document.getElementById('bpm').value);
  state.stepDuration = getStepDuration();
  document.getElementById('bpmValue').textContent = state.bpm;
}

function renderArrangement() {
  const grid = document.getElementById('arrangementGrid');
  grid.innerHTML = '';
  for (let i = 0; i < 16; i += 1) {
    const div = document.createElement('div');
    if (i === state.currentStep) div.classList.add('active');
    grid.appendChild(div);
  }
}

function renderChannels() {
  const list = document.getElementById('channelList');
  list.innerHTML = '';

  state.tracks.forEach((track, idx) => {
    const item = document.createElement('div');
    item.className = 'channel-item';
    item.innerHTML = `
      <span class="channel-color" style="background: ${track.color};"></span>
      <div>
        <strong>${track.name}</strong>
        <label>16-step pattern</label>
      </div>
      <input type="range" min="0" max="1" step="1" value="${track.pattern[state.currentStep] || 0}" data-track="${idx}" />
    `;
    list.appendChild(item);
  });
}

function renderPianoRoll() {
  const grid = document.getElementById('pianoRollGrid');
  grid.innerHTML = '';

  for (let row = 0; row < state.pianoRoll.length; row += 1) {
    for (let col = 0; col < state.pianoRoll[row].length; col += 1) {
      const cell = document.createElement('button');
      cell.className = `piano-roll-cell ${state.pianoRoll[row][col] ? 'active' : ''}`;
      cell.title = `row ${row}, col ${col}`;
      cell.addEventListener('click', () => {
        state.pianoRoll[row][col] = state.pianoRoll[row][col] ? 0 : 1;
        renderPianoRoll();
      });
      grid.appendChild(cell);
    }
  }
}

function renderMeter() {
  const meterFill = document.getElementById('meterFill');
  const value = 45 + Math.random() * 35;
  meterFill.style.width = `${value}%`;
}

function randomProgression() {
  const moods = {
    Dreamy: ['Cmaj7', 'Am7', 'Fmaj7', 'G7'],
    Energetic: ['Dmaj7', 'Bm7', 'Gmaj7', 'A7'],
    Dark: ['Em7', 'Cmaj7', 'Gmaj7', 'D7'],
    Epic: ['Amaj7', 'F#m7', 'Dmaj7', 'E7']
  };
  const mood = document.getElementById('moodSelect').value;
  const progression = moods[mood] || moods.Dreamy;
  document.getElementById('progressionBox').textContent = progression.join(' - ');
}

function playKick(time) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(55, time);
  gain.gain.setValueAtTime(1, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
  osc.connect(gain);
  gain.connect(audio.masterGain);
  osc.start(time);
  osc.stop(time + 0.14);
}

function playBass(freq, time) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, time);
  gain.gain.setValueAtTime(0.18, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
  osc.connect(gain);
  gain.connect(audio.masterGain);
  osc.start(time);
  osc.stop(time + 0.24);
}

function playChord(interval, time) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const notes = [interval, interval * 1.25, interval * 1.5];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time + idx * 0.01);
    gain.gain.setValueAtTime(0.06, time + idx * 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.28 + idx * 0.03);
    osc.connect(gain);
    gain.connect(audio.masterGain);
    osc.start(time + idx * 0.01);
    osc.stop(time + 0.32 + idx * 0.03);
  });
}

function playArp(freq, time) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, time);
  gain.gain.setValueAtTime(0.065, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  osc.connect(gain);
  gain.connect(audio.masterGain);
  osc.start(time);
  osc.stop(time + 0.11);
}

function playNoise(time) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.4;
  }
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  gain.gain.setValueAtTime(0.04, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
  source.connect(gain);
  gain.connect(audio.masterGain);
  source.start(time);
  source.stop(time + 0.09);
}

function triggerStep(step) {
  if (state.tracks[0].pattern[step]) playKick(audio.ctx ? audio.ctx.currentTime : 0);
  if (state.tracks[1].pattern[step]) playBass(52.41, audio.ctx ? audio.ctx.currentTime : 0);
  if (state.tracks[2].pattern[step]) playChord(220, audio.ctx ? audio.ctx.currentTime : 0);
  if (state.tracks[3].pattern[step]) playArp(440, audio.ctx ? audio.ctx.currentTime : 0);

  if (step % 2 === 0) playNoise(audio.ctx ? audio.ctx.currentTime : 0);
}

function scheduler() {
  const ctx = ensureAudio();
  if (!ctx) return;

  while (state.nextNoteTime < ctx.currentTime + 0.12) {
    triggerStep(state.currentStep);
    renderArrangement();
    renderChannels();
    state.currentStep = (state.currentStep + 1) % 16;
    state.nextNoteTime += getStepDuration();
  }
}

function playTransport() {
  ensureAudio();
  state.isPlaying = true;
  state.nextNoteTime = audio.ctx.currentTime + 0.05;
  if (!audio.schedulerTimer) {
    audio.schedulerTimer = setInterval(scheduler, 25);
  }
}

function pauseTransport() {
  state.isPlaying = false;
  clearInterval(audio.schedulerTimer);
  audio.schedulerTimer = null;
}

function stopTransport() {
  state.isPlaying = false;
  if (audio.schedulerTimer) clearInterval(audio.schedulerTimer);
  audio.schedulerTimer = null;
  state.currentStep = 0;
  renderArrangement();
  renderChannels();
}

function bindControls() {
  document.getElementById('playBtn').addEventListener('click', playTransport);
  document.getElementById('pauseBtn').addEventListener('click', pauseTransport);
  document.getElementById('stopBtn').addEventListener('click', stopTransport);
  document.getElementById('bpm').addEventListener('input', updateBPM);
  document.getElementById('togglePianoScene').addEventListener('click', () => {
    document.getElementById('studioScene').classList.toggle('piano-roll-open');
  });
  document.getElementById('generateBtn').addEventListener('click', randomProgression);
  document.getElementById('exportBtn').addEventListener('click', () => {
    alert('Render sequence queued for WAV export.');
  });

  document.getElementById('imageUpload').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx2d = canvas.getContext('2d');
      ctx2d.drawImage(bitmap, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      const img = document.createElement('img');
      img.src = dataUrl;
      img.className = 'preview-image';
      const stage = document.querySelector('.studio-stage');
      const previous = stage.querySelector('.preview-image');
      if (previous) previous.remove();
      stage.appendChild(img);
    } catch (error) {
      console.warn('Client-side conversion failed; trying fallback path.', error);
      const reader = new FileReader();
      reader.onload = () => {
        const img = document.createElement('img');
        img.src = reader.result;
        img.className = 'preview-image';
        const stage = document.querySelector('.studio-stage');
        const previous = stage.querySelector('.preview-image');
        if (previous) previous.remove();
        stage.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });
}

function init() {
  updateBPM();
  renderArrangement();
  renderChannels();
  renderPianoRoll();
  randomProgression();
  setInterval(renderMeter, 400);
  bindControls();
}

init();
