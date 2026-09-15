const DIFFICULTY_LANGS = {
  fr: FREQ_FR,
  es: FREQ_ES,
};

// See docs/nlp.md for why this weight is set this high.
const UNKNOWN_WORD_PENALTY = 4.0;

function tokenizeLyrics(lines) {
  const entries = [];
  for (const line of lines) {
    if (line == null) continue;
    const rawWords = line.split(" ");
    rawWords.forEach((raw, i) => {
      let word = raw;
      const punct = /\p{P}/u;
      if (punct.test(word.charAt(0))) word = word.slice(1);
      if (punct.test(word.slice(-1))) word = word.slice(0, -1);
      if (!word) return;
      const isProperNoun = i > 0 && word.charAt(0) === word.charAt(0).toUpperCase() && word.charAt(0) !== word.charAt(0).toLowerCase();
      entries.push({ lower: word.toLowerCase().trim(), isProperNoun });
    });
  }
  return entries;
}

function freqOf(word, freqList) {
  if (freqList[word] != null) return freqList[word];
  const parts = word.split(/['-]/).filter(Boolean);
  if (parts.length < 2) return undefined;
  const scores = parts.map((p) => freqList[p]).filter((z) => z != null);
  if (scores.length === 0) return undefined;
  return Math.max(...scores);
}

async function detectLyricsLanguage(lines) {
  const text = lines.filter((l) => l != null).join(" ");
  if (text.trim().length < 20) return null;
  try {
    const mod = await import("https://esm.run/franc-min@6");
    const iso3 = mod.franc(text, { minLength: 10 });
    if (iso3 === "fra") return "fr";
    if (iso3 === "spa") return "es";
    return null;
  } catch (err) {
    console.log("difficulty: language detection failed", err);
    return null;
  }
}

function rareWordScore(uniqueWords, freqList) {
  const known = uniqueWords
    .map((w) => freqOf(w, freqList))
    .filter((z) => z != null)
    .sort((a, b) => a - b);
  if (known.length === 0) return 2.0;

  const unknownRatio = 1 - known.length / uniqueWords.length;
  const n = Math.max(1, Math.ceil(known.length / 3));
  const rarestKnown = known.slice(0, n);
  const knownRareAvg = rarestKnown.reduce((sum, z) => sum + z, 0) / rarestKnown.length;
  return knownRareAvg - unknownRatio * UNKNOWN_WORD_PENALTY;
}

async function scoreDifficulty(lines) {
  const lang = await detectLyricsLanguage(lines);
  if (!lang) return null;

  const entries = tokenizeLyrics(lines);
  const lowerSeen = new Set(entries.map((e) => e.lower));
  const properNouns = new Set(
    entries.filter((e) => e.isProperNoun).map((e) => e.lower)
  );
  for (const e of entries) {
    if (!e.isProperNoun) properNouns.delete(e.lower);
  }
  const uniqueWords = [...lowerSeen].filter((w) => !properNouns.has(w));
  if (uniqueWords.length < 5) return null;

  const score = rareWordScore(uniqueWords, DIFFICULTY_LANGS[lang]);

  let level;
  if (score >= 4.4) {
    level = "Beginner";
  } else if (score >= 3.7) {
    level = "Intermediate";
  } else {
    level = "Advanced";
  }
  return { lang, level };
}

async function renderDifficultyBadge(lines) {
  const result = await scoreDifficulty(lines);
  const header = document.querySelector(".headsong");
  if (!result || !header) return;

  const badgeClass = {
    Beginner: "difficulty-beginner",
    Intermediate: "difficulty-intermediate",
    Advanced: "difficulty-advanced",
  }[result.level];

  const wrapper = document.createElement("span");
  wrapper.className = "difficulty-wrapper";

  const label = document.createElement("span");
  label.className = "difficulty-label";
  label.textContent = "Vocabulary difficulty:";

  const badge = document.createElement("span");
  badge.className = `difficulty-badge ${badgeClass}`;
  badge.textContent = result.level;

  const tooltip = document.createElement("span");
  tooltip.className = "difficulty-tooltip";
  tooltip.textContent = "Estimated from how common this song's vocabulary is, based on word-frequency data for the detected language.";
  badge.appendChild(tooltip);

  wrapper.append(label, badge);
  header.appendChild(wrapper);
}
