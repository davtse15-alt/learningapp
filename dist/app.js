const curriculum = [
  ['m', 'moon', 'assets/moon.jpg', 'mmm'], ['s', 'sun', 'assets/sun.jpg', 'sss'],
  ['f', 'fish', 'assets/fish.jpg', 'fff'], ['a', 'apple', 'assets/apple.jpg', 'apple'],
  ['t', 'top', 'assets/top.jpg', 'top'], ['n', 'nest', '🪺', 'nnn'],
  ['i', 'igloo', '🧊', 'igloo'], ['p', 'pig', '🐷', 'pig'],
  ['o', 'octopus', '🐙', 'octopus'], ['c', 'cat', '🐱', 'cat'],
  ['r', 'rain', '🌧️', 'rrr'], ['e', 'egg', '🥚', 'egg'],
  ['h', 'hat', '🎩', 'hhh'], ['d', 'dog', '🐶', 'dog'],
  ['u', 'umbrella', '☂️', 'umbrella'], ['l', 'leaf', '🍃', 'lll'],
  ['b', 'ball', '⚽', 'ball'], ['g', 'goat', '🐐', 'g'],
  ['k', 'kite', '🪁', 'kite'], ['v', 'van', '🚐', 'vvv'],
  ['w', 'web', '🕸️', 'www'], ['y', 'yo-yo', '🪀', 'yyy'],
  ['z', 'zip', '🤐', 'zzz'], ['j', 'jam', '🍓', 'jam'],
  ['x', 'box', '📦', 'box'], ['q', 'queen', '👑', 'queen']
];
const progressKey = 'soundStepsIndex';
const blendKey = 'soundStepsBlendComplete';
const metKey = 'soundStepsMet';
const sessionLength = 150000;
const firstWords = ['mat', 'sat'];
let soundIndex = Number(localStorage.getItem(progressKey) || 0);
let blendComplete = localStorage.getItem(blendKey) === 'yes';
let metSounds = new Set(JSON.parse(localStorage.getItem(metKey) || '[]'));
if (!metSounds.size && soundIndex > 0) {
  curriculum.slice(0, soundIndex).forEach(x => metSounds.add(x[0]));
  localStorage.setItem(metKey, JSON.stringify([...metSounds]));
}
if (!Number.isFinite(soundIndex) || soundIndex < 0 || soundIndex >= curriculum.length) soundIndex = 0;
if (soundIndex > 4 && !blendComplete) soundIndex = 4;
let stage = 0, tries = 0, enabled = true, done = false, mode = 'letter';
let selectedTile = null;
let wordRound = 0, targetWord = firstWords[0];
let sessionEnded = false, sessionTimer;
let currentAudio = null;
let reviewQueue = [], reviewCursor = 0;
const $ = id => document.getElementById(id);
const item = () => curriculum[soundIndex];

function pictureArt(entry, className = 'lesson-art') {
  return entry[2].startsWith('assets/')
    ? '<img class="' + className + '" src="./' + entry[2] + '" alt="" aria-hidden="true">'
    : '<span class="' + className + ' emoji-art" aria-hidden="true">' + entry[2] + '</span>';
}

