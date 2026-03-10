/* GESTION DE LA NAVIGATION (ESPACE) */
document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        const pageActuelle = window.location.pathname;
        if (pageActuelle.includes("index.html") || pageActuelle.endsWith("/")) {
            event.preventDefault();
            window.location.href = "./pages/regles.html";
        } else if (pageActuelle.includes("regles.html")) {
            event.preventDefault();
            window.location.href = "ecranjeu.html";
        }
    }
});

/* BASE DE DONNÉES DES MOTS */
const baseDeMots = {
    facile: [
        { mot: "internet", indices: ["Permet de se connecter au monde entier", "Sert à rechercher des informations", "Fonctionne avec le Wi-Fi ou la 4G/5G"] },
        { mot: "site web", indices: ["Se consulte avec un navigateur", "Contient des pages avec du texte et des images", "Peut présenter une entreprise ou vendre des produits"] },
        { mot: "application", indices: ["S’installe sur un téléphone ou un ordinateur", "Sert à faire une tâche précise", "On la télécharge sur un store"] },
        { mot: "email", indices: ["Permet d’envoyer un message en ligne", "Peut contenir des pièces jointes", "A besoin d’une adresse (ex : nom@gmail.com)"] },
        { mot: "mot de passe", indices: ["Protège un compte", "Doit rester secret", "Contient souvent des lettres et des chiffres"] },
        { mot: "wifi", indices: ["Permet d’avoir Internet sans fil", "Fonctionne avec une box", "Nécessite un code pour se connecter"] },
        { mot: "vidéo", indices: ["Image en mouvement", "Peut avoir du son", "Se regarde sur un écran"] },
        { mot: "photo", indices: ["Image fixe", "Prise avec un téléphone ou un appareil", "Peut être partagée en ligne"] },
        { mot: "réseau social", indices: ["Permet de communiquer avec d’autres personnes", "On peut publier du contenu", "On peut aimer et commenter"] },
        { mot: "téléchargement", indices: ["Permet de récupérer un fichier", "Vient d’Internet vers ton appareil", "Vient d’Internet vers ton appareil"] },
    ],
    moyen: [
        { mot: "navigateur", indices: ["Permet d’aller sur des sites web", "On l’ouvre pour faire une recherche Google", "C’est un logiciel installé sur l’ordinateur ou le téléphone"] },
        { mot: "cloud", indices: ["Permet de garder des fichiers en ligne", "Accessible depuis plusieurs appareils", "Évite de tout stocker uniquement sur son ordinateur"] },
        { mot: "stockage", indices: ["Sert à garder des fichiers", "Peut être sur un téléphone, un ordinateur ou en ligne", "A une limite d’espace (ex : 64Go, 1To)"] },
        { mot: "streaming", indices: ["Permet de regarder une vidéo sans la télécharger", "Fonctionne avec Internet", "Utilisé pour films, séries ou musique"] },
        { mot: "mise à jour", indices: ["Améliore un logiciel ou une application", "Corrige des bugs", "Ajoute parfois de nouvelles fonctionnalités"] },
        { mot: "algorithme", indices: ["Suit des règles pour donner un résultat", "Utilisé par les réseaux sociaux", "Décide souvent ce que tu vois en premier"] },
    ],
    difficile: [
        { mot: "interface", indices: ["C’est ce que l’on voit à l’écran", "Permet d’interagir avec un site ou une application", "Contient des boutons, menus et images"] },
        { mot: "base de données", indices: ["Sert à stocker beaucoup d’informations", "Organise les données de manière structurée", "Utilisée par les sites web et applications"] },
        { mot: "automatisation", indices: ["Permet de faire une tâche automatiquement", "Évite de répéter la même action manuellement", "Fait gagner du temps"] },
        { mot: "sécurité informatique", indices: ["Protège les données et les comptes", "Évite les piratages", "Utilise des mots de passe et protections spéciales"] },
    ]
};

/* VARIABLES D'ÉTAT */
let listeDeJeu = [];
let motsTrouvesCompteur = 0; 
let indiceActuelIndex = 0; 
let vies = 3;
let temps = 30;
let timer;

