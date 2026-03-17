// ============================================
// SYSTÈME AUDIO
// ============================================

function playWheelSound() {
  const htmlAudio = document.getElementById('wheelAudio');
  if (htmlAudio) {
    htmlAudio.currentTime = 0;
    htmlAudio.play().catch(err => {
      console.log("Erreur:", err);
    });
  }
}

function playWithAudioJS() {
  const audio = new Audio();
  audio.src = 'sound/LUCKY WHEEL SPIN SOUND EFFECTS  Copyright Free.mp3';
  audio.volume = 0.8;
  
  audio.play().then(() => {
    console.log("Son joué avec Audio JS!");
  }).catch(err => {
    console.log("Erreur lecture audio JS:", err);
  });
  
  setTimeout(() => {
    audio.pause();
  }, 5000);
}

// ============================================
// BOUTON PLAY - Effet paillages
// ============================================
const playBtn = document.querySelector(".play");

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function burstSparkles(btn, clientX, clientY) {
  const rect = btn.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const count = 18;

  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;

    const dx = rand(-120, 120);
    const dy = rand(-90, 90);
    s.style.setProperty("--dx", `${dx}px`);
    s.style.setProperty("--dy", `${dy}px`);

    const size = rand(5, 11);
    s.style.width = `${size}px`;
    s.style.height = `${size}px`;

    const colors = ["#fff2ff", "#ffd6ff", "#fff7c2", "#c9fff5", "#ffd1a6"];
    s.style.background = colors[Math.floor(Math.random() * colors.length)];

    btn.appendChild(s);
    s.addEventListener("animationend", () => s.remove());
  }
}

if (playBtn) {
  playBtn.addEventListener("click", (e) => {
    e.preventDefault();
    playWheelSound();
    burstSparkles(playBtn, e.clientX, e.clientY);
    setTimeout(() => {
      location.href = 'wheel.html';
    }, 300);
  });
}

// ============================================
// BADGES - Effet flip 3D
// ============================================
const cards = document.querySelectorAll('.ach-card');

// if (!cards.length) {
//   console.warn("Aucune carte trouvée : vérifie .ach-card dans ton HTML");
// }

cards.forEach((card) => {
  const flip = card.querySelector('.ach-flip');

  if (!flip) {
    console.warn("Flip introuvable dans une carte : vérifie .ach-flip");
    return;
  }

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;
    flip.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    flip.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });

  card.addEventListener('mousedown', () => {
    flip.style.transform = 'rotateY(180deg)';
  });

  card.addEventListener('mouseup', () => {
    flip.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
});

// ============================================
// ROUETTE - Animation et logique
// ============================================
const wheel = document.getElementById("wheel");
const segmentsGroup = document.getElementById("segments");
const spinBtn = document.getElementById("spin");
const result = document.getElementById("result");
const scene = document.getElementById("scene");

const vinylePlayer = document.querySelector('.vinyle-player');

if (spinBtn && scene) {
  spinBtn.addEventListener("click", () => {
    const spinSoundEl = document.getElementById('spinSound');
    if (spinSoundEl) {
      const volumeSliderEl = document.getElementById('volumeSlider');
      const volume = volumeSliderEl ? volumeSliderEl.value / 100 : 0.5;
      spinSoundEl.currentTime = 0;
      spinSoundEl.volume = volume;
      spinSoundEl.play().catch(err => {
        console.log("Erreur lecture son spin:", err);
      });
      setTimeout(() => {
        if (spinSoundEl) {
          spinSoundEl.pause();
          spinSoundEl.currentTime = 0;
        }
      }, 5000);
    }
    
    if (vinylePlayer) {
      scene.classList.add("is-playing");
    }
  });
}

function getNextPage() {
  const body = document.body;
  if (body.classList.contains('page-wheel3')) {
    return 'index.html';
} else if (body.classList.contains('page-wheel2')) {
    return 'wheel3.html';
  } else {
    return 'wheel2.html';
  }

}

// ============================================
// BLIND TEST
// ============================================
let blindTestTimer = null;
let questionTimer = null;

