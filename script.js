"use strict";

/**
 * Données du quiz.
 * On utilise un tableau d'objets même s'il n'y a qu'une question pour l'instant :
 * cela permettra, dans les prochains sprints, d'enchaîner plusieurs questions,
 * de gérer un score / une progression, puis de remplacer ce tableau par des
 * questions générées par l'IA (même format JSON).
 */
const QUESTIONS = [
  {
    // Géographie
    question: "Quelle est la capitale de l'Australie ?",
    choices: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correctIndex: 2,
  },
  {
    // Histoire
    question: "En quelle année a eu lieu la Révolution française ?",
    choices: ["1789", "1815", "1492", "1914"],
    correctIndex: 0,
  },
  {
    // Sciences / Physique
    question: "Quelle est la vitesse approximative de la lumière dans le vide ?",
    choices: ["300 000 km/s", "3 000 km/s", "30 000 km/s", "3 millions km/s"],
    correctIndex: 0,
  },
  {
    // Biologie / Corps humain
    question: "Combien d'os compte le corps humain adulte ?",
    choices: ["156", "206", "306", "106"],
    correctIndex: 1,
  },
  {
    // Arts / Peinture
    question: "Qui a peint « La Joconde » ?",
    choices: ["Michel-Ange", "Raphaël", "Léonard de Vinci", "Botticelli"],
    correctIndex: 2,
  },
  {
    // Littérature
    question: "Qui a écrit « Les Misérables » ?",
    choices: ["Émile Zola", "Victor Hugo", "Gustave Flaubert", "Molière"],
    correctIndex: 1,
  },
  {
    // Sport
    question: "Tous les combien d'années ont lieu les Jeux olympiques d'été ?",
    choices: ["2 ans", "3 ans", "4 ans", "5 ans"],
    correctIndex: 2,
  },
  {
    // Chimie
    question: "Quel est le symbole chimique de l'or ?",
    choices: ["Ag", "Or", "Au", "Go"],
    correctIndex: 2,
  },
  {
    // Musique
    question: "Combien de touches possède un piano standard ?",
    choices: ["76", "88", "96", "61"],
    correctIndex: 1,
  },
  {
    // Astronomie
    question: "Quelle est la planète la plus proche du Soleil ?",
    choices: ["Vénus", "Mars", "Mercure", "La Terre"],
    correctIndex: 2,
  },
];

// Délai (en millisecondes) avant de passer à la question suivante après une réponse.
const NEXT_QUESTION_DELAY = 5000;

// Index de la question courante.
let currentIndex = 0;

// Référence du minuteur en cours, pour éviter les passages en double.
let nextQuestionTimer = null;

// Références aux éléments du DOM.
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");

/**
 * Affiche la question courante et génère ses 4 boutons de choix.
 */
function renderQuestion() {
  const current = QUESTIONS[currentIndex];

  // Réinitialise l'affichage (utile pour la future navigation entre questions).
  questionEl.textContent = current.question;
  feedbackEl.textContent = "";
  feedbackEl.className = "quiz__feedback";
  choicesEl.innerHTML = "";

  // Crée un bouton par choix.
  current.choices.forEach((choiceText, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz__choice";
    // Numérote chaque choix : "1-", "2-", "3-", "4-".
    button.textContent = `${index + 1}- ${choiceText}`;
    button.addEventListener("click", () => handleAnswer(index));
    choicesEl.appendChild(button);
  });
}

/**
 * Gère le clic sur un choix : affiche le feedback, colore les boutons
 * et verrouille tous les choix pour empêcher un second essai.
 * @param {number} selectedIndex - index du choix cliqué
 */
function handleAnswer(selectedIndex) {
  const current = QUESTIONS[currentIndex];
  const isCorrect = selectedIndex === current.correctIndex;
  const buttons = choicesEl.querySelectorAll(".quiz__choice");

  buttons.forEach((button, index) => {
    // Désactive tous les boutons.
    button.disabled = true;

    // Le bon choix passe toujours en vert.
    if (index === current.correctIndex) {
      button.classList.add("quiz__choice--correct");
    }

    // Si le choix cliqué est faux, on le marque en rouge.
    if (index === selectedIndex && !isCorrect) {
      button.classList.add("quiz__choice--wrong");
    }
  });

  // Affiche le message dans la zone de feedback.
  feedbackEl.textContent = isCorrect ? "Correct" : "Incorrect";
  feedbackEl.classList.add(
    isCorrect ? "quiz__feedback--correct" : "quiz__feedback--wrong"
  );

  // Passe automatiquement à la question suivante après 5 secondes.
  scheduleNextQuestion();
}

/**
 * Programme le passage à la question suivante après NEXT_QUESTION_DELAY.
 * On boucle sur la première question une fois la dernière atteinte.
 */
function scheduleNextQuestion() {
  // Sécurité : annule un éventuel minuteur déjà en cours.
  clearTimeout(nextQuestionTimer);

  nextQuestionTimer = setTimeout(() => {
    currentIndex = (currentIndex + 1) % QUESTIONS.length;
    renderQuestion();
  }, NEXT_QUESTION_DELAY);
}

// Démarre le quiz.
renderQuestion();