/* INITIALISATION MODIFIÉE : Respecte l'ordre 3 Faciles, 2 Moyens, 1 Difficile */
function preparerPartie() {
    const faciles = [...baseDeMots.facile].sort(() => 0.5 - Math.random()).slice(0, 3);
    const moyens = [...baseDeMots.moyen].sort(() => 0.5 - Math.random()).slice(0, 2);
    const difficiles = [...baseDeMots.difficile].sort(() => 0.5 - Math.random()).slice(0, 1);

    // On les assemble dans cet ordre précis sans les mélanger globalement
    listeDeJeu = [...faciles, ...moyens, ...difficiles];
    motsTrouvesCompteur = 0;
}

window.onload = () => {
    if (document.body.classList.contains("page-jeu")) {
        preparerPartie();
        chargerMot();
        demarrerTimer();

        document.getElementById('btn-valider').onclick = verifierReponse;
        document.getElementById('btn-passer').onclick = changerIndice; 
        document.getElementById('btn-passer-mot').onclick = passerMot;

        document.getElementById('input-reponse').onkeypress = (e) => {
            if (e.key === 'Enter') verifierReponse();
        };
    }
};

/* LOGIQUE DU JEU */
function chargerMot() {
    if (listeDeJeu.length === 0) {
        afficherVictoire();
        return;
    }

    const data = listeDeJeu[0];
    indiceActuelIndex = 0; 
    
    actualiserAffichageIndice();
    document.getElementById('stat-progression').textContent = `Mots restants : ${listeDeJeu.length}`;
    
    temps = 30;
    document.getElementById('timer-display').textContent = temps;
}

function actualiserAffichageIndice() {
    const data = listeDeJeu[0];
    document.getElementById('bulle-indice').textContent = "Indice : " + data.indices[indiceActuelIndex];
    document.getElementById('stat-indice').textContent = `Indice : ${indiceActuelIndex + 1}/3`;
}

function changerIndice() {
    indiceActuelIndex = (indiceActuelIndex + 1) % 3;
    actualiserAffichageIndice();
}

function passerMot() {
    if (listeDeJeu.length > 1) {
        const motActuel = listeDeJeu.shift(); 
        listeDeJeu.push(motActuel); 
        chargerMot();
        document.getElementById('input-reponse').value = "";
    } else {
        temps = 30;
        document.getElementById('timer-display').textContent = temps;
    }
}

function demarrerTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        temps--;
        document.getElementById('timer-display').textContent = temps;
        
        if (temps <= 0) {
            vies--; 
            actualiserVies();
            
            if (vies <= 0) {
                finDePartie("GAME OVER");
            } else {
                const motEnEchec = listeDeJeu.shift();
                listeDeJeu.push(motEnEchec);
                document.getElementById('input-reponse').value = "";
                chargerMot();
            }
        }
    }, 1000);
}

/* MODIFICATION : Nettoyage de la réponse (accents, espaces, majuscules) */
function verifierReponse() {
    const input = document.getElementById('input-reponse');
    
    // On nettoie la saisie : trim, minuscule, et suppression des accents
    const reponseJoueur = input.value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (listeDeJeu.length === 0) return;

    // On nettoie aussi le mot correct pour comparer des choses identiques
    const motCorrect = listeDeJeu[0].mot.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (reponseJoueur === motCorrect) {
        listeDeJeu.shift(); 
        motsTrouvesCompteur++;

        const imageSorcier = document.getElementById('image-sorcier');
        let progression = motsTrouvesCompteur / 6; 
        imageSorcier.style.filter = `grayscale(${progression * 100}%)`;
        imageSorcier.style.opacity = 1 - (progression * 0.8); 

        input.value = "";
        chargerMot(); 
    } else {
        vies--;
        actualiserVies();
        input.value = "";
        if (vies <= 0) finDePartie("GAME OVER");
    }
}

function actualiserVies() {
    const coeurs = document.querySelectorAll('.coeur');
    if (vies >= 0 && vies < 3) {
        coeurs[vies].classList.add('perdu');
    }
}

function afficherVictoire() {
    clearInterval(timer);
    const imageSorcier = document.getElementById('image-sorcier');
    imageSorcier.style.opacity = "0";
    document.getElementById('overlay-you-win').style.display = "flex";
    window.addEventListener('keydown', handleFinEspace);
}

function finDePartie(message) {
    clearInterval(timer);
    if (message === "GAME OVER") {
        document.getElementById('overlay-game-over').style.display = "flex";
        window.addEventListener('keydown', handleFinEspace);
    }
}

function handleFinEspace(event) {
    if (event.code === "Space") {
        window.removeEventListener('keydown', handleFinEspace);
        window.location.href = "../index.html";
    }
}