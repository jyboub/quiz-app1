# Quiz ISTQB CT-AI

## Description

Application de quiz développée dans le cadre du projet pédagogique.

Cette version implémente le Sprint C :

- Génération automatique des questions via Claude AI
- Score en temps réel
- Progression Question X/Y
- Navigation entre les questions
- Résultat final personnalisé
- Gestion des erreurs de génération
- Compatibilité GitHub Pages + Vercel

---

## Architecture

Frontend :

- HTML
- CSS
- JavaScript Vanilla

Backend :

- Vercel Function
- Proxy IA vers Claude

---

## Fonctionnement

Au chargement :

1. L'application appelle le proxy :

```text
/api/ask-claude
```

2. Claude génère 5 questions ISTQB CT-AI.

3. Les questions sont renvoyées au format JSON.

4. Le quiz est affiché.

---

## Format attendu

```json
[
  {
    "question": "Question",
    "choices": [
      "Réponse 1",
      "Réponse 2",
      "Réponse 3",
      "Réponse 4"
    ],
    "correctIndex": 0
  }
]
```

---

## Gestion des erreurs

Si :

- le proxy est indisponible
- Claude ne répond pas
- le JSON est invalide

alors l'application affiche :

```text
Impossible de générer les questions.
Veuillez réessayer plus tard.
```

---

## Lancement local

Installer les dépendances :

```bash
npm install
```

Lancer Vercel :

```bash
vercel dev
```

Application disponible sur :

```text
http://localhost:3000
```

---

## Déploiement

Déployer sur Vercel :

```bash
vercel --prod
```

---

## Variables d'environnement

Créer :

```text
ANTHROPIC_API_KEY
```

dans les variables d'environnement Vercel.

---

## Fonctionnalités implémentées

### Sprint B

- Score
- Progression
- Navigation
- Résultat final

### Sprint C

- Génération IA
- Parsing JSON
- Gestion d'erreurs
- Questions renouvelées automatiquement

---

## Auteurs

Projet Quiz IA - Formation Test Logiciel / ISTQB