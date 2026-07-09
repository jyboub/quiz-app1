// Quiz ISTQB IA — questions générées dynamiquement via le proxy IA (Vercel)

// Endpoint du proxy Vercel (la clé ANTHROPIC_API_KEY reste côté serveur).
const PROXY_URL = 'https://quiz-proxy2.vercel.app/api/ask-claude';

// Nombre total de questions du quiz.
const TOTAL_QUESTIONS = 5;

// Intitulés déjà générés dans la session courante (anti-doublons).
const askedQuestions = [];

let currentQuestion = 0;
let score = 0;
let answered = false;
// Question en cours : { question, options: [3], correctAnswer: 0|1|2 }
let currentQuizItem = null;
// Promesse de la question suivante, préchargée pendant qu'on répond à la question en cours.
let prefetch = null;
// Indique si le préchargement est déjà résolu (question prête à afficher immédiatement).
let prefetchReady = false;

/**
 * Construit le prompt envoyé à l'IA pour générer une question.
 * Demande un JSON strict et varie le sous-thème pour changer à chaque exécution.
 * @returns {string}
 */
const SUBTHEMES = [
    'la dérive des données (data drift) et le monitoring en production',
    'les tests adversariaux et la robustesse du modèle',
    'les biais et l\'équité (fairness) des systèmes d\'IA',
    'l\'explicabilité et l\'interprétabilité (XAI)',
    'la qualité et la préparation des données de test',
    'les métriques d\'évaluation (précision, rappel, F1, matrice de confusion)',
    'la généralisation et les tests hors distribution (out-of-distribution)',
    'les fondamentaux du test logiciel ISTQB (niveaux, types, techniques de test)'
];

function buildPrompt() {
    const alreadyAsked = askedQuestions.length
        ? `\n\nNe répète AUCUNE de ces questions déjà posées :\n- ${askedQuestions.join('\n- ')}`
        : '';

    // Tirage aléatoire côté client pour varier le sujet à chaque exécution.
    const focus = SUBTHEMES[Math.floor(Math.random() * SUBTHEMES.length)];

    return `Génère UNE question de quiz à choix multiple, en français.
Thème : le plus souvent le test de systèmes d'IA (ISTQB CT-AI : dérive/drift, tests adversariaux, robustesse, biais, explicabilité, données de test, métriques...), et parfois les fondamentaux du test logiciel ISTQB.
Pour cette question, concentre-toi de préférence sur : ${focus}.

Contraintes :
- exactement 3 options de réponse ;
- une seule bonne réponse ;
- "correctAnswer" est l'index (0, 1 ou 2) de la bonne réponse dans "options".

Réponds UNIQUEMENT avec un objet JSON strict, sans texte autour ni balises Markdown, au format exact :
{"question": "...", "options": ["...", "...", "..."], "correctAnswer": 0}${alreadyAsked}`;
}

/**
 * Extrait et valide la question depuis le texte brut renvoyé par l'IA.
 * N'écrit jamais dans le DOM ; lève une erreur si la réponse est inexploitable.
 * @param {string} rawText
 * @returns {{question: string, options: string[], correctAnswer: number}}
 */
function parseQuestion(rawText) {
    if (typeof rawText !== 'string' || !rawText.trim()) {
        throw new Error('Réponse vide de l\'IA.');
    }

    // Nettoyage d'éventuelles clôtures Markdown (```json ... ```).
    let text = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    // On isole la sous-chaîne du premier { au dernier } pour ignorer tout texte parasite.
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
        throw new Error('Aucun objet JSON détecté dans la réponse.');
    }
    text = text.slice(start, end + 1);

    let item;
    try {
        item = JSON.parse(text);
    } catch (e) {
        throw new Error('JSON invalide renvoyé par l\'IA.');
    }

    // Validation de forme stricte.
    const questionOk = typeof item.question === 'string' && item.question.trim().length > 0;
    const optionsOk = Array.isArray(item.options)
        && item.options.length === 3
        && item.options.every(o => typeof o === 'string' && o.trim().length > 0);
    const answerOk = Number.isInteger(item.correctAnswer)
        && item.correctAnswer >= 0
        && item.correctAnswer <= 2;

    if (!questionOk || !optionsOk || !answerOk) {
        throw new Error('Format de question inattendu.');
    }

    return {
        question: item.question.trim(),
        options: item.options.map(o => o.trim()),
        correctAnswer: item.correctAnswer
    };
}