const blindTestSongs = [
  { title: "Despacito", answer: "Despacito", choices: ["Despacito", "Doucement", "Latino"] },
  { title: "Shape of You", answer: "Shape of You", choices: ["Shape of You", "Perfect", "Thinking Out Loud"] },
  { title: "Papa Outai", answer: "Papa Outai", choices: ["Papa Outai", "Bambino", "Dancing"], audio: "papaOutai" },
  { title: "Billie Jean", answer: "Billie Jean", choices: ["Billie Jean", "Thriller", "Beat It"], audio: "billieJean" },
  { title: "We Will Rock You", answer: "We Will Rock You", choices: ["We Will Rock You", "Bohemian Rhapsody", "Stayin' Alive"], audio: "weWillRock" },
  { title: "Get Lucky", answer: "Get Lucky", choices: ["One More Time", "Get Lucky", "Veridis Quo"], audio: "daftPunk" },
  { title: "Uptown Funk", answer: "Uptown Funk", choices: ["Bruno Mars", "Uptown Funk", "24K Magic"] , audio: "brunomars" },
  { title: "Macarena", answer: "Macarena", choices: ["Macarena", "La Macarena", "Los Del Rio"] , audio: "macarena" },
  { title: "Another One Bites the Dust", answer: "Another One Bites the Dust", choices: ["Queen", "Another One Bites the Dust", "We Will Rock You"] , audio: "queen" }
];

function showQuestionTimer(label, qObj) {
  const panel = document.getElementById('panel');
  const panelCards = panel.querySelectorAll('.panel-card');
  
  panel.setAttribute('aria-hidden', 'false');
  
  if (scene) scene.classList.add('is-done');
  
  if (panelCards[0]) {
let timeLeft = 9; // Réduit de 10s à 9s
    panelCards[0].innerHTML = `
      <div style="text-align:center; width:100%;">
        <div style="font-size:24px; font-weight:bold; margin-bottom:10px;">⏱️ ${timeLeft}s</div>
        <div style="font-size:14px;">Préparez-vous...</div>
      </div>
    `;
  }
  
  let currentTime = timeLeft;
  
  questionTimer = setInterval(() => {
    currentTime--;
    
    if (panelCards[0]) {
      panelCards[0].innerHTML = `
        <div style="text-align:center; width:100%;">
          <div style="font-size:24px; font-weight:bold; margin-bottom:10px;">⏱️ ${currentTime}s</div>
          <div style="font-size:14px;">Préparez-vous...</div>
        </div>
      `;
    }
    
    if (currentTime <= 0) {
      clearInterval(questionTimer);
      questionTimer = null;
      showQuestion(qObj);
    }
  }, 1000);
}

function startBlindTest() {
  console.log("🎵 startBlindTest appelé !");
  
  if (blindTestTimer) {
    clearInterval(blindTestTimer);
    blindTestTimer = null;
  }
  
const despacitoAudio = document.getElementById('blindTestAudio');
  const shapeAudio = document.getElementById('shapeOfYouAudio');
  const papaAudio = document.getElementById('papaOutaiAudio');
  const billieAudio = document.getElementById('billieJeanAudio');
  const weRockAudio = document.getElementById('weWillRockAudio');
  const daftAudio = document.getElementById('daftPunkAudio');
  const brunoAudio = document.getElementById('brunoMarsAudio');
  const macarenaAudio = document.getElementById('macarenaAudio');
  const queenAudio = document.getElementById('queenAudio');
  if (despacitoAudio) despacitoAudio.pause();
  if (shapeAudio) shapeAudio.pause();
  if (papaAudio) papaAudio.pause();
  if (billieAudio) billieAudio.pause();
  if (weRockAudio) weRockAudio.pause();
  if (daftAudio) daftAudio.pause();
  if (brunoAudio) brunoAudio.pause();
  if (macarenaAudio) macarenaAudio.pause();
  if (queenAudio) queenAudio.pause();
  
  const panel = document.getElementById('panel');
  const blindPhase = document.getElementById('blindTestPhase');
  
  if (!panel || !blindPhase) {
    console.error("❌ Éléments manquants !");
    return;
  }
  
  scene.classList.add('is-done');
  
  panel.setAttribute('aria-hidden', 'false');
  blindPhase.style.display = 'block';
  const allPanelCards = document.querySelectorAll('#panel .panel-card');
  
  allPanelCards.forEach((card, idx) => {
    if (card.id !== 'blindTestPhase') {
      card.style.display = 'block';
      card.style.visibility = 'visible';
      card.style.opacity = '1';
      card.style.pointerEvents = 'auto';
      
      if (idx === 1) card.textContent = 'Question ' + (spinsDone + 1);
      else if (idx === 2) card.innerHTML = '';
      else if (idx === 3) card.textContent = '';
    }
  });
  
  const song = blindTestSongs[Math.floor(Math.random() * blindTestSongs.length)];
  console.log("🎵 Chanson sélectionnée:", song.title);
  
let audio = null;
  if (song.title === "Shape of You") {
    audio = document.getElementById('shapeOfYouAudio');
  } else if (song.audio === "papaOutai") {
    audio = document.getElementById('papaOutaiAudio');
  } else if (song.audio === "billieJean") {
    audio = document.getElementById('billieJeanAudio');
} else if (song.audio === "weWillRock") {
    audio = document.getElementById('weWillRockAudio');
  } else if (song.audio === "daftPunk") {
    audio = document.getElementById('daftPunkAudio');
  } else if (song.audio === "brunomars") {
    audio = document.getElementById('brunoMarsAudio');
  } else if (song.audio === "macarena") {
    audio = document.getElementById('macarenaAudio');
  } else if (song.audio === "queen") {
    audio = document.getElementById('queenAudio');
  } else {
    audio = document.getElementById('blindTestAudio');
  }
  
  if (audio) {
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) audio.volume = volumeSlider.value / 100;
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.error("❌ Erreur audio:", err);
    });
  }
  
