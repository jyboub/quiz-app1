"use strict";

// ── Supabase ──────────────────────────────────────────────
const SUPABASE_URL = "https://gysybzdqrmxnxwodcaju.supabase.co";
const SUPABASE_KEY = "sb_publishable_kEmDn9lzusPbt03GVp8ZfA_ybdjwlsb";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
console.log("✅ Client Supabase initialisé :", supabaseClient);
// ─────────────────────────────────────────────────────────

const PROXY_URL = "/api/ask-claude";

// État global
let currentQuestion = 0;
let score = 0;
let selectedTheme = null;
let selectedClass = null;
let QUESTIONS = [];

// ── Éléments DOM (index.html) ────────────────────────────
const homeScreen   = document.getElementById("homeScreen");
const quizScreen   = document.getElementById("quizScreen");
const quizContent  = document.getElementById("quizContent");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const themeSelect  = document.getElementById("themeSelect");
const classSelect  = document.getElementById("classSelect");
// ─────────────────────────────────────────────────────────

// Appelée par le bouton "Commencer le quiz" dans index.html
async function startQuiz() {

  selectedTheme = themeSelect.value;
  selectedClass = classSelect.value;

  console.log(`▶ Démarrage — thème : ${selectedTheme}, classe : ${selectedClass}`);

  // Passage à l'écran quiz
  homeScreen.style.display  = "none";
  quizScreen.style.display  = "block";

  QUESTIONS = [];
  currentQuestion = 0;
  score = 0;

  await generateAndInsertQuestion(selectedTheme, selectedClass);
}

// ── Génération IA + insertion Supabase ───────────────────
async function generateAndInsertQuestion(theme, classeNum) {

  const table = `questions_classe${classeNum}`;

  quizContent.innerHTML = `<p style="text-align:center;font-size:1.1rem;">⏳ Génération de la question…</p>`;

  try {

    const response = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `Génère une question de quiz sur le thème "${theme}".
Réponds UNIQUEMENT en JSON valide, sans balises markdown, sans texte avant ou après, avec exactement ce format :
{
  "texte": "La question ici ?",
  "choix": ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
  "bonne_reponse": "Réponse A",
  "difficulte": "moyen"
}`
          }
        ]
      })
    });

    const data = await response.json();
    const raw  = data.content[0].text;

    // Nettoyage des balises markdown éventuelles (```json ... ```)
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // Insertion dans Supabase avec le thème réellement choisi
    const { error } = await supabaseClient
      .from(table)
      .insert({
        texte:         parsed.texte,
        choix:         parsed.choix,
        bonne_reponse: parsed.bonne_reponse,
        difficulte:    parsed.difficulte,
        theme:         theme,
        statut:        "en_attente",
        contexte:      "quiz"
      });

    if (error) {
      console.error("❌ Erreur insertion Supabase :", error);
      quizContent.innerHTML = `<p style="color:red;text-align:center;">Erreur lors de l'enregistrement. Réessaie.</p>`;
      return;
    }

    console.log("✅ Question insérée dans Supabase :", parsed);

    const correctIndex = parsed.choix.indexOf(parsed.bonne_reponse);

    QUESTIONS.push({
      question:     parsed.texte,
      choices:      parsed.choix,
      correctIndex: correctIndex >= 0 ? correctIndex : 0
    });

    renderQuestion();

  } catch (err) {
    console.error("❌ Erreur génération :", err);
    quizContent.innerHTML = `<p style="color:red;text-align:center;">Erreur lors de la génération. Réessaie.</p>`;
  }
}
// ─────────────────────────────────────────────────────────

function updateProgress() {
  const total   = QUESTIONS.length;
  const pct     = total > 0 ? ((currentQuestion + 1) / total) * 100 : 0;
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `Question ${currentQuestion + 1} sur ${total} — Score : ${score}/${total}`;
}

function renderQuestion() {

  updateProgress();

  const current = QUESTIONS[currentQuestion];

  quizContent.innerHTML = `
    <div class="quiz__question" style="text-align:center;padding:20px;border:2px solid #e5e7eb;border-radius:12px;margin-bottom:20px;">
      <h2>${current.question}</h2>
    </div>
    <div id="choices" class="quiz__choices" style="display:flex;flex-wrap:wrap;gap:15px;"></div>
    <p id="feedback" class="quiz__feedback" role="status" aria-live="polite" style="margin-top:20px;text-align:center;font-size:1.2rem;font-weight:bold;min-height:30px;"></p>
    <div id="actions" style="display:flex;justify-content:center;margin-top:20px;"></div>
  `;

  const choicesEl = document.getElementById("choices");
  const feedbackEl = document.getElementById("feedback");
  const actionsEl  = document.getElementById("actions");

  current.choices.forEach((choice, index) => {

    const btn = document.createElement("button");
    btn.className   = "quiz__choice";
    btn.textContent = choice;
    btn.style.cssText = "flex:1 1 calc(50% - 15px);padding:15px;border-radius:12px;border:2px solid #d1d5db;background:white;cursor:pointer;font-size:1rem;transition:all .2s;";

    btn.addEventListener("click", () => handleAnswer(index, current, feedbackEl, actionsEl));
    choicesEl.appendChild(btn);
  });
}

function handleAnswer(selectedIndex, current, feedbackEl, actionsEl) {

  const buttons = document.querySelectorAll(".quiz__choice");
  buttons.forEach(btn => { btn.disabled = true; });

  if (selectedIndex === current.correctIndex) {
    score++;
    feedbackEl.textContent  = "✅ Correct";
    feedbackEl.style.color  = "#22c55e";
  } else {
    feedbackEl.textContent  = "❌ Incorrect";
    feedbackEl.style.color  = "#ef4444";
    buttons[selectedIndex].style.background = "#ef4444";
    buttons[selectedIndex].style.color      = "white";
  }

  buttons[current.correctIndex].style.background = "#22c55e";
  buttons[current.correctIndex].style.color      = "white";

  updateProgress();

  // Bouton suivant ou résultat
  const nextBtn = document.createElement("button");
  nextBtn.className   = "action-btn";
  nextBtn.style.cssText = "background:#4f46e5;color:white;border:none;padding:12px 24px;border-radius:10px;cursor:pointer;font-size:1rem;";
  nextBtn.textContent = "Question suivante";

  nextBtn.addEventListener("click", async () => {
    currentQuestion++;
    await generateAndInsertQuestion(selectedTheme, selectedClass);
  });

  actionsEl.appendChild(nextBtn);

  // Bouton "Retour à l'accueil"
  const homeBtn = document.createElement("button");
  homeBtn.className   = "action-btn";
  homeBtn.style.cssText = "background:#6b7280;color:white;border:none;padding:12px 24px;border-radius:10px;cursor:pointer;font-size:1rem;margin-left:10px;";
  homeBtn.textContent = "🏠 Changer de thème";

  homeBtn.addEventListener("click", () => goHome());
  actionsEl.appendChild(homeBtn);
}

function goHome() {
  quizScreen.style.display = "none";
  homeScreen.style.display = "block";
  QUESTIONS = [];
  currentQuestion = 0;
  score = 0;
}
