"use strict";

let QUESTIONS = [];

let currentQuestion = 0;
let score = 0;

const questionEl =
  document.getElementById("question");

const choicesEl =
  document.getElementById("choices");

const feedbackEl =
  document.getElementById("feedback");

const actionsEl =
  document.getElementById("actions");

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

function showError(message) {

  questionEl.textContent = message;

  choicesEl.innerHTML = "";

  actionsEl.innerHTML = "";

  feedbackEl.textContent = "";
}

async function generateQuestionsFromAI() {

  try {

    questionEl.textContent =
      "Chargement des questions IA...";

    const response =
      await fetch("/api/ask-claude", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `
Génère exactement 5 questions ISTQB CT-AI.

Réponds uniquement avec du JSON.

[
 {
   "question":"...",
   "choices":["...","...","...","..."],
   "correctIndex":0
 }
]
`
            }
          ]
        })
      });

    const data =
      await response.json();

    const text =
      data?.content?.[0]?.text;

    QUESTIONS =
      JSON.parse(text);

    currentQuestion = 0;
    score = 0;

    renderQuestion();

  } catch (error) {

    console.error(error);

    showError(
      "Impossible de générer les questions. Veuillez réessayer plus tard."
    );
  }
}

function updateHeader() {

  progressionEl.textContent =
    `Question ${currentQuestion + 1}/${QUESTIONS.length}`;

  scoreEl.textContent =
    `Score : ${score}/${QUESTIONS.length}`;
}

function renderQuestion() {

  updateHeader();

  feedbackEl.textContent = "";

  actionsEl.innerHTML = "";

  const q =
    QUESTIONS[currentQuestion];

  questionEl.textContent =
    q.question;

  choicesEl.innerHTML = "";

  q.choices.forEach((choice, index) => {

    const button =
      document.createElement("button");

    button.className =
      "quiz-choice";

    button.textContent =
      choice;

    button.addEventListener(
      "click",
      () => handleAnswer(index)
    );

    choicesEl.appendChild(button);
  });
}

function handleAnswer(index) {

  const q =
    QUESTIONS[currentQuestion];

  const buttons =
    document.querySelectorAll(
      ".quiz-choice"
    );

  buttons.forEach(button => {
    button.disabled = true;
  });

  if (index === q.correctIndex) {

    score++;

    feedbackEl.textContent =
      "✅ Correct";

  } else {

    feedbackEl.textContent =
      "❌ Incorrect";
  }

  createNextButton();
}

function createNextButton() {

  const next =
    document.createElement("button");

  next.className =
    "next-btn";

  next.textContent =
    currentQuestion ===
    QUESTIONS.length - 1
      ? "Voir mon résultat"
      : "Question suivante";

  next.addEventListener(
    "click",
    () => {

      if (
        currentQuestion ===
        QUESTIONS.length - 1
      ) {

        showResults();

      } else {

        currentQuestion++;

        renderQuestion();
      }
    }
  );

  actionsEl.innerHTML = "";

  actionsEl.appendChild(next);
}

function showResults() {

  resultEl.classList.remove(
    "hidden"
  );

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

  finalScoreEl.textContent =
    `Vous avez obtenu ${score}/${QUESTIONS.length}`;
}

restartButton.addEventListener(
  "click",
  generateQuestionsFromAI
);

generateQuestionsFromAI();