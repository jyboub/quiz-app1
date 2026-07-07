const TOTAL_QUESTIONS = 5;

// À remplacer par l'URL réelle de votre proxy Vercel
const PROXY_URL = "https://votre-proxy.vercel.app/api/generate-question";

let currentQuestionIndex = 0;
let score = 0;
let currentQuestion = null;
let answered = false;

async function loadQuestion() {
  answered = false;

  document.getElementById("question").textContent = "Génération de la question...";
  document.getElementById("answers").innerHTML = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("error").textContent = "";
  document.getElementById("nextBtn").disabled = true;

  updateHeader();

  try {
    const response = await fetch(PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        theme: "culture générale",
        level: "facile"
      })
    });

    if (!response.ok) {
      throw new Error("Le proxy IA ne répond pas correctement.");
    }

    const data = await response.json();

    validateQuestion(data);

    currentQuestion = data;
    displayQuestion();

  } catch (error) {
    showError("Impossible de générer une question. Réessayez plus tard.");
    console.error(error);
  }
}

function validateQuestion(data) {
  if (!data.question) {
    throw new Error("Question manquante.");
  }

  if (!Array.isArray(data.answers)) {
    throw new Error("Liste de réponses invalide.");
  }

  if (data.answers.length < 2) {
    throw new Error("Nombre de réponses insuffisant.");
  }

  if (!data.correctAnswer) {
    throw new Error("Bonne réponse manquante.");
  }

  if (!data.answers.includes(data.correctAnswer)) {
    throw new Error("La bonne réponse n'est pas dans les choix.");
  }
}

function displayQuestion() {
  document.getElementById("question").textContent = currentQuestion.question;

  const answersContainer = document.getElementById("answers");
  answersContainer.innerHTML = "";

  currentQuestion.answers.forEach(answer => {
    const button = document.createElement("button");
    button.textContent = answer;
    button.onclick = () => checkAnswer(button, answer);
    answersContainer.appendChild(button);
  });
}

function checkAnswer(button, selectedAnswer) {
  if (answered) return;

  answered = true;

  const buttons = document.querySelectorAll("#answers button");

  buttons.forEach(btn => {
    btn.disabled = true;

    if (btn.textContent === currentQuestion.correctAnswer) {
      btn.classList.add("correct");
    }
  });

  if (selectedAnswer === currentQuestion.correctAnswer) {
    score++;
    button.classList.add("correct");
    document.getElementById("feedback").textContent = "Correct !";
  } else {
    button.classList.add("incorrect");
    document.getElementById("feedback").textContent = "Incorrect.";
  }

  updateHeader();
  document.getElementById("nextBtn").disabled = false;
}

function nextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex < TOTAL_QUESTIONS) {
    loadQuestion();
  } else {
    showFinalResult();
  }
}

function updateHeader() {
  document.getElementById("progression").textContent =
    `Question ${currentQuestionIndex + 1} / ${TOTAL_QUESTIONS}`;

  document.getElementById("score").textContent =
    `Score : ${score} / ${TOTAL_QUESTIONS}`;
}

function showFinalResult() {
  document.getElementById("question").textContent = "Quiz terminé";
  document.getElementById("answers").innerHTML = "";
  document.getElementById("feedback").textContent =
    `Score final : ${score} / ${TOTAL_QUESTIONS}`;
  document.getElementById("error").textContent = "";

  document.getElementById("nextBtn").textContent = "Recommencer";
  document.getElementById("nextBtn").disabled = false;
  document.getElementById("nextBtn").onclick = restartQuiz;
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;

  document.getElementById("nextBtn").textContent = "Suivant →";
  document.getElementById("nextBtn").onclick = nextQuestion;

  loadQuestion();
}

function showError(message) {
  document.getElementById("question").textContent = "Erreur de génération";
  document.getElementById("answers").innerHTML = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("error").textContent = message;
}

loadQuestion();