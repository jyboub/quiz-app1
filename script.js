"use strict";

const QUESTIONS = [
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
      "Le modèle mémorise trop les données",
      "Le modèle est plus rapide",
      "Le modèle est plus sécurisé",
      "Le modèle est plus léger"
    ],
    correctIndex: 0
  },
  {
    question: "Pourquoi tester une IA ?",
    choices: [
      "Pour décorer l'application",
      "Pour mesurer sa qualité",
      "Pour changer le CSS",
      "Pour réduire la mémoire"
    ],
    correctIndex: 1
  },
  {
    question: "Que signifie CT-AI ?",
    choices: [
      "Certified Tester AI Testing",
      "Computer Testing AI",
      "Certified Technical AI",
      "Control Testing AI"
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

  questionEl.textContent = current.question;

  feedbackEl.textContent = "";
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

  document
    .querySelectorAll(".quiz__choice")
    .forEach(button => button.disabled = true);

  if (selectedIndex === current.correctIndex) {
    score++;
    feedbackEl.textContent = "✅ Correct";
  } else {
    feedbackEl.textContent = "❌ Incorrect";
  }

  updateHeader();

  createNextButton();
}

function createNextButton() {

  actionsEl.innerHTML = "";

  const button = document.createElement("button");

  button.className = "action-btn";

  const lastQuestion =
    currentQuestion === QUESTIONS.length - 1;

  button.textContent =
    lastQuestion
      ? "Voir mon résultat"
      : "Question suivante";

  button.addEventListener("click", () => {

    if (lastQuestion) {
      showResults();
    } else {
      currentQuestion++;
      renderQuestion();
    }
  });

  actionsEl.appendChild(button);
}

function showResults() {

  questionEl.classList.add("hidden");
  choicesEl.classList.add("hidden");
  feedbackEl.classList.add("hidden");
  actionsEl.classList.add("hidden");

  resultEl.classList.remove("hidden");

  finalScoreEl.textContent =
    `Vous avez obtenu ${score}/${QUESTIONS.length}`;
}

function restartQuiz() {

  currentQuestion = 0;
  score = 0;

  resultEl.classList.add("hidden");

  questionEl.classList.remove("hidden");
  choicesEl.classList.remove("hidden");
  feedbackEl.classList.remove("hidden");
  actionsEl.classList.remove("hidden");

  renderQuestion();
}

restartButton.addEventListener(
  "click",
  restartQuiz
);

renderQuestion();