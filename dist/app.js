Warning: truncated output (original token count: 3458)
Total output lines: 302

const curriculum = [
  ['m', 'moon', '🌙', 'mmm'], ['s', 'sun', '☀️', 'sss'],
  ['f', 'fish', '🐟', 'fff'], ['a', 'apple', '🍎', 'apple'],
  ['t', 'top', '🪀', 'top'], ['n', 'nest', '🪺', 'nnn'],
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
const firstWords = ['mat', 'sat'];
let soundIndex = Number(localStorage.getItem(progressKey) || 0);
let blendComplete = localStorage.getItem(blendKey) === 'yes';
if (!Number.isFinite(soundIndex) || soundIndex < 0 || soundIndex >= curriculum.length) soundIndex = 0;
if (soundIndex > 4 && !blendComplete) soundIndex = 4;
let stage = 0, tries = 0, enabled = true, done = false, mode = 'letter';
let selectedTile = null;
let wordRound = 0, targetWord = firstWords[0];
const $ = id => document.getElementById(id);
const item = () => curriculum[soundIndex];

function say(text) {
  if (!enabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(text);
  voice.lang = 'en-GB';
  voice.rate = .78;
  voice.pitch = 1.06;
  window.speechSynthesis.speak(voice);
}
function hearSound() {
  // Use a familiar example word where speech synthesis cannot isolate a phoneme cleanly.
  say(item()[3]);
}
function modelPrompt(instruction = '') {
  const c = item();
  say('Listen. ' + c[3] + '. ' + c[1] + '. The first sound in ' + c[1] + ' is ' + c[0] + '. ' + instruction);
}
function exampleSound(letter) {
  return curriculum.find(x => x[0] === letter)?.[3] || letter;
}
function hearWordBlend(word = targetWord, instruction = '') {
  const firstSoundModels = word.split('').map(letter => {
    const example = curriculum.find(x => x[0] === letter)?.[1] || letter;
    return 'The first sound in ' + example + ' is ' + letter;
  });
  say(firstSoundModels.join('. ') + '. Listen to the word: ' + word + '. ' + instruction);
}
function updateMap() {
  $('map').innerHTML = curriculum.map((v, i) =>
    '<div class="map-item ' + (i < soundIndex ? 'done' : '') + '"><span class="map-letter">' +
    (i < soundIndex ? '✓' : v[0]) + '</span><span><b>' + v[1] + '</b><small>' +
    (i < soundIndex ? 'Introduced' : i === soundIndex ? 'We are here' : 'Coming up') +
    '</small></span></div>').join('');
}
function render() {
  mode = 'letter'; stage = 0; tries = 0; done = false;
  const c = item();
  $('progressLabel').textContent = 'Sound ' + (soundIndex + 1);
  $('progressCount').textContent = (soundIndex + 1) + ' of ' + curriculum.length;
  $('progressFill').style.width = (soundIndex / curriculum.length * 100) + '%';
  $('stageName').textContent = 'Learn the sound';
  $('title').innerHTML = 'Listen <span style="color:#789b7e">' + c[0] + '</span>';
  $('intro').textContent = 'Listen to the sound. Look at the picture.';
  $('bigLetter').textContent = c[0];
  $('bigLetter').setAttribute('aria-label', 'Hear the ' + c[0] + ' sound');
  $('picture').innerHTML = c[2];
  $('picture').setAttribute('aria-label', 'Hear the word ' + c[1]);
  $('caption').textContent = 'Listen. Look. Tap the letter.';
  $('question').textContent = 'Listen to the first sound.';
  const seen = curriculum.slice(0, soundIndex).map(x => x[0]);
  const options = [c[0], ...seen.slice(-2)];
  options.sort((a, b) => ((a.charCodeAt(0) * 7 + soundIndex * 5) % 13) - ((b.charCodeAt(0) * 7 + soundIndex * 5) % 13));
  $('choices').innerHTML = options.map(x => '<button class="choice" data-value="' + x + '" aria-label="Letter ' + x + '">' + x + '</button>').join('');
  $('feedback').textContent = '';
  $('next').classList.add('hidden');
  $('next').textContent = 'Keep going';
  $('choices').classList.add('hidden');
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
function answer(btn) {
  if (done) return;
  if (mode === 'blend-choice') {
    if (btn.dataset.value === targetWord) {
      done = true;
      btn.classList.add('good');
      $('feedback').textContent = '✨';
      $('next').textContent = '➜';
      $('next').setAttribute('aria-label', 'Build the word');
      $('next').classList.remove('hidden');
      hearWordBlend(targetWord, 'Yes. Find the picture for ' + targetWord + '.');
    } else {
      btn.classList.add('retry');
      $('feedback').textContent = '🔊';
      hearWordBlend(targetWord, 'Listen again.');
    }
    return;
  }
  tries++;
  if (btn.dataset.value === item()[0]) {
    done = true;
    btn.classList.add('good');
    $('feedback').textContent = '✨';
    $('next').classList.remove('hidden');
    const nextLabel = soundIndex === 4 && !blendComplete ? 'Blend the sounds' : soundIndex === curriculum.length - 1 ? 'Finish for today' : 'Next sound';
    $('next').textContent = '➜';
    $('next').setAttribute('aria-label', nextLabel);
    say('Yes. The first sound in ' + item()[1] + ' is ' + item()[0] + '.');
  } else {
    btn.classList.add('retry');
    $('feedback').textContent = '🔊';
    modelPrompt('Try again. Find the letter for that first sound.…458 tokens truncated…tContent = 'Put each sound in its place.';
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
      say('The first sound in ' + c[1] + ' is ' + c[0] + '.');
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
  hearWordBlend(targetWord, 'Tap a letter to hear it. Put the first sound in the first space.');
}
function fillWordSlot(tile, slot) {
  if (tile.disabled || slot.disabled || done) return;
  const expected = targetWord[Number(slot.dataset.index)];
  const nextIndex = [...$('wordSlots').querySelectorAll('.word-slot')].findIndex(s => !s.classList.contains('filled'));
  if (Number(slot.dataset.index) !== nextIndex) {
    $('feedback').textContent = '👈';
    say('Start with the first sound.');
    return;
  }
  if (tile.dataset.letter !== expected) {
    $('feedback').textContent = '🔊';
    const c = curriculum.find(x => x[0] === tile.dataset.letter);
    say('The first sound in ' + c[1] + ' is ' + c[0] + '.');
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
    say(targetWord);
  } else {
    const nextSlot = [...$('wordSlots').querySelectorAll('.word-slot')].find(s => !s.classList.contains('filled'));
    if (nextSlot) nextSlot.classList.add('current');
    $('feedback').textContent = '✨';
    say('Good. Find the next sound.');
  }
}
function finish() {
  $('card').classList.add('hidden');
  $('done').style.display = 'block';
  $('progressFill').style.width = ((soundIndex + 1) / curriculum.length * 100) + '%';
  $('progressCount').textContent = (soundIndex + 1) + ' of ' + curriculum.length;
  $('progressLabel').textContent = 'Lovely listening';
  say('Lovely listening. You learned a new sound.');
}

$('bigLetter').onclick = () => {
  $('bigLetter').classList.remove('pulse'); void $('bigLetter').offsetWidth; $('bigLetter').classList.add('pulse');
  if (mode === 'letter' && stage === 0) {
    stage = 1;
    $('choices').classList.remove('hidden');
    modelPrompt('Now find the letter for that first sound.');
    return;
  }
  modelPrompt('Listen for the first sound.');
};
$('picture').onclick = () => say(item()[1]);
$('playSound').onclick = () => {
  if (mode === 'blend-choice') hearWordBlend(targetWord, 'Find the picture for ' + targetWord + '.');
  else if (mode === 'blend-build') hearWordBlend(targetWord, 'Tap a letter to hear it. Put the first sound in the first space.');
  else hearSound();
};
$('blendPreview').onclick = e => {
  const b = e.target.closest('.blend-sound');
  if (!b) return;
  const c = curriculum.find(x => x[0] === b.textContent);
  say(c ? 'The first sound in ' + c[1] + ' is ' + c[0] : b.dataset.sound);
};
$('choices').onclick = e => { const b = e.target.closest('.choice'); if (b) answer(b); };
$('next').onclick = () => {
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
$('again').onclick = () => { render(); };
$('soundBtn').onclick = () => {
  enabled = !enabled;
  $('soundBtn').textContent = enabled ? '🔊' : '🔇';
  $('soundBtn').setAttribute('aria-label', enabled ? 'Turn sound off' : 'Turn sound on');
  if (!enabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
};
$('mapBtn').onclick = () => { $('sheet').classList.add('open'); updateMap(); };
$('closeSheet').onclick = () => $('sheet').classList.remove('open');
$('sheet').onclick = e => { if (e.target === $('sheet')) $('sheet').classList.remove('open'); };
render();

