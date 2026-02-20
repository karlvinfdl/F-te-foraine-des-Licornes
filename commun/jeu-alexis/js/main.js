document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault(); // Empêche le scroll de la page

    // On récupère le nom de la page actuelle
    const pageActuelle = window.location.pathname;

    // SI on est sur l'accueil (index.html ou juste /) -> on va aux règles
    if (pageActuelle.includes("index.html") || pageActuelle.endsWith("/")) {
      window.location.href = "./pages/regles.html";
    } 
    // SI on est sur la page des règles -> on va au jeu
    else if (pageActuelle.includes("regles.html")) {
      window.location.href = "ecranjeu.html"; 
    }
  }
});

// 1. Base de données des 6 mots
const dictionnaire = [
    { mot: "ORDINATEUR", indice: "Messagerie et calculs" },
    { mot: "CHATEAU", indice: "Demeure royale" },
    { mot: "CASCADE", indice: "Chute d'eau" },
    { mot: "DRAGON", indice: "Crache du feu" },
    { mot: "FORET", indice: "Beaucoup d'arbres" },
    { mot: "PIXEL", indice: "Petit carré d'image" }
];

let motActuelIndex = 0;
let vies = 3;
let temps = 30;
let timer;

// 2. Lancement du jeu
window.onload = () => {
    chargerMot();
    demarrerTimer();
    
    // Ecouteur sur le bouton Valider
    document.getElementById('btn-valider').onclick = verifierReponse;
    
    // Permet de valider avec la touche "Entrée"
    document.getElementById('input-reponse').onkeypress = (e) => {
        if (e.key === 'Enter') verifierReponse();
    };
};

function chargerMot() {
    const data = dictionnaire[motActuelIndex];
    document.getElementById('bulle-indice').textContent = "Indice : " + data.indice;
    document.getElementById('stat-progression').textContent = `Mots : ${motActuelIndex}/6`;
}

function demarrerTimer() {
    timer = setInterval(() => {
        temps--;
        document.getElementById('timer-display').textContent = temps;
        if (temps <= 0) finDePartie("TEMPS ÉCOULÉ !");
    }, 1000);
}

function verifierReponse() {
    const input = document.getElementById('input-reponse');
    const reponseJoueur = input.value.trim().toUpperCase();
    
    if (reponseJoueur === dictionnaire[motActuelIndex].mot) {
        // ✅ BONNE RÉPONSE
        motActuelIndex++;

        // Réinitialise le chrono à 30 secondes pour le mot suivant
        temps = 30; 
        document.getElementById('timer-display').textContent = temps;
        
        // --- EFFET VISUEL DE DÉGRADATION ---
        const imageSorcier = document.getElementById('image-sorcier');
        let progression = motActuelIndex / 6; 
        
        imageSorcier.style.filter = `grayscale(${progression * 100}%)`;
        imageSorcier.style.opacity = 1 - (progression * 0.8); 
        // ------------------------------------

        if (motActuelIndex < 6) {
            chargerMot();
            input.value = "";
        } else {
            // 🏆 VICTOIRE FINALE
            clearInterval(timer); // Arrête le chrono définitivement
            imageSorcier.style.opacity = "0"; // Le sorcier disparaît totalement
            
            // Affiche l'overlay de victoire
            const winOverlay = document.getElementById('overlay-you-win');
            winOverlay.style.display = "flex";
            
            // Écoute la touche ESPACE pour retourner à l'accueil
            window.addEventListener('keydown', function handleWinSpace(event) {
                if (event.code === "Space") {
                    window.removeEventListener('keydown', handleWinSpace);
                    window.location.href = "../index.html"; // Redirection vers l'accueil
                }
            });
        }
    } else {
        // ❌ MAUVAISE RÉPONSE
        vies--;
        actualiserVies();
        input.value = "";
        
        if (vies <= 0) {
            finDePartie("GAME OVER");
        }
    }
}

function actualiserVies() {
    const coeurs = document.querySelectorAll('.coeur');
    if (vies >= 0) {
        coeurs[vies].classList.add('perdu');
    }
}

function finDePartie(message) {
    clearInterval(timer);
    alert(message);
    location.reload(); // Recommence le jeu
}

function finDePartie(message) {
    clearInterval(timer);
    
    if (message === "GAME OVER") {
        // Affiche l'overlay
        const overlay = document.getElementById('overlay-game-over');
        overlay.style.display = "flex";
        
        // Écoute la touche Espace pour quitter
        window.addEventListener('keydown', ecouterEspace);
    } else {
        alert(message);
        location.reload();
    }
}

function ecouterEspace(event) {
    if (event.code === "Space") {
        // Supprime l'écouteur et redirige vers l'accueil
        window.removeEventListener('keydown', ecouterEspace);
        window.location.href = "../index.html"; // Remplace par le nom de ton fichier d'accueil
    }
}