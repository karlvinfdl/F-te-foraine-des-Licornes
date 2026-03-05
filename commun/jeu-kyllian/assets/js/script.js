class UnicornShooter {
    constructor() {
        // 1. VARIABLES
        this.score = 0;
        this.totalScore = 0;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentLevel = 1;
        this.spawnRate = 700;
        this.pseudo = "JOUEUR";
        this.targets = [];
        this.timerInterval = null;
        this.spawnTimeout = null;
        this.comboCount = 0;
        this.lastHitTime = 0;

        // 2. ÉLÉMENTS DOM
        this.gameArea = document.getElementById('levelContainer');
        this.scoreElement = document.getElementById('scoreValue');
        this.timerElement = document.getElementById('timerValue');
        this.startMsg = document.getElementById('startMessage');
        this.welcomeOverlay = document.getElementById('welcomeOverlay');
        this.endOverlay = document.getElementById('endOverlay');
        this.nameInput = document.getElementById('playerNameInput');
        this.startBtn = document.getElementById('startGameBtn');
        
        this.targetImages = [
            '../assets/images/licorne_variante_1.png',
            '../assets/images/licorne_variante_2.png',
            '../assets/images/licorne_variante_3.png',
            '../assets/images/licorne_variante_4.png',
            '../assets/images/licorne_variante_5.png',
            '../assets/images/licorne_variante_6.png'
        ];

        this.setupWelcome();
        this.setupPause();
    }

    // 3. ÉCRAN D'ACCUEIL
    setupWelcome() {
        this.startBtn.onclick = () => {
            const val = this.nameInput.value.trim();
            if (val !== "") {
                this.pseudo = val.toUpperCase();
                this.welcomeOverlay.style.display = "none";
                this.initLevel();
            } else {
                alert("Entre un pseudo pour commencer !");
            }
        };
    }

    // 4. BOUTON PAUSE (Correction : utilisable à l'infini)
    setupPause() {
        const pauseBtn = document.getElementById('pauseBtn');
        if (!pauseBtn) return;

        pauseBtn.onclick = () => {
            // On ne peut pauser que si le jeu a démarré
            if (!this.isPlaying) return;

            this.isPaused = !this.isPaused;

            if (this.isPaused) {
                // ÉTAT PAUSE
                pauseBtn.textContent = "▶";
                this.gameArea.style.pointerEvents = 'none';
                this.gameArea.style.filter = "blur(4px)";
                // On stoppe les timers pour économiser les ressources
                clearInterval(this.timerInterval);
                clearTimeout(this.spawnTimeout);
            } else {
                // ÉTAT REPRISE
                pauseBtn.textContent = "⏸";
                this.gameArea.style.pointerEvents = 'auto';
                this.gameArea.style.filter = "none";
                // On relance tout proprement
                this.startTimer();
                this.spawnLoop();
            }
        };
    }

    // 5. LANCEMENT DU NIVEAU
    initLevel() {
        this.startMsg.style.display = "block";
        this.startMsg.textContent = "Prêt " + this.pseudo + " ?";
        
        setTimeout(() => { this.startMsg.textContent = "Attention..."; }, 1000);
        setTimeout(() => { this.startMsg.textContent = "C'est parti !"; }, 2000);
        
        setTimeout(() => {
            this.startMsg.style.display = "none";
            this.isPlaying = true;
            this.isPaused = false;
            this.startTimer();
            this.spawnLoop();
            this.update(); // Boucle requestAnimationFrame
        }, 3000);
    }

    // 6. GESTION DU TEMPS
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.isPlaying && !this.isPaused) {
                this.timeLeft--;
                this.updateUI();
                if (this.timeLeft <= 0) this.endGame();
            }
        }, 1000);
    }

    updateUI() {
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        this.timerElement.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        this.scoreElement.textContent = this.score;
    }

    // 7. APPARITION DES LICORNES
