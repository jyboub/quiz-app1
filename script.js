"use strict";

const ALL_QUESTIONS = [
  {
    question: "Quel est l'objectif principal du test d'un système basé sur l'IA ?",
    choices: [
      "Créer le modèle",
      "Évaluer sa qualité et ses risques",
      "Concevoir l'interface",
      "Administrer la base de données"
    ],
    correctIndex: 1
  },
  {
    question: "Qu'est-ce qu'un biais dans un système IA ?",
    choices: [
      "Une erreur réseau",
      "Une tendance à produire des résultats injustes",
      "Une méthode d'apprentissage",
      "Un bug graphique"
    ],
    correctIndex: 1
  },
  {
    question: "Quel apprentissage utilise des données étiquetées ?",
    choices: [
      "Supervisé",
      "Non supervisé",
      "Par renforcement",
      "Statistique"
    ],
    correctIndex: 0
  },
  {
    question: "Quel apprentissage repose sur des récompenses ?",
    choices: [
      "Supervisé",
      "Par renforcement",
      "Non supervisé",
      "Probabiliste"
    ],
    correctIndex: 1
  },
  {
    question: "Qu'est-ce que l'overfitting ?",
    choices: [
      "Le modèle généralise parfaitement",
      "Le modèle mémorise trop les données d'entraînement",
      "Le modèle est trop rapide",
      "Le modèle ne possède pas assez de paramètres"
    ],
    correctIndex: 1
  },
  {
    question: "Quel est le rôle d'un jeu de données de test ?",
    choices: [
      "Entraîner le modèle",
      "Valider les performances du modèle",
      "Créer l'architecture",
      "Déployer le modèle"
    ],
    correctIndex: 1
  },
  {
    question: "Pourquoi la qualité des données est-elle critique ?",
    choices: [
      "Elle influence la qualité des prédictions",
      "Elle réduit les coûts réseau",
      "Elle améliore le design",
      "Elle remplace les tests"
    ],
    correctIndex: 0
  },
  {
    question: "Que signifie explicabilité ?",
    choices: [
      "Comprendre les décisions du modèle",
      "Augmenter la vitesse du modèle",
      "Réduire les coûts",
      "Entraîner les données"
    ],
    correctIndex: 0
  },
  {
    question: "Quel risque est fréquent dans les systèmes IA ?",
    choices: [
      "La partialité des résultats",
      "La couleur de l'écran",
      "La taille de la RAM",
      "Le navigateur utilisé"
    ],
    correctIndex: 0
  },
  {
    question: "Que mesure une métrique de performance ?",
    choices: [
      "La qualité du modèle",
      "La couleur des boutons",
      "Le nombre de développeurs",
      "Le coût du projet"
    ],
    correctIndex: 0
  },
  {
    question: "Quel défi est spécifique aux systèmes IA ?",
    choices: [
      "Le comportement non déterministe",
      "L'utilisation du HTML",
      "Le Responsive Design",
      "La gestion CSS"
    ],
    correctIndex: 0
  },
  {
    question: "Quel est le principal objectif du monitoring ?",
    choices: [
      "Suivre les performances en production",
      "Créer des données",
      "Concevoir l'application",
      "Remplacer les tests"
    ],
    correctIndex: 0
  },
  {
    question: "Pourquoi tester les biais ?",
    choices: [
      "Pour détecter des résultats discriminatoires",
      "Pour améliorer le CSS",
      "Pour diminuer le stockage",
      "Pour accélérer JavaScript"
    ],
    correctIndex: 0
  },
  {
    question: "Qu'est-ce qu'un faux positif ?",
    choices: [
      "Un résultat annoncé positif alors qu'il est négatif",
      "Une réponse correcte",
      "Une donnée d'entraînement",
      "Un modèle IA"
    ],
    correctIndex: 0
  },
  {
    question: "Qu'est-ce qu'un faux négatif ?",
    choices: [
      "Un résultat annoncé négatif alors qu'il est positif",
      "Une erreur réseau",
      "Une donnée incorrecte",
      "Une métrique"
    ],
    correctIndex: 0
  },
  {
    question: "Pourquoi les données représentatives sont-elles importantes ?",
    choices: [
      "Pour limiter les biais",
      "Pour réduire le nombre de questions",
      "Pour accélérer le navigateur",
      "Pour remplacer les tests"
    ],
    correctIndex: 0
  },
  {
    question: "Quel aspect est essentiel pour une IA responsable ?",
    choices: [
      "L'équité",
      "La couleur du texte",
      "Le nombre de lignes de code",
      "Le système d'exploitation"
    ],
    correctIndex: 0
  },
  {
    question: "Quel document décrit les compétences de test IA ?",
    choices: [
      "CT-AI",
      "PMBOK",
      "Scrum Guide",
      "TMMI"
    ],
    correctIndex: 0
  },
  {
    question: "Une forte précision sur les données d'entraînement garantit-elle une bonne généralisation ?",
    choices: [
      "Oui",
      "Non",
      "Seulement pour les réseaux neuronaux",
      "Seulement pour l'IA générative"
    ],
    correctIndex: 1
  },
  {
    question: "Quel est le but de la validation d'un modèle ?",
    choices: [
      "Ajuster et évaluer ses performances",
      "Créer l'interface",
      "Réduire le code",
      "Supprimer les données"
    ],
    correctIndex: 0
  },
  {
    question: "Pourquoi un modèle doit-il être réévalué après déploiement ?",
    choices: [
      "Les données réelles évoluent",
      "Le HTML change",
      "Le navigateur change",
      "Les APIs expirent"
    ],
    correctIndex: 0
  },
  {
    question: "Qu'est-ce que le data drift ?",
    choices: [
      "Une évolution des données dans le temps",
      "Une erreur CSS",
      "Une erreur réseau",
      "Un problème matériel"
    ],
    correctIndex: 0
  },
  {
    question: "Quel est le rôle principal du testeur dans un projet IA ?",
    choices: [
      "Identifier les risques et évaluer la qualité",
      "Créer le modèle",
      "Administrer les serveurs",
      "Remplacer le Data Scientist"
    ],
    correctIndex: 0
  },
  {
    question: "Quelle caractéristique complique l'automatisation des tests IA ?",
    choices: [
      "Le caractère non déterministe",
      "Le HTML",
      "Le Git",
      "Le CSS"
    ],
    correctIndex: 0
  },
  {
    question: "Pourquoi documenter les données utilisées ?",
    choices: [
      "Assurer la traçabilité",
      "Changer la couleur du site",
      "Générer du CSS",
      "Diminuer la mémoire"
    ],
    correctIndex: 0
  },
  {
    question: "Quel risque provient d'un jeu de données déséquilibré ?",
    choices: [
      "Des résultats biaisés",
      "Une meilleure précision",
      "Un meilleur graphisme",
      "Une meilleure vitesse"
    ],
    correctIndex: 0
  },
  {
    question: "Que vérifie un test d'équité ?",
    choices: [
      "L'absence de discrimination injustifiée",
      "La vitesse de calcul",
      "Le thème graphique",
      "Le réseau"
    ],
    correctIndex: 0
  },
  {
    question: "Quel est l'intérêt d'expliquer les décisions d'une IA ?",
    choices: [
      "Augmenter la confiance des utilisateurs",
      "Réduire le stockage",
      "Améliorer le CSS",
      "Supprimer les tests"
    ],
    correctIndex: 0
  },
  {
    question: "Quel est l'objectif principal d'une approche basée sur les risques ?",
    choices: [
      "Concentrer les efforts sur les zones les plus critiques",
      "Tester au hasard",
      "Réduire les développeurs",
      "Supprimer les métriques"
    ],
    correctIndex: 0
  },
  {
    question: "Pourquoi les systèmes IA nécessitent-ils une surveillance continue ?",
    choices: [
      "Leurs performances peuvent évoluer avec les données",
      "Ils utilisent JavaScript",
      "Ils utilisent HTML",
      "Ils utilisent Git"
    ],
    correctIndex: 0
  }
];

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