let timeLeft = 6;
  const totalTime = 6;
  
  const newTimerEl = document.getElementById('blindTestTimer');
  const newQuestionEl = document.getElementById('blindTestQuestion');
  
  // Timer dynamique avec barre de progression - version simplifiée
  if (newTimerEl) {
    // Reset complet
    newTimerEl.style.transition = 'none';
    newTimerEl.style.width = '100%';
    newTimerEl.classList.remove('low', 'medium');
    
    // Force reflow puis animation
    void newTimerEl.offsetWidth;
    newTimerEl.style.transition = 'width ' + totalTime + 's linear';
    newTimerEl.style.width = '0%';
  }
  if (newQuestionEl) newQuestionEl.textContent = 'Devine le titre !';
  
  blindTestTimer = setInterval(() => {
    timeLeft--;
    const timerElUpdate = document.getElementById('blindTestTimer');
    if (timerElUpdate) {
      // Changer la couleur selon le temps restant
      timerElUpdate.classList.remove('low', 'medium');
      if (timeLeft <= 2) {
        timerElUpdate.classList.add('low');
      } else if (timeLeft <= 3) {
        timerElUpdate.classList.add('medium');
      }
    }
    
    if (timeLeft <= 0) {
      if (audio) audio.pause();
      clearInterval(blindTestTimer);
      console.log("⏰ Timer terminé, affichage de la question...");
      showBlindTestQuestion(song);
    }
  }, 1000);
}