function playClip(name) {
  playSequence([name]);
}
function playSequence(names) {
  if (!enabled) return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  const playAt = index => {
    if (!enabled || index >= names.length) return;
    currentAudio = new Audio('./assets/voice/' + names[index] + '.mp3');
    currentAudio.preload = 'auto';
    currentAudio.onended = () => playAt(index + 1);
    currentAudio.play().catch(() => {});
  };
  playAt(0);
}
function hearSound() {
  playClip('lesson_' + item()[0]);
}
function modelPrompt() {
  playClip('lesson_' + item()[0]);
}
function exampleSound(letter) {
  return curriculum.find(x => x[0] === letter)?.[3] || letter;
}
function hearWordBlend(word = targetWord) {
  playClip('blend_' + word);
}
function markMet(letter) {
  metSounds.add(letter);
  localStorage.setItem(metKey, JSON.stringify([...metSounds]));
}
function updateMap() {
  const soundCard = (v, i) => {
    const state = metSounds.has(v[0]) ? 'done' : i === soundIndex ? 'here' : '';
    return '<div class="map-item ' + state + '"><span class="map-letter">' +
      (metSounds.has(v[0]) ? '✓' : v[0]) + '</span><b>' + v[1] + '</b></div>';
  };
  const met = curriculum.filter(v => metSounds.has(v[0]));
  const revisitCards = met.length
    ? met.map(v => '<div class="parent-sound"><b>' + v[0] + '</b><span>' + v[1] + '</span><small>Revisit</small></div>').join('')
    : '<p class="parent-empty">No sounds met yet. Each one will appear here after he finds its letter.</p>';
  $('parentSummary').innerHTML =
    '<div class="summary-stats"><div><b>' + met.length + '</b><span>sounds met</span></div><div><b>' + (curriculum.length - met.length) + '</b><span>still to explore</span></div></div>' +
    '<div class="revisit-block"><h3>Met so far · revisit together</h3><div class="parent-sound-list">' + revisitCards + '</div></div>' +
    '<p class="up-next">Up next: <b>' + item()[0] + ' · ' + item()[1] + '</b></p>';
  $('map').innerHTML =
    '<section class="map-band"><div><span class="map-kicker">Step 1 · hear and notice</span><h3>First sounds</h3><p>Listen for a sound, then find its letter.</p></div><div class="map-grid">' +
    curriculum.slice(0, 5).map((v, i) => soundCard(v, i)).join('') +
    '</div></section>' +
    '<section class="map-band"><div><span class="map-kicker">Step 2 · put sounds together</span><h3>Read a first word</h3><p>Use the sounds you have met to build a word.</p></div><div class="map-grid"><span class="map-word">m · a · t</span><span class="map-word">s · a · t</span></div></section>' +
    '<section class="map-band"><div><span class="map-kicker">Step 3 · keep exploring</span><h3>More letter sounds</h3><p>Meet a few at a time and revisit familiar sounds.</p></div><div class="map-grid">' +
    curriculum.slice(5).map((v, i) => soundCard(v, i + 5)).join('') +
    '</div></section>' +
    '<section class="map-band"><div><span class="map-kicker">Step 4 · later on</span><h3>Letter pairs & reading</h3><p>When the sounds feel familiar, begin noticing how letters work together.</p></div><div class="map-grid"><span class="map-word map-future">sh</span><span class="map-word map-future">ch</span><span class="map-word map-future">th</span><span class="map-word map-future">vowel teams</span><span class="map-word map-future">read together</span></div></section>';
}
function render() {
  mode = 'letter'; stage = 1; tries = 0; done = false;
  const c = item();
  $('progressLabel').textContent = 'Sound ' + (soundIndex + 1);
  $('progressCount').textContent = (soundIndex + 1) + ' of ' + curriculum.length;
  $('progressFill').style.width = (soundIndex / curriculum.length * 100) + '%';
  $('stageName').textContent = 'Learn the sound';
  $('title').innerHTML = 'Listen <span style="color:#789b7e">' + c[0] + '</span>';
  $('intro').textContent = 'Listen to the sound. Look at the picture.';
  $('bigLetter').textContent = c[0];
  $('bigLetter').setAttribute('aria-label', 'Hear the ' + c[0] + ' sound');
  $('picture').innerHTML = pictureArt(c) + '<small>' + c[1] + '</small>';
  $('picture').setAttribute('aria-label', 'Hear the word ' + c[1]);
  $('caption').textContent = 'Listen. Look. Tap the letter.';
  $('question').textContent = 'Which letter begins with that sound?';
  const seen = curriculum.slice(0, soundIndex).map(x => x[0]);
  const options = [c[0], ...seen.slice(-2)];
  options.sort((a, b) => ((a.charCodeAt(0) * 7 + soundIndex * 5) % 13) - ((b.charCodeAt(0) * 7 + soundIndex * 5) % 13));
  $('choices').innerHTML = options.map(x => '<button class="choice" data-value="' + x + '" aria-label="Letter ' + x + '">' + x + '</button>').join('');
  $('feedback').textContent = '';
  $('next').classList.add('hidden');
  $('next').textContent = 'Keep going';
  $('choices').classList.remove('hidden');
  $('next').textContent = '➜';
  $('next').setAttribute('aria-label', 'Find the letter');
  $('wordBuilder').classList.add('hidden');
  $('blendPreview').classList.add('hidden');
  $('arrow').classList.remove('hidden');
  $('picture').classList.remove('hidden');
  $('bigLetter').classList.remove('hidden');
  $('playSound').classList.remove('hidden');
  $('card').classList.remove('hidden');
  $('done').style.display = 'none';
  updateMap();
  modelPrompt();
}
function chooseSessionReviews() {
  const familiar = curriculum.filter(v => metSounds.has(v[0]));
  if (!familiar.length) return [];
  const count = Math.min(2, familiar.length);
  const offsetKey = 'soundStepsReviewOffset';
  const offset = Number(localStorage.getItem(offsetKey) || 0) % familiar.length;
  const chosen = Array.from({ length: count }, (_, i) => familiar[(offset + i) % familiar.length]);
  localStorage.setItem(offsetKey, String((offset + count) % familiar.length));
  return chosen;
}
function renderReview() {
  mode = 'review'; stage = 0; tries = 0; done = false;
  const c = reviewQueue[reviewCursor];
  $('progressLabel').textContent = 'Remember a sound';
  $('progressCount').textContent = (reviewCursor + 1) + ' of ' + reviewQueue.length;
  $('progressFill').style.width = ((reviewCursor + 1) / (reviewQueue.length + 1) * 100) + '%';
  $('stageName').textContent = 'Remember a familiar sound';
  $('title').textContent = 'Let’s remember';
  $('intro').textContent = 'Look at the picture. Find the letter that starts its name.';
  $('bigLetter').classList.add('hidden');
  $('arrow').classList.add('hidden');
  $('picture').innerHTML = pictureArt(c) + '<small>' + c[1] + '</small>';
  $('picture').setAttribute('aria-label', 'Picture of ' + c[1]);
  $('picture').classList.remove('hidden');
  $('caption').textContent = 'Think, then tap a letter.';
  $('question').textContent = 'What letter starts this word?';
  const familiar = curriculum.filter(v => metSounds.has(v[0]) && v[0] !== c[0]);
  const distractors = familiar.slice(-2).map(v => v[0]);
  if (distractors.length < 2 && item()[0] !== c[0]) distractors.push(item()[0]);
  const options = [c[0], ...distractors];
  options.sort((a, b) => ((a.charCodeAt(0) * 7 + reviewCursor * 5) % 13) - ((b.charCodeAt(0) * 7 + reviewCursor * 5) % 13));
  $('choices').innerHTML = options.map(x => '<button class="choice" data-value="' + x + '" aria-label="Letter ' + x + '">' + x + '</button>').join('');
  $('choices').classList.remove('hidden');
  $('wordBuilder').classList.add('hidden');
  $('blendPreview').classList.add('hidden');
  $('playSound').classList.remove('hidden');
  $('feedback').textContent = '';
  $('next').classList.add('hidden');
  $('next').setAttribute('aria-label', reviewCursor + 1 < reviewQueue.length ? 'Next familiar sound' : 'Start a new sound');
  $('card').classList.remove('hidden');
  $('done').style.display = 'none';
  updateMap();
  playClip('review_prompt');
}
function beginSession() {
  clearTimeout(sessionTimer);
  sessionEnded = false;
  sessionTimer = setTimeout(() => { if (!sessionEnded) finish(); }, sessionLength);
  reviewQueue = chooseSessionReviews();
  reviewCursor = 0;
  if (reviewQueue.length) renderReview();
  else render();
}
function answer(btn) {
  if (done) return;
  if (mode === 'review') {
    if (btn.dataset.value === reviewQueue[reviewCursor][0]) {
      done = true;
      btn.classList.add('good');
      $('feedback').textContent = '✨';
      $('next').classList.remove('hidden');
      $('next').setAttribute('aria-label', reviewCursor + 1 < reviewQueue.length ? 'Next familiar sound' : 'Start a new sound');
      playSequence(['praise', 'lesson_' + reviewQueue[reviewCursor][0]]);
    } else {
      btn.classList.add('retry');
      $('feedback').textContent = '🔊';
      playSequence(['try_again', 'lesson_' + reviewQueue[reviewCursor][0]]);
    }
    return;
  }
  if (mode === 'blend-choice') {
    if (btn.dataset.value === targetWord) {
      done = true;
      btn.classList.add('good');
      $('feedback').textContent = '✨';
      $('next').textContent = '➜';
      $('next').setAttribute('aria-label', 'Build the word');
      $('next').classList.remove('hidden');
      hearWordBlend(targetWord);
    } else {
      btn.classList.add('retry');
      $('feedback').textContent = '🔊';
      playSequence(['try_again', 'blend_' + targetWord]);
    }
    return;
  }
  tries++;
  if (btn.dataset.value === item()[0]) {
    done = true;
    markMet(item()[0]);
    $('progressFill').style.width = ((soundIndex + 1) / curriculum.length * 100) + '%';
    btn.classList.add('good');
    $('feedback').textContent = '✨';
    $('next').classList.remove('hidden');
    const nextLabel = soundIndex === 4 && !blendComplete ? 'Blend the sounds' : soundIndex === curriculum.length - 1 ? 'Finish for today' : 'Next sound';
    $('next').textContent = '➜';
    $('next').setAttribute('aria-label', nextLabel);
    playClip('praise');
  } else {
    btn.classList.add('retry');
    $('feedback').textContent = '🔊';
    playSequence(['try_again', 'lesson_' + item()[0]]);
  }
}
function startBlend() {
  mode = 'blend-choice'; stage = 3; done = false; tries = 0;
  targetWord = firstWords[wordRound];
  $('progressLabel').textContent = 'Word ' + (wordRound + 1) + ' of ' + firstWords.length;
  $('progressCount').textContent = (soundIndex + 1) + ' of ' + curriculum.length;
  $('progressFill').style.width = (5 / curriculum.length * 100) + '%';
  $('stageName').textContent = 'Blend the sounds';
  $('title').textContent = 'Listen and find';
  $('intro').textContent = 'Listen to the sounds. Find the picture.';
  $('caption').textContent = 'Tap the speaker to hear again.';
  $('question').textContent = 'Which picture?';
  $('bigLetter').classList.add('hidden');
  $('arrow').classList.add('hidden');
  $('picture').classList.add('hidden');
  $('blendPreview').classList.remove('hidden');
  $('playSound').classList.remove('hidden');
  const wordPictures = {
    mat: '<img src="./assets/mat.jpg" alt="" aria-hidden="true">',
    sat: '<img src="./assets/sat.jpg" alt="" aria-hidden="true">'
  };
  $('choices').innerHTML = firstWords.map(word =>
    '<button class="choice word-choice picture-choice" data-value="' + word + '" aria-label="' + word + '">' + wordPictures[word] + '</button>').join('');
  $('blendPreview').innerHTML = targetWord.split('').map(letter =>
    '<button class="blend-sound" data-sound="' + exampleSound(letter) + '" aria-label="Hear the ' + letter + ' sound">' + letter + '</button>').join('');
  $('choices').classList.remove('hidden');
  $('wordBuilder').classList.add('hidden');
  $('feedback').textContent = '';
  $('next').classList.add('hidden');
  hearWordBlend(targetWord);
}
function startWordBuild() {
  mode = 'blend-build'; stage = 4; done = false; selectedTile = null;
  $('stageName').textContent = 'Build the word';
  $('title').textContent = 'Build it';
  $('intro').textContent = 'Put each sound in its place.';
  $('caption').textContent = 'Tap a letter, then the next space.';
  $('question').textContent = 'Listen, then build.';
  $('choices').classList.add('hidden');
  $('wordBuilder').classList.remove('hidden');
  $('wordTiles').innerHTML = targetWord.split('').reverse().map((x, i) =>
    '<button class="word-tile" data-letter="' + x + '" data-sound="' + exampleSound(x) + '" aria-label="Hear letter ' + x + '">' + x + '</button>').join('');
  $('wordSlots').querySelectorAll('.word-slot').forEach(slot => {
    slot.textContent = '';
    slot.classList.remove('filled', 'over');
    slot.disabled = false;
    slot.classList.toggle('current', slot.dataset.index === '0');
  });
  $('wordTiles').querySelectorAll('.word-tile').forEach(tile => {
    tile.onclick = () => {
      selectedTile = tile;
      $('wordTiles').querySelectorAll('.word-tile').forEach(t => t.style.borderColor = '');
      tile.style.borderColor = '#789b7e';
      const c = curriculum.find(x => x[0] === tile.dataset.letter);
      playClip('lesson_' + c[0]);
    };
    tile.onpointerdown = e => {
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.style.transform = 'scale(1.08)';
    };
    tile.onpointerup = e => {
      e.currentTarget.style.transform = '';
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const slot = target && target.closest('.word-slot');
      if (slot) fillWordSlot(tile, slot);
    };
  });
  $('wordSlots').querySelectorAll('.word-slot').forEach(slot => {
    slot.onclick = () => { if (selectedTile) fillWordSlot(selectedTile, slot); };
  });
  $('feedback').textContent = '';
  $('next').classList.add('hidden');
  playClip('build_word');
}
function fillWordSlot(tile, slot) {
  if (tile.disabled || slot.disabled || done) return;
  const expected = targetWord[Number(slot.dataset.index)];
  const nextIndex = [...$('wordSlots').querySelectorAll('.word-slot')].findIndex(s => !s.classList.contains('filled'));
  if (Number(slot.dataset.index) !== nextIndex) {
    $('feedback').textContent = '👈';
    playClip('build_word');
    return;
  }
  if (tile.dataset.letter !== expected) {
    $('feedback').textContent = '🔊';
    const c = curriculum.find(x => x[0] === tile.dataset.letter);
    playClip('lesson_' + c[0]);
    return;
  }
  slot.textContent = tile.dataset.letter;
  slot.classList.add('filled');
  slot.classList.remove('current');
  tile.disabled = true;
  tile.style.opacity = '.35';
  selectedTile = null;
  if ($('wordSlots').querySelectorAll('.word-slot.filled').length === 3) {
    done = true; mode = 'blend-complete';
    $('feedback').textContent = '🎉';
    const nextLabel = wordRound < firstWords.length - 1 ? 'Build another word' : 'Next sound';
    $('next').textContent = '➜';
    $('next').setAttribute('aria-label', nextLabel);
    $('next').classList.remove('hidden');
    hearWordBlend(targetWord);
  } else {
    const nextSlot = [...$('wordSlots').querySelectorAll('.word-slot')].find(s => !s.classList.contains('filled'));
    if (nextSlot) nextSlot.classList.add('current');
    $('feedback').textContent = '✨';
    playClip('next_sound');
  }
}
function finish() {
  if (sessionEnded) return;
  sessionEnded = true;
  clearTimeout(sessionTimer);
  $('card').classList.add('hidden');
  $('done').style.display = 'block';
  $('progressFill').style.width = ((soundIndex + 1) / curriculum.length * 100) + '%';
  $('progressCount').textContent = (soundIndex + 1) + ' of ' + curriculum.length;
  $('progressLabel').textContent = 'Lovely listening';
  playClip('all_done');
}

