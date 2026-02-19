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
    text.setAttribute("font-size", "12");
    text.setAttribute("font-weight", "800");
    text.setAttribute("fill", "#ffffff");

    text.setAttribute("transform", `rotate(${mid} ${pos.x} ${pos.y})`);
    text.textContent = segments[i].label;
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

    wheel.style.transform = `rotate(${angle}deg)`;
  });


  wheel.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "transform") return;
    if (!spinning) return;

    const norm = ((angle % 360) + 360) % 360;
    const index = Math.floor(((360 - norm) % 360) / slice) % segments.length;

    if (result) result.textContent = `Résultat : ${segments[index].label}`;

    spinning = false;
    spinBtn.disabled = false;

    // pop up 
    if (scene) scene.classList.add("is-done");
  });
}
