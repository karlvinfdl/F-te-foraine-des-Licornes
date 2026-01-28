// ============================
// GESTION AUDIO
// ============================

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playSound(soundName) {
  if (typeof gameState !== "undefined" && !gameState.soundEnabled) return;

  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    if (soundName === "click") playTap(ctx);
  } catch (error) {
    console.error("Erreur audio:", error);
  }
}

function playTone(ctx, frequency, duration, type = "sine", volume = 0.2) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playTap(ctx) {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.13);

  const noiseDur = 0.03;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * noiseDur), ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.setValueAtTime(1200, now);

  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.0001, now);
  nGain.gain.exponentialRampToValueAtTime(0.09, now + 0.002);
  nGain.gain.exponentialRampToValueAtTime(0.0001, now + noiseDur);

  noise.connect(hp);
  hp.connect(nGain);
  nGain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + noiseDur);
}

// ============================
// PLACEMENT DES LETTRES
// ============================

// ============================
// PLACEMENT DES LETTRES + BOUTON EFFACER
// ============================

document.addEventListener("DOMContentLoaded", function() {

  // Conteneur des tuiles (lettres disponibles)
  const tilesWrap = document.querySelector(".tuiles");

  // Ligne contenant les emplacements de réponse
  const answerLine = document.querySelector(".reponse__ligne");

  // Bouton "Effacer"
  const clearBtn = document.querySelector('[aria-label="Effacer"]');

  // Sécurité : si les éléments n'existent pas, on arrête
  if (!tilesWrap || !answerLine) {
    console.error("Elements not found:", { tilesWrap, answerLine });
    return;
  }

  // Liste des emplacements
  const slots = Array.from(answerLine.querySelectorAll(".reponse__lettre"));
  console.log("Slots found:", slots.length);

  const ensureTileIds = () => {
    const tiles = Array.from(tilesWrap.querySelectorAll(".tuile"));
    tiles.forEach((tile, i) => {
      if (!tile.dataset.tileId) {
        tile.dataset.tileId = `tile-${Date.now()}-${i}`;
      }
    });
  };

  const isSlotEmpty = (slot) => {
    const value = (slot.textContent || "").trim();
    return value === "_" || value === "";
  };

  const findFirstEmptySlot = () => slots.find(isSlotEmpty);

  const setTileUsed = (tile, used) => {
    tile.classList.toggle("tuile--inactive", used);
    tile.style.pointerEvents = used ? "none" : "";
    tile.setAttribute("aria-disabled", used ? "true" : "false");
  };

  const getTileLetter = (tile) => {
    const letterEl = tile.querySelector(".tuile__lettre");
    return (letterEl ? letterEl.textContent : tile.textContent).trim();
  };

  const placeTileIntoSlot = (tile, slot) => {
    if (!tile || !slot || !isSlotEmpty(slot)) return;

    const letter = getTileLetter(tile);
    if (!letter) return;

    slot.textContent = letter;
    slot.classList.add("reponse__lettre--pleine");
    slot.dataset.tileId = tile.dataset.tileId;

    setTileUsed(tile, true);
  };

  const clearSlot = (slot) => {
    if (!slot || isSlotEmpty(slot)) return;

    const tileId = slot.dataset.tileId;

    if (tileId) {
      const tile = tilesWrap.querySelector(`.tuile[data-tile-id="${tileId}"]`);
      if (tile) setTileUsed(tile, false);
    }

    slot.textContent = "_";
    slot.classList.remove("reponse__lettre--pleine");
    delete slot.dataset.tileId;
  };

  const clearAllSlots = () => {
    slots.forEach(clearSlot);
  };

  // INITIALISATION
  ensureTileIds();

  // INTERACTIONS
  tilesWrap.addEventListener("click", (e) => {
    const tile = e.target.closest(".tuile");
    if (!tile) return;

    const slot = findFirstEmptySlot();
    if (!slot) return;

    // playSound("click");
    placeTileIntoSlot(tile, slot);
  });

  answerLine.addEventListener("click", (e) => {
    const slot = e.target.closest(".reponse__lettre");
    if (!slot || isSlotEmpty(slot)) return;

    clearSlot(slot);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", clearAllSlots);
  }

});