let QUESTIONS = [];
let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const actionsEl = document.getElementById("actions");
const progressionEl = document.getElementById("progression");
const scoreEl = document.getElementById("score");
const resultEl = document.getElementById("result");
const finalScoreEl = document.getElementById("finalScore");
const restartButton = document.getElementById("restartButton");

function initializeQuiz() {
  QUESTIONS = shuffle(ALL_QUESTIONS).slice(0, 5);
  currentQuestion = 0;
  score = 0;
}

function updateHeader() {
  progressionEl.textContent =
    `Question ${currentQuestion + 1}/${QUESTIONS.length}`;

  scoreEl.textContent =
    `Score : ${score}/${QUESTIONS.length}`;
}

function renderQuestion() {

  updateHeader();

  actionsEl.innerHTML = "";

  const current = QUESTIONS[currentQuestion];

  questionEl.textContent = current.question;

  feedbackEl.textContent = "";
  feedbackEl.className = "quiz__feedback";

  choicesEl.innerHTML = "";

  current.choices.forEach((choice, index) => {
    const button = document.createElement("button");

    button.className = "quiz__choice";
    button.textContent = choice;

    button.addEventListener("click", () => {
      handleAnswer(index);
    });

    choicesEl.appendChild(button);
  });
}

function handleAnswer(selectedIndex) {

  const current = QUESTIONS[currentQuestion];

  const buttons =
    document.querySelectorAll(".quiz__choice");

  buttons.forEach(btn => btn.disabled = true);

  if (selectedIndex === current.correctIndex) {

    score++;

    feedbackEl.textContent = "✅ Correct";
    feedbackEl.classList.add("quiz__feedback--correct");

  } else {

    feedbackEl.textContent = "❌ Incorrect";
    feedbackEl.classList.add("quiz__feedback--wrong");
  }

  buttons[current.correctIndex]
    .classList.add("quiz__choice--correct");

  if (selectedIndex !== current.correctIndex) {
    buttons[selectedIndex]
      .classList.add("quiz__choice--wrong");
  }

  updateHeader();
  createNextButton();
}

