const curriculum = [
  ['a', 'apple', 'assets/apple.jpg', 'apple'], ['m', 'moon', 'assets/moon.jpg', 'mmm'],
  ['s', 'sun', 'assets/sun.jpg', 'sss'], ['t', 'top', 'assets/top.jpg', 'top'],
  ['f', 'fish', 'assets/fish.jpg', 'fff'], ['n', 'nest', 'assets/nest.jpg', 'nnn'],
  ['i', 'igloo', 'assets/igloo.jpg', 'igloo'], ['p', 'pig', 'assets/pig.jpg', 'pig'],
  ['o', 'octopus', 'assets/octopus.jpg', 'octopus'], ['c', 'cat', 'assets/cat.jpg', 'cat'],
  ['r', 'rain', 'assets/rain.jpg', 'rrr'], ['e', 'egg', 'assets/egg.jpg', 'egg'],
  ['h', 'hat', 'assets/hat.jpg', 'hhh'], ['d', 'dog', 'assets/dog.jpg', 'dog'],
  ['u', 'umbrella', 'assets/umbrella.jpg', 'umbrella'], ['l', 'leaf', 'assets/leaf.jpg', 'lll'],
  ['b', 'ball', 'assets/ball.jpg', 'ball'], ['g', 'goat', 'assets/goat.jpg', 'g'],
  ['k', 'kite', 'assets/kite.jpg', 'kite'], ['v', 'van', 'assets/van.jpg', 'vvv'],
  ['w', 'web', 'assets/web.jpg', 'www'], ['y', 'yo-yo', 'assets/yoyo.jpg', 'yyy'],
  ['z', 'zip', 'assets/zip.jpg', 'zzz'], ['j', 'jam', 'assets/jam.jpg', 'jam'],
  ['x', 'box', 'assets/box.jpg', 'box'], ['q', 'queen', 'assets/queen.jpg', 'queen']
];
const progressKey = 'soundStepsIndex';
const metKey = 'soundStepsMet';
const masteryKey = 'soundStepsMastery';
const sessionNumberKey = 'soundStepsSessionNumber';
const sessionLengthKey = 'soundStepsSessionMinutes';
const blendOffsetKey = 'soundStepsBlendOffset';
const blendWords = [
  { word:'mat', tiles:['m','a','t'], sounds:['m','a','t'], picture:'assets/mat.jpg', emoji:'🧘' },
  { word:'sat', tiles:['s','a','t'], sounds:['s','a','t'], picture:'assets/sat.jpg', emoji:'🪑' },
  { word:'fat', tiles:['f','a','t'], sounds:['f','a','t'], emoji:'🐘' },
  { word:'fan', tiles:['f','a','n'], sounds:['f','a','n'], emoji:'🪭' },
  { word:'sit', tiles:['s','i','t'], sounds:['s','i','t'], emoji:'🪑' },
  { word:'tap', tiles:['t','a','p'], sounds:['t','a','p'], emoji:'🚰' },
  { word:'rat', tiles:['r','a','t'], sounds:['r','a','t'], emoji:'🐀' },
  { word:'net', tiles:['n','e','t'], sounds:['n','e','t'], emoji:'🥅' },
  { word:'dot', tiles:['d','o','t'], sounds:['d','o','t'], emoji:'🔴' },
  { word:'lip', tiles:['l','i','p'], sounds:['l','i','p'], emoji:'👄' },
  { word:'bat', tiles:['b','a','t'], sounds:['b','a','t'], emoji:'🦇' },
  { word:'kit', tiles:['k','i','t'], sounds:['k','i','t'], emoji:'🧰' },
  { word:'yam', tiles:['y','a','m'], sounds:['y','a','m'], emoji:'🍠' },
  { word:'wet', tiles:['w','e','t'], sounds:['w','e','t'], emoji:'💧' },
  { word:'top', tiles:['t','o','p'], sounds:['t','o','p'], picture:'assets/top.jpg', emoji:'🔝' },
  { word:'cat', tiles:['c','a','t'], sounds:['c','a','t'], picture:'assets/cat.jpg', emoji:'🐱' },
  { word:'hat', tiles:['h','a','t'], sounds:['h','a','t'], picture:'assets/hat.jpg', emoji:'🎩' },
  { word:'dog', tiles:['d','o','g'], sounds:['d','o','g'], picture:'assets/dog.jpg', emoji:'🐶' },
  { word:'sun', tiles:['s','u','n'], sounds:['s','u','n'], picture:'assets/sun.jpg', emoji:'☀️' },
  { word:'pig', tiles:['p','i','g'], sounds:['p','i','g'], picture:'assets/pig.jpg', emoji:'🐷' },
  { word:'van', tiles:['v','a','n'], sounds:['v','a','n'], picture:'assets/van.jpg', emoji:'🚐' },
  { word:'web', tiles:['w','e','b'], sounds:['w','e','b'], picture:'assets/web.jpg', emoji:'🕸️' },
  { word:'zip', tiles:['z','i','p'], sounds:['z','i','p'], picture:'assets/zip.jpg', emoji:'🤐' },
  { word:'jam', tiles:['j','a','m'], sounds:['j','a','m'], picture:'assets/jam.jpg', emoji:'🍓' },
  { word:'box', tiles:['b','o','x'], sounds:['b','o','x'], picture:'assets/box.jpg', emoji:'📦' },
  { word:'quit', tiles:['qu','i','t'], sounds:['q','i','t'], emoji:'🛑' }
];
const storedMastery = JSON.parse(localStorage.getItem(masteryKey) || '{}');
let metSounds = new Set(JSON.parse(localStorage.getItem(metKey) || '[]'));
let soundIndex = 0;
let sessionLength = Number(localStorage.getItem(sessionLengthKey) || 2.5) * 60000;
let stage = 0, tries = 0, enabled = true, done = false, mode = 'letter';
let selectedTile = null;
let targetWord = null;
let sessionEnded = false, sessionTimer;
let currentAudio = null;
let reviewQueue = [], reviewCursor = 0;
let sessionId = 0;
let nextLevelAfterReview = false;
const $ = id => document.getElementById(id);
const item = () => curriculum[soundIndex];

