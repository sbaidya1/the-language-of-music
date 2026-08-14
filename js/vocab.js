/*
 * Word-level translation for lyrics (the NLP feature).
 *
 * How it works:
 *   1. Every word in the lyrics is rendered as an <input> with the actual
 *      word stored in `input.answer` (see main.js / main1.js).
 *   2. When the user double-clicks any word input, we grab that answer,
 *      look up its translation using the MyMemory API (free, no key,
 *      https://mymemory.translated.net/doc/spec.php), and show it in
 *      a small tooltip anchored to the word.
 *   3. Translations are cached in memory so repeated clicks are instant.
 *
 * Source language comes from a <select id="srcLang"> on the page.
 * Target language is always English, unless source IS English, in which
 * case target falls back to Spanish.
 *
 * To add a new source language: just add an <option> to the dropdown in
 * play.html / view.html. Nothing else needs to change here.
 */

// -----------------------------------------------------------------------
// Translation cache. Keyed by "word|sourceLang".
// -----------------------------------------------------------------------
const translationCache = new Map();

// -----------------------------------------------------------------------
// Read the currently selected source language from the dropdown.
// Falls back to "es" (Spanish) if the dropdown doesn't exist.
// -----------------------------------------------------------------------
function getSourceLang() {
  const dropdown = document.getElementById("srcLang");
  return dropdown ? dropdown.value : "es";
}

// -----------------------------------------------------------------------
// Pick a target language. We translate INTO English by default. But if
// the source language IS English, we translate into Spanish so the user
// still sees a translation.
// -----------------------------------------------------------------------
function getTargetLang(sourceLang) {
  return sourceLang === "en" ? "es" : "en";
}

// -----------------------------------------------------------------------
// Fetch a translation for one word. Returns a string, or null on error.
// -----------------------------------------------------------------------
async function translateWord(word, sourceLang) {
  const targetLang = getTargetLang(sourceLang);
  const cacheKey = `${word.toLowerCase()}|${sourceLang}|${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${sourceLang}|${targetLang}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const translation = (data && data.responseData && data.responseData.translatedText) || null;
    translationCache.set(cacheKey, translation);
    return translation;
  } catch (err) {
    console.log("translation failed", err);
    return null;
  }
}

// -----------------------------------------------------------------------
// The tooltip. There's only ever one on screen. We reuse the same
// element and move/refill it each time.
// -----------------------------------------------------------------------
let tooltipEl = null;

function getTooltip() {
  if (tooltipEl) return tooltipEl;
  tooltipEl = document.createElement("div");
  tooltipEl.className = "word-tooltip";
  tooltipEl.style.display = "none";
  document.body.appendChild(tooltipEl);
  return tooltipEl;
}

function showTooltip(anchorEl, contentHTML) {
  const tip = getTooltip();
  tip.innerHTML = contentHTML;
  tip.style.display = "block";

  // Position ABOVE the word. getBoundingClientRect gives coords relative
  // to the viewport, so add window.scrollX/Y for absolute page coords.
  const rect = anchorEl.getBoundingClientRect();
  tip.style.top = (rect.top + window.scrollY - tip.offsetHeight - 8) + "px";
  tip.style.left = (rect.left + window.scrollX + rect.width / 2 - tip.offsetWidth / 2) + "px";
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.style.display = "none";
}

// -----------------------------------------------------------------------
// The main handler. Wired up on DOMContentLoaded below.
// Uses event delegation so it works even for inputs added later by
// createForm() — we don't need to touch main.js/main1.js at all.
// -----------------------------------------------------------------------
async function handleDoubleClick(event) {
  const target = event.target;
  // Only handle double-clicks on lyric word inputs. Those inputs have
  // className "blanks" and a `.answer` property (set in main.js).
  if (!(target instanceof HTMLInputElement)) return;
  if (!target.classList.contains("blanks")) return;
  if (!target.answer) return;

  event.preventDefault();
  const word = target.answer.trim();
  const sourceLang = getSourceLang();

  showTooltip(target, `<em>translating…</em>`);

  const translation = await translateWord(word, sourceLang);
  if (!translation) {
    showTooltip(target, `<strong>${word}</strong><br><em>no translation found</em>`);
    return;
  }
  showTooltip(target,
    `<strong>${word}</strong><br>${translation}` +
    `<br><small>${sourceLang} → ${getTargetLang(sourceLang)}</small>`
  );
}

// -----------------------------------------------------------------------
// Wire everything up when the page loads.
// -----------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Double-click any word input → translate it.
  document.addEventListener("dblclick", handleDoubleClick);

  // Click anywhere else → dismiss the tooltip.
  document.addEventListener("click", (e) => {
    if (tooltipEl && !tooltipEl.contains(e.target)) hideTooltip();
  });

  // Remember the last-chosen source language across page loads.
  const dropdown = document.getElementById("srcLang");
  if (dropdown) {
    const saved = sessionStorage.getItem("srcLang");
    if (saved) dropdown.value = saved;
    dropdown.addEventListener("change", () => {
      sessionStorage.setItem("srcLang", dropdown.value);
    });
  }
});
