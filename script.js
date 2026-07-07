const questions = [
  {
    question: "Quelle est la capitale de la France ?",
    answers: ["Paris", "Lyon", "Marseille"],
    correct: "Paris"
  },
  {
    question: "Quel est le plus grand fleuve du monde ?",
    answers: ["Amazone", "Nil", "Congo"],
    correct: "Amazone"
  },
  {
    question: "Combien font 5 × 6 ?",
    answers: ["25", "30", "36"],
    correct: "30"
  }
];

let currentQuestionIndex = 0;
let score = 0;
let answered = false;

function displayQuestion() {
  answered = false;

  const currentQuestion = questions[currentQuestionIndex];

  document.getElementById("question").textContent = currentQuestion.question;
  document.getElementById("progression").textContent =
    `Question ${currentQuestionIndex + 1} / ${questions.length}`;
  document.getElementById("score").textContent =
    `Score : ${score} / ${questions.length}`;
  document.getElementById("feedback").textContent = "";
  document.getElementById("nextBtn").disabled = true;

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

  const currentQuestion = questions[currentQuestionIndex];
  const buttons = document.querySelectorAll("#answers button");

  buttons.forEach(btn => {
    btn.disabled = true;

    if (btn.textContent === currentQuestion.correct) {
      btn.classList.add("correct");
    }
  });

  if (selectedAnswer === currentQuestion.correct) {
    score++;
    button.classList.add("correct");
    document.getElementById("feedback").textContent = "Correct !";
  } else {
    button.classList.add("incorrect");
    document.getElementById("feedback").textContent = "Incorrect.";
  }

  document.getElementById("score").textContent =
    `Score : ${score} / ${questions.length}`;

  document.getElementById("nextBtn").disabled = false;
}

function nextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    displayQuestion();
  } else {
    showFinalResult();
  }
}

function showFinalResult() {
  document.querySelector(".quiz-header").style.display = "none";
  document.querySelector(".question-box").innerHTML =
    `<h2>Quiz terminé</h2>`;

  document.getElementById("answers").innerHTML = "";
  document.getElementById("feedback").textContent =
    `Score final : ${score} / ${questions.length}`;

  document.getElementById("nextBtn").textContent = "Recommencer";
  document.getElementById("nextBtn").disabled = false;
  document.getElementById("nextBtn").onclick = restartQuiz;
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;

  document.querySelector(".quiz-header").style.display = "flex";
  document.getElementById("nextBtn").textContent = "Suivant →";
  document.getElementById("nextBtn").onclick = nextQuestion;

  displayQuestion();
}

displayQuestion();