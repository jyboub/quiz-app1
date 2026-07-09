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

let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const actionsEl = document.getElementById("actions");

const progressionEl =
  document.getElementById("progression");

const scoreEl =
  document.getElementById("score");

const resultEl =
  document.getElementById("result");

const finalScoreEl =
  document.getElementById("finalScore");

const restartButton =
  document.getElementById("restartButton");

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

    button.className = "quiz__choice";

    button.textContent = choice;

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

  if (selectedIndex !== current.correctIndex) {

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

  const nextButton =
    document.createElement("button");

  nextButton.className =
    "action-btn";

  const lastQuestion =
    currentQuestion ===
    QUESTIONS.length - 1;

  nextButton.textContent =
    lastQuestion
      ? "Voir mon résultat"
      : "Question suivante";

  nextButton.addEventListener(
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

    message =
      "😞 Résultat insuffisant.";

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
      "🏆 Bravo ! Score parfait !";
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