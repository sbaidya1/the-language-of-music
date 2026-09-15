# NLP in The Language of Music

This app has two features built on natural language processing: a word-level 
translation dictionary, and a vocabulary-based difficulty score for songs. 
Both lean on existing libraries and APIs rather than building models from scratch, 
which is the more practical way to bring NLP into a small app like this one. This 
doc walks through how each feature works, why it's built the way it is, and where it
still falls short.

## Word-level translation dictionary

**Where:** `js/vocab.js`

Every word in a song's lyrics is rendered as its own input box on the play
page. Double-click a word and the app looks up its translation and shows it
in a tooltip.

### Language detection

Before any word can be translated, the app needs to know what language the
song is in. This is handled by `franc-min`, a language identification
library that works by comparing character n-gram frequencies in the input
text against language profiles it was trained on. It's a classic, well
understood approach to language ID and it runs entirely client-side, so
there's no API call or key needed for this part.

The lyrics are collected once rendering settles down (tracked with a
`MutationObserver`, since the words get added to the page asynchronously
after a fetch), then passed to `franc-min`, and the result is mapped to a
dropdown the user can override.

One tradeoff worth naming: n-gram detection needs a reasonable amount of
text to be reliable. A four-word song title isn't enough. That's why the
detector requires a minimum number of rendered words before it runs at all,
rather than guessing on a coin flip.

### Translation

Once a word is double-clicked, its translation is fetched from the MyMemory
API, a free translation memory service. There's no local dictionary and no
custom translation model here. This is a deliberate choice: building or
hosting a translation model is a lot of infrastructure for a feature that a
free API already does well, and MyMemory covers a wide set of language pairs
without needing an API key.

Results are cached in memory per session so repeat lookups on the same word
don't hit the API again.

### Known limitations

- Word-level translation loses context. A word translated in isolation can
  be wrong for how it's actually being used in the line. This is a real
  limitation of doing translation at the single-word level instead of
  sentence level, and it's a tradeoff made deliberately here in exchange for
  simplicity: users get an instant, precise pointer at the one word they
  clicked, rather than a full-line translation that requires them to parse
  out which word means what.
- MyMemory's quality varies a lot by language pair. Common pairs like
  French-English are solid. Less common pairs can be rougher.
- Detection is text-based only. A song made up mostly of proper nouns,
  interjections, or a very short chorus can trip up any n-gram detector,
  this one included.

## Vocabulary difficulty scoring

**Where:** `js/difficulty.js`, `js/freq-data.js`

The idea is simple: estimate how hard a song's vocabulary is by checking how
common its words are in everyday language, then show a Beginner /
Intermediate / Advanced badge next to the song title. This is only
supported for French and Spanish right now.

### Why word frequency

The underlying assumption, borrowed from corpus linguistics, is that word
frequency correlates with how early a learner encounters a word. Words like
"the", "love", or "house" show up constantly and get learned early. Words
like "epistemological" or regional slang show up rarely and get learned
late, if ever. This idea is the basis of things like CEFR vocabulary lists
and frequency-based graded readers, and it's a reasonable proxy for
difficulty even though it isn't a perfect one.

The frequency data itself comes from `wordfreq`, an open source Python
library that aggregates word frequencies across a range of real-world text
sources (subtitles, web text, social media, and more) and expresses them on
a Zipf scale, where higher numbers mean more common. Since this app has no
build step and everything is plain JavaScript, the frequency lists for
French and Spanish (roughly the 8,000 most common words in each) were
generated once, offline, with a short Python script, and committed as
static data in `js/freq-data.js`. There's no runtime dependency on Python or
on `wordfreq` itself, just the numbers it produced.

### How the score works

1. Lyrics are tokenized the same way the game itself splits words into
   blanks (split on spaces, strip one leading/trailing punctuation
   character), so the difficulty score is judging the exact same words the
   learner will be typing.
2. Proper nouns are filtered out. A word that's capitalized mid-line but
   never appears lowercase anywhere else in the song is assumed to be a
   name, and names don't tell you anything about vocabulary difficulty.
