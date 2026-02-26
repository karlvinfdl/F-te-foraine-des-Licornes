// ✨ Paillettes sur le bouton PLAY
const playBtn = document.querySelector(".play");

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function burstSparkles(btn, clientX, clientY) {
  const rect = btn.getBoundingClientRect();

  // point d'origine = endroit du clic (dans le bouton)
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const count = 18;

  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "spark";

    // position de départ
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;

    // trajectoire aléatoire
    const dx = rand(-120, 120);
    const dy = rand(-90, 90);
    s.style.setProperty("--dx", `${dx}px`);
    s.style.setProperty("--dy", `${dy}px`);

    // taille aléatoire
    const size = rand(5, 11);
    s.style.width = `${size}px`;
    s.style.height = `${size}px`;

    // couleur "paillettes"
    const colors = ["#fff2ff", "#ffd6ff", "#fff7c2", "#c9fff5", "#ffd1a6"];
    s.style.background = colors[Math.floor(Math.random() * colors.length)];

    btn.appendChild(s);

    s.addEventListener("animationend", () => s.remove());
  }
}

if (playBtn) {
  playBtn.addEventListener("click", (e) => {
    burstSparkles(playBtn, e.clientX, e.clientY);
  });
}

// section badge (donc diamant etc)
const cards = document.querySelectorAll('.ach-card');

if (!cards.length) {
  console.warn("Aucune carte trouvée : vérifie .ach-card dans ton HTML");
}

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


/* Roue + animation slider */

const wheel = document.getElementById("wheel");
const segmentsGroup = document.getElementById("segments");
const spinBtn = document.getElementById("spin");
const result = document.getElementById("result");
const scene = document.getElementById("scene"); // ✅ wrapper

// compteur global de tours et de bonnes réponses
let spinsDone = 0;
let correctCount = 0;
const maxSpins = 3;

if (wheel && segmentsGroup && spinBtn) {
  const segments = [
    { label: "Niveau Facile", color: "#4fc3a3" },
    { label: "Niveau Facile", color: "#3fb993" },
    { label: "Niveau Facile", color: "#76c96a" },
    { label: "Niveau Moyen", color: "#f6c23e" },
    { label: "Niveau Moyen", color: "#f2b72f" },
    { label: "Niveau Difficile", color: "#e74c3c" },
    { label: "Bonus 🎁", color: "#f39c12" },
    { label: "Rejoue ↻", color: "#2aa6a1" },
  ];

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
    // réduire la taille de police pour les labels longs
    const labelText = segments[i].label;
    text.setAttribute("font-size", "9");
    text.setAttribute("font-weight", "800");
    text.setAttribute("fill", "#ffffff");

    // split label into two lines when possible (e.g. "Niveau Facile")
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

  spinBtn.addEventListener("click", () => {
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    if (result) result.textContent = "";

    // reset de la roue si on rejoue
    if (scene) scene.classList.remove("is-done");

    const extra = Math.random() * 360;
    const spins = 1080 + Math.random() * 1080; // 3 à 6 tours
    angle = angle + spins + extra;

    // rotate only the segments group so the center stays fixed
    segmentsGroup.style.transform = `rotate(${angle}deg)`;
  });


  segmentsGroup.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "transform") return;
    if (!spinning) return;

    const norm = ((angle % 360) + 360) % 360;
    const index = Math.floor(((360 - norm) % 360) / slice) % segments.length;

    const label = segments[index].label;
    if (result) result.textContent = `Résultat : ${label}`;

    // Special case: "Rejoue" segment should let the player spin again without consuming a spin
    if (label && label.toLowerCase().includes('rejoue')) {
      // brief feedback in the panel header (don't count as a spin)
      const panelCards = document.querySelectorAll('.panel-card');
      if (panelCards[0]) panelCards[0].textContent = "Rejoue !";
      const panel = document.getElementById('panel');
      if (panel) panel.setAttribute('aria-hidden','false');
      if (scene) scene.classList.add('is-done');

      // allow the player to spin again shortly
      setTimeout(() => {
        if (panel) panel.setAttribute('aria-hidden','true');
        if (scene) scene.classList.remove('is-done');
        if (spinBtn) spinBtn.disabled = false;
      }, 900);

      spinning = false;
      return;
    }

    // count this completed spin (normal segments)
    spinsDone++;

    // afficher question correspondant au label
    const qObj = pickQuestionFor(label);
    if (qObj) {
      showQuestion(qObj); // showQuestion will keep spinBtn disabled until answered
    } else {
      // pas de question — afficher message et gérer fin si spins épuisés
      const panelCards = document.querySelectorAll('.panel-card');
      if (panelCards[0]) panelCards[0].textContent = "Pas de question, rejoue !";
      const panel = document.getElementById('panel');
      if (panel) panel.setAttribute('aria-hidden','false');
      if (scene) scene.classList.add('is-done');

      if (spinsDone >= maxSpins) {
        if (correctCount >= maxSpins) {
          setTimeout(() => window.location.href = 'wheel2.html', 900);
        } else if (lives === 0) {
          setTimeout(() => window.location.href = 'fail.html', 900);
        } else {
          // pas mort mais pas toutes bonnes -> continuer sur la roue suivante
          setTimeout(() => window.location.href = 'wheel2.html', 900);
        }
      } else {
        // allow next spin after a short delay
        setTimeout(() => { if (spinBtn) spinBtn.disabled = false; }, 900);
      }
    }

    spinning = false;
  });
 }

