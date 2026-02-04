# 🎨 Ng-Expert Design System

Documentation complète du système de design de la plateforme Ng-Expert.

---

## 📋 Table des matières

1. [Palette de couleurs](#palette-de-couleurs)
2. [Typographie](#typographie)
3. [Espacements](#espacements)
4. [Composants](#composants)
5. [Animations](#animations)
6. [Ombres](#ombres)
7. [Dégradés](#dégradés)

---

## 🎨 Palette de couleurs

### Couleurs principales (Angular Identity)

```css
/* Rose principal - Inspiré d'Angular */
primary: #E91E63

/* Rose foncé - Hover states */
primary-dark: #C2185B

/* Violet accent - Complémentaire Angular */
accent: #9C27B0
```

### Couleurs secondaires

```css
/* Gris foncé - Textes principaux */
secondary: #1E293B

/* Gris moyen - Textes secondaires */
secondary-light: #334155

/* Rose très clair - Backgrounds */
bg-soft: #FDF2F8
```

### Couleurs Angular (Référence)

```css
angular-red: #DD0031
angular-pink: #E91E63
angular-purple: #9C27B0
angular-gradient-start: #E91E63
angular-gradient-end: #9C27B0
```

### Couleurs fonctionnelles

```css
/* Badges et tags */
badge-bg: bg-pink-50
badge-text: text-primary

/* États de disponibilité */
available: bg-green-100 text-green-700
unavailable: bg-gray-100 text-gray-600
```

---

## ✍️ Typographie

### Polices

```css
/* Titres et headings */
font-heading: 'Space Grotesk', sans-serif
font-weight: 700
letter-spacing: -0.02em

/* Corps de texte */
font-body: 'DM Sans', sans-serif
font-weight: 400, 500, 700
```

### Hiérarchie des tailles

```css
/* Hero Title */
text-5xl md:text-6xl (48px → 60px)

/* Section Titles */
text-4xl md:text-5xl (36px → 48px)

/* Feature Titles */
text-3xl md:text-4xl (30px → 36px)

/* Body Large */
text-xl (20px)

/* Body Regular */
text-base (16px)

/* Small Text */
text-sm (14px)

/* Extra Small */
text-xs (12px)
```

---

## 📏 Espacements

### Padding & Margin

```css
/* Sections principales */
py-20 (80px vertical)
py-24 (96px vertical)

/* Containers */
px-6 (24px horizontal)

/* Cards */
p-6 (24px all sides)
p-8 (32px all sides)

/* Gaps */
gap-2 (8px)
gap-3 (12px)
gap-4 (16px)
gap-6 (24px)
gap-8 (32px)
gap-16 (64px)
```

### Border Radius

```css
rounded-xl: 1rem (16px)
rounded-2xl: 1.5rem (24px)
rounded-3xl: 2rem (32px)
rounded-full: 9999px (cercle parfait)
```

---

## 🧩 Composants

### Boutons

#### Bouton Principal (Primary)
```html
<button style="background: linear-gradient(135deg, #E91E63 0%, #9C27B0 100%);" 
        class="text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 hover:opacity-90">
    Texte du bouton
</button>
```

#### Bouton Secondaire (Outline)
```html
<button class="border-2 border-gray-300 hover:border-primary text-gray-700 hover:text-primary font-semibold px-8 py-4 rounded-xl transition-all bg-white">
    Texte du bouton
</button>
```

#### Bouton Petit (Navbar)
```html
<button class="border-0 rounded-full px-5 py-2 text-sm font-bold text-white hover:opacity-90 transition" 
        style="background: linear-gradient(135deg, #E91E63 0%, #9C27B0 100%);">
    Apply as an Expert
</button>
```

### Cards

#### Expert Card
```html
<div class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition">
    <!-- Avatar + Info -->
    <div class="flex items-start gap-4 mb-4">
        <img src="..." class="w-16 h-16 rounded-full border-2 border-gray-100">
        <div class="flex-1">
            <h3 class="font-bold text-lg mb-1">Nom</h3>
            <p class="text-sm text-gray-500">Ville</p>
        </div>
    </div>
    
    <!-- Description -->
    <p class="text-sm text-gray-600 mb-4 line-clamp-3">Description...</p>
    
    <!-- Badges -->
    <div class="flex flex-wrap gap-2 mb-4">
        <span class="px-3 py-1 bg-pink-50 text-primary text-xs rounded-full font-medium">Skill</span>
    </div>
    
    <!-- Disponibilités -->
    <div class="flex flex-wrap gap-2 text-xs text-gray-500">
        <span>Type</span>
        <span>•</span>
        <span>Type</span>
    </div>
</div>
```

#### Feature Card (Mockup)
```html
<div class="relative">
    <!-- Glow effect -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-3xl opacity-50"></div>
    
    <!-- Card content -->
    <div class="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <!-- Contenu -->
    </div>
</div>
```

### Badges

```html
<!-- Badge rose (skills) -->
<span class="px-3 py-1 bg-pink-50 text-primary text-xs rounded-full font-medium">Angular</span>

<!-- Badge statut -->
<span class="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">Disponible</span>

<!-- Badge compteur -->
<span class="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">+9</span>

<!-- Badge section -->
<span class="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">Fonctionnalités</span>
```

### Inputs

```html
<!-- Input de recherche -->
<input type="text" 
       placeholder="Rechercher des compétences..." 
       class="w-full px-6 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-base shadow-sm">

<!-- Select -->
<select class="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm">
    <option>Option</option>
</select>
```

---

## ✨ Animations

### Keyframes

```css
/* Float - Mouvement vertical doux */
@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
}
.animate-float { animation: float 4s ease-in-out infinite; }

/* Float Slow - Mouvement complexe */
@keyframes floatSlow {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(20px, -20px) rotate(5deg); }
    66% { transform: translate(-20px, 20px) rotate(-5deg); }
}
.animate-float-slow { animation: floatSlow 20s ease-in-out infinite; }

/* Pulse - Pulsation douce */
@keyframes pulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
}
.animate-pulse-slow { animation: pulse 4s ease-in-out infinite; }

/* Scroll - Défilement horizontal infini */
@keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}
.animate-scroll { animation: scroll 30s linear infinite; }

/* Fade In Up - Apparition depuis le bas */
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }

/* Scale In - Zoom d'apparition */
@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}
.animate-scaleIn { animation: scaleIn 0.5s ease-out; }
```

### Transitions

```css
/* Hover lift - Élévation au survol */
.hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* Transition standard */
transition-all
transition (default: 150ms)
```

---

## 🌑 Ombres

```css
/* Soft - Légère */
shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.04)

/* Small - Petite */
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)

/* Medium - Moyenne */
shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.08)

/* Large - Grande */
shadow-large: 0 12px 40px rgba(0, 0, 0, 0.12)

/* XL - Très grande */
shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)

/* Glow - Lueur colorée */
shadow-glow: 0 0 40px rgba(233, 30, 99, 0.2)

/* Inner - Intérieure */
shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06)
```

---

## 🌈 Dégradés

### Dégradés principaux

```css
/* Dégradé Angular (Rose → Violet) */
background: linear-gradient(135deg, #E91E63 0%, #9C27B0 100%);

/* Dégradé Hero/Navbar (Rose très clair) */
background: linear-gradient(135deg, #FEFCFD 0%, #FEF9FB 50%, #FEF9FC 100%);

/* Dégradé Section Experts (Vertical) */
background: linear-gradient(180deg, #FFFFFF 0%, #FFF5F7 50%, #FFFFFF 100%);
```

### Dégradés pour badges/cards

```css
/* Badge dégradé */
background: linear-gradient(to right, rgb(252, 231, 243), rgb(250, 232, 255));
/* Équivalent Tailwind: bg-gradient-to-r from-pink-50 to-purple-50 */

/* Glow effect */
background: linear-gradient(to bottom right, rgba(233, 30, 99, 0.1), rgba(156, 39, 176, 0.1));
/* Équivalent Tailwind: bg-gradient-to-br from-primary/10 to-accent/10 */
```

### Text Gradient

```css
.text-gradient {
    background: linear-gradient(135deg, #E91E63 0%, #9C27B0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

---

## 🎯 Éléments décoratifs

### Blobs flottants (Hero)

```html
<!-- Large blob droit -->
<div class="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl opacity-60 animate-float-slow"></div>

<!-- Large blob gauche -->
<div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl opacity-50 animate-float-slow" style="animation-delay: 3s;"></div>

<!-- Petits cercles -->
<div class="absolute top-20 left-[15%] w-16 h-16 bg-white/40 rounded-full backdrop-blur-sm animate-float" style="animation-delay: 1s;"></div>
<div class="absolute top-40 right-[20%] w-12 h-12 bg-primary/10 rounded-full animate-float" style="animation-delay: 2s;"></div>
```

### Barre décorative

```html
<div class="h-1 w-16 bg-gradient-to-r from-primary to-accent rounded-full"></div>
```

---

## 📱 Responsive Design

### Breakpoints Tailwind

```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X Extra large devices */
```

### Patterns communs

```html
<!-- Grid responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- Texte responsive -->
<h1 class="text-5xl md:text-6xl">

<!-- Espacement responsive -->
<div class="px-4 md:px-6 lg:px-8">

<!-- Visibilité responsive -->
<div class="hidden lg:block">
```

---

## 🔧 Utilitaires CSS personnalisés

### Glass Effect

```css
.glass-effect {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}
```

### Gradient Card

```css
.gradient-card {
    background: linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%);
}
```

---

## 📦 Stack technique

- **Framework CSS**: Tailwind CSS (CDN)
- **Polices**: Google Fonts (DM Sans, Space Grotesk)
- **Icônes**: Font Awesome 6.4.0
- **Animations**: CSS Keyframes + Tailwind utilities

---

## 🎨 Principes de design

1. **Cohérence Angular**: Utilisation systématique des couleurs rose/violet
2. **Hiérarchie claire**: Typographie bien définie avec Space Grotesk pour les titres
3. **Espacement généreux**: Respiration entre les éléments (gap-6, gap-8, gap-16)
4. **Micro-interactions**: Hover states sur tous les éléments interactifs
5. **Accessibilité**: Contrastes suffisants, focus states visibles
6. **Performance**: Animations GPU-accelerated (transform, opacity)

---

## 📝 Notes d'implémentation

### Ordre des classes Tailwind (recommandé)

```html
<div class="
    /* Layout */
    flex items-center justify-between
    
    /* Spacing */
    px-6 py-4 gap-3
    
    /* Sizing */
    w-full h-auto
    
    /* Typography */
    text-lg font-bold
    
    /* Colors */
    bg-white text-gray-900
    
    /* Borders */
    border border-gray-200 rounded-xl
    
    /* Effects */
    shadow-sm hover:shadow-lg
    
    /* Transitions */
    transition-all
">
```

### Performance

- Utiliser `transform` et `opacity` pour les animations (GPU)
- Limiter les `blur` et `backdrop-filter` (coûteux)
- Lazy load les images avec `loading="lazy"`
- Optimiser les dégradés complexes

---

## 🚀 Évolutions futures

- [ ] Mode sombre (Dark mode)
- [ ] Thème personnalisable
- [ ] Composants React/Angular
- [ ] Storybook pour la documentation
- [ ] Design tokens en JSON

---

**Version**: 1.0.0  
**Dernière mise à jour**: Janvier 2026  
**Maintenu par**: Équipe Ng-Expert
