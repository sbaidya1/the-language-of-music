const ISO_3_TO_2 = {
  spa: "es",
  fra: "fr",
  deu: "de",
  ita: "it",
  por: "pt",
  jpn: "ja",
  kor: "ko",
  cmn: "zh",
  eng: "en",
};

const translationCache = new Map();

function getSourceLang() {
  const dropdown = document.getElementById("srcLang");
  return dropdown ? dropdown.value : "fr";
}

function getTargetLang(sourceLang) {
  return sourceLang === "en" ? "es" : "en";
}

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

  const rect = anchorEl.getBoundingClientRect();
  tip.style.top = (rect.top + window.scrollY - tip.offsetHeight - 8) + "px";
  tip.style.left = (rect.left + window.scrollX + rect.width / 2 - tip.offsetWidth / 2) + "px";
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.style.display = "none";
}

async function handleDoubleClick(event) {
  const target = event.target;
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

async function detectLanguageFromLyrics() {
  const inputs = document.querySelectorAll("input.blanks");
  if (inputs.length < 5) return null;
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

function whenLyricsReady(callback) {
  const content = document.querySelector(".content");
  if (!content) return;

  let lastCount = 0;
  let stableTimer = null;

  const check = () => {
    const count = document.querySelectorAll("input.blanks").length;
    if (count === lastCount && count > 0) {
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
  stableTimer = setTimeout(check, 500);
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("dblclick", handleDoubleClick);

  document.addEventListener("click", (e) => {
    if (tooltipEl && !tooltipEl.contains(e.target)) hideTooltip();
  });

  const dropdown = document.getElementById("srcLang");
  if (dropdown) {
    const saved = sessionStorage.getItem("srcLang");
    if (saved) dropdown.value = saved;
    dropdown.addEventListener("change", () => {
      sessionStorage.setItem("srcLang", dropdown.value);
    });

    whenLyricsReady(async () => {
      const detected = await detectLanguageFromLyrics();
      if (detected) {
        dropdown.value = detected;
        sessionStorage.setItem("srcLang", detected);
      }
    });
  }
});
