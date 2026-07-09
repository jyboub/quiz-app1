console.log("SCRIPT CHARGE");
2
alert("SCRIPT CHARGE");

"use strict";

const QUESTIONS = [
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
    question: "Pourquoi la qualité des données est-elle critique ?",
    choices: [
      "Elle influence la qualité des prédictions",
      "Elle réduit les coûts réseau",
      "Elle améliore le design",
      "Elle remplace les tests"
    ],
    correctIndex: 0
  }
];

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

  questionEl.textContent =
    current.question;

  feedbackEl.textContent = "";
  feedbackEl.className = "quiz__feedback";

  choicesEl.innerHTML = "";

  current.choices.forEach((choice, index) => {

    const button =
      document.createElement("button");

    button.className =
      "quiz__choice";

    button.textContent =
      choice;

    button.addEventListener(
      "click",
      () => handleAnswer(index)
    );

    choicesEl.appendChild(button);
  });
}

function handleAnswer(selectedIndex) {

  const current =
    QUESTIONS[currentQuestion];

  const buttons =
    document.querySelectorAll(".quiz__choice");

  buttons.forEach(btn => {
    btn.disabled = true;
  });

  if (selectedIndex === current.correctIndex) {

    score++;

    feedbackEl.textContent =
      "✅ Correct";

    feedbackEl.classList.add(
      "quiz__feedback--correct"
    );

  } else {

    feedbackEl.textContent =
      "❌ Incorrect";

    feedbackEl.classList.add(
      "quiz__feedback--wrong"
    );
  }

  buttons[current.correctIndex]
    .classList.add(
      "quiz__choice--correct"
    );

  if (
    selectedIndex !==
    current.correctIndex
  ) {
    buttons[selectedIndex]
      .classList.add(
        "quiz__choice--wrong"
      );
  }

  updateHeader();

  createNextButton();
}

function createNextButton() {

  actionsEl.innerHTML = "";

  const button =
    document.createElement(
      "button"
    );

  button.className =
    "action-btn";

  const lastQuestion =
    currentQuestion ===
    QUESTIONS.length - 1;

  button.textContent =
    lastQuestion
      ? "Voir mon résultat"
      : "Question suivante";

  button.addEventListener(
    "click",
    () => {

      if (lastQuestion) {

        showResults();

      } else {

        currentQuestion++;

        renderQuestion();
      }
    }
  );

  actionsEl.appendChild(button);
}

function showResults() {

  questionEl.classList.add(
    "hidden"
  );

  choicesEl.classList.add(
    "hidden"
  );

  feedbackEl.classList.add(
    "hidden"
  );

  actionsEl.classList.add(
    "hidden"
  );

  resultEl.classList.remove(
    "hidden"
  );

  let message = "";

  if (score <= 1) {

    message =
      "😞 Résultat insuffisant. Continuez vos révisions.";

  } else if (score === 2) {

    message =
      "😐 Peut mieux faire.";

  } else if (score === 3) {

    message =
      "🙂 Bon travail !";

  } else if (score === 4) {

    message =
      "🎉 Très bon résultat !";

  } else {

    message =
      "🏆 Excellent ! Vous semblez prêt pour l'examen.";
  }

  finalScoreEl.innerHTML = `
    <strong>${message}</strong>
    <br><br>
    Vous avez obtenu ${score}/${QUESTIONS.length}
  `;
}

function restartQuiz() {

  currentQuestion = 0;
  score = 0;

  resultEl.classList.add(
    "hidden"
  );

  questionEl.classList.remove(
    "hidden"
  );

  choicesEl.classList.remove(
    "hidden"
  );

  feedbackEl.classList.remove(
    "hidden"
  );

  actionsEl.classList.remove(
    "hidden"
  );

  renderQuestion();
}

restartButton.addEventListener(
  "click",
  restartQuiz
);

renderQuestion();