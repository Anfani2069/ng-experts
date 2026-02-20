# Guide : Éditeur de Texte Riche (WYSIWYG)

## 📝 Résumé des fonctionnalités ajoutées

J'ai intégré un **éditeur de texte riche (Rich Text Editor)** basé sur **Quill** pour la saisie des descriptions dans les expériences et l'éducation. Vous pouvez maintenant :

### ✨ Fonctionnalités de l'éditeur
- ✅ **Mise en forme du texte** : Gras, italique, souligné, barré
- ✅ **Titres** : 3 niveaux de titres (H1, H2, H3)
- ✅ **Listes** : Listes ordonnées et à puces
- ✅ **Indentation** : Augmenter/réduire l'indentation
- ✅ **Liens** : Insérer des liens hypertextes
- ✅ **Nettoyage** : Supprimer toute mise en forme

### 🎯 Fonctionnalités de gestion
- ✅ **Ajouter** des expériences/formations avec descriptions riches
- ✅ **Modifier** les expériences/formations existantes (nouveau !)
- ✅ **Supprimer** les expériences/formations
- ✅ Le contenu HTML est préservé et affiché correctement

## 🏗️ Architecture technique

### 1. Composant RichTextEditor

**Fichier** : `src/app/shared/components/rich-text-editor/rich-text-editor.component.ts`

Le composant wrapper autour de Quill qui :
- Implémente `ControlValueAccessor` pour l'intégration avec Angular Forms
- Expose des inputs pour la configuration (`placeholder`, `height`, `initialValue`)
- Émet un événement `contentChange` avec le HTML généré
- Stylé pour s'intégrer avec le thème sombre de l'application

### 2. Modifications dans ProfileEdit

**Fichiers modifiés** :
- `src/app/features/profile-edit/profile-edit.component.ts`
- `src/app/features/profile-edit/profile-edit.component.html`

#### Nouveaux signaux ajoutés :
```typescript
protected readonly isEditingExperience = signal<string | null>(null);
protected readonly isEditingEducation = signal<string | null>(null);
protected readonly editExperience = signal({ ... });
protected readonly editEducation = signal({ ... });
```

#### Nouvelles méthodes :

**Pour les expériences :**
- `startEditExperience(exp: Experience)` : Commence l'édition d'une expérience
- `cancelEditExperience()` : Annule l'édition en cours
- `updateEditExperience(field, value)` : Met à jour un champ pendant l'édition
- `confirmEditExperience()` : Sauvegarde les modifications

**Pour l'éducation :**
- `startEditEducation(edu: Education)` : Commence l'édition d'une formation
- `cancelEditEducation()` : Annule l'édition en cours
- `updateEditEducation(field, value)` : Met à jour un champ pendant l'édition
- `confirmEditEducation()` : Sauvegarde les modifications

**Méthode utilitaire :**
- `formatDateForInput(date: Date)` : Formate une date pour les inputs HTML

## 🎨 Interface utilisateur

### Mode Affichage
Chaque expérience/formation affiche :
- Un bouton **Modifier** (icône crayon) pour éditer
- Un bouton **Supprimer** (icône poubelle) pour supprimer
- Le contenu HTML est affiché avec `[innerHTML]` pour préserver la mise en forme

### Mode Édition
Quand on clique sur "Modifier" :
- Le formulaire d'édition s'affiche à la place de l'affichage
- L'éditeur de texte riche est initialisé avec le contenu existant
- Boutons "Enregistrer" et "Annuler" pour valider ou annuler

### Mode Ajout
Quand on clique sur "Ajouter" :
- Un formulaire vierge apparaît
- L'éditeur de texte riche est disponible pour la description
- Boutons "Ajouter" et "Annuler"

## 📦 Dépendances ajoutées

```json
{
  "quill": "^2.0.2"
}
```

## 🚀 Utilisation

### Pour ajouter une expérience/formation :
1. Cliquez sur "+ Ajouter un projet" ou "+ Ajouter une formation"
2. Remplissez les champs (titre, entreprise, dates, etc.)
3. Utilisez l'éditeur de texte riche pour la description :
   - Sélectionnez du texte et utilisez la barre d'outils
   - Cliquez sur les boutons pour appliquer la mise en forme
4. Cliquez sur "Ajouter" pour sauvegarder

### Pour modifier une expérience/formation :
1. Cliquez sur l'icône de crayon (✏️) à côté de l'élément
2. Modifiez les champs souhaités
3. Utilisez l'éditeur pour mettre à jour la description
4. Cliquez sur "Enregistrer" pour sauvegarder ou "Annuler" pour abandonner

### Pour supprimer une expérience/formation :
1. Cliquez sur l'icône de poubelle (🗑️) à côté de l'élément
2. L'élément est immédiatement supprimé

## 🎨 Personnalisation

Le style de l'éditeur est personnalisé pour s'adapter au thème de l'application :
- Fond sombre avec transparence
- Bordures subtiles
- Couleur primaire (rose) pour les boutons actifs
- Texte blanc pour une meilleure lisibilité

## 📄 Fichiers créés/modifiés

### Créés :
- `src/app/shared/components/rich-text-editor/rich-text-editor.component.ts`

### Modifiés :
- `src/styles.scss` (import CSS de Quill)
- `src/app/shared/components/index.ts` (export du composant)
- `src/app/features/profile-edit/profile-edit.component.ts` (logique d'édition)
- `src/app/features/profile-edit/profile-edit.component.html` (interface)

## 🔧 Notes techniques

- Le contenu est stocké en HTML dans Firebase
- Le composant utilise `ControlValueAccessor` pour une intégration transparente avec les formulaires Angular
- Les changements sont détectés automatiquement grâce aux signaux Angular
- L'éditeur supporte l'initialisation avec du contenu existant via `initialValue`

## 🎉 Résultat

Vous avez maintenant un éditeur de texte professionnel qui permet de :
- ✅ Formater le texte comme dans Word
- ✅ Créer des listes structurées
- ✅ Ajouter des titres et sous-titres
- ✅ Modifier les expériences/formations après validation
- ✅ Avoir un aperçu en temps réel du formatage

Profitez de votre nouvel éditeur ! 🚀