if (!Object.keys(storedMastery).length && metSounds.size) {
  for (const letter of metSounds) storedMastery[letter] = { sessions: ['legacy'] };
}
function isMastered(letter) {
  return (storedMastery[letter]?.sessions?.length || 0) >= 3;
}
function findCurrentLevel() {
  const next = curriculum.findIndex(x => !isMastered(x[0]));
  return next < 0 ? 0 : next;
}
soundIndex = findCurrentLevel();
if (!Number.isFinite(sessionLength) || sessionLength < 60000 || sessionLength > 600000) sessionLength = 150000;
localStorage.setItem(masteryKey, JSON.stringify(storedMastery));
localStorage.setItem(progressKey, String(soundIndex));

function pictureArt(entry, className = 'lesson-art') {
  return '<img class="' + className + '" src="./' + entry[2] + '" alt="" aria-hidden="true">';
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
  playClip('sound_' + item()[0]);
}
function modelPrompt() {
  playClip('lesson_' + item()[0]);
}
function hearWord(word = item()[1]) {
  playClip('word_' + word.replaceAll('-', ''));
}
function levelProgress() {
  const evidence = storedMastery[item()[0]]?.sessions?.length || 0;
  return Math.min(100, (soundIndex + Math.min(evidence / 3, 1)) / curriculum.length * 100);
}
function hearWordBlend(word = targetWord) {
  if (typeof word === 'string') word = blendWords.find(x => x.word === word);
  if (word) playSequence([...word.sounds.map(letter => 'sound_' + letter), 'word_' + word.word]);
}
function markMet(letter) {
  metSounds.add(letter);
  localStorage.setItem(metKey, JSON.stringify([...metSounds]));
}
function updateMap() {
  const seen = curriculum.filter(v => metSounds.has(v[0]));
  const masteredCount = curriculum.filter(v => isMastered(v[0])).length;
  const evidence = storedMastery[item()[0]]?.sessions?.length || 0;
  const soundCard = (v, i) => {
    const mastered = isMastered(v[0]);
    const state = mastered ? 'done' : i === soundIndex ? 'here' : '';
    return '<div class="map-item ' + state + '"><span class="map-letter">' +
      (mastered ? '✓' : v[0]) + '</span><b>' + v[1] + '</b>' +
      (!mastered && metSounds.has(v[0]) ? '<small>' + (storedMastery[v[0]]?.sessions?.length || 0) + ' of 3 sessions</small>' : '') + '</div>';
  };
  const revisitCards = seen.length
    ? seen.map(v => '<div class="parent-sound"><b>' + v[0] + '</b><span>' + v[1] + '</span><small>' + (isMastered(v[0]) ? 'Met' : (storedMastery[v[0]]?.sessions?.length || 0) + ' of 3') + '</small></div>').join('')
    : '<p class="parent-empty">Sounds met during lessons will appear here.</p>';
  $('parentSummary').innerHTML =
    '<div class="summary-stats"><div><b>' + masteredCount + '</b><span>sounds mastered</span></div><div><b>' + evidence + ' / 3</b><span>correct sessions on ' + item()[0] + '</span></div></div>' +
    '<div class="revisit-block"><h3>Sounds to revisit</h3><div class="parent-sound-list">' + revisitCards + '</div></div>' +
    '<p class="up-next">Current level: <b>' + (soundIndex + 1) + ' · ' + item()[0] + ' · ' + item()[1] + '</b></p>';
  $('map').innerHTML =
    '<section class="map-band"><div><span class="map-kicker">Step 1 · hear and notice</span><h3>First sounds</h3><p>Listen for a sound, then find its letter.</p></div><div class="map-grid">' +
    curriculum.slice(0, 5).map((v, i) => soundCard(v, i)).join('') +
    '</div></section>' +
    '<section class="map-band"><div><span class="map-kicker">Every level · blend and build</span><h3>Put sounds together</h3><p>As soon as enough sounds are known, blend and build words from the growing sound set.</p></div><div class="map-grid">' +
    blendWords.filter(w => w.sounds.every(letter => curriculum.findIndex(x => x[0] === letter) <= soundIndex)).map(w => '<span class="map-word">' + w.tiles.join(' · ') + '</span>').join('') + '</div></section>' +
    '<section class="map-band"><div><span class="map-kicker">Step 3 · keep exploring</span><h3>More letter sounds</h3><p>Meet a few at a time and revisit familiar sounds.</p></div><div class="map-grid">' +
    curriculum.slice(5).map((v, i) => soundCard(v, i + 5)).join('') +
    '</div></section>' +
    '<section class="map-band"><div><span class="map-kicker">Step 4 · later on</span><h3>Letter pairs & reading</h3><p>When the sounds feel familiar, begin noticing how letters work together.</p></div><div class="map-grid"><span class="map-word map-future">sh</span><span class="map-word map-future">ch</span><span class="map-word map-future">th</span><span class="map-word map-future">vowel teams</span><span class="map-word map-future">read together</span></div></section>';
}
function makeLetterChoices(letter, salt = 0) {
  const earlier = curriculum.slice(0, soundIndex).map(x => x[0]).filter(x => x !== letter);
  const distractors = earlier.slice(-2);
  for (const candidate of curriculum.map(x => x[0])) {
    if (distractors.length >= 2) break;
    if (candidate !== letter && !distractors.includes(candidate)) distractors.push(candidate);
  }
  const options = [letter, ...distractors];
  options.sort((a, b) => ((a.charCodeAt(0) * 7 + salt * 5) % 13) - ((b.charCodeAt(0) * 7 + salt * 5) % 13));
  return options;
}
function render(playLessonPrompt = true) {
  mode = 'letter'; stage = 1; tries = 0; done = false;
  const c = item();
  $('progressLabel').textContent = 'Level ' + (soundIndex + 1);
  $('progressCount').textContent = (soundIndex + 1) + ' of ' + curriculum.length;
  $('progressFill').style.width = levelProgress() + '%';
  $('stageName').textContent = 'Learn the sound';
  $('title').innerHTML = 'Listen <span style="color:#789b7e">' + c[0] + '</span>';
  $('intro').textContent = 'Listen to the sound. Look at the picture.';
  $('bigLetter').textContent = c[0];
  $('bigLetter').setAttribute('aria-label', 'Hear the ' + c[0] + ' sound');
  $('picture').innerHTML = pictureArt(c) + '<small>' + c[1] + '</small>';
  $('picture').setAttribute('aria-label', 'Hear the word ' + c[1]);
  $('caption').textContent = 'Listen. Look. Tap the letter.';
  $('question').textContent = 'Which letter begins with that sound?';
  const options = makeLetterChoices(c[0], soundIndex);
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
  if (playLessonPrompt) modelPrompt();
  else hearSound();
}
function chooseSessionReviews() {
  const familiar = curriculum.filter((v, i) => metSounds.has(v[0]) && i < soundIndex);
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
  $('progressFill').style.width = levelProgress() + '%';
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
  const options = makeLetterChoices(c[0], reviewCursor + soundIndex);
  $('choices').innerHTML = options.map(x => '<button class="choice" data-value="' + x + '" aria-label="Letter ' + x + '">' + x + '</button>').join('');
  $('choices').classList.remove('hidden');
  $('wordBuilder').classList.add('hidden');
  $('blendPreview').classList.add('hidden');
  $('playSound').classList.remove('hidden');
  $('feedback').textContent = '';
  $('next').classList.add('hidden');
  $('next').setAttribute('aria-label', reviewCursor + 1 < reviewQueue.length ? 'Next familiar sound' : 'Blend some sounds');
  $('card').classList.remove('hidden');
  $('done').style.display = 'none';
  updateMap();
  playClip('review_short');
}
function beginSession() {
  clearTimeout(sessionTimer);
  sessionEnded = false;
  sessionId = Number(localStorage.getItem(sessionNumberKey) || 0) + 1;
  localStorage.setItem(sessionNumberKey, String(sessionId));
  sessionTimer = setTimeout(() => { if (!sessionEnded) finish(); }, sessionLength);
  reviewQueue = chooseSessionReviews();
  reviewCursor = 0;
  nextLevelAfterReview = false;
  $('startGate').classList.add('hidden');
  render();
}
function answer(btn) {
  if (done) return;
  if (mode === 'review') {
    if (btn.dataset.value === reviewQueue[reviewCursor][0]) {
      done = true;
      btn.classList.add('good');
      $('feedback').textContent = '✨';
      $('next').classList.remove('hidden');
      $('next').setAttribute('aria-label', reviewCursor + 1 < reviewQueue.length ? 'Next familiar sound' : 'Blend some sounds');
      playSequence(['praise', 'sound_' + reviewQueue[reviewCursor][0]]);
    } else {
      btn.classList.add('retry');
      $('feedback').textContent = '🔊';
      playSequence(['try_again_short', 'sound_' + reviewQueue[reviewCursor][0]]);
    }
    return;
  }
  if (mode === 'blend-choice') {
    if (btn.dataset.value === targetWord.word) {
      done = true;
      btn.classList.add('good');
      $('feedback').textContent = '✨';
      $('next').textContent = '➜';
      $('next').setAttribute('aria-label', 'Build the word');
      $('next').classList.remove('hidden');
      hearWordBlend();
    } else {
      btn.classList.add('retry');
      $('feedback').textContent = '🔊';
      playSequence(['try_again_short', ...targetWord.sounds.map(letter => 'sound_' + letter), 'word_' + targetWord.word]);
    }
    return;
  }
  tries++;
  if (btn.dataset.value === item()[0]) {
    done = true;
    const letter = item()[0];
    if (!storedMastery[letter]) storedMastery[letter] = { sessions: [] };
    if (!storedMastery[letter].sessions.includes(sessionId)) {
      storedMastery[letter].sessions.push(sessionId);
      storedMastery[letter].sessions = storedMastery[letter].sessions.slice(-3);
      localStorage.setItem(masteryKey, JSON.stringify(storedMastery));
    }
    markMet(item()[0]);
    $('progressFill').style.width = levelProgress() + '%';
    btn.classList.add('good');
    const evidence = storedMastery[letter].sessions.length;
    $('feedback').textContent = isMastered(letter) ? '🎉 Sound learned!' : '✨ ' + evidence + ' of 3 sessions';
    $('next').classList.remove('hidden');
    $('next').textContent = '➜';
    $('next').setAttribute('aria-label', isMastered(letter) ? 'Meet the next sound' : 'Keep practicing this sound');
    updateMap();
    playSequence(['praise', 'sound_' + item()[0]]);
  } else {
    btn.classList.add('retry');
    $('feedback').textContent = '🔊';
    playSequence(['try_again_short', 'sound_' + item()[0]]);
  }
}
function eligibleBlendWords() {
  return blendWords.filter(word => word.sounds.every(letter =>
    curriculum.findIndex(entry => entry[0] === letter) >= 0 && curriculum.findIndex(entry => entry[0] === letter) <= soundIndex));
}
function chooseBlendWord() {
  const pool = eligibleBlendWords();
  if (!pool.length) return null;
  const includesNewSound = pool.filter(word => word.sounds.includes(item()[0]));
  const candidates = includesNewSound.length ? includesNewSound : pool;
  const offset = Number(localStorage.getItem(blendOffsetKey) || 0) % candidates.length;
  localStorage.setItem(blendOffsetKey, String((offset + 1) % candidates.length));
  return candidates[offset];
}
function startBlend() {
  mode = 'blend-choice'; stage = 3; done = false; tries = 0;
  targetWord = chooseBlendWord();
  // Early levels may not yet have enough taught sounds to make a decodable
  // word. Keep the session going with another short, familiar sound turn.
  if (!targetWord) { render(false); return; }
  $('progressLabel').textContent = 'Level ' + (soundIndex + 1) + ' · blend';
  $('progressCount').textContent = (soundIndex + 1) + ' of ' + curriculum.length;
  $('progressFill').style.width = levelProgress() + '%';
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
  const pool = eligibleBlendWords();
  const distractors = pool.filter(word => word.word !== targetWord.word).slice(0, 2);
  const choices = [targetWord, ...distractors];
  $('choices').innerHTML = choices.map(word =>
    '<button class="choice word-choice picture-choice" data-value="' + word.word + '" aria-label="Picture choice"><span class="blend-picture">' +
    (word.picture ? '<img src="./' + word.picture + '" alt="" aria-hidden="true">' : word.emoji) + '</span></button>').join('');
  $('blendPreview').innerHTML = targetWord.tiles.map((tile, i) =>
    '<button class="blend-sound" data-sound="' + targetWord.sounds[i] + '" aria-label="Hear a sound">' + tile + '</button>').join('');
  $('choices').classList.remove('hidden');
  $('wordBuilder').classList.add('hidden');
  $('feedback').textContent = '';
  $('next').classList.add('hidden');
  playSequence(['blend_start', ...targetWord.sounds.map(letter => 'sound_' + letter), 'word_' + targetWord.word]);
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
  $('wordBuilderArt').innerHTML = targetWord.picture
    ? '<img src="./' + targetWord.picture + '" alt="" aria-hidden="true">'
    : '<span>' + targetWord.emoji + '</span>';
  $('wordTiles').innerHTML = [...targetWord.tiles].reverse().map((tile, i) => {
    const sound = targetWord.sounds[targetWord.tiles.length - 1 - i];
    return '<button class="word-tile" data-grapheme="' + tile + '" data-sound="' + sound + '" aria-label="Hear a sound">' + tile + '</button>';
  }).join('');
  $('wordSlots').querySelectorAll('.word-slot').forEach(slot => {
    slot.textContent = '';
    slot.classList.remove('filled', 'over');
    slot.disabled = false;
    slot.classList.toggle('current', slot.dataset.index === '0');
  });
  $('wordSlots').innerHTML = targetWord.tiles.map((tile, i) =>
    '<button class="word-slot" data-index="' + i + '" aria-label="Sound ' + (i + 1) + '"></button>').join('');
  $('wordTiles').querySelectorAll('.word-tile').forEach(tile => {
    tile.onclick = () => {
      selectedTile = tile;
      $('wordTiles').querySelectorAll('.word-tile').forEach(t => t.style.borderColor = '');
      tile.style.borderColor = '#789b7e';
      playClip('sound_' + tile.dataset.sound);
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
  playSequence(['build_word', ...targetWord.sounds.map(letter => 'sound_' + letter), 'word_' + targetWord.word]);
}
function fillWordSlot(tile, slot) {
  if (tile.disabled || slot.disabled || done) return;
  const expected = targetWord.tiles[Number(slot.dataset.index)];
  const nextIndex = [...$('wordSlots').querySelectorAll('.word-slot')].findIndex(s => !s.classList.contains('filled'));
  if (Number(slot.dataset.index) !== nextIndex) {
    $('feedback').textContent = '👈';
    playClip('try_again_short');
    return;
  }
  if (tile.dataset.grapheme !== expected) {
    $('feedback').textContent = '🔊';
    playClip('sound_' + tile.dataset.sound);
    return;
  }
  slot.textContent = tile.dataset.grapheme;
  slot.classList.add('filled');
  slot.classList.remove('current');
  tile.disabled = true;
  tile.style.opacity = '.35';
  selectedTile = null;
  if ($('wordSlots').querySelectorAll('.word-slot.filled').length === targetWord.tiles.length) {
    done = true; mode = 'blend-complete';
    $('feedback').textContent = '🎉';
    $('next').textContent = '➜';
    $('next').setAttribute('aria-label', 'Keep playing');
    $('next').classList.remove('hidden');
    hearWordBlend();
  } else {
    const nextSlot = [...$('wordSlots').querySelectorAll('.word-slot')].find(s => !s.classList.contains('filled'));
    if (nextSlot) nextSlot.classList.add('current');
    $('feedback').textContent = '✨';
    playClip('sound_' + expected);
  }
}
function finish() {
  if (sessionEnded) return;
  sessionEnded = true;
  clearTimeout(sessionTimer);
  soundIndex = findCurrentLevel();
  localStorage.setItem(progressKey, String(soundIndex));
  updateMap();
  $('card').classList.add('hidden');
  $('done').style.display = 'block';
  $('progressFill').style.width = ((soundIndex + 1) / curriculum.length * 100) + '%';
  $('progressCount').textContent = (soundIndex + 1) + ' of ' + curriculum.length;
  $('progressLabel').textContent = 'Lovely listening';
  playClip('all_done');
}

$('bigLetter').onclick = () => {
  $('bigLetter').classList.remove('pulse'); void $('bigLetter').offsetWidth; $('bigLetter').classList.add('pulse');
  hearSound();
};
$('picture').onclick = () => hearWord(mode === 'review' ? reviewQueue[reviewCursor][1] : item()[1]);
$('playSound').onclick = () => {
  if (mode === 'review') hearWord(reviewQueue[reviewCursor][1]);
  else if (mode === 'blend-choice') hearWordBlend(targetWord);
  else if (mode === 'blend-build') hearWordBlend(targetWord);
  else if (mode === 'letter') hearSound();
  else hearSound();
};
$('blendPreview').onclick = e => {
  const b = e.target.closest('.blend-sound');
  if (!b) return;
  playClip('sound_' + b.dataset.sound);
};
$('choices').onclick = e => { const b = e.target.closest('.choice'); if (b) answer(b); };
$('next').onclick = () => {
  if (mode === 'letter' && done) {
    if (isMastered(item()[0])) {
      soundIndex = findCurrentLevel();
      reviewQueue = chooseSessionReviews();
      reviewCursor = 0;
      nextLevelAfterReview = true;
      if (reviewQueue.length) renderReview();
      else { nextLevelAfterReview = false; render(); }
    } else if (reviewCursor < reviewQueue.length) renderReview();
    else startBlend();
    return;
  }
  if (mode === 'review' && done) {
    reviewCursor++;
    if (reviewCursor < reviewQueue.length) renderReview();
    else if (nextLevelAfterReview) { nextLevelAfterReview = false; render(); }
    else startBlend();
    return;
  }
  if (mode === 'blend-choice' && done) { startWordBuild(); return; }
  if (mode === 'blend-complete' && done) startBlend();
};
$('again').onclick = () => {
  $('done').style.display = 'none';
  $('startGate').classList.remove('hidden');
};
$('startButton').onclick = () => beginSession();
$('sessionMinutes').value = String(sessionLength / 60000);
$('sessionMinutes').onchange = e => {
  const minutes = Number(e.target.value);
  if (![1, 1.5, 2, 2.5, 3, 4, 5].includes(minutes)) return;
  sessionLength = minutes * 60000;
  localStorage.setItem(sessionLengthKey, String(minutes));
};
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
