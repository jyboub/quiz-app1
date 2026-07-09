"use strict";

// URL du proxy IA.
// - En local (vercel dev) ou si le front est servi par Vercel : laisser "/api/ask-claude".
// - Sur GitHub Pages (front séparé du proxy) : remplacer par l'URL absolue Vercel,
//   ex : "https://VOTRE-PROJET.vercel.app/api/ask-claude".
const PROXY_URL = "/api/ask-claude";

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

  feedbackEl.textContent = "";

  // Bouton « Réessayer » : relance la génération sans recharger la page.
  actionsEl.innerHTML = "";

  const retry =
    document.createElement("button");

  retry.className =
    "next-btn";

  retry.textContent =
    "Réessayer";

  retry.addEventListener(
    "click",
    generateQuestionsFromAI
  );

  actionsEl.appendChild(retry);
}

/**
 * Réaffiche la vue quiz et masque l'écran de résultat.
 * Nécessaire au redémarrage depuis l'écran de résultat (où ces
 * éléments ont été masqués par showResults()).
 */
function showQuizView() {
  resultEl.classList.add("hidden");
  questionEl.classList.remove("hidden");
  choicesEl.classList.remove("hidden");
  feedbackEl.classList.remove("hidden");
  actionsEl.classList.remove("hidden");
}

async function generateQuestionsFromAI() {

  showQuizView();

  try {

    questionEl.textContent =
      "Chargement des questions IA...";

    const response =
      await fetch(PROXY_URL, {
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

    // Le proxy peut renvoyer une 404 (chemin introuvable) ou une 5xx :
    // on le détecte explicitement plutôt que de laisser JSON.parse planter.
    if (!response.ok) {
      throw new Error(`Proxy indisponible (HTTP ${response.status})`);
    }

    const data =
      await response.json();

    const text =
      data?.content?.[0]?.text;

    if (!text) {
      throw new Error("Réponse de l'IA vide ou inattendue");
    }

    QUESTIONS =
      parseQuestions(text);

    if (!Array.isArray(QUESTIONS) || QUESTIONS.length === 0) {
      throw new Error("Aucune question exploitable dans la réponse IA");
    }

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

/**
 * Extrait et parse le tableau JSON renvoyé par l'IA.
 * L'IA entoure souvent le JSON de texte ou de balises ```json ... ``` :
 * on isole le premier '[' et le dernier ']' avant de parser.
 * @param {string} text - texte brut renvoyé par l'IA
 * @returns {Array} tableau de questions
 */
function parseQuestions(text) {
  // Tentative directe.
  try {
    return JSON.parse(text);
  } catch (_) {
    // On extrait le bloc entre le premier '[' et le dernier ']'.
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");

    if (start === -1 || end === -1 || end < start) {
      throw new Error("Aucun tableau JSON trouvé dans la réponse IA");
    }

    return JSON.parse(text.slice(start, end + 1));
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