3. Each remaining unique word is looked up in the frequency list for the
   detected language. French and Spanish elisions and pronoun-inversion
   constructions (`j'aime`, `dormez-vous`) get split so the underlying word
   gets looked up properly, since the frequency list only knows the word
   itself, not the contraction.
4. The score comes from two things: how rare the rarest third of the known
   words are, and what fraction of the song's vocabulary wasn't found in
   the frequency list at all. That second part turned out to matter more
   than expected, more on that below.
5. Language confirmation reuses `franc-min` (the same library from the
   dictionary feature) rather than guessing language from frequency-list
   overlap. That second approach was tried first and abandoned, also more
   on that below.

### What went wrong during calibration, and why it matters

The first version of this scorer used a much simpler rule: look at the
rarest third of a song's unique words, and if a word isn't in the frequency
list, treat it as maximally rare. That version had two serious bugs that
only became obvious by testing against real songs instead of trusting the
formula on paper.

**Bug one: elisions and contractions.** French leans heavily on elision,
`j'aime`, `l'école`, `m'appelle`. The word "aime" is common. The combined
form "j'aime" isn't a token the frequency list recognizes at all, because
`wordfreq` counts the underlying word, not the contraction. Left unfixed,
this meant simple, common phrases were getting flagged as full of rare
vocabulary just because of how French spells its pronouns.

**Bug two: score collapse.** Once enough words in a short song are missing
from the frequency list, be it due to onomatopoeia ("ding", "dong"),
inflected verb forms not the same as their infinitive, or slang, they all
got clamped to the same fixed "unknown" value. That meant a children's
nursery rhyme and a passage of dense academic French could end up with the
identical score, for entirely different reasons: one because a couple of
sound-effect words weren't in the list, the other because it was genuinely
built from obscure vocabulary throughout. Same number, completely different
situations. Fixing this meant changing how the "unknown" portion of a song
is weighted: instead of every unknown word being scored as if it were
equally rare, the model tracks what fraction of the song's vocabulary was
unrecognized and lets that fraction itself drive the score down, rather
than substituting a single guessed value in its place. Testing against real
songs is what surfaced this: a handful of nursery rhymes, real pop songs
already in the app, a deliberately archaic Georges Brassens-style passage,
and a French rap song dense with verlan and slang all needed to land in
believably different buckets, and they didn't until this was fixed.

**Bug three: language false positives.** An early version tried to guess a
song's language by checking how many of its words overlapped with the
French or Spanish frequency lists. This seemed reasonable, until it turned
out that `wordfreq`'s French and Spanish lists, being built from real-world
text, include plenty of common English loanwords and code-switched words
("ok", "hello", "world"). Plain English lyrics were scoring 40-60% "French
coverage" this way, easily enough to slip past a naive threshold. Reusing
`franc-min` instead, the same proper language-ID model already used for the
dictionary feature, closed this gap, since it's actually modeling language
rather than counting word overlap.

None of these bugs were visible from the code alone. They only showed up by
running the scorer against actual songs, both simple and difficult ones,
and asking whether the results matched a human's intuition for how hard
each one is.

### Known limitations

- The frequency lists are built from general-purpose corpora and aren't
  lemmatized, so an uncommon inflection of an otherwise common verb can
  register as "unknown." A handful of these in a short song can meaningfully
  shift the score.
- Very short songs are noisy. A four-line song might only have seven or
  eight unique words, so one or two unusual words can swing a large
  fraction of that vocabulary and throw off the score more than it would in
  a full-length song with a hundred unique words.
- Word frequency measures how often a word is *used*, not how easy it is to
  *understand*. A word can be common purely because a genre uses it a lot
  (slang, for instance) without being something a classroom learner has
  actually studied.
- Coverage is limited to French and Spanish. Extending this to another
  language means generating a new frequency list and recalibrating the
  score thresholds against real songs in that language, not just plugging
  in new data and assuming the same thresholds hold.