// et ici les questions
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
  const pool = questions[label] || [];
  if(!pool.length) return null;
  return pool[Math.floor(Math.random()*pool.length)];
}

// initialiser vies UI
let lives = 3;
// nombre de spins effectués est dans spinsDone
const maxToNext = 3;   // si tu veux utiliser ailleurs

function updateLivesUI(){
  const hearts = document.querySelector('.hearts');
  if(!hearts) return;
  hearts.innerHTML = '❤'.repeat(lives) + '♡'.repeat(3 - lives);
}

// appeler au chargement pour synchroniser affichage cœurs
updateLivesUI();

// fonctions d'affichage / gestion des questions
function showQuestion(qObj){
  const panel = document.getElementById('panel');
  if(!panel) return;
  const panelCards = panel.querySelectorAll('.panel-card');

  // question
  if(panelCards[0]) panelCards[0].textContent = qObj.q || '';

  // choices dans la 2ᵉ carte
  if(panelCards[1]){
    const container = panelCards[1];
    // reset container and make sure any previous "answered" flag is cleared
    container.innerHTML = '';
    delete container.dataset.answered;

    (qObj.choices || []).forEach((c, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'answer-btn';
      btn.textContent = c;
      // ensure the button starts enabled
      btn.disabled = false;
      btn.addEventListener('click', () => checkAnswer(i, qObj.answer));
      container.appendChild(btn);
    });
  }

  // feedback vide
  if(panelCards[2]) panelCards[2].textContent = '';

  panel.setAttribute('aria-hidden','false');
  if(scene) scene.classList.add('is-done');
  // keep spin disabled while question is active
  if (spinBtn) spinBtn.disabled = true;
}

function checkAnswer(choiceIndex, correctIndex){
  const panelCards = document.querySelectorAll('.panel-card');
  const feedbackCard = panelCards[2] || null;
  const choicesContainer = panelCards[1];
  const buttons = choicesContainer ? Array.from(choicesContainer.querySelectorAll('.answer-btn')) : [];

  // safety: if already answered correctly, ignore
  if (choicesContainer && choicesContainer.dataset.answered === 'true') return;

  const clickedBtn = buttons[choiceIndex];
  if (clickedBtn) clickedBtn.disabled = true; // prevent immediate double-click

  if (choiceIndex === correctIndex){
    // correct answer: mark and proceed
    if (clickedBtn) clickedBtn.classList.add('correct');
    if (feedbackCard) feedbackCard.textContent = 'Bonne réponse !';

    correctCount++;
    // mark as answered so future clicks are ignored
    if (choicesContainer) choicesContainer.dataset.answered = 'true';

    // small delay so the user sees feedback, then close panel and continue
    setTimeout(() => {
      // cleanup
      buttons.forEach(b => { b.disabled = false; b.classList.remove('selected','wrong','correct'); });

      const panel = document.getElementById('panel');
      if (panel) panel.setAttribute('aria-hidden','true');
      if (scene) scene.classList.remove('is-done');

      // check immediate victory
      if (correctCount >= maxSpins){
        window.location.href = 'wheel2.html';
        return;
      }

      // if spins exhausted, decide next screen
      if (spinsDone >= maxSpins){
        if (correctCount >= maxSpins){
          window.location.href = 'wheel2.html';
        } else if (lives === 0) {
          window.location.href = 'fail.html';
        } else {
          window.location.href = 'wheel2.html';
        }
        return;
      }

      // otherwise re-enable spin for next round
      if (spinBtn) spinBtn.disabled = false;
    }, 900);

    return;
  }

  // wrong answer: consume one life, mark the button wrong, let player try remaining choices
  lives = Math.max(0, lives - 1);
  updateLivesUI();
  if (clickedBtn) clickedBtn.classList.add('wrong');
  if (feedbackCard) feedbackCard.textContent = `Mauvaise réponse — il vous reste ${lives} cœur(s)`;

  // defeat if no lives left
  if (lives === 0){
    setTimeout(() => { window.location.href = 'fail.html'; }, 800);
    return;
  }

  // keep other buttons enabled so the player can try again; do not close the panel
}

function gameOver(){
  const panelCards = document.querySelectorAll('.panel-card');
  if(panelCards[0]) panelCards[0].textContent = 'Game Over — plus de vies';
  if(scene) scene.classList.add('is-done');
}