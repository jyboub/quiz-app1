// ========== SUPABASE INITIALIZATION ==========
const SUPABASE_URL = 'https://gysybzdqrmxnxwodcaju.supabase.co';
const SUPABASE_KEY = 'sb_publishable_kEmDn9lzusPbt03GVp8ZfA_ybdjwlsb';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Vérifier l'initialisation du client Supabase
console.log('✓ Supabase client initialisé:', supabaseClient ? 'OK' : 'ERREUR');

// ========== QUIZ IA - QUESTIONS GENEREES DYNAMIQUEMENT ==========

// Thème sélectionné par l'utilisateur (récupéré du formulaire d'accueil).
let selectedTheme = 'ISTQB IA';

// Numéro de classe pour la table Supabase (questions_classeX).
let classNumber = '1';

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
 * Récupère les valeurs du formulaire d'accueil et lance le quiz.
 */
function startQuiz() {
    selectedTheme = document.getElementById('themeSelect').value;
    classNumber = document.getElementById('classSelect').value;

    console.log(`🎯 Quiz démarré - Thème: ${selectedTheme}, Classe: ${classNumber}`);

    // Masquer l'écran d'accueil et afficher l'écran de quiz
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('quizScreen').style.display = 'block';

    // Réinitialiser et démarrer le quiz
    currentQuestion = 0;
    score = 0;
    answered = false;
    currentQuizItem = null;
    prefetch = null;
    prefetchReady = false;
    askedQuestions.length = 0;

    // Lancer la première question
    renderQuestion();
}

/**
 * Construit le prompt envoyé à l'IA pour générer une question.
 * Demande un JSON strict et varie le sous-thème pour changer à chaque exécution.
 * @returns {string}
 */
const SUBTHEMES_BY_THEME = {
    'ISTQB IA': [
        'la dérive des données (data drift) et le monitoring en production',
        'les tests adversariaux et la robustesse du modèle',
        'les biais et l\'équité (fairness) des systèmes d\'IA',
        'l\'explicabilité et l\'interprétabilité (XAI)',
        'la qualité et la préparation des données de test',
        'les métriques d\'évaluation (précision, rappel, F1, matrice de confusion)',
        'la généralisation et les tests hors distribution (out-of-distribution)',
        'les fondamentaux du test logiciel ISTQB (niveaux, types, techniques de test)'
    ],
    'Géographie': [
        'les capitales des pays du monde',
        'les chaînes de montagnes et les géographes célèbres',
        'les océans, mers et fleuves importants',
        'les climats et les zones biogéographiques',
        'la démographie et les villes les plus peuplées',
        'les ressources naturelles et l\'exploitation minière',
        'les frontières et les régions historiques',
        'la géologie et la formation des continents'
    ],
    'Gastronomie': [
        'les cuisines du monde et leurs traditions',
        'les techniques culinaires classiques et modernes',
        'les ingrédients et leurs origines',
        'les chefs cuisiniers célèbres et leurs innovations',
        'les accords mets-vins et les boissons',
        'l\'histoire de la gastronomie française et européenne',
        'les desserts et pâtisseries du monde',
        'la nutrition et la cuisine saine'
    ]
};

function buildPrompt() {
    const alreadyAsked = askedQuestions.length
        ? `\n\nNe répète AUCUNE de ces questions déjà posées :\n- ${askedQuestions.join('\n- ')}`
        : '';

    // Récupérer les sous-thèmes pour le thème sélectionné
    const subthemes = SUBTHEMES_BY_THEME[selectedTheme] || SUBTHEMES_BY_THEME['ISTQB IA'];
    const focus = subthemes[Math.floor(Math.random() * subthemes.length)];

    return `Génère UNE question de quiz à choix multiple, en français, sur le thème : ${selectedTheme}.
Concentre-toi sur : ${focus}.

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
    let text = rawText
		.replace(/^```json\s*/i, '')
		.replace(/^```\s*/i, '')
		.replace(/\s*```$/i, '')
		.trim();

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
 * Insère une question générée dans la table Supabase questions_classeX.
 * Capture les erreurs sans interrompre le quiz.
 * @param {string} questionText - Le texte de la question
 * @param {string[]} options - Tableau des options de réponse
 * @param {number} correctAnswerIndex - Index (0, 1 ou 2) de la bonne réponse
 * @returns {Promise<void>}
 */
