# Architecture du projet Angular

Ce document décrit les **règles d’architecture, de structuration et de nommage** du projet Angular.  
L’objectif est d’assurer une application **lisible, maintenable, scalable** et cohérente dans le temps.

Cette architecture est inspirée des bonnes pratiques Angular modernes (≥ 2025) et de retours d’expérience sur des projets de taille moyenne à grande.

---

## 1. Structure globale

Toute l’application est contenue dans `src/app` et repose sur **trois dossiers principaux** :

src/app
├─ core/
├─ shared/
└─ features/


### Principe fondamental

La distinction entre `core`, `shared` et `features` repose sur **l’import et la réutilisation** :

- **Utilisé dans une seule feature** → `features`
- **Importé une seule fois, utilisé partout** → `core`
- **Importé et utilisé à plusieurs endroits** → `shared`

---

## 2. Dossier `features/`

### Rôle
Contient les **fonctionnalités métier** de l’application.

### Organisation
- 1 dossier = 1 feature (ou *Bounded Context* DDD)
- Chaque feature est **autonome**
- Une feature ne dépend **jamais d’une autre feature**

### Contenu possible
- components
- services
- facades
- store / state
- models / interfaces
- directives ou pipes spécifiques

### Exemple
features/
└─ employee-management/
├─ components/
├─ services/
├─ store/
├─ models/
├─ facade/
└─ tests/


### Découpage métier
Le découpage des features doit suivre les **domaines métier** (ex : `catalog`, `orders`, `billing`).  
Si une feature devient trop volumineuse, elle doit être découpée en **sous-features**.

---

## 3. Dossier `core/`

### Rôle
Contient le **cœur technique** de l’application.

### Règle
- Importé **une seule fois**
- Fournit des singletons globaux

### Contenu
- services transverses (auth, logging, notifications, errors…)
- HTTP interceptors
- guards et resolvers globaux
- composants de layout
- models / interfaces globales

### Règle stricte
`core` **ne dépend que de `core`**

---

## 4. Dossier `shared/`

### Rôle
Contient les **éléments réutilisables** à travers l’application.

### Contenu
- composants UI génériques
- directives partagées
- pipes partagées
- models liés aux éléments shared

### Dépendances autorisées
- `shared` → `shared`, `core`
- ❌ jamais une feature

---

## 5. Règles de dépendances (obligatoires)

| Source       | Peut dépendre de            |
|-------------|-----------------------------|
| core        | core                        |
| shared      | shared, core                |
| feature     | feature, shared, core       |

Si une feature dépend d’une autre feature :
➡️ **extraire la dépendance dans `shared`**  
ou  
➡️ **revoir les frontières métier**

---

## 6. Structure interne d’une feature

### Principes
- Même structure pour toutes les features
- Organisation reflétant la **hiérarchie UI**
- Découpage progressif (KISS / YAGNI)

### Exemple pour les components
employee-list/
├─ avatar/
├─ actions/
└─ overview/


- Les dossiers n’ont pas de préfixe inutile
- Les fichiers portent le **nom exact de la classe**

---

## 7. Nomenclature (Angular ≥ 2025)

### Suppression des suffixes
Les suffixes suivants **ne doivent plus être utilisés** :

- `Component`
- `Service`
- `Directive`
- `Pipe`

### Exemples
| Avant                  | Après           |
|------------------------|------------------|
| EmployeeListComponent  | EmployeeList     |
| EmployeeService        | Employees / Api  |
| HighlightDirective     | Highlight        |
| ShortenPipe            | Shorten          |

➡️ Objectif : **réduire le bruit cognitif**

---

## 8. Barrel files (`index.ts`)

### Principe
Utiliser des fichiers `index.ts` pour regrouper les exports d’un dossier.

### Exemple
```ts
// models/index.ts
export * from './employee';
export * from './manager';
import { Employee, Manager } from '../models';
Attention
Les barrel files peuvent introduire des dépendances circulaires.
Dans ce cas, importer directement le fichier concerné.

9. TypeScript paths (alias)
Problème
import { User } from '../../../core/auth/models';
Solution
Configurer des alias dans tsconfig.json :

{
  "compilerOptions": {
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"]
    }
  }
}
Résultat
import { User } from '@core/auth';
✔️ Imports lisibles
✔️ Refactorisation facilitée

10. Tests
Les tests peuvent être regroupés par comportement

Les données de test, fakes et harness sont stockés avec les tests

Le placement exact est laissé à la discrétion de l’équipe tant que la cohérence est respectée

11. Règles finales
Respect strict de core / shared / features

Pas de dépendances croisées entre features

Découpage métier prioritaire

Nommage clair, sans suffixes inutiles

Imports propres via barrel files et alias TS

12. Évolution
Cette architecture est idéale pour des applications Angular de taille moyenne.
Lorsque l’écosystème grandit :

extraction en librairies

micro-frontends

ou découpage par domaines applicatifs

Ces évolutions devront respecter les mêmes principes de dépendances.

