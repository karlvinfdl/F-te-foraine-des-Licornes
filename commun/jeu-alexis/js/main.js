// Écoute les touches du clavier
document.addEventListener("keydown", (event) => {
  // Vérifie si la touche pressée est ESPACE
  if (event.code === "Space") {
    event.preventDefault(); // empêche le scroll
    window.location.href = "./pages/regles.html";
  }
});
