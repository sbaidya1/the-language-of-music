/*
 * Word-level translation for lyrics (the NLP feature).
 *
 * How it works:
 *   1. Every word in the lyrics is rendered as an <input> with the actual
 *      word stored in `input.answer` (see main.js / main1.js).
 *   2. When lyrics have finished rendering, we auto-detect the language
 *      using the `franc-min` library (client-side, n-gram based). The
 *      dropdown is set to the detected language — user can override.
 *   3. When the user double-clicks any word input, we grab that answer,
 *      look up its translation using the MyMemory API (free, no key,
 *      https://mymemory.translated.net/doc/spec.php), and show it in
 *      a small tooltip anchored to the word.
 *   4. Translations are cached in memory so repeated clicks are instant.
 *
 * Source language comes from a <select id="srcLang"> on the page.
 * Target language is always English, unless source IS English, in which
 * case target falls back to Spanish.
 *
 * To add a new source language: add an <option> to the dropdown in
 * play.html / view.html AND add a mapping to ISO_3_TO_2 below so
 * auto-detect can select it.
 */

// -----------------------------------------------------------------------
// franc-min returns ISO 639-3 codes (3 letters). Our dropdown uses
// ISO 639-1 (2 letters). This maps between them for languages we support.
// -----------------------------------------------------------------------
const ISO_3_TO_2 = {
  spa: "es",
  fra: "fr",
  deu: "de",
  ita: "it",
  por: "pt",
  jpn: "ja",
  kor: "ko",
  cmn: "zh",  // Mandarin Chinese
  eng: "en",
};

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
// Auto-detect the song language from all rendered lyric words.
//
// We use `franc-min` (https://github.com/wooorm/franc) which does n-gram
// language detection entirely in the browser — no API call, no key.
// Loaded via dynamic import from a CDN so we don't have to touch the HTML.
// -----------------------------------------------------------------------
async function detectLanguageFromLyrics() {
  // Gather text from every word input on the page.
  const inputs = document.querySelectorAll("input.blanks");
  if (inputs.length < 5) return null;  // too little text to be reliable
  const text = Array.from(inputs).map(i => i.answer).join(" ");

  try {
    const mod = await import("https://esm.run/franc-min@6");
    const iso3 = mod.franc(text, { minLength: 10 });
    return ISO_3_TO_2[iso3] || null;
  } catch (err) {
    console.log("language detection failed", err);
    return null;
  }
}

// -----------------------------------------------------------------------
// Wait for lyrics to finish rendering, then run auto-detect.
//
// main.js creates the word inputs asynchronously (after a fetch), so we
// can't just run on DOMContentLoaded. We use a MutationObserver to watch
// the .content container and consider rendering "done" once the number
// of word inputs stops growing for 500ms.
// -----------------------------------------------------------------------
function whenLyricsReady(callback) {
  const content = document.querySelector(".content");
  if (!content) return;

  let lastCount = 0;
  let stableTimer = null;

  const check = () => {
    const count = document.querySelectorAll("input.blanks").length;
    if (count === lastCount && count > 0) {
      // No new inputs for the debounce window → we're done.
      observer.disconnect();
      callback();
      return;
    }
    lastCount = count;
    clearTimeout(stableTimer);
    stableTimer = setTimeout(check, 500);
  };

  const observer = new MutationObserver(check);
  observer.observe(content, { childList: true, subtree: true });
  // Kick off the first debounce in case lyrics are already there.
  stableTimer = setTimeout(check, 500);
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

  const dropdown = document.getElementById("srcLang");
  if (dropdown) {
    // Restore last-chosen language for this tab as a starting guess.
    const saved = sessionStorage.getItem("srcLang");
    if (saved) dropdown.value = saved;
    dropdown.addEventListener("change", () => {
      sessionStorage.setItem("srcLang", dropdown.value);
    });

    // Once the lyrics have rendered, auto-detect and set the dropdown.
    whenLyricsReady(async () => {
      const detected = await detectLanguageFromLyrics();
      if (detected) {
        dropdown.value = detected;
        sessionStorage.setItem("srcLang", detected);
      }
    });
  }
});