$('bigLetter').onclick = () => {
  $('bigLetter').classList.remove('pulse'); void $('bigLetter').offsetWidth; $('bigLetter').classList.add('pulse');
  modelPrompt();
};
$('picture').onclick = () => mode === 'review' ? playClip('review_prompt') : hearSound();
$('playSound').onclick = () => {
  if (mode === 'review') playClip('review_prompt');
  else if (mode === 'blend-choice') hearWordBlend(targetWord);
  else if (mode === 'blend-build') playClip('build_word');
  else if (mode === 'letter') modelPrompt();
  else hearSound();
};
$('blendPreview').onclick = e => {
  const b = e.target.closest('.blend-sound');
  if (!b) return;
  const c = curriculum.find(x => x[0] === b.textContent);
  if (c) playClip('lesson_' + c[0]);
};
$('choices').onclick = e => { const b = e.target.closest('.choice'); if (b) answer(b); };
$('next').onclick = () => {
  if (mode === 'review' && done) {
    reviewCursor++;
    if (reviewCursor < reviewQueue.length) renderReview();
    else render();
    return;
  }
  if (mode === 'letter' && stage === 1) {
    if (soundIndex === 4 && !blendComplete) { startBlend(); return; }
    if (soundIndex === curriculum.length - 1) { finish(); return; }
    soundIndex++; localStorage.setItem(progressKey, String(soundIndex)); render(); return;
  }
  if (mode === 'blend-choice') { startWordBuild(); return; }
  if (mode === 'blend-complete') {
    if (wordRound < firstWords.length - 1) {
      wordRound++;
      startBlend();
      return;
    }
    blendComplete = true;
    localStorage.setItem(blendKey, 'yes');
    soundIndex = 5;
    localStorage.setItem(progressKey, String(soundIndex));
    render();
  }
};
$('again').onclick = () => beginSession();
$('soundBtn').onclick = () => {
  enabled = !enabled;
  $('soundBtn').textContent = enabled ? '🔊 On' : '🔇 Off';
  $('soundBtn').setAttribute('aria-label', enabled ? 'Turn sound off' : 'Turn sound on');
  if (!enabled && currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
};
$('closeSheet').onclick = () => $('sheet').classList.remove('open');
$('sheet').onclick = e => { if (e.target === $('sheet')) $('sheet').classList.remove('open'); };
let holdTimer, holdOpened = false;
const parentButton = $('parentGesture');
parentButton.onpointerdown = e => {
  e.preventDefault(); holdOpened = false;
  holdTimer = setTimeout(() => {
    holdOpened = true;
    updateMap();
    $('sheet').classList.add('open');
    if (navigator.vibrate) navigator.vibrate(25);
  }, 1100);
};
['pointerup', 'pointercancel', 'pointerleave'].forEach(type => parentButton.addEventListener(type, () => clearTimeout(holdTimer)));
parentButton.oncontextmenu = e => e.preventDefault();
document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
document.addEventListener('keydown', e => { if (e.key === 'Escape') $('sheet').classList.remove('open'); });
beginSession();