async function insertQuestionToSupabase(questionText, options, correctAnswerIndex) {
    try {
        const tableName = `questions_classe${classNumber}`;
        
        const { data, error } = await supabaseClient
            .from(tableName)
            .insert([
                {
                    texte: questionText,
                    choix: options,
                    bonne_reponse: String(correctAnswerIndex), // Convertir l'index en string
                    difficulte: 'moyen',
                    theme: selectedTheme,
                    statut: 'publié',
                    contexte: 'quiz'
                }
            ]);

        if (error) {
            console.warn(`⚠️ Insertion dans ${tableName} échouée:`, error.message);
        } else {
            console.log(`✓ Question insérée dans ${tableName}:`, questionText.substring(0, 50) + '...');
        }
    } catch (err) {
        console.error('❌ Erreur lors de l\'insertion Supabase:', err);
    }
}
async function getQuestionFromSupabase() {
  try {
    const { data, error } = await supabaseClient
      .from(`questions_classe${classNumber}`)
      .select("*")
      .eq("contexte", "quiz")
      .eq("theme", selectedTheme);

    if (error) {
      console.error("❌ Erreur lecture Supabase :", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const availableQuestions = data.filter(
      q => !askedQuestions.includes(q.texte)
    );

    if (availableQuestions.length === 0) {
      return null;
    }

    const randomQuestion =
      availableQuestions[
        Math.floor(Math.random() * availableQuestions.length)
      ];
	
	console.log("Question Supabase :", {
    question: randomQuestion.texte,
    choix: randomQuestion.choix,
    bonne_reponse: randomQuestion.bonne_reponse
	});
	
	console.log(
    "correctAnswer =",
    Number(randomQuestion.bonne_reponse)
	);

		let correctAnswer;

	if (
		randomQuestion.bonne_reponse === "0" ||
		randomQuestion.bonne_reponse === "1" ||
		randomQuestion.bonne_reponse === "2"
	) {
		correctAnswer = Number(randomQuestion.bonne_reponse);
	} else {
    correctAnswer = randomQuestion.choix.indexOf(
        randomQuestion.bonne_reponse
    );
	}

	if (correctAnswer < 0 || correctAnswer > 2) {
    console.warn(
        "Question ignorée (bonne réponse invalide) :",
        randomQuestion
    );
    return null;
	}

	return {
    question: randomQuestion.texte,
    options: randomQuestion.choix,
    correctAnswer
	};
``
  } catch (err) {
    console.error(
      "❌ Erreur récupération question :",
      err
    );
    return null;
  }
}

async function genererEtEnregistrerPourTest(theme, nombre) {
    const resultats = [];

    for (let i = 0; i < nombre; i++) {
        try {
            const ancienTheme = selectedTheme;

            selectedTheme = theme;

            const item = await generateQuestion();

            selectedTheme = ancienTheme;

            const tableName = `questions_classe${classNumber}`;

            const { error } = await supabaseClient
                .from(tableName)
                .insert([
                    {
                        texte: item.question,
                        choix: item.options,
                        bonne_reponse: String(item.correctAnswer),
                        difficulte: 'moyen',
                        theme: theme,
                        statut: 'publié',
                        contexte: 'test'
                    }
                ]);

            resultats.push({
                numero: i + 1,
                theme,
                question: item.question,
                bonne_reponse: item.correctAnswer,
                insertion: error ? 'ERREUR' : 'OK',
                erreur: error ? error.message : ''
            });

            if (error) {
                console.error(
                    `❌ Erreur insertion question ${i + 1}`,
                    error
                );
            }
        } catch (err) {
            resultats.push({
                numero: i + 1,
                theme,
                question: '',
                bonne_reponse: '',
                insertion: 'ERREUR',
                erreur: err.message
            });

            console.error(
                `❌ Erreur génération question ${i + 1}`,
                err
            );
        }
    }

    console.table(resultats);

    return resultats;
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
    let item = await getQuestionFromSupabase();

    if (!item) {
        item = await generateQuestion();

    }

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

    // Insérer la question dans Supabase (en arrière-plan, sans bloquer le quiz).
  //  insertQuestionToSupabase(item.question, item.options, item.correctAnswer);

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
 * Réinitialise le quiz et retourne à l'écran d'accueil.
 */
function restartQuiz() {
    // Masquer l'écran de quiz et afficher l'écran d'accueil
    document.getElementById('quizScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'flex';

    // Réinitialiser les variables
    currentQuestion = 0;
    score = 0;
    answered = false;
    currentQuizItem = null;
    prefetch = null;
    prefetchReady = false;
    askedQuestions.length = 0;
}

// Initialiser : afficher l'écran d'accueil au chargement
document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ Page chargée - Écran d\'accueil prêt');
    // L'écran d'accueil est affiché par défaut dans le HTML
});