function createNextButton() {

  actionsEl.innerHTML = "";

  const nextButton =
    document.createElement("button");

  nextButton.className = "action-btn";

  const lastQuestion =
    currentQuestion === QUESTIONS.length - 1;

  nextButton.textContent =
    lastQuestion
      ? "Voir mon résultat"
      : "Question suivante";

  nextButton.addEventListener("click", () => {

    if (lastQuestion) {
      showResults();
    } else {
      currentQuestion++;
      renderQuestion();
    }
  });

  actionsEl.appendChild(nextButton);
}

function showResults() {

  questionEl.classList.add("hidden");
  choicesEl.classList.add("hidden");
  feedbackEl.classList.add("hidden");
  actionsEl.classList.add("hidden");

  resultEl.classList.remove("hidden");

  let message = "";

  if (score <= 1) {
    message = "😞 Résultat insuffisant.";
  } else if (score === 2) {
    message = "😐 Peut mieux faire.";
  } else if (score === 3) {
    message = "🙂 Bon travail !";
  } else if (score === 4) {
    message = "🎉 Très bon résultat !";
  } else {
    message = "🏆 Excellent !";
  }

  finalScoreEl.innerHTML =
    `<strong>${message}</strong><br><br>
     Vous avez obtenu ${score}/${QUESTIONS.length}`;
}

function restartQuiz() {

  initializeQuiz();

  resultEl.classList.add("hidden");

  questionEl.classList.remove("hidden");
  choicesEl.classList.remove("hidden");
  feedbackEl.classList.remove("hidden");
  actionsEl.classList.remove("hidden");

  renderQuestion();
}

restartButton.addEventListener("click", restartQuiz);

initializeQuiz();
renderQuestion();