spawnLoop() {
    if (this.isPlaying && !this.isPaused) {
        let img;

        // On définit une chance sur 20 (5%) de faire apparaître la cible rare
        if (Math.random() < 0.05) {
            // Chemin vers ta cible rare (assure-toi que le nom correspond exactement)
            img = '../assets/images/Tokyo_Cuistot.png';
        } else {
            // Sinon, on prend une image au hasard parmis les autres
            // On filtre pour exclure Tokyo_Cuistot de la liste "normale"
            const normalImages = this.targetImages.filter(path => !path.includes('Tokyo_Cuistot.png'));
            img = normalImages[Math.floor(Math.random() * normalImages.length)];
        }

        this.targets.push(new Target(img, this));
    }
    
    // Prépare la prochaine licorne même en pause, mais elle ne s'affichera que si isPaused est false
    const nextSpawn = this.spawnRate + Math.random() * 1000;
    this.spawnTimeout = setTimeout(() => this.spawnLoop(), nextSpawn);
}
    // 8. BOUCLE DE MOUVEMENT (Animation)
    update() {
        if (this.isPlaying && !this.isPaused) {
            this.targets.forEach((target, index) => {
                target.move();
                // Supprime si elle sort de l'écran par le bas
                if (target.y > window.innerHeight + 100) {
                    target.remove();
                    this.targets.splice(index, 1);
                }
            });
        }
        requestAnimationFrame(() => this.update());
    }

    // 9. FIN DE NIVEAU
    endGame() {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        clearTimeout(this.spawnTimeout);

        this.totalScore += this.score;
        document.getElementById('finalScore').textContent = this.score;
        this.endOverlay.style.display = "flex";

     // --- RENDRE LE COMMENTAIRE DYNAMIQUE ---
    const commentElement = document.getElementById('endComment');
    
    if (this.score === 0) {
        commentElement.textContent = "Tu as dormi ???";
    } else if (this.score < 100) {
        commentElement.textContent = "Pas ouf, tout ça...";
    } else if (this.score < 400) {
        commentElement.textContent = "Mouais pas trop mal...";
    } else if (this.score < 700) {
        commentElement.textContent = "Je dirai pas que t'es meilleur mais tu progresses...";
    } else {
        commentElement.textContent = "Mais c'est que tu commences à devenir bon dis moi !";
    }
        // Gérer le clic sur le bouton de l'overlay de fin
        const continueBtn = document.querySelector('.click-to-continue');
        if (continueBtn) {
            continueBtn.onclick = (e) => {
                e.stopPropagation(); // Évite les doubles clics
                if (this.currentLevel < 3) {
                    this.nextLevel();
                } else {
                    this.finishGame();
                }
            };
        }
    }

    nextLevel() {
        this.currentLevel++;
        document.body.className = `world_${this.currentLevel}`;
        document.querySelector('.current-level').textContent = `Level ${this.currentLevel}`;
        
        this.spawnRate = Math.max(400, this.spawnRate * 0.7); 
        this.endOverlay.style.display = "none";
        this.score = 0;
        this.timeLeft = 60;
        this.updateUI();
        this.gameArea.innerHTML = "";
        this.targets = [];
        this.initLevel();
    }

    finishGame() {
        localStorage.setItem('lastFinalScore', this.totalScore);
        localStorage.setItem('lastPlayerName', this.pseudo);

        let leaderboard = JSON.parse(localStorage.getItem('unicornLeaderboard')) || [];
        const newEntry = {
            name: this.pseudo,
            score: this.totalScore,
            date: new Date().toLocaleDateString()
        };
        leaderboard.push(newEntry);
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 10);

        localStorage.setItem('unicornLeaderboard', JSON.stringify(leaderboard));
        window.location.href = "scores.html";
    }
}

// CLASSE TARGET
class Target {
    constructor(imgSrc, game) {
        this.game = game;
        this.element = document.createElement('img');
        this.element.src = imgSrc;
        this.element.className = 'targets';
        
        const baseSize = 100 - (this.game.currentLevel * 10);
        const size = Math.max(40, baseSize);
        this.x = Math.random() * (window.innerWidth - 100);
        this.y = window.innerHeight;

        // --- MODIFICATIONS ICI ---

        // 1. On définit une gravité beaucoup plus douce (ex: 0.05 au lieu de 0.10)
        // On l'augmente très légèrement par niveau pour garder un peu de challenge
        this.gravity = 0.04 + (this.game.currentLevel * 0.01); 

        // 2. On ajuste la puissance du saut vertical (vy)
        // Comme la gravité est plus faible, on réduit aussi la poussée pour 
        // éviter que les licornes ne s'envolent trop haut.
        this.vy = -(6 + Math.random() * 4); 

        // --------------------------

        this.vx = (Math.random() - 0.5) * 2;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 2;

        this.game.gameArea.appendChild(this.element);

        this.element.onmousedown = (e) => { 
            e.preventDefault(); 
            if (!this.game.isPaused && this.game.isPlaying) {
                this.explode(); 
            }
        };
    }