/**
 * Appelle le proxy IA et renvoie une question validée.
 * @returns {Promise<{question: string, options: string[], correctAnswer: number}>}
 */
async function generateQuestion() {
    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [{ role: 'user', content: buildPrompt() }]
        })
    });

    if (!response.ok) {
        throw new Error(`Le service a répondu ${response.status}.`);
    }

    const data = await response.json();
    // Le proxy renvoie la réponse Claude verbatim : le texte est dans content[0].text.
    const rawText = data && data.content && data.content[0] && data.content[0].text;
    return parseQuestion(rawText);
}

/**
 * Génère une question ET enregistre son intitulé pour l'anti-doublon.
 * Enregistrer ici (et non à l'affichage) garantit que le préchargement
 * de la question suivante connaît déjà les intitulés en attente.
 * @returns {Promise<{question: string, options: string[], correctAnswer: number}>}
 */
async function loadQuestion() {
    const item = await generateQuestion();
    askedQuestions.push(item.question);
    return item;
}

/**
 * Lance en arrière-plan le préchargement de la question suivante,
 * sauf si on est déjà sur la dernière. Les erreurs éventuelles sont
 * absorbées ici et retraitées au moment de l'affichage.
 */
function prefetchNext() {
    if (currentQuestion + 1 >= TOTAL_QUESTIONS) {
        prefetch = null;
        prefetchReady = false;
        return;
    }
    prefetchReady = false;
    prefetch = loadQuestion();
    // Marque la question comme prête dès résolution (affichage immédiat possible).
    prefetch.then(() => { prefetchReady = true; }, () => {});
}

/**
 * Met à jour la barre de progression et le texte.
 */
function updateProgress() {
    const progress = ((currentQuestion + 1) / TOTAL_QUESTIONS) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `Question ${currentQuestion + 1} sur ${TOTAL_QUESTIONS}`;
}

/**
 * Affiche l'état de chargement pendant la génération de la question.
 */
function showLoading() {
    const quizContent = document.getElementById('quizContent');
    quizContent.innerHTML = `
        <div class="question-counter">
            <span class="counter-label">Progression</span>
            <span class="score-display">${score} point${score > 1 ? 's' : ''} / ${TOTAL_QUESTIONS}</span>
        </div>
        <div class="question-section">
            <div class="question-text">Génération de la question…</div>
        </div>
    `;
    updateProgress();
}

/**
 * Affiche un message d'erreur clair et un bouton Réessayer.
 * @param {string} [detail] - Détail technique optionnel.
 */
function showError(detail) {
    const quizContent = document.getElementById('quizContent');
    quizContent.innerHTML = `
        <div class="question-section">
            <div class="feedback-zone incorrect-feedback show">
                Impossible de générer la question. Vérifiez votre connexion et réessayez.
            </div>
            ${detail ? `<p style="margin-top:15px;color:#999;font-size:13px;text-align:center;">${detail}</p>` : ''}
        </div>
        <div class="button-group">
            <button class="btn btn-primary" onclick="renderQuestion()">Réessayer</button>
        </div>
    `;
}

/**
 * Génère et affiche la question courante.
 * Consomme la question préchargée si disponible (affichage immédiat),
 * sinon la génère à la volée. Déclenche ensuite le préchargement de la suivante.
 */
async function renderQuestion() {
    if (currentQuestion >= TOTAL_QUESTIONS) {
        showCompletion();
        return;
    }

    // Si une question préchargée est déjà prête, affichage immédiat ;
    // sinon (1ère question, ou préchargement pas encore terminé) on montre l'état de chargement.
    const pending = prefetch || loadQuestion();
    if (!prefetchReady) {
        showLoading();
    }
    prefetch = null;
    prefetchReady = false;

    let item;
    try {
        item = await pending;
    } catch (error) {
        showError(error && error.message);
        return;
    }

    currentQuizItem = item;
    answered = false;

    displayQuestion(item);

    // Précharge la question suivante pendant que l'utilisateur répond.
    prefetchNext();
}

