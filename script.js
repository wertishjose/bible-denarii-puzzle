// Bible Book Lists
const oldTestamentBooks = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah",
  "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai",
  "Zechariah", "Malachi"
];

const newTestamentBooks = [
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
  "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation"
];

const allBooks = [...oldTestamentBooks, ...newTestamentBooks];

// Decoy Word Bank
const decoyWords = [
  "run", "jump", "house", "car", "water", "tree", "stone", "road",
  "sky", "river", "gold", "silver", "dream", "fight", "sleep", "lion",
  "bread", "fish", "chair", "floor", "book", "key", "door", "lamp",
  "storm", "crown", "cloud", "fire", "sword", "field", "wine", "sheep",
  "goat", "apple", "sun", "moon", "star", "mountain", "desert", "ocean",
  "sand", "village", "castle", "enemy", "friend", "angel", "light", "shadow"
];

// Player Profile Data
let playerData = {
  denarii: 0.0000000,
  puzzlesSolved: []
};

const chapterLimits = {
  Genesis: 50,
  Exodus: 40,
  Leviticus: 27,
  Numbers: 36,
  Deuteronomy: 34,
  Joshua: 24,
  Judges: 21,
  Ruth: 4,
  "1Samuel": 31,
  "2Samuel": 24,
  "1Kings": 22,
  "2Kings": 25,
  "1Chronicles": 29,
  "2Chronicles": 36,
  Ezra: 10,
  Nehemiah: 13,
  Esther: 10,
  Job: 42,
  Psalms: 150,
  Proverbs: 31,
  Ecclesiastes: 12,
  "SongofSolomon": 8,
  Isaiah: 66,
  Jeremiah: 52,
  Lamentations: 5,
  Ezekiel: 48,
  Daniel: 12,
  Hosea: 14,
  Joel: 3,
  Amos: 9,
  Obadiah: 1,
  Jonah: 4,
  Micah: 7,
  Nahum: 3,
  Habakkuk: 3,
  Zephaniah: 3,
  Haggai: 2,
  Zechariah: 14,
  Malachi: 4,
  Matthew: 28,
  Mark: 16,
  Luke: 24,
  John: 21,
  Acts: 28,
  Romans: 16,
  "1Corinthians": 16,
  "2Corinthians": 13,
  Galatians: 6,
  Ephesians: 6,
  Philippians: 4,
  Colossians: 4,
  "1Thessalonians": 5,
  "2Thessalonians": 3,
  "1Timothy": 6,
  "2Timothy": 4,
  Titus: 3,
  Philemon: 1,
  Hebrews: 13,
  James: 5,
  "1Peter": 5,
  "2Peter": 3,
  "1John": 5,
  "2John": 1,
  "3John": 1,
  Jude: 1,
  Revelation: 22
};

// Global Variables
let selectedWord = null;
let selectedBook = "";

const verseContainer = document.getElementById('verse-container');
const wordBank = document.getElementById('word-bank');
const denariiDisplay = document.getElementById('denarii-amount');
const verseReference = document.getElementById('verse-reference');
const bookChoice = document.getElementById('book-choice');

// Full Reset on Page Load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('reward-popup').style.display = 'none';
  document.getElementById('ad-screen').style.display = 'none';
  document.getElementById('earned-denarii').textContent = "";

  // Set selectedBook properly at load
  selectedBook = bookChoice.value.replace(/ /g, '');

  // Fetch first puzzle
  fetchVerse();
});

