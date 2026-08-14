let lyrics = [null, null, "Dites-moi d'où il vient", "Enfin je saurai où je vais", "Maman dit que lorsqu'on cherche bien", "On finit toujours par trouver", "Elle dit qu'il n'est jamais très loin", "Qu'il part très souvent travailler", "Maman dit travailler c'est bien", "Bien mieux qu'être mal accompagné", "Pas vrai ?", null, "Où est ton papa ?", "Dis-moi où est ton papa ?", "Sans même devoir lui parler", "Il sait ce qui ne va pas", "Ah sacré papa", "Dis-moi où es-tu caché ?", "Ça doit, faire au moins mille fois que j'ai", "Compté mes doigts", "Hey !", null, "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, où t'es où, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, où t'es où, papaoutai ?", "Où t'es", "Où t'es", null, "Quoi, qu'on y croit ou pas", "Y aura bien un jour où on n'y croira plus", "Un jour ou l'autre on sera tous papa", "Et d'un jour à l'autre on aura disparu", "Serons-nous détestables ?", "Serons-nous admirables ?", "Des géniteurs ou des génies ?", "Dites-nous qui donne naissance aux irresponsables ?", "Ah dites-nous qui, tiens", "Tout le monde sait comment on fait des bébés", "Mais personne sait comment on fait des papas", "Monsieur Je-sais-tout en aurait hérité, c'est ça", "Faut l'sucer d'son pouce ou quoi ?", "Dites-nous où c'est caché, ça doit", "Faire au moins mille fois qu'on a", "Bouffé nos doigts", "Hey !", null, "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, où t'es où, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, où t'es où, papaoutai ?", "Où t'es", "Où t'es", null, "Où est ton papa ?", "Dis-moi où est ton papa ?", "Sans même devoir lui parler", "Il sait ce qui ne va pas", "Ah sacré papa", "Dis-moi où es-tu caché ?", "Ça doit, faire au moins mille fois que j'ai", "Compté mes doigts", "Hey", "Où est ton papa ?", "Dis-moi où est ton papa ?", "Sans même devoir lui parler", "Il sait ce qui ne va pas", "Ah sacré papa", "Dis-moi où es-tu caché ?", "Ça doit, faire au moins mille fois que j'ai", "Compté mes doigts", "Hey !", null, "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, où t'es où, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, papaoutai ?", "Où t'es, où t'es où, papaoutai ?", "Où t'es", "Où t'es"]

displayLyrics(lyrics)

let selectedPositions = [];

function displayLyrics(lyricsArray) {
  const lyricsContainer = document.getElementById('lyrics');
  let nullC = 0
  for (let lineIndex = 0; lineIndex < lyricsArray.length; lineIndex++) {
    const line = lyricsArray[lineIndex];
    if (line == null) {
      if(nullC > 0) {
        const d = document.createElement('div')
        d.className = "lb"
        lyricsContainer.append(d)
      }
      nullC--
    } else {
      const words = line.split(' ');
      for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
        const word = words[wordIndex];
        // Wrap each word in a <span> element with data attributes for line and word index
        lyricsContainer.innerHTML += `<span data-line="${lineIndex}" data-word="${wordIndex}">${word}</span> `;
      }
      lyricsContainer.innerHTML += '<br>';
      }
    nullC++
  }
  const saveButton = document.createElement('button');

  // Step 3: Set attributes and styles for the submit button
  saveButton.textContent = 'Save Selections';
  saveButton.id = 'subm';
  saveButton.classList.add('submit-button'); 
  lyricsContainer.appendChild(saveButton);
  
  addEventListenersToLyrics();
}

function addEventListenersToLyrics() {
  const lyricsContainer = document.getElementById('lyrics');
  lyricsContainer.addEventListener('click', selectBlank);
}


function selectBlank(event) {
  if (!event.target.matches('span')) {
    return;
  }
  const selectedWord = event.target;
  const lineIndex = parseInt(selectedWord.dataset.line);
  const wordIndex = parseInt(selectedWord.dataset.word);

  const positionString = "form" + lineIndex + " blank" + wordIndex

  if (!selectedPositions.includes(positionString)) {
    selectedPositions.push(positionString);
    selectedWord.classList.add('blank'); // Add a class to change the color of the selected word
  } else {
    selectedPositions = selectedPositions.filter((pos) => pos !== positionString);
    selectedWord.classList.remove('blank'); // Remove the class to deselect the word
  }
}

