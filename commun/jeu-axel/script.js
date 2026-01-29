/* =========================================================
   BADGES (ton code, inchangé)
   ========================================================= */

// On récupère toutes les cartes (badges)
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


/* =========================================================
   ROUE (ajout)
   ========================================================= */

const wheel = document.getElementById("wheel");
const segmentsGroup = document.getElementById("segments");
const spinBtn = document.getElementById("spin");
const result = document.getElementById("result");


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

  segments.forEach((_, i) => addSegment(i));

  let angle = 0;
  let spinning = false;

  spinBtn.addEventListener("click", () => {
    if (spinning) return;
    spinning = true;
    if (result) result.textContent = "";

    const extra = Math.random() * 360;
    const spins = 1080 + Math.random() * 1080; // 3 à 6 tours
    angle = angle + spins + extra;

    wheel.style.transform = `rotate(${angle}deg)`;

    // ✅ Débloque + calcule le résultat quand la transition est vraiment finie
wheel.addEventListener("transitionend", () => {
  const norm = ((angle % 360) + 360) % 360;
  const index = Math.floor(((360 - norm) % 360) / slice) % segments.length;

  if (result) result.textContent = `Résultat : ${segments[index].label}`;
  spinning = false;
}, { once: true });

  });
}