function showBlindTestQuestion(song) {
  console.log("🎯 showBlindTestQuestion appelé avec:", song.title);
  
  const blindPhase = document.getElementById('blindTestPhase');
  const panel = document.getElementById('panel');
  
  if (blindPhase) {
    blindPhase.style.display = 'none';
  }
  
  if (scene) scene.classList.add('is-done');
  panel.setAttribute('aria-hidden', 'false');
  
  const allPanelCards = document.querySelectorAll('#panel .panel-card');
  console.log("📋 Cartes trouvées dans showBlindTestQuestion:", allPanelCards.length);
  
  const questionCards = [];
  allPanelCards.forEach(card => {
    if (card.id !== 'blindTestPhase') questionCards.push(card);
  });
  
  console.log("📋 Question cards:", questionCards.length);
  
  if (questionCards[0]) {
    questionCards[0].style.display = 'block';
    questionCards[0].style.visibility = 'visible';
    questionCards[0].style.opacity = '1';
    questionCards[0].innerHTML = `
      <div style="text-align:center; width:100%;">
        <div style="font-size:14px; margin-bottom:10px;">Quel est le titre de la chanson ?</div>
      </div>
    `;
  }
  
  if (questionCards[1]) {
    questionCards[1].style.display = 'block';
    questionCards[1].style.visibility = 'visible';
    questionCards[1].style.opacity = '1';
    questionCards[1].innerHTML = '';
  }
  
  if (questionCards[2]) {
    questionCards[2].style.display = 'block';
    questionCards[2].style.visibility = 'visible';
    questionCards[2].style.opacity = '1';
    questionCards[2].textContent = '';
  }
  
  if (questionCards[1]) {
    const container = questionCards[1];
    container.innerHTML = '';
    let answered = false;
    
    song.choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer-btn';
      btn.textContent = choice;
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.style.padding = '14px 18px';
      btn.style.margin = '8px 0';
      btn.disabled = false;
      
      btn.addEventListener('click', function() {
        if (answered) return;
        
        if (choice === song.answer) {
          answered = true;
          btn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
          btn.style.boxShadow = '0 4px 15px rgba(46,204,113,0.5)';
          btn.style.color = 'white';
          btn.style.transform = 'scale(1.05)';
          
          const allBtns = container.querySelectorAll('.answer-btn');
          allBtns.forEach(b => b.disabled = true);
          
          if (questionCards[2]) {
            questionCards[2].textContent = 'Bonne réponse ! 🎉';
            questionCards[2].style.color = '#27ae60';
          }
          
          correctCount++;
          
          setTimeout(() => {
            if (panel) {
              panel.setAttribute('aria-hidden', 'true');
              panel.style.transform = 'translateY(-50%) translateX(120%)';
              panel.style.opacity = '0';
            }
            if (scene) scene.classList.remove('is-done');
            
            if (correctCount >= maxSpins) {
              setTimeout(() => window.location.href = 'wheel3.html', 300);
            } else if (spinsDone >= maxSpins) {
              setTimeout(() => window.location.href = lives === 0 ? 'fail.html' : 'wheel3.html', 300);
            } else {
              setTimeout(() => { if (spinBtn) spinBtn.disabled = false; }, 300);
            }
          }, 3000);
          
        } else {
          answered = false; // Allow retry
          btn.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
          btn.style.boxShadow = '0 4px 15px rgba(231,76,60,0.5)';
          btn.style.color = 'white';
          btn.style.transform = 'scale(0.95)';
          btn.disabled = true;
          
          lives = Math.max(0, lives - 1);
          updateLivesUI();
          
          if (questionCards[2]) {
            if (lives === 0) {
              questionCards[2].textContent = 'Plus de vies ! 💀';
              questionCards[2].style.color = '#e74c3c';
              setTimeout(() => window.location.href = 'fail.html', 1500);
            } else {
              questionCards[2].textContent = 'Mauvaise ! Réessayez... 🔥';
              questionCards[2].style.color = '#e67e22';
            }
          }
        }
      });
      container.appendChild(btn);
    });
  }
}

// ============================================
// SEGMENTS DE LA ROUETTE
// ============================================
let segments;
const body = document.body;

if (body.classList.contains('page-wheel3')) {
  segments = [
    { label: "Elodie", color: "#FF6B9D" },
    { label: "Kylian", color: "#4ECDC4" },
    { label: "Karlvin", color: "#FFE66D" },
    { label: "Alexis", color: "#95E1D3" },
  ];
} else if (body.classList.contains('page-wheel2')) {
// Wheel2: 8 segments numbers black
  segments = [
    { label: "1", color: "#000000" },
    { label: "2", color: "#1a1a1a" },
    { label: "3", color: "#2d2d2d" },
    { label: "4", color: "#404040" },
    { label: "5", color: "#000000" },
  ];

 } else {
  segments = [
    { label: "Facile", color: "#4fc3a3" },
    { label: "Moyen", color: "#f6c23e" },
    { label: "Facile", color: "#3fb993" },
    { label: "Énigme", color: "#f39c12" },
    { label: "Facile", color: "#76c96a" },
    { label: "Difficile", color: "#e74c3c" },
    { label: "Moyen", color: "#f2b72f" },
    { label: "Rejoue ↻", color: "#2aa6a1" },
  ];
}

let spinsDone = 0;
let correctCount = 0;
let blindTestPlayed = false;
const maxSpins = 3; // Wheel1/2/3: 3 correct answers to advance