/**
 * Affiche dans le DOM une question déjà résolue.
 * @param {{question: string, options: string[], correctAnswer: number}} item
 */
function displayQuestion(item) {
    const optionsHTML = item.options
        .map((option, index) => `
            <button class="option" onclick="selectAnswer(${index}, this)">
                ${option}
            </button>
        `)
        .join('');

    const quizContent = document.getElementById('quizContent');
    quizContent.innerHTML = `
        <div class="question-counter">
            <span class="counter-label">Progression</span>
            <span class="score-display">${score} point${score > 1 ? 's' : ''} / ${TOTAL_QUESTIONS}</span>
        </div>
        <div class="question-section">
            <div class="question-text">${item.question}</div>
            <div class="options-grid">
                ${optionsHTML}
            </div>
            <div class="feedback-zone" id="feedbackZone"></div>
        </div>
        <div class="button-group">
            <button class="btn btn-primary" id="nextBtn" onclick="nextQuestion()" disabled>
                ${currentQuestion === TOTAL_QUESTIONS - 1 ? 'Terminer' : 'Suivant'}
            </button>
        </div>
    `;

    updateProgress();
}

/**
 * Gère la sélection d'une réponse.
 * @param {number} index - L'index de la réponse sélectionnée
 * @param {HTMLElement} element - L'élément bouton cliqué
 */
function selectAnswer(index, element) {
    if (answered) return;

    answered = true;
    const feedbackZone = document.getElementById('feedbackZone');
    const nextBtn = document.getElementById('nextBtn');
    const allOptions = document.querySelectorAll('.option');

    // Désactiver tous les boutons
    allOptions.forEach(opt => opt.classList.add('disabled'));

    if (index === currentQuizItem.correctAnswer) {
        // Réponse correcte
        element.classList.add('correct');
        feedbackZone.classList.add('correct-feedback', 'show');
        feedbackZone.textContent = '✓ Correct !';
        score++;
    } else {
        // Réponse incorrecte
        element.classList.add('incorrect');
        allOptions[currentQuizItem.correctAnswer].classList.add('correct');
        feedbackZone.classList.add('incorrect-feedback', 'show');
        feedbackZone.textContent = '✗ Incorrect';
    }

    // Activer le bouton suivant
    nextBtn.disabled = false;
}

/**
 * Passe à la question suivante (nouvelle génération IA).
 */
function nextQuestion() {
    currentQuestion++;
    renderQuestion();
}

/**
 * Affiche l'écran de completion avec le score final.
 */
function showCompletion() {
    const quizContent = document.getElementById('quizContent');

    let message = '';
    if (score === TOTAL_QUESTIONS) {
        message = 'Parfait ! Vous maîtrisez l\'ISTQB IA ! 🎓';
    } else if (score >= 4) {
        message = 'Excellent travail ! Vous avez une bonne compréhension.';
    } else if (score >= 3) {
        message = 'Bon résultat ! Continuez vos apprentissages.';
    } else {
        message = 'Vous devriez approfondir vos connaissances en test d\'IA.';
    }

    quizContent.innerHTML = `
        <div class="completion-message">
            <h2>${message}</h2>
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">${score}/${TOTAL_QUESTIONS}</div>
                    <div class="stat-label">Score Final</div>
                </div>
            </div>
            <p style="margin-top: 20px;">Merci d'avoir participé à ce quiz ISTQB IA !</p>
        </div>
        <div class="button-group">
            <button class="btn btn-primary" onclick="restartQuiz()">Recommencer</button>
        </div>
    `;
}

/**
 * Réinitialise le quiz (nouvelles questions).
 */
function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    currentQuizItem = null;
    prefetch = null;
    prefetchReady = false;
    askedQuestions.length = 0;
    renderQuestion();
}

// Initialiser le quiz au chargement
document.addEventListener('DOMContentLoaded', function() {
    renderQuestion();
});
