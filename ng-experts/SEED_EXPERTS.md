# 🌱 Script de Seeding Firebase - Experts

Ce document explique comment peupler votre base de données Firebase avec des données d'experts de test.

## 📋 Prérequis

- Node.js installé
- Dépendances du projet installées (`npm install`)
- Configuration Firebase valide dans `src/environments/environment.ts`

## 🚀 Exécution du Script

### Option 1 : Via npm script (Recommandé)

```bash
npm run seed:experts
```

### Option 2 : Via ts-node directement

```bash
npx ts-node src/app/scripts/seed-experts.ts
```

## 📊 Données Créées

Le script créera **8 profils d'experts** dans la collection `users` de Firestore :

| Expert | Ville | Compétences principales |
|--------|-------|------------------------|
| Camille Coutens | Bordeaux | Vue.js, Nuxt, Ionic |
| Dina Ramarovahoaka | Bordeaux | Angular, React, TypeScript |
| Natacha Dupont | Lille | Angular, Next.js, MongoDB, Node.js |
| Brenda Meunier | Mende | Angular, TypeScript, RxJS, Python |
| Manon Carbonnel | Nantes | TypeScript, CSS, PHP, Angular |
| Emmanuelle Aboaf | Paris | Angular, React, Vue.js, Accessibility |
| Thomas Leroux | Lyon | Angular, Ionic, PWA, Capacitor |
| Sophie Martin | Toulouse | Angular, NgRx, RxJS, TypeScript |

## ✨ Caractéristiques des Données

- ✅ Tous les experts sont **vérifiés** (`verificationStatus: 'verified'`)
- ✅ Tous sont **disponibles** (`isAvailable: true`)
- ✅ Profils **publics** (`isPublic: true`)
- ✅ Données réalistes (bio, compétences, expériences, disponibilités)
- ✅ Notes et avis variés (4.7 à 5.0)
- ✅ Villes françaises variées

## 🔍 Vérification

Après l'exécution du script, vous pouvez vérifier les données :

1. **Dans la console Firebase** :
   - Allez sur [Firebase Console](https://console.firebase.google.com/)
   - Sélectionnez votre projet `ng-experts`
   - Naviguez vers Firestore Database
   - Vérifiez la collection `users`

2. **Dans l'application** :
   - Lancez l'app : `npm start`
   - Allez sur la page d'accueil
   - La section "Nos Experts Angular" devrait afficher les 8 experts

## ⚠️ Notes Importantes

- Le script **écrase** les données existantes si les IDs correspondent
- Les IDs des experts sont : `expert-001` à `expert-008`
- Si vous voulez ajouter plus d'experts, modifiez le fichier `src/app/scripts/seed-experts.ts`

## 🛠️ Personnalisation

Pour ajouter vos propres experts, éditez le fichier :
```
src/app/scripts/seed-experts.ts
```

Suivez la structure du modèle `Expert` défini dans :
```
src/app/core/models/user.model.ts
```

## 🐛 Dépannage

**Erreur : "Firebase not initialized"**
- Vérifiez votre configuration dans `src/environments/environment.ts`

**Erreur : "Permission denied"**
- Vérifiez les règles de sécurité Firestore
- En développement, vous pouvez temporairement autoriser les écritures

**Erreur : "ts-node command not found"**
```bash
npm install -D ts-node
```