if (wheel && segmentsGroup && spinBtn) {
  const cx = 100, cy = 100;
  const R = 92;
  const rText = 68;
  const slice = 360 / segments.length;
  const deg2rad = (d) => (d * Math.PI) / 180;

  function polarToXY(centerX, centerY, radius, angleDeg) {
    const a = deg2rad(angleDeg);
    return {
      x: centerX + radius * Math.cos(a),
      y: centerY + radius * Math.sin(a),
    };
  }

  function wedgePath(startDeg, endDeg) {
    const s = startDeg - 90;
    const e = endDeg - 90;
    const p1 = polarToXY(cx, cy, R, s);
    const p2 = polarToXY(cx, cy, R, e);
    const largeArc = (endDeg - startDeg) > 180 ? 1 : 0;

    return [
      `M ${cx} ${cy}`,
      `L ${p1.x} ${p1.y}`,
      `A ${R} ${R} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
      "Z",
    ].join(" ");
  }

  function addSegment(i) {
    const start = i * slice;
    const end = (i + 1) * slice;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", wedgePath(start, end));
    path.setAttribute("fill", segments[i].color);
    path.setAttribute("stroke", "#ffffff");
    path.setAttribute("stroke-width", "3");
    segmentsGroup.appendChild(path);

    const mid = (start + end) / 2;
    const midShifted = mid - 90;
    const pos = polarToXY(cx, cy, rText, midShifted);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", pos.x);
    text.setAttribute("y", pos.y);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    const labelText = segments[i].label;
    text.setAttribute("font-size", "9");
    text.setAttribute("font-weight", "800");
    text.setAttribute("fill", "#ffffff");

    const parts = labelText.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0];
      const rest = parts.slice(1).join(' ');

      const t1 = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      t1.setAttribute('x', pos.x);
      t1.setAttribute('dy', '-6');
      t1.textContent = first;

      const t2 = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      t2.setAttribute('x', pos.x);
      t2.setAttribute('dy', '12');
      t2.textContent = rest;

      text.appendChild(t1);
      text.appendChild(t2);
    } else {
      text.textContent = labelText;
    }

    text.setAttribute("transform", `rotate(${mid} ${pos.x} ${pos.y})`);
    segmentsGroup.appendChild(text);
  }

  segmentsGroup.innerHTML = "";
  segments.forEach((_, i) => addSegment(i));

  let angle = 0;
  let spinning = false;
  let transitionTimeout = null;

  function handleSpinComplete() {
    if (!spinning) return;
    
    console.log("🎯 Spin complete handler triggered");
    console.log("Body classes:", document.body.className);
    
    const norm = ((angle % 360) + 360) % 360;
    const index = Math.floor(((360 - norm) % 360) / slice) % segments.length;
    const label = segments[index].label;
    
// Gestion de "Rejoue ↻" pour toutes les pages
    if (label === "Rejoue ↻") {
      console.log("🔄 Rejoue détecté, reload de la page...");
      
      if (result) result.textContent = `Résultat : ${label} - Rejouez !`;
      
      setTimeout(() => {
        const panel = document.getElementById('panel');
        if (panel) {
          panel.setAttribute('aria-hidden', 'true');
          panel.style.transform = 'translateY(-50%) translateX(120%)';
        }
        if (scene) scene.classList.remove('is-done');
        if (spinBtn) spinBtn.disabled = false;
      }, 1500);
      
      spinning = false;
      return;
    }
    
    // Pour wheel2 : BLIND TEST SUR TOUS LES SPINS
    if (document.body.classList.contains('page-wheel2')) {
      console.log("✅ wheel2: BLIND TEST TOUS SPINS");
      
      spinsDone++;
      console.log("🎰 Blindtest #", spinsDone, "/", maxSpins);
      
      if (scene) scene.classList.add('is-done');
      
      // Reset panel
      const panel = document.getElementById('panel');
      if (panel) panel.style.cssText = '';
      
      startBlindTest();
      spinning = false;
      
      if (transitionTimeout) {
        clearTimeout(transitionTimeout);
        transitionTimeout = null;
      }
      return;
    }
    
    if (result) result.textContent = `Résultat : ${label}`;
    
    spinsDone++;
    const qObj = pickQuestionFor(label);
    if (qObj) {
      showQuestion(qObj);
    }
    
    spinning = false;
    
    if (transitionTimeout) {
      clearTimeout(transitionTimeout);
      transitionTimeout = null;
    }
  }

  spinBtn.addEventListener("click", () => {
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    if (result) result.textContent = "";

    if (scene) scene.classList.remove("is-done");

    const extra = Math.random() * 360;
    const spins = 1080 + Math.random() * 1080;
    angle = angle + spins + extra;

    segmentsGroup.style.transform = `rotate(${angle}deg)`;
    
    if (transitionTimeout) clearTimeout(transitionTimeout);
    transitionTimeout = setTimeout(() => {
      console.log("⏰ Timeout de secours déclenché");
      handleSpinComplete();
    }, 3500);
  });

  segmentsGroup.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "transform") return;
    if (!spinning) return;
    
    if (transitionTimeout) {
      clearTimeout(transitionTimeout);
      transitionTimeout = null;
    }
    
    handleSpinComplete();
  });
}

// ============================================
// QUESTIONS
// ============================================
const questionsWheel1 = {
  "Facile": [
    { q: "À quoi sert un bouton ?", choices: ["Cliquer", "Décorer la page", "Stocker des données"], answer: 0 },
    { q: "Que se passe-t-il quand je clique sur un bouton ?", choices: ["Le site s'éteint", "Une action se déclenche", "Le PC redémarre"], answer: 1 },
    { q: "Que signifie 'Bravo' à l'écran ?", choices: ["Une erreur", "Une réussite", "Un bug"], answer: 1 },
    { q: "Un site web, c'est…", choices: ["Une page sur Internet", "Une application téléphone uniquement", "Un jeu vidéo"], answer: 0 }
  ],
  "Moyen": [
    { q: "Pour changer la couleur d'un bouton, on modifie :", choices: ["Le texte", "L'apparence", "Le son"], answer: 1 },
    { q: "Si un élément 'apparaît', ça veut dire :", choices: ["Il disparaît", "Il devient visible", "Il est supprimé"], answer: 1 },
    { q: "Une animation, c'est :", choices: ["Un calcul", "Un mouvement ou effet visuel", "Une erreur"], answer: 1 },
    { q: "Si je clique et qu'il se passe quelque chose :", choices: ["C'est un hasard", "C'est une interaction", "C'est un bug"], answer: 1 }
  ],
  "Difficile": [
    { q: "Si rien ne se passe quand je clique :", choices: ["C'est normal", "Il y a un problème", "C'est fini"], answer: 1 },
    { q: '"404 chance not found" veut dire :', choices: ["J'ai gagné", "Le site est cassé", "Je n'ai pas eu de chance 😄"], answer: 1 },
    { q: "Si je fais une erreur :", choices: ["Je continue quand même", "Je gagne plus", "Je recommence à zéro"], answer: 2 },
    { q: "Plus je réussis :", choices: ["Moins je gagne", "Rien ne change", "Plus je gagne"], answer: 2 }
  ],
  "Énigme": [
    { q: "Complétez la suite : 1 - 3 - 5 - ?", choices: ["6", "7", "8"], answer: 1 },
    { q: "Complétez la suite : 2 - 4 - 8 - 16 - ?", choices: ["24", "32", "36"], answer: 1 },
    { q: "Complétez la suite : A - C - E - G - ?", choices: ["H", "I", "J"], answer: 1 }
  ],
  "Rejoue ↻": []
};

const questionsWheel2 = {
  "1": [
    { q: "Pour aller sur un site, on clique sur :", choices: ["Un lien", "Une image", "Un son"], answer: 0 }
  ],
  "2": [
    { q: "Un écran noir signifie :", choices: ["Le site fonctionne", "Une erreur ou veille", "Le chargement"], answer: 1 }
  ],
  "3": [
    { q: "Pour valider un formulaire, on clique sur :", choices: ["Effacer", "Envoyer", "Supprimer"], answer: 1 }
  ],
  "4": [
    { q: "Si le texte est petit, on peut :", choices: ["Le cacher", "Zoomer", "L'effacer"], answer: 1 }
  ],
  "5": [
    { q: "Qui est surnommé le Roi de la Pop ?", choices: ["Michael Jackson", "Elvis Presley", "Justin Bieber"], answer: 0 }
  ],
  "6": [
    { q: "Un site lent veut dire :", choices: ["Il est cassé", "Problème de connexion ou serveur", "C'est fini"], answer: 1 }
  ],
  "7": [
    { q: '"Erreur 500" signifie :', choices: ["Tout va bien", "Problème serveur", "Victoire"], answer: 1 }
  ],
  "8": [
    { q: "Si le son ne marche pas :", choices: ["Le site est muet", "Problème de son ou muted", "C'est normal"], answer: 1 }
  ]
};


const questionsWheel3 = {
  "Elodie": [
    { q: "Sur le jeux  ?", choices: ["Rose", "Bleu", "Vert"], answer: 0 },
    { q: "Elodie aime les... ?", choices: ["Fleurs", "Sports", "Voitures"], answer: 0 }
  ],
  "Kyllian": [
    { q: "Kylian est bon en... ?", choices: ["Maths", "Dessin", "Cuisine"], answer: 0 },
    { q: "Quel sport aime Kylian ?", choices: ["Football", "Natation", "Escalade"], answer: 0 }
  ],
  "Karlvin": [
    { q: "Karlvin résout les énigmes en combien de temps ?", choices: ["Rapide", "Lent", "Jamais"], answer: 0 },
    { q: "Quel est le challenge préféré de Karlvin ?", choices: ["Difficile", "Facile", "Moyen"], answer: 0 }
  ],
  "Alexis": [
    { q: "De quel couleur était le mage du jeux Devine le mot?", choices: ["Bleu", "Rouge", "Vert"], answer: 0 },
    { q: "Quel est le super pouvoir du mage ?", choices: ["Eau", "Feux", "Terre"], answer: 1 }
  ]
};

const questions = {
  "Niveau Facile": [
    { q: "Quelle couleur a la licorne ?", choices: ["Rose","Bleu","Vert"], answer: 0 },
    { q: "Combien de cornes ?", choices: ["1","2","3"], answer: 0 }
  ],
  "Niveau Moyen": [
    { q: "Question moyen 1 ?", choices: ["A","B","C"], answer: 1 }
  ],
  "Niveau Difficile": [
    { q: "Question difficile ?", choices: ["X","Y","Z"], answer: 2 }
  ],
  "Bonus 🎁": [
    { q: "Quel est le cadeau ?", choices: ["Bonbon","Étoile"], answer: 0 }
  ],
  "Rejoue ↻": []
};


function pickQuestionFor(label){
  let questionsData;
  const body = document.body;
  
  if (body.classList.contains('page-wheel3')) {
    questionsData = questionsWheel3;
  } else if (body.classList.contains('page-wheel2')) {
    questionsData = questionsWheel2;
  } else {
    questionsData = questionsWheel1;
  }
  
  const pool = questionsData[label] || [];
  if(!pool.length) return null;
  return pool[Math.floor(Math.random()*pool.length)];
}

// ============================================
// GESTION DES VIES
// ============================================
let lives = 3;
const maxToNext = 3;

function updateLivesUI(){
  const hearts = document.querySelector('.hearts');
  if(!hearts) return;
  
  let html = '';
  for(let i = 0; i < 3; i++){
    const isActive = i < lives;
    
    html += `<svg class="heart-svg ${isActive ? '' : 'lost'}" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="heartGrad${i}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff6b9d"/>
          <stop offset="100%" style="stop-color:#e34"/>
        </linearGradient>
      </defs>
      <path fill="url(#heartGrad${i})" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>`;
  }
  hearts.innerHTML = html;
}

updateLivesUI();

function showQuestion(qObj){
  if (questionTimer) {
    clearInterval(questionTimer);
    questionTimer = null;
  }
  
  const panel = document.getElementById('panel');
  if(!panel) return;
  const panelCards = panel.querySelectorAll('.panel-card');

  if(panelCards[0]) panelCards[0].textContent = qObj.q || '';

  if(panelCards[1]){
    const container = panelCards[1];
    container.innerHTML = '';
    delete container.dataset.answered;

    (qObj.choices || []).forEach((c, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer-btn';
      btn.textContent = c;
      btn.disabled = false;
      btn.addEventListener('click', () => checkAnswer(i, qObj.answer));
      container.appendChild(btn);
    });
  }

  if(panelCards[2]) panelCards[2].textContent = '';

  scene.classList.add('is-done');
  panel.setAttribute('aria-hidden','false');
  if (spinBtn) spinBtn.disabled = true;

}

function checkAnswer(choiceIndex, correctIndex){
  const panelCards = document.querySelectorAll('.panel-card');
  const feedbackCard = panelCards[2] || null;
  const choicesContainer = panelCards[1];
  const buttons = choicesContainer ? Array.from(choicesContainer.querySelectorAll('.answer-btn')) : [];

  if (choicesContainer && choicesContainer.dataset.answered === 'true') return;

  const clickedBtn = buttons[choiceIndex];
  if (clickedBtn) clickedBtn.disabled = true;

  if (choiceIndex === correctIndex){
    if (clickedBtn) clickedBtn.classList.add('correct');
    if (feedbackCard) {
      feedbackCard.textContent = 'Bonne réponse !';
      feedbackCard.style.color = '#27ae60';
    }

    correctCount++;
    if (choicesContainer) choicesContainer.dataset.answered = 'true';

    setTimeout(() => {
      buttons.forEach(b => { b.disabled = false; b.classList.remove('selected','wrong','correct'); });

      const panel = document.getElementById('panel');
      if (panel) panel.setAttribute('aria-hidden','true');
      if (scene) scene.classList.remove('is-done');

      if (correctCount >= maxSpins){
        window.location.href = getNextPage();
        return;
      }

      if (spinsDone >= maxSpins){
        if (correctCount >= maxSpins){
          window.location.href = getNextPage();
        } else if (lives === 0) {
          window.location.href = 'fail.html';
        } else {
          window.location.href = getNextPage();
        }
        return;
      }

      if (spinBtn) spinBtn.disabled = false;
    }, 2000);

    return;
  }

  lives = Math.max(0, lives - 1);
  updateLivesUI();
  if (clickedBtn) clickedBtn.classList.add('wrong');
  if (feedbackCard) {
    feedbackCard.textContent = `Mauvaise réponse — il vous reste ${lives} cœur(s)`;
    feedbackCard.style.color = '#e67e22';
  }

  if (lives === 0){
    setTimeout(() => { window.location.href = 'fail.html'; }, 800);
    return;
  }
}

function gameOver(){
  const panelCards = document.querySelectorAll('.panel-card');
  if(panelCards[0]) panelCards[0].textContent = 'Game Over — plus de vies';
  if(scene) scene.classList.add('is-done');
}

// ============================================
// CONTRÔLE DU VOLUME
// ============================================
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const blindTestAudio = document.getElementById('blindTestAudio');
const shapeOfYouAudio = document.getElementById('shapeOfYouAudio');
const papaOutaiAudio = document.getElementById('papaOutaiAudio');
const billieJeanAudio = document.getElementById('billieJeanAudio');
const weWillRockAudio = document.getElementById('weWillRockAudio');
const daftPunkAudio = document.getElementById('daftPunkAudio');
const brunoMarsAudio = document.getElementById('brunoMarsAudio');
const macarenaAudio = document.getElementById('macarenaAudio');
const queenAudio = document.getElementById('queenAudio');
const spinSound = document.getElementById('spinSound');

function updateVolume() {
  if (!volumeSlider) return;
  
  const volume = volumeSlider.value / 100;
  
  if (volumeValue) {
    volumeValue.textContent = volumeSlider.value + '%';
  }
  
  if (blindTestAudio) blindTestAudio.volume = volume;
  if (shapeOfYouAudio) shapeOfYouAudio.volume = volume;
  if (papaOutaiAudio) papaOutaiAudio.volume = volume;
  if (billieJeanAudio) billieJeanAudio.volume = volume;
  if (weWillRockAudio) weWillRockAudio.volume = volume;
  if (daftPunkAudio) daftPunkAudio.volume = volume;
  if (brunoMarsAudio) brunoMarsAudio.volume = volume;
  if (macarenaAudio) macarenaAudio.volume = volume;
  if (queenAudio) queenAudio.volume = volume;
  if (spinSound) spinSound.volume = volume;
}

if (volumeSlider) {
  updateVolume();
  
  volumeSlider.addEventListener('input', function() {
    updateVolume();
  });
}
