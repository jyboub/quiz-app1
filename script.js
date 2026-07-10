"use strict";

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

function showError(message) {
  questionEl.textContent = message;
  choicesEl.innerHTML = "";
  feedbackEl.textContent = "";
  actionsEl.innerHTML = "";
}

async function generateQuestionsFromAI() {
  try {
    questionEl.textContent = "Chargement des questions IA...";

    const response = await fetch("/api/ask-claude", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `
Génère exactement 5 questions ISTQB CT-AI.

Réponds uniquement avec du JSON valide.

Format :

[
  {
    "question":"Question",
    "choices":[
      "Réponse 1",
      "Réponse 2",
      "Réponse 3",
      "Réponse 4"
    ],
    "correctIndex":0
  }
]

Contraintes :
- 4 choix de réponse
- une seule bonne réponse
- questions différentes à chaque génération
- niveau certification ISTQB CT-AI
- aucune explication
- uniquement du JSON
`
          }
        ]
      })
    });

    const data = await response.json();

    if (!data.content) {
      throw new Error("Réponse IA invalide");
    }

    const text = data.content[0]?.text;

    QUESTIONS = JSON.parse(text);

    if (
      !Array.isArray(QUESTIONS) ||
      QUESTIONS.length === 0
    ) {
      throw new Error("Questions invalides");
    }

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

  const current = QUESTIONS[currentQuestion];

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
    selectedIndex !== current.correctIndex
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
    document.createElement("button");

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

  questionEl.classList.add("hidden");
  choicesEl.classList.add("hidden");
  feedbackEl.classList.add("hidden");
  actionsEl.classList.add("hidden");

  resultEl.classList.remove("hidden");

  let message = "";

  if (score <= 1) {

    message =
      "😞 Résultat insuffisant. Continuez votre préparation CT-AI.";

  } else if (score === 2) {

    message =
      "😐 Peut mieux faire. Quelques notions restent à consolider.";

  } else if (score === 3) {

    message =
      "🙂 Bon travail ! Les bases sont acquises.";

  } else if (score === 4) {

    message =
      "🎉 Très bon résultat ! Vous êtes proche du niveau certification.";

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

async function restartQuiz() {

  currentQuestion = 0;
  score = 0;

  resultEl.classList.add("hidden");

  questionEl.classList.remove("hidden");
  choicesEl.classList.remove("hidden");
  feedbackEl.classList.remove("hidden");
  actionsEl.classList.remove("hidden");

  await generateQuestionsFromAI();
}

restartButton.addEventListener(
  "click",
  restartQuiz
);

generateQuestionsFromAI();