class UnicornShooter {
    constructor() {
        // 1. VARIABLES
        this.score = 0;
        this.totalScore = 0;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentLevel = 1;
        this.spawnRate = 2000;
        this.pseudo = "JOUEUR";
        this.targets = [];
        this.timerInterval = null;
        this.spawnTimeout = null;

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
            '../assets/images/licorne_variante_3.png',
            '../assets/images/licorne_variante_4.png',
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
            const img = this.targetImages[Math.floor(Math.random() * this.targetImages.length)];
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
        
        this.x = Math.random() * (window.innerWidth - 100);
        this.y = window.innerHeight;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = -(8 + Math.random() * 4);
        this.gravity = 0.12;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 3;

        this.game.gameArea.appendChild(this.element);

        // Tirer sur la licorne
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
        // 1. Son
        const pop = document.getElementById('popSound');
        if(pop) { pop.currentTime = 0; pop.play(); }

        // 2. Position centrale de la licorne
        const rect = this.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 3. Création de l'explosion de pixels (Style Arcade)
        const particleCount = 8; // Nombre de petits carrés
        for (let i = 0; i < particleCount; i++) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            
            // Position de départ
            pixel.style.left = `${centerX}px`;
            pixel.style.top = `${centerY}px`;

            // Calcul d'une direction aléatoire pour chaque pixel
            const angle = (Math.PI * 2 / particleCount) * i;
            const distance = 50 + Math.random() * 50;
            const dx = Math.cos(angle) * distance + "px";
            const dy = Math.sin(angle) * distance + "px";

            // On passe les variables au CSS
            pixel.style.setProperty('--dx', dx);
            pixel.style.setProperty('--dy', dy);

            // Alternance de couleur pour le style rétro
            if (i % 2 === 0) pixel.style.backgroundColor = "#fff";

            document.body.appendChild(pixel);

            // Nettoyage
            setTimeout(() => pixel.remove(), 500);
        }

        // 4. Points et suppression de la cible
        this.game.score += 10;
        this.game.updateUI();
        
        // Micro-secousse avant disparition
        this.element.style.filter = "brightness(3) contrast(2)"; // Flash blanc
        setTimeout(() => this.remove(), 50); 
    }

    remove() { 
        if (this.element.parentNode) this.element.remove(); 
    }
}

// Initialisation
window.onload = () => { new UnicornShooter(); };