    move() {
        this.vy += this.gravity; 
        this.x += this.vx; 
        this.y += this.vy; 
        this.rotation += this.rotationSpeed;
        this.element.style.left = `${this.x}px`; 
        this.element.style.top = `${this.y}px`;
        this.element.style.transform = `rotate(${this.rotation}deg)`;
    }


    explode() {
    // --- 1. GESTION DU SYSTÈME DE COMBO ---
    const now = Date.now();
    // Si le délai entre ce clic et le précédent est inférieur à 800ms
    if (now - this.game.lastHitTime < 800) {
        this.game.comboCount++; // On incrémente le combo
    } else {
        this.game.comboCount = 1; // Sinon, on réinitialise à 1
    }
    // On met à jour l'heure du dernier hit pour le prochain calcul
    this.game.lastHitTime = now;

    // --- 2. CRÉATION DU TEXTE FLOTTANT (UI) ---
    const rect = this.element.getBoundingClientRect();
    const floatingText = document.createElement('div');
    floatingText.className = 'combo-text';
    
    // Détermination du message selon le nombre de combos
    let message = "HIT !";
    if (this.game.comboCount === 2) message = "GREAT !!";
    if (this.game.comboCount === 3) message = "UNBELIVABLE !!!";
    if (this.game.comboCount === 4) message = "OUTSANDING !!!!!";
    if (this.game.comboCount >= 5) {
        message = "PERFECT !!!!!";
        floatingText.style.color = "#FFD700"; // Couleur dorée pour le score max
    }
    
    floatingText.textContent = message;
    
    // Positionnement du texte au-dessus de la licorne cliquée
    floatingText.style.left = `${rect.left + (rect.width / 2) - 50}px`;
    floatingText.style.top = `${rect.top}px`;
    
    // Ajout au document et suppression automatique après l'animation (800ms)
    document.body.appendChild(floatingText);
    setTimeout(() => floatingText.remove(), 800);

    // --- 3. EFFETS SONORES ET PARTICULES (TON CODE ORIGINAL) ---
    // Lecture du son de pop
    const pop = document.getElementById('popSound');
    if(pop) { pop.currentTime = 0; pop.play(); }

    // Calcul du centre de la cible pour l'explosion de pixels
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Création des 8 particules de l'explosion arcade
    const particleCount = 8; 
    for (let i = 0; i < particleCount; i++) {
        const pixel = document.createElement('div');
        pixel.className = 'pixel';
        pixel.style.left = `${centerX}px`;
        pixel.style.top = `${centerY}px`;

        // Direction aléatoire pour chaque pixel
        const angle = (Math.PI * 2 / particleCount) * i;
        const distance = 50 + Math.random() * 50;
        
        // Envoi des variables de mouvement au CSS
        pixel.style.setProperty('--dx', Math.cos(angle) * distance + "px");
        pixel.style.setProperty('--dy', Math.sin(angle) * distance + "px");

        document.body.appendChild(pixel);
        // Nettoyage des pixels après 500ms
        setTimeout(() => pixel.remove(), 500);
    }

    // --- 4. MISE À JOUR DU SCORE AVEC MULTIPLICATEUR ---
    // On multiplie les 10 points de base par le combo actuel
    this.game.score += (10 * this.game.comboCount);
    this.game.updateUI();
    
    // Petit effet de flash blanc sur l'image avant de la supprimer
    this.element.style.filter = "brightness(3) contrast(2)"; 
    setTimeout(() => this.remove(), 50); 
}

    remove() { 
        if (this.element.parentNode) this.element.remove(); 
    }
}

// Initialisation
window.onload = () => { new UnicornShooter(); };