// Load saved Player Data
if (localStorage.getItem('playerData')) {
  playerData = JSON.parse(localStorage.getItem('playerData'));
}
updateDenariiDisplay();
// Shuffle Helper
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Fetch a verse based on selectedBook
function fetchVerse(attempt = 1, chapterOverride = null, verseOverride = null) {
  document.getElementById('reward-popup').style.display = 'none';
  document.getElementById('ad-screen').style.display = 'none';
  document.getElementById('earned-denarii').textContent = "";
  verseContainer.innerHTML = "";
  wordBank.innerHTML = "";
  verseReference.textContent = "Loading Verse...";

  const maxChapter = chapterLimits[selectedBook] || 10;
  const chapter = chapterOverride || (Math.floor(Math.random() * maxChapter) + 1);
  let verse = verseOverride || (Math.floor(Math.random() * 20) + 1);

  if (verse < 1) verse = 1; // Make sure verse never goes below 1

  const apiUrl = `https://bible-api.com/${selectedBook}+${chapter}:${verse}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (!data.text && attempt < 5) {
        console.log(`Retrying... Attempt ${attempt} (Chapter ${chapter}, Verse ${verse})`);
        fetchVerse(attempt + 1, chapter, Math.max(1, verse - 5));
      } else if (data.text) {
        setupPuzzle(data.text.trim(), data.reference, data.translation_id.toUpperCase());
      } else {
        console.error("Fallback to John 3:16");
        setupPuzzle(
          "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
          "John 3:16",
          "NIV"
        );
      }
    })
    .catch(error => {
      console.error("Fetch failed:", error);
      if (attempt < 5) {
        fetchVerse(attempt + 1, chapter, Math.max(1, verse - 5));
      } else {
        setupPuzzle(
          "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
          "John 3:16",
          "NIV"
        );
      }
    });
}


// Setup Puzzle
function setupPuzzle(verse, reference, version) {
  verseReference.textContent = `${reference} (${version})`;

  const verseWords = verse.split(" ");
  let numBlanks = 3;
  if (verseWords.length > 10) numBlanks = 4;
  if (verseWords.length > 15) numBlanks = 6;

  const missingWords = [];
  while (missingWords.length < numBlanks) {
    const word = verseWords[Math.floor(Math.random() * verseWords.length)];
    const cleanWord = word.replace(/[.,;]/g, "");
    if (!missingWords.includes(cleanWord)) {
      missingWords.push(cleanWord);
    }
  }

  verseWords.forEach(word => {
    const cleanWord = word.replace(/[.,;]/g, "");
    if (missingWords.includes(cleanWord)) {
      const blank = document.createElement('div');
      blank.className = 'blank';
      blank.dataset.answer = cleanWord;
      verseContainer.appendChild(blank);
    } else {
      const span = document.createElement('span');
      span.textContent = word + " ";
      verseContainer.appendChild(span);
    }
  });

  const selectedDecoys = [];
  while (selectedDecoys.length < 4) {
    const word = decoyWords[Math.floor(Math.random() * decoyWords.length)];
    if (!selectedDecoys.includes(word)) {
      selectedDecoys.push(word);
    }
  }

  const wordsToUse = shuffle([...missingWords, ...selectedDecoys]);

  wordsToUse.forEach(word => {
    const wordDiv = document.createElement('div');
    wordDiv.className = 'word';
    wordDiv.textContent = word;
    wordDiv.draggable = true;

    wordDiv.addEventListener('click', () => {
      const allWords = document.querySelectorAll('.word');
      allWords.forEach(w => w.classList.remove('selected-word'));
      wordDiv.classList.add('selected-word');
      selectedWord = wordDiv.textContent;
    });

    wordDiv.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', word);
    });

    wordBank.appendChild(wordDiv);
  });
}

// Drag and Drop Events
verseContainer.addEventListener('dragover', (e) => e.preventDefault());

verseContainer.addEventListener('dragenter', (e) => {
  const target = e.target;
  if (target.classList.contains('blank')) {
    target.classList.add('drag-over');
  }
});

verseContainer.addEventListener('dragleave', (e) => {
  const target = e.target;
  if (target.classList.contains('blank')) {
    target.classList.remove('drag-over');
  }
});

verseContainer.addEventListener('drop', (e) => {
  e.preventDefault();
  const word = e.dataTransfer.getData('text/plain');
  const target = e.target;
  if (target.classList.contains('blank')) {
    target.textContent = "";
    delete target.dataset.userAnswer;
    target.textContent = word;
    target.dataset.userAnswer = word;
    target.classList.remove('drag-over');
  }
});

// Click-to-fill blanks
verseContainer.addEventListener('click', (e) => {
  const target = e.target;
  if (target.classList.contains('blank')) {
    if (selectedWord) {
      target.textContent = selectedWord;
      target.dataset.userAnswer = selectedWord;
      selectedWord = null;
      const allWords = document.querySelectorAll('.word');
      allWords.forEach(w => w.classList.remove('selected-word'));
    } else {
      target.textContent = "";
      delete target.dataset.userAnswer;
    }
  }
});
// Update Denarii display
function updateDenariiDisplay() {
  denariiDisplay.textContent = playerData.denarii.toFixed(7);
  localStorage.setItem('playerData', JSON.stringify(playerData));
}

// Check Answers
document.getElementById('check-button').addEventListener('click', () => {
  const blanks = document.querySelectorAll('.blank');
  let correct = 0;

  blanks.forEach(blank => {
    if (blank.dataset.userAnswer === blank.dataset.answer) {
      blank.style.backgroundColor = 'lightgreen';
      correct++;
    } else {
      blank.style.backgroundColor = 'lightcoral';
    }
  });

  if (correct === blanks.length) {
    if (confirm("🎉 Puzzle Complete!\nWatch a short ad to receive your Denarii reward!")) {
      showAdScreen();
      playerData.puzzlesSolved.push({
  verse: verseContainer.innerText.trim(),
  reference: verseReference.textContent.trim()
});

      updateDenariiDisplay();
    }
  } else {
    alert(`⚠️ You got ${correct} out of ${blanks.length} correct.\nComplete the full verse to earn your Denarii!`);
  }
});

// Fake Ad then Reward
function showAdScreen() {
  document.getElementById('ad-screen').style.display = 'block';
  let countdown = 5;
  document.getElementById('ad-countdown').textContent = countdown;

  const adTimer = setInterval(() => {
    countdown--;
    document.getElementById('ad-countdown').textContent = countdown;

    if (countdown <= 0) {
      clearInterval(adTimer);
      document.getElementById('ad-screen').style.display = 'none';

      const earned = 0.0005995;
      playerData.denarii += earned;
      playerData.denarii = Math.round(playerData.denarii * 10000000) / 10000000;
      updateDenariiDisplay();

      document.getElementById('earned-denarii').textContent = earned.toFixed(7);
      document.getElementById('reward-popup').style.display = 'flex';
    }
  }, 1000);
}

// Continue Button on Reward Card
document.getElementById('continue-button').addEventListener('click', () => {
  document.getElementById('reward-popup').style.display = 'none';
  fetchVerse();
});

// Cash Out Button
document.getElementById('cashout-button').addEventListener('click', () => {
  if (playerData.denarii >= 1.0) {
    const wholeDenarii = Math.floor(playerData.denarii);
    const cashOutAmount = wholeDenarii * 10;
    playerData.denarii -= wholeDenarii;
    playerData.denarii = Math.round(playerData.denarii * 10000000) / 10000000;
    updateDenariiDisplay();
    alert(`🎉 Cashout Success!\n💸 You withdrew $${cashOutAmount}!\n💰 Remaining Denarii: ${playerData.denarii.toFixed(7)} Denarii.`);
  } else {
    const needed = 1.0 - playerData.denarii;
    alert(`⏳ You need ${needed.toFixed(7)} more Denarii to cash out.`);
  }
});

// Reload Puzzle Button
document.getElementById('reload-button').addEventListener('click', () => {
  if (confirm("♻️ Are you sure you want to reload a new verse? Your current progress will be lost.")) {
    fetchVerse();
  }
});

// Book Selection Changes
bookChoice.addEventListener('change', () => {
  if (confirm("📖 You changed the book. Load a new verse from the selected book?")) {
    selectedBook = bookChoice.value.replace(/ /g, '');
    fetchVerse();
  }
});

// Hint Button
document.getElementById('hint-button').addEventListener('click', () => {
  const hintCost = 0.0000599;

  if (playerData.denarii >= hintCost) {
    const blanks = Array.from(document.querySelectorAll('.blank'));
    const unsolved = blanks.filter(blank => blank.dataset.userAnswer !== blank.dataset.answer);

    if (unsolved.length > 0) {
      playerData.denarii -= hintCost;
      playerData.denarii = Math.round(playerData.denarii * 10000000) / 10000000;
      updateDenariiDisplay();

      const randomBlank = unsolved[Math.floor(Math.random() * unsolved.length)];
      randomBlank.textContent = randomBlank.dataset.answer;
      randomBlank.dataset.userAnswer = randomBlank.dataset.answer;
      randomBlank.style.backgroundColor = 'lightyellow';
    } else {
      alert("✅ All blanks already solved!");
    }
  } else {
    alert("⛔ Not enough Denarii to get a hint!\nEarn more by solving puzzles!");
  }
});
// View Collection Button
document.getElementById('view-collection-button').addEventListener('click', () => {
  if (playerData.puzzlesSolved.length === 0) {
    alert("📖 You haven't completed any puzzles yet!");
  } else {
    const completedList = playerData.puzzlesSolved.map((item, index) => {
      if (typeof item === 'string') {
        // Old style saved reference only
        return `${index + 1}. (Reference only)\n    — ${item}`;
      } else if (item.verse && item.reference) {
        // New style saved full verse and reference
        return `${index + 1}. "${item.verse}"\n    — ${item.reference}`;
      } else {
        // Broken or missing data
        return `${index + 1}. (Unknown or incomplete data)`;
      }
    }).join('\n\n');
    
    alert(`📚 Completed Verses:\n\n${completedList}`);
  }
});


