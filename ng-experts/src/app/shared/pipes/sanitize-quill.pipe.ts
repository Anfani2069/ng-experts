import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'sanitizeQuill',
  standalone: true
})
export class SanitizeQuillPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';

    // Créer un élément DOM temporaire pour manipuler le HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = value;

    // Supprimer tous les éléments .ql-ui
    const uiElements = tempDiv.querySelectorAll('.ql-ui');
    uiElements.forEach(el => el.remove());

    // Supprimer les paragraphes vides avec indentation (comme <p class="ql-indent-1"><br></p>)
    const emptyIndentedParagraphs = tempDiv.querySelectorAll('p[class*="ql-indent"]');
    emptyIndentedParagraphs.forEach(p => {
      if (p.textContent?.trim() === '' || (p.children.length === 1 && p.children[0].tagName === 'BR')) {
        p.remove();
      }
    });

    // Convertir les <ol> avec data-list="bullet" en <ul>
    const allOlLists = tempDiv.querySelectorAll('ol');
    allOlLists.forEach(ol => {
      // Vérifier si tous les enfants <li> ont data-list="bullet"
      const listItems = Array.from(ol.querySelectorAll('li'));
      const hasBulletItems = listItems.some(li => li.getAttribute('data-list') === 'bullet');

      if (hasBulletItems) {
        const ul = document.createElement('ul');
        ul.className = ol.className;

        // Copier tous les enfants
        while (ol.firstChild) {
          const child = ol.firstChild;
          if (child instanceof HTMLElement && child.tagName === 'LI') {
            child.removeAttribute('data-list');
          }
          ul.appendChild(child);
        }

        ol.replaceWith(ul);
      }
    });

    // Nettoyer les attributs data-list restants sur les li
    const allListItems = tempDiv.querySelectorAll('li[data-list]');
    allListItems.forEach(li => {
      li.removeAttribute('data-list');
    });

    // Retourner le HTML nettoyé et sécurisé
    return this.sanitizer.bypassSecurityTrustHtml(tempDiv.innerHTML);
  }
}
