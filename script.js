"use strict";

const QUESTIONS = [
  {
    question: "Quelle est la capitale de l'Australie ?",
    choices: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correctIndex: 2
  },
  {
    question: "En quelle année a eu lieu la Révolution française ?",
    choices: ["1789", "1815", "1492", "1914"],
    correctIndex: 0
  },
  {
    question: "Quelle est la vitesse approximative de la lumière dans le vide ?",
    choices: [
      "300 000 km/s",
      "3 000 km/s",
      "30 000 km/s",
      "3 millions km/s"
    ],
    correctIndex: 0
  },
  {
    question: "Combien d'os compte le corps humain adulte ?",
    choices: ["156", "206", "306", "106"],
    correctIndex: 1
  },
  {
    question: "Qui a peint La Joconde ?",
    choices: [
      "Michel-Ange",
      "Raphaël",
      "Léonard de Vinci",
      "Botticelli"
    ],
    correctIndex: 2
  }
];

const DELAY = 5;

let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const countdownEl = document.getElementById("countdown");

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

  const question = QUESTIONS[currentQuestion];

  questionEl.textContent = question.question;

  feedbackEl.textContent = "";
  feedbackEl.className = "quiz__feedback";

  countdownEl.textContent = "";

  choicesEl.innerHTML = "";

  question.choices.forEach((choice, index) => {

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

  const question = QUESTIONS[currentQuestion];

  const buttons =
    document.querySelectorAll(".quiz__choice");

  buttons.forEach(button => {
    button.disabled = true;
  });

  if (selectedIndex === question.correctIndex) {

    score++;

    feedbackEl.textContent = "✅ Correct";
    feedbackEl.classList.add("quiz__feedback--correct");

    buttons[selectedIndex]
      .classList.add("quiz__choice--correct");

  } else {

    feedbackEl.textContent = "❌ Incorrect";
    feedbackEl.classList.add("quiz__feedback--wrong");

    buttons[selectedIndex]
      .classList.add("quiz__choice--wrong");

    buttons[question.correctIndex]
      .classList.add("quiz__choice--correct");
  }

  updateHeader();

  startCountdown();
}

function startCountdown() {

  let remaining = DELAY;

  countdownEl.textContent =
    `Question suivante dans ${remaining}s`;

  const timer = setInterval(() => {

    remaining--;

    countdownEl.textContent =
      `Question suivante dans ${remaining}s`;

    if (remaining <= 0) {

      clearInterval(timer);

      currentQuestion++;

      if (currentQuestion < QUESTIONS.length) {
        renderQuestion();
      } else {
        showResults();
      }
    }

  }, 1000);
}

function showResults() {

  questionEl.classList.add("hidden");
  choicesEl.classList.add("hidden");
  feedbackEl.classList.add("hidden");
  countdownEl.classList.add("hidden");

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
  countdownEl.classList.remove("hidden");

  renderQuestion();
}

restartButton.addEventListener("click", restartQuiz);

renderQuestion();