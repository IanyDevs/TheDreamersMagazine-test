window.toggleAdminTutorial = function() {
  const box = document.getElementById('adminTutorialBox');
  if (box) {
    const isHidden = window.getComputedStyle(box).display === 'none' || box.style.display === 'none';
    box.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
};

window.ensureSelectionIsOutsideBlock = function(editor) {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  
  let range = sel.getRangeAt(0);
  let node = range.startContainer;
  
  // Trova se siamo dentro un elemento blocco/multimediale da non annidare
  let blockElement = null;
  
  // Se la selezione punta direttamente ai nodi figli dell'editor
  if (node === editor && range.startOffset < editor.childNodes.length) {
    const childNode = editor.childNodes[range.startOffset];
    if (childNode && childNode.nodeType === Node.ELEMENT_NODE) {
      if (
        childNode.nodeName === 'PRE' || 
        childNode.nodeName === 'BLOCKQUOTE' || 
        childNode.nodeName === 'FIGURE' || 
        childNode.nodeName === 'IMG' || 
        childNode.nodeName === 'IFRAME' ||
        childNode.nodeName === 'TABLE' ||
        childNode.classList.contains('video-container') || 
        childNode.classList.contains('media-element-wrapper')
      ) {
        blockElement = childNode;
      }
    }
  }

  while (!blockElement && node && node !== editor) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (
        node.nodeName === 'PRE' || 
        node.nodeName === 'BLOCKQUOTE' || 
        node.nodeName === 'FIGURE' || 
        node.nodeName === 'IMG' || 
        node.nodeName === 'IFRAME' ||
        node.nodeName === 'TABLE' ||
        node.classList.contains('video-container') || 
        node.classList.contains('media-element-wrapper')
      ) {
        blockElement = node;
        break;
      }
    } else if (node.parentNode && node.parentNode.nodeType === Node.ELEMENT_NODE) {
      const pNode = node.parentNode;
      if (
        pNode.nodeName === 'PRE' || 
        pNode.nodeName === 'BLOCKQUOTE' || 
        pNode.nodeName === 'FIGURE' || 
        pNode.nodeName === 'IMG' || 
        pNode.nodeName === 'IFRAME' ||
        pNode.nodeName === 'TABLE' ||
        pNode.classList.contains('video-container') || 
        pNode.classList.contains('media-element-wrapper')
      ) {
        blockElement = pNode;
        break;
      }
    }
    node = node.parentNode;
  }
  
  // Se non trovato, controlla se c'è un elemento multimediale evidenziato/selezionato
  if (!blockElement) {
    blockElement = editor.querySelector('[data-media-highlighted="true"]') || 
                   editor.querySelector('img[style*="outline"], figure[style*="outline"], iframe[style*="outline"], .video-container[style*="outline"]');
  }
  
  if (blockElement) {
    let nextSibling = blockElement.nextSibling;
    while (nextSibling && nextSibling.nodeType === Node.TEXT_NODE && !nextSibling.textContent.trim()) {
      nextSibling = nextSibling.nextSibling;
    }
    
    let targetParagraph;
    if (nextSibling && nextSibling.nodeName === 'P') {
      targetParagraph = nextSibling;
    } else {
      targetParagraph = document.createElement('p');
      targetParagraph.style.textAlign = 'left';
      targetParagraph.innerHTML = '<br>';
      if (blockElement.parentNode) {
        blockElement.parentNode.insertBefore(targetParagraph, blockElement.nextSibling);
      } else {
        editor.appendChild(targetParagraph);
      }
    }
    
    const newRange = document.createRange();
    newRange.setStart(targetParagraph, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
};

window.activeCoverImageData = '';

window.toggleHomepagePreviewModal = function() {
  const backdrop = document.getElementById('homepagePreviewModalBackdrop');
  if (!backdrop) return;
  const isHidden = backdrop.style.display === 'none' || !backdrop.style.display;
  
  if (isHidden) {
    if (typeof window.clearWysiwygSelection === 'function') {
      window.clearWysiwygSelection();
    }
    window.renderHomepagePreview();
    backdrop.style.display = 'flex';
    setTimeout(() => { backdrop.style.opacity = '1'; }, 10);
  } else {
    backdrop.style.opacity = '0';
    setTimeout(() => { backdrop.style.display = 'none'; }, 250);
  }
};

window.toggleFullArticlePreviewModal = function() {
  const backdrop = document.getElementById('fullArticlePreviewModalBackdrop');
  if (!backdrop) return;
  
  const isHidden = backdrop.style.display === 'none' || !backdrop.style.display;
  
  if (isHidden) {
    if (typeof window.clearWysiwygSelection === 'function') {
      window.clearWysiwygSelection();
    }
    const hpBackdrop = document.getElementById('homepagePreviewModalBackdrop');
    if (hpBackdrop && hpBackdrop.style.display !== 'none') {
      hpBackdrop.style.opacity = '0';
      setTimeout(() => { hpBackdrop.style.display = 'none'; }, 200);
    }
    
    window.renderFullArticlePreview();
    backdrop.style.display = 'block';
    backdrop.classList.add('open');
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    
    // Reset scroll position to top
    const modalScrollBody = backdrop.querySelector('.modal-scroll-body');
    if (modalScrollBody) {
      modalScrollBody.scrollTop = 0;
    }
    
    setTimeout(() => { backdrop.style.opacity = '1'; }, 10);
  } else {
    backdrop.style.opacity = '0';
    backdrop.classList.remove('open');
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    setTimeout(() => { backdrop.style.display = 'none'; }, 250);
  }
};

window.toggleHomepagePreviewModalFromFull = function() {
  window.toggleFullArticlePreviewModal();
  setTimeout(() => {
    window.toggleHomepagePreviewModal();
  }, 260);
};

window.renderHomepagePreview = function() {
  const container = document.getElementById('homepagePreviewCardsContainer');
  if (!container) return;

  const titleEl = document.getElementById('artTitle');
  const subtitleEl = document.getElementById('artSubtitle');
  const catEl = document.getElementById('artCategory');
  const authorEl = document.getElementById('artAuthor');
  const imgEl = document.getElementById('artImage');

  const title = (titleEl ? titleEl.value.trim() : '') || 'Titolo di Esempio dell\'Articolo';
  const subtitle = (subtitleEl ? subtitleEl.value.trim() : '') || 'Questo è un esempio di sottotitolo o catenaccio dell\'articolo.';
  const category = (catEl ? catEl.value : '') || 'News';
  const author = (authorEl ? authorEl.value : '') || 'Redazione';

  const activeImg = window.activeCoverImageData || (imgEl ? imgEl.value.trim() : '');
  const coverImg = activeImg || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
  const font = window.currentFont || 'Inter';
  const titleColor = window.currentTitleColor || '#ffffff';

  const dateStr = new Date().toLocaleDateString('it-IT');

  container.innerHTML = `
    <!-- Variante 1: Card Griglia Standard Homepage -->
    <div onclick="toggleFullArticlePreviewModal()" style="background: #1e293b; border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 12px 32px rgba(0,0,0,0.6); cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;" onmouseover="this.style.transform='translateY(-4px)'; this.style.borderColor='#C85A32';" onmouseout="this.style.transform='none'; this.style.borderColor='rgba(255,255,255,0.1)';">
      <div style="font-size: 0.7rem; font-weight: 800; color: #C85A32; background: rgba(200,90,50,0.15); padding: 0.4rem 0.85rem; text-transform: uppercase; border-bottom: 1px solid rgba(200,90,50,0.2); display: flex; justify-content: space-between; align-items: center;">
        <span>Formato Griglia 3 Colonne</span>
        <span style="font-size: 0.65rem; color: #f97316; font-weight: 700;">Clicca per Full Screen</span>
      </div>
      <div style="position: relative; height: 195px; overflow: hidden;">
        <img src="${coverImg}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;">
        <span style="position: absolute; top: 12px; left: 12px; background: #C85A32; color: #fff; padding: 0.25rem 0.7rem; border-radius: 9999px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">${category}</span>
      </div>
      <div style="padding: 1.25rem;">
        <h3 style="font-family: '${font}', sans-serif; color: ${titleColor}; font-size: 1.15rem; font-weight: 800; margin: 0 0 0.5rem 0; line-height: 1.35;">${title}</h3>
        <p style="font-size: 0.82rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1rem;">${subtitle}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem; font-size: 0.78rem;">
          <span style="color: #cbd5e1; font-weight: 600;">${author}</span>
          <span style="color: #f97316; font-weight: 800; display: flex; align-items: center; gap: 0.2rem; background: rgba(249,115,22,0.15); padding: 0.25rem 0.6rem; border-radius: 6px;">Apri e Leggi ›</span>
        </div>
      </div>
    </div>

    <!-- Variante 2: Card Hero In Evidenza Prima Pagina -->
    <div onclick="toggleFullArticlePreviewModal()" style="background: #1e293b; border-radius: 18px; overflow: hidden; border: 1px solid #C85A32; box-shadow: 0 12px 32px rgba(0,0,0,0.6); cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 16px 40px rgba(200,90,50,0.45)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 12px 32px rgba(0,0,0,0.6)';">
      <div style="font-size: 0.7rem; font-weight: 800; color: #34d399; background: rgba(52,211,153,0.15); padding: 0.4rem 0.85rem; text-transform: uppercase; border-bottom: 1px solid rgba(52,211,153,0.2); display: flex; justify-content: space-between; align-items: center;">
        <span>Formato Hero Prima Pagina</span>
        <span style="font-size: 0.65rem; color: #34d399; font-weight: 700;">Clicca per Full Screen</span>
      </div>
      <div style="position: relative; height: 215px; overflow: hidden;">
        <img src="${coverImg}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;">
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,23,42,0.95), transparent);"></div>
        <div style="position: absolute; bottom: 12px; left: 12px; right: 12px;">
          <span style="background: #34d399; color: #0f172a; padding: 0.2rem 0.55rem; border-radius: 6px; font-size: 0.68rem; font-weight: 800; text-transform: uppercase;">In Evidenza</span>
          <h2 style="font-family: '${font}', sans-serif; color: ${titleColor}; font-size: 1.2rem; font-weight: 800; margin: 0.35rem 0 0 0; line-height: 1.3;">${title}</h2>
        </div>
      </div>
      <div style="padding: 1rem 1.25rem;">
        <p style="font-size: 0.8rem; color: #cbd5e1; margin-bottom: 0.75rem;">${subtitle}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #64748b;">
          <span>Data: ${dateStr}</span>
          <span style="color: #34d399; font-weight: 800; background: rgba(52,211,153,0.15); padding: 0.2rem 0.55rem; border-radius: 6px;">Apri e Leggi ›</span>
        </div>
      </div>
    </div>
  `;
};

window.renderFullArticlePreview = function() {
  const heroImg = document.getElementById('fullPreviewHeroImg');
  const catBadge = document.getElementById('fullPreviewCategoryBadge');
  const titleEl = document.getElementById('fullPreviewTitle');
  const subtitleEl = document.getElementById('fullPreviewSubtitle');
  const initialsEl = document.getElementById('fullPreviewAuthorInitials');
  const authorNameEl = document.getElementById('fullPreviewAuthorName');
  const authorRoleEl = document.getElementById('fullPreviewAuthorRole');
  const dateEl = document.getElementById('fullPreviewDate');
  const textContentEl = document.getElementById('fullPreviewTextContent');
  const footerAvatarEl = document.getElementById('fullPreviewFooterAvatar');
  const footerAuthorNameEl = document.getElementById('fullPreviewFooterAuthorName');

  const artTitleInput = document.getElementById('artTitle');
  const artSubtitleInput = document.getElementById('artSubtitle');
  const artCategoryInput = document.getElementById('artCategory');
  const artAuthorInput = document.getElementById('artAuthor');
  const artImageInput = document.getElementById('artImage');
  const artContentEl = document.getElementById('artContent');

  const title = (artTitleInput ? artTitleInput.value.trim() : '') || 'Titolo di Esempio dell\'Articolo';
  const subtitle = (artSubtitleInput ? artSubtitleInput.value.trim() : '') || 'Questo è un esempio di sottotitolo o catenaccio dell\'articolo.';
  const category = (artCategoryInput ? artCategoryInput.value : '') || 'News';
  const author = (artAuthorInput ? artAuthorInput.value : '') || 'Redazione';

  const activeImg = window.activeCoverImageData || (artImageInput ? artImageInput.value.trim() : '');
  const coverImg = activeImg || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
  const titleFont = window.currentFont || (artTitleInput ? artTitleInput.style.fontFamily : '') || 'Inter';
  const titleColor = window.currentTitleColor || (artTitleInput ? artTitleInput.style.color : '') || '#0f172a';

  const subFont = (artSubtitleInput ? artSubtitleInput.style.fontFamily : '') || 'inherit';
  const subColor = (artSubtitleInput ? artSubtitleInput.style.color : '') || '#475569';

  const rawContent = artContentEl ? (artContentEl.innerHTML || artContentEl.value || '').trim() : '';

  if (heroImg) {
    heroImg.src = coverImg;
    heroImg.alt = title;
  }
  if (catBadge) catBadge.textContent = category;

  if (titleEl) {
    titleEl.textContent = title;
    titleEl.style.fontFamily = titleFont.includes(',') ? titleFont : `'${titleFont}', sans-serif`;
    titleEl.style.color = titleColor;
  }

  if (subtitleEl) {
    subtitleEl.textContent = subtitle;
    subtitleEl.style.fontFamily = subFont;
    subtitleEl.style.color = subColor;
  }

  let initials = 'RD';
  let role = 'Redazione The Dreamers';
  const lowerAuthor = author.toLowerCase();
  if (lowerAuthor.includes('enzo')) {
    initials = 'EP';
    role = 'Fondatore & Redattore Chief';
  } else if (lowerAuthor.includes('francesco')) {
    initials = 'FP';
    role = 'Fondatore & Redattore Chief';
  } else {
    const parts = author.split(' ').filter(Boolean);
    if (parts.length >= 2) initials = (parts[0][0] + parts[1][0]).toUpperCase();
    else if (parts.length === 1) initials = parts[0].substring(0, 2).toUpperCase();
  }

  if (initialsEl) initialsEl.textContent = initials;
  if (authorNameEl) authorNameEl.textContent = author;
  if (authorRoleEl) authorRoleEl.textContent = role;
  if (footerAvatarEl) footerAvatarEl.textContent = initials;
  if (footerAuthorNameEl) footerAuthorNameEl.textContent = author;

  const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const dateFormatted = new Date().toLocaleDateString('it-IT', dateOptions);
  if (dateEl) dateEl.textContent = dateFormatted;

  if (textContentEl) {
    if (rawContent && rawContent !== '<br>' && rawContent !== '<div><br></div>') {
      textContentEl.innerHTML = rawContent;
    } else {
      textContentEl.innerHTML = `
        <div style="background: rgba(249, 115, 22, 0.05); border: 2px dashed rgba(249, 115, 22, 0.3); border-radius: 16px; padding: 2.5rem; text-align: center; margin: 2rem 0;">
          <h4 style="font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem 0;">Articolo ancora senza testo body</h4>
          <p style="font-size: 0.9rem; color: #64748b; margin: 0; max-width: 500px; margin: 0 auto; line-height: 1.5;">
            Questo è un esempio di come apparirà la pagina completa dell'articolo per i tuoi lettori. Inizia a scrivere nell'editor per vedere qui la formattazione reale!
          </p>
        </div>
      `;
    }
  }
};

window.toggleEditorFullscreen = function() {
  const card = document.getElementById('wysiwygEditorCard');
  const btn = document.getElementById('toggleFullscreenBtn');
  if (!card) return;

  const isFullscreen = card.classList.contains('fullscreen-editor-mode');
  if (isFullscreen) {
    card.classList.remove('fullscreen-editor-mode');
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    if (btn) btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg><span>Schermo Intero Editor</span>`;
  } else {
    card.classList.add('fullscreen-editor-mode');
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    if (btn) btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="3" y2="21"></line><line x1="10" y1="14" x2="3" y2="21"></line></svg><span>Esci da Schermo Intero Editor</span>`;
  }
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const fullPreviewModal = document.getElementById('fullArticlePreviewModalBackdrop');
    if (fullPreviewModal && fullPreviewModal.style.display !== 'none') {
      window.toggleFullArticlePreviewModal();
      return;
    }
    const hpModal = document.getElementById('homepagePreviewModalBackdrop');
    if (hpModal && hpModal.style.display !== 'none') {
      window.toggleHomepagePreviewModal();
      return;
    }
    const card = document.getElementById('wysiwygEditorCard');
    if (card && card.classList.contains('fullscreen-editor-mode')) {
      window.toggleEditorFullscreen();
      return;
    }
  }
});

window.changeTitleFont = function(fontName) {
  const titleInput = document.getElementById('artTitle');
  if (titleInput) titleInput.style.fontFamily = `'${fontName}', sans-serif`;
};

window.changeTitleColor = function(color) {
  const titleInput = document.getElementById('artTitle');
  if (titleInput) titleInput.style.color = color;
};

window.changeSubtitleFont = function(fontName) {
  const subInput = document.getElementById('artSubtitle');
  if (subInput) subInput.style.fontFamily = `'${fontName}', sans-serif`;
};

window.changeSubtitleColor = function(color) {
  const subInput = document.getElementById('artSubtitle');
  if (subInput) subInput.style.color = color;
};

window.lastEditorSelectionRange = null;

function saveEditorSelection() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const editor = document.getElementById('artContent');
    if (editor && editor.contains(sel.anchorNode)) {
      window.lastEditorSelectionRange = sel.getRangeAt(0).cloneRange();
    }
  }
}

function restoreEditorSelection() {
  if (window.lastEditorSelectionRange) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(window.lastEditorSelectionRange);
  }
}

document.addEventListener('selectionchange', () => {
  saveEditorSelection();
  syncToolbarWithSelection();
});

function syncToolbarWithSelection() {
  const editor = document.getElementById('artContent');
  if (!editor) return;

  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    let node = sel.anchorNode;
    // Risaliamo la catena DOM fino all'editor
    while (node && node !== editor) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const style = window.getComputedStyle(node);
        
        // 1. Sincronizzazione Font Family
        let fontName = style.fontFamily;
        if (fontName) {
          fontName = fontName.replace(/['"]/g, '').split(',')[0].trim();
          const labelEl = document.getElementById('currentFontSelectedLabel');
          if (labelEl && labelEl.textContent !== fontName) {
            labelEl.textContent = fontName;
            labelEl.style.fontFamily = style.fontFamily;
          }
          window.currentFont = fontName;
        }

        // 2. Sincronizzazione Dimensione Font
        let fontSize = style.fontSize;
        if (fontSize) {
          const selectEl = document.getElementById('editorFontSizeSelect');
          if (selectEl) {
            for (let option of selectEl.options) {
              if (option.value === fontSize || (option.text && option.text.includes(fontSize))) {
                if (selectEl.value !== option.value) selectEl.value = option.value;
                break;
              }
            }
          }
        }

        // 3. Sincronizzazione Colore Testo
        let color = style.color;
        if (color) {
          const pickerEl = document.getElementById('editorTextColorPicker');
          if (pickerEl) {
            const hex = rgbToHex(color);
            if (hex && pickerEl.value !== hex) pickerEl.value = hex;
          }
        }
        break;
      }
      node = node.parentNode;
    }
  }
}

function rgbToHex(rgbStr) {
  const match = rgbStr.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*\d+(?:\.\d+)?)?\)$/);
  if (!match) return null;
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

window.applyTextColor = function(color) {
  const editor = document.getElementById('artContent');
  if (!editor) return;
  
  restoreEditorSelection();
  editor.focus();

  document.execCommand('foreColor', false, color);
  window.renderLiveTextPreview();
};

window.applyFontSize = function(size) {
  const editor = document.getElementById('artContent');
  if (!editor) return;

  restoreEditorSelection();
  editor.focus();

  document.execCommand('fontSize', false, '7');
  const fontEls = editor.querySelectorAll('font[size="7"]');
  fontEls.forEach(el => {
    const span = document.createElement('span');
    span.style.fontSize = size;
    span.innerHTML = el.innerHTML;
    el.parentNode.replaceChild(span, el);
  });

  window.renderLiveTextPreview();
};

const fontCategoriesData = [
  {
    category: "SANS-SERIF MODERNE",
    fonts: [
      { name: "Inter", label: "Inter (Default Modern)", font: "'Inter', sans-serif" },
      { name: "Roboto", label: "Roboto", font: "'Roboto', sans-serif" },
      { name: "Open Sans", label: "Open Sans", font: "'Open Sans', sans-serif" },
      { name: "Montserrat", label: "Montserrat", font: "'Montserrat', sans-serif" },
      { name: "Poppins", label: "Poppins", font: "'Poppins', sans-serif" },
      { name: "Outfit", label: "Outfit", font: "'Outfit', sans-serif" },
      { name: "Lato", label: "Lato", font: "'Lato', sans-serif" },
      { name: "Plus Jakarta Sans", label: "Plus Jakarta Sans", font: "'Plus Jakarta Sans', sans-serif" },
      { name: "Raleway", label: "Raleway", font: "'Raleway', sans-serif" },
      { name: "Work Sans", label: "Work Sans", font: "'Work Sans', sans-serif" }
    ]
  },
  {
    category: "SERIF ELEGANTI & EDITORIALI",
    fonts: [
      { name: "Playfair Display", label: "Playfair Display (Classico)", font: "'Playfair Display', serif" },
      { name: "Merriweather", label: "Merriweather", font: "'Merriweather', serif" },
      { name: "Lora", label: "Lora", font: "'Lora', serif" },
      { name: "Cinzel", label: "Cinzel (Editoriale Lusso)", font: "'Cinzel', serif" },
      { name: "Bodoni Moda", label: "Bodoni Moda (Alta Moda)", font: "'Bodoni Moda', serif" },
      { name: "Cormorant Garamond", label: "Cormorant Garamond", font: "'Cormorant Garamond', serif" },
      { name: "PT Serif", label: "PT Serif", font: "'PT Serif', serif" }
    ]
  },
  {
    category: "DISPLAY & IMPACT",
    fonts: [
      { name: "Bebas Neue", label: "Bebas Neue (Titolo Forte)", font: "'Bebas Neue', sans-serif" },
      { name: "Oswald", label: "Oswald", font: "'Oswald', sans-serif" },
      { name: "Syne", label: "Syne (Futuristico)", font: "'Syne', sans-serif" },
      { name: "Space Grotesk", label: "Space Grotesk", font: "'Space Grotesk', sans-serif" }
    ]
  },
  {
    category: "MONOSPACE & CODE",
    fonts: [
      { name: "Fira Code", label: "Fira Code", font: "'Fira Code', monospace" },
      { name: "JetBrains Mono", label: "JetBrains Mono", font: "'JetBrains Mono', monospace" },
      { name: "Space Mono", label: "Space Mono", font: "'Space Mono', monospace" }
    ]
  },
  {
    category: "HANDWRITING & MANOSCRITTO",
    fonts: [
      { name: "Dancing Script", label: "Dancing Script", font: "'Dancing Script', cursive" },
      { name: "Caveat", label: "Caveat", font: "'Caveat', cursive" },
      { name: "Pacifico", label: "Pacifico", font: "'Pacifico', cursive" }
    ]
  }
];

window.toggleCustomFontDropdown = function() {
  const menu = document.getElementById('customFontDropdownMenu');
  if (!menu) return;
  const isHidden = menu.style.display === 'none' || !menu.style.display;
  menu.style.display = isHidden ? 'block' : 'none';
  if (isHidden) {
    window.renderCustomFontOptions('');
    const input = document.getElementById('fontSearchInput');
    if (input) {
      input.value = '';
      input.focus();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     CUSTOM DIALOG MODAL SYSTEM (Replaces native browser prompt)
     ========================================================================== */
  window.showCustomInputModal = function(options, callback) {
    let modalOverlay = document.getElementById('customInputModalOverlay');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'customInputModalOverlay';
      modalOverlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(0, 0, 0, 0.78);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        opacity: 0;
        transition: opacity 0.2s ease;
      `;
      modalOverlay.innerHTML = `
        <div id="customInputModalContainer" style="background: var(--admin-card-bg, #1A1815); border: 1px solid var(--admin-accent, #C85A32); border-radius: 20px; box-shadow: 0 25px 60px rgba(0,0,0,0.85); width: 100%; max-width: 440px; padding: 1.75rem; color: var(--admin-text-main, #F7F5F2); transform: translateY(-10px); transition: transform 0.2s ease;">
          <h3 id="customInputModalTitle" style="font-size: 1.15rem; font-weight: 800; color: var(--admin-text-main, #ffffff); margin: 0 0 0.4rem 0;"></h3>
          <p id="customInputModalMessage" style="font-size: 0.83rem; color: var(--admin-text-muted, #A8A29A); margin: 0 0 1.1rem 0; line-height: 1.5;"></p>
          
          <input type="text" id="customInputModalValue" class="form-control" style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 10px; background: var(--admin-input-bg, #0E0C0B); border: 1px solid var(--admin-input-border, rgba(225,218,210,0.2)); color: var(--admin-text-main, #F7F5F2); font-size: 0.9rem; font-weight: 600; margin-bottom: 1.25rem; outline: none; box-sizing: border-box;">
          
          <div style="display: flex; justify-content: flex-end; gap: 0.65rem;">
            <button type="button" id="customInputModalCancelBtn" class="btn btn-secondary" style="padding: 0.55rem 1.1rem; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer;">Annulla</button>
            <button type="button" id="customInputModalConfirmBtn" class="btn btn-primary" style="padding: 0.55rem 1.35rem; border-radius: 10px; font-size: 0.82rem; font-weight: 800; cursor: pointer;">Conferma</button>
          </div>
        </div>
      `;
      document.body.appendChild(modalOverlay);
    }

    const titleEl = document.getElementById('customInputModalTitle');
    const msgEl = document.getElementById('customInputModalMessage');
    const inputEl = document.getElementById('customInputModalValue');
    const confirmBtn = document.getElementById('customInputModalConfirmBtn');
    const cancelBtn = document.getElementById('customInputModalCancelBtn');
    const container = document.getElementById('customInputModalContainer');

    titleEl.textContent = options.title || 'Personalizza Impostazione';
    msgEl.textContent = options.message || '';
    inputEl.value = options.defaultValue || '';
    inputEl.placeholder = options.placeholder || '';
    confirmBtn.textContent = options.confirmText || 'Conferma';
    cancelBtn.textContent = options.cancelText || 'Annulla';

    modalOverlay.style.display = 'flex';
    setTimeout(() => {
      modalOverlay.style.opacity = '1';
      container.style.transform = 'translateY(0)';
      inputEl.focus();
      inputEl.select();
    }, 10);

    function closeModal(res) {
      modalOverlay.style.opacity = '0';
      container.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        modalOverlay.style.display = 'none';
        cleanup();
        if (typeof callback === 'function') callback(res);
      }, 200);
    }

    function handleConfirm() {
      closeModal(inputEl.value.trim());
    }

    function handleCancel() {
      closeModal(null);
    }

    function handleKeyDown(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    }

    function cleanup() {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      inputEl.removeEventListener('keydown', handleKeyDown);
    }

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    inputEl.addEventListener('keydown', handleKeyDown);
  };

  /* ==========================================================================
     CUSTOM CONFIRMATION MODAL SYSTEM (Replaces native browser confirm)
     ========================================================================== */
  window.showCustomConfirmModal = function(options, callback) {
    let modalOverlay = document.getElementById('customConfirmModalOverlay');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'customConfirmModalOverlay';
      modalOverlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(0, 0, 0, 0.78);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        opacity: 0;
        transition: opacity 0.2s ease;
      `;
      modalOverlay.innerHTML = `
        <div id="customConfirmModalContainer" style="background: var(--admin-card-bg, #1A1815); border: 1px solid var(--admin-accent, #C85A32); border-radius: 20px; box-shadow: 0 25px 60px rgba(0,0,0,0.85); width: 100%; max-width: 440px; padding: 1.75rem; color: var(--admin-text-main, #F7F5F2); transform: translateY(-10px); transition: transform 0.2s ease;">
          <h3 id="customConfirmModalTitle" style="font-size: 1.15rem; font-weight: 800; color: var(--admin-text-main, #ffffff); margin: 0 0 0.45rem 0;"></h3>
          <p id="customConfirmModalMessage" style="font-size: 0.88rem; color: var(--admin-text-muted, #A8A29A); margin: 0 0 1.5rem 0; line-height: 1.55;"></p>
          
          <div style="display: flex; justify-content: flex-end; gap: 0.65rem;">
            <button type="button" id="customConfirmModalCancelBtn" class="btn btn-secondary" style="padding: 0.6rem 1.15rem; border-radius: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer;">Annulla</button>
            <button type="button" id="customConfirmModalConfirmBtn" class="btn btn-primary" style="padding: 0.6rem 1.4rem; border-radius: 10px; font-size: 0.82rem; font-weight: 800; cursor: pointer;">Conferma</button>
          </div>
        </div>
      `;
      document.body.appendChild(modalOverlay);
    }

    const titleEl = document.getElementById('customConfirmModalTitle');
    const msgEl = document.getElementById('customConfirmModalMessage');
    const confirmBtn = document.getElementById('customConfirmModalConfirmBtn');
    const cancelBtn = document.getElementById('customConfirmModalCancelBtn');
    const container = document.getElementById('customConfirmModalContainer');

    titleEl.textContent = options.title || 'Conferma Operazione';
    msgEl.textContent = options.message || '';
    confirmBtn.textContent = options.confirmText || 'Conferma';
    cancelBtn.textContent = options.cancelText || 'Annulla';

    if (options.isDanger !== false) {
      confirmBtn.style.background = 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)';
      confirmBtn.style.color = '#ffffff';
      confirmBtn.style.border = 'none';
    } else {
      confirmBtn.style.background = 'var(--admin-accent-gradient)';
      confirmBtn.style.color = '#ffffff';
      confirmBtn.style.border = 'none';
    }

    modalOverlay.style.display = 'flex';
    setTimeout(() => {
      modalOverlay.style.opacity = '1';
      container.style.transform = 'translateY(0)';
      confirmBtn.focus();
    }, 10);

    function closeModal(res) {
      modalOverlay.style.opacity = '0';
      container.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        modalOverlay.style.display = 'none';
        cleanup();
        if (typeof callback === 'function') callback(res);
      }, 200);
    }

    function handleConfirm() {
      closeModal(true);
    }

    function handleCancel() {
      closeModal(false);
    }

    function handleKeyDown(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    }

    function cleanup() {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      window.removeEventListener('keydown', handleKeyDown);
    }

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    window.addEventListener('keydown', handleKeyDown);
  };

  /* ==========================================================================
     WYSIWYG INTERACTIVE MEDIA CONTROLLER (IMAGE & VIDEO MOVE/RESIZE/ALIGN)
     ========================================================================== */
  function setupWYSIWYGMediaController() {
    const editor = document.getElementById('artContent');
    if (!editor) return;

    // Floating Toolbar
    let toolbar = document.getElementById('wysiwygMediaToolbar');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.id = 'wysiwygMediaToolbar';
      toolbar.style.cssText = `
        position: absolute;
        z-index: 100000;
        display: none;
        background: #1A1815;
        border: 1px solid rgba(225, 218, 210, 0.25);
        box-shadow: 0 12px 35px rgba(0,0,0,0.65);
        border-radius: 12px;
        padding: 0.45rem 0.75rem;
        gap: 0.4rem;
        align-items: center;
        flex-wrap: wrap;
        backdrop-filter: blur(12px);
        user-select: none;
      `;
      document.body.appendChild(toolbar);
    }

    // Corner Drag-Resize Handle
    let resizeHandle = document.getElementById('wysiwygResizeHandle');
    if (!resizeHandle) {
      resizeHandle = document.createElement('div');
      resizeHandle.id = 'wysiwygResizeHandle';
      resizeHandle.title = 'Trascina col mouse per ridimensionare';
      resizeHandle.style.cssText = `
        position: absolute;
        z-index: 100001;
        display: none;
        width: 16px;
        height: 16px;
        background: #C85A32;
        border: 2px solid #ffffff;
        border-radius: 4px;
        cursor: nwse-resize;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      `;
      document.body.appendChild(resizeHandle);
    }

    // Drop Caret Indicator
    let dropCaret = document.getElementById('wysiwygDropCaret');
    if (!dropCaret) {
      dropCaret = document.createElement('div');
      dropCaret.id = 'wysiwygDropCaret';
      dropCaret.style.cssText = `
        position: absolute;
        z-index: 99999;
        display: none;
        height: 4px;
        background: #C85A32;
        box-shadow: 0 0 12px #C85A32;
        border-radius: 2px;
        pointer-events: none;
      `;
      document.body.appendChild(dropCaret);
    }

    let selectedMediaEl = null;
    let draggedMediaNode = null;
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    function clearMediaSelection() {
      if (selectedMediaEl) {
        selectedMediaEl.style.outline = '';
        selectedMediaEl.style.outlineOffset = '';
        selectedMediaEl = null;
      }
      if (toolbar) toolbar.style.display = 'none';
      if (resizeHandle) resizeHandle.style.display = 'none';
    }
    window.clearWysiwygSelection = clearMediaSelection;

    function getMediaTarget(el) {
      if (!el || el === editor || !editor.contains(el)) return null;
      if (el.tagName === 'IMG') {
        return el.closest('figure') || el;
      }
      if (el.tagName === 'FIGURE') return el;
      if (el.classList && (el.classList.contains('video-container') || el.classList.contains('media-element-wrapper'))) return el;
      if (el.tagName === 'IFRAME' || el.tagName === 'VIDEO') {
        return el.closest('.video-container') || el.closest('figure') || el;
      }
      return null;
    }

    function positionOverlayUI(target) {
      if (!target || !toolbar) return;
      const rect = target.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      // Position Toolbar
      toolbar.style.display = 'flex';
      let top = rect.top + scrollTop - toolbar.offsetHeight - 12;
      if (top < scrollTop + 10) {
        top = rect.bottom + scrollTop + 10;
      }
      let left = rect.left + scrollLeft + (rect.width / 2) - (toolbar.offsetWidth / 2);
      left = Math.max(10, Math.min(left, window.innerWidth - toolbar.offsetWidth - 20));

      toolbar.style.top = `${top}px`;
      toolbar.style.left = `${left}px`;

      // Position Corner Resize Handle
      if (resizeHandle) {
        resizeHandle.style.display = 'block';
        resizeHandle.style.top = `${rect.bottom + scrollTop - 10}px`;
        resizeHandle.style.left = `${rect.right + scrollLeft - 10}px`;
      }
    }

    function updateToolbarButtons(target) {
      toolbar.innerHTML = `
        <div style="font-size: 0.7rem; font-weight: 800; color: #C85A32; text-transform: uppercase; letter-spacing: 0.05em; padding-right: 0.25rem;">Posizione:</div>
        <button type="button" class="media-tb-btn" data-action="align-left" title="Allinea a Sinistra (Testo a Destra)" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; font-weight: 700; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; cursor: pointer;">Left</button>
        <button type="button" class="media-tb-btn" data-action="align-center" title="Allinea al Centro" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; font-weight: 700; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; cursor: pointer;">Center</button>
        <button type="button" class="media-tb-btn" data-action="align-right" title="Allinea a Destra (Testo a Sinistra)" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; font-weight: 700; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; cursor: pointer;">Right</button>
        <button type="button" class="media-tb-btn" data-action="align-full" title="Larghezza Piena" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; font-weight: 700; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; cursor: pointer;">Full</button>

        <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.2); margin: 0 0.2rem;"></div>
        <div style="font-size: 0.7rem; font-weight: 800; color: #C85A32; text-transform: uppercase; letter-spacing: 0.05em; padding-right: 0.25rem;">Dimensione:</div>
        <button type="button" class="media-tb-btn" data-action="size-25" style="padding: 0.35rem 0.5rem; font-size: 0.72rem; font-weight: 700; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; cursor: pointer;">25%</button>
        <button type="button" class="media-tb-btn" data-action="size-50" style="padding: 0.35rem 0.5rem; font-size: 0.72rem; font-weight: 700; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; cursor: pointer;">50%</button>
        <button type="button" class="media-tb-btn" data-action="size-75" style="padding: 0.35rem 0.5rem; font-size: 0.72rem; font-weight: 700; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; cursor: pointer;">75%</button>
        <button type="button" class="media-tb-btn" data-action="size-100" style="padding: 0.35rem 0.5rem; font-size: 0.72rem; font-weight: 700; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; cursor: pointer;">100%</button>
        <button type="button" class="media-tb-btn" data-action="size-custom" style="padding: 0.35rem 0.6rem; font-size: 0.72rem; font-weight: 700; background: rgba(200,90,50,0.25); color: #C85A32; border: 1px solid #C85A32; border-radius: 6px; cursor: pointer;">Custom</button>

        <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.2); margin: 0 0.2rem;"></div>
        <button type="button" class="media-tb-btn" data-action="delete" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; font-weight: 800; background: rgba(225,29,72,0.25); color: #f43f5e; border: 1px solid rgba(225,29,72,0.4); border-radius: 6px; cursor: pointer;">Elimina</button>
      `;

      toolbar.querySelectorAll('.media-tb-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.getAttribute('data-action');
          applyMediaAction(target, action);
        });
      });
    }

    function applyMediaAction(target, action) {
      if (!target) return;

      if (action === 'align-left') {
        target.style.float = 'left';
        target.style.margin = '0.5rem 1.25rem 1rem 0';
        target.style.clear = 'none';
        target.style.display = 'block';
        if (!target.style.width || target.style.width === '100%') target.style.width = '50%';
      } else if (action === 'align-center') {
        target.style.float = 'none';
        target.style.margin = '1.5rem auto';
        target.style.clear = 'both';
        target.style.display = 'block';
      } else if (action === 'align-right') {
        target.style.float = 'right';
        target.style.margin = '0.5rem 0 1rem 1.25rem';
        target.style.clear = 'none';
        target.style.display = 'block';
        if (!target.style.width || target.style.width === '100%') target.style.width = '50%';
      } else if (action === 'align-full') {
        target.style.float = 'none';
        target.style.margin = '1.5rem 0';
        target.style.width = '100%';
        target.style.maxWidth = '100%';
        target.style.clear = 'both';
        target.style.display = 'block';
      } else if (action.startsWith('size-')) {
        const val = action.replace('size-', '');
        if (val === 'custom') {
          const curWidth = target.style.width || '100%';
          window.showCustomInputModal({
            title: 'Personalizza Larghezza',
            message: 'Inserisci la larghezza desiderata (es: 350px, 60%, 45%):',
            defaultValue: curWidth,
            placeholder: 'es: 50% o 400px'
          }, (custom) => {
            if (custom) {
              target.style.width = custom;
              positionOverlayUI(target);
            }
          });
        } else {
          target.style.width = `${val}%`;
        }
      } else if (action === 'delete') {
        target.remove();
        clearMediaSelection();
        return;
      }

      positionOverlayUI(target);
    }

    // Document-wide click handler to manage media selection and clear it when clicking outside
    document.addEventListener('click', (e) => {
      if (isResizing) return;
      
      // If clicking inside the editor, handle media selection
      if (editor.contains(e.target)) {
        const target = getMediaTarget(e.target);
        if (target) {
          if (selectedMediaEl && selectedMediaEl !== target) {
            selectedMediaEl.style.outline = '';
            selectedMediaEl.style.outlineOffset = '';
          }
          selectedMediaEl = target;
          selectedMediaEl.style.outline = '2px dashed #C85A32';
          selectedMediaEl.style.outlineOffset = '4px';
          selectedMediaEl.setAttribute('draggable', 'true');
          updateToolbarButtons(selectedMediaEl);
          positionOverlayUI(selectedMediaEl);
          return;
        }
      }
      
      // If clicking outside the selected media element, its toolbar, or its resize handle, clear selection
      if (!e.target.closest('#wysiwygMediaToolbar') && !e.target.closest('#wysiwygResizeHandle') && (!selectedMediaEl || !selectedMediaEl.contains(e.target))) {
        clearMediaSelection();
      }
    });

    // MOUSE DRAG RESIZE HANDLE EVENTS
    if (resizeHandle) {
      resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!selectedMediaEl) return;
        isResizing = true;
        startX = e.clientX;
        startWidth = selectedMediaEl.offsetWidth;
        document.body.style.cursor = 'nwse-resize';
      });

      document.addEventListener('mousemove', (e) => {
        if (!isResizing || !selectedMediaEl) return;
        const editorRect = editor.getBoundingClientRect();
        const deltaX = e.clientX - startX;
        const newWidthPx = Math.max(120, Math.min(editorRect.width, startWidth + deltaX));
        selectedMediaEl.style.width = `${Math.round(newWidthPx)}px`;
        positionOverlayUI(selectedMediaEl);
      });

      document.addEventListener('mouseup', () => {
        if (isResizing) {
          isResizing = false;
          document.body.style.cursor = '';
          if (selectedMediaEl) positionOverlayUI(selectedMediaEl);
        }
      });
    }

    // MOUSE DRAG AND DROP TO MOVE MEDIA ACROSS TEXT
    editor.addEventListener('dragstart', (e) => {
      const target = getMediaTarget(e.target);
      if (target) {
        draggedMediaNode = target;
        e.dataTransfer.setData('text/html', target.outerHTML);
        e.dataTransfer.effectAllowed = 'move';
        target.style.opacity = '0.4';
      }
    });

    editor.addEventListener('dragover', (e) => {
      if (!draggedMediaNode) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      let range;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
      } else if (e.rangeParent) {
        range = document.createRange();
        range.setStart(e.rangeParent, e.rangeOffset);
      }

      if (range && dropCaret) {
        const rect = range.getBoundingClientRect();
        dropCaret.style.display = 'block';
        dropCaret.style.top = `${rect.top + scrollTop}px`;
        dropCaret.style.left = `${rect.left + scrollLeft}px`;
        dropCaret.style.width = `${Math.max(100, rect.width || 200)}px`;
      }
    });

    editor.addEventListener('dragleave', () => {
      if (dropCaret) dropCaret.style.display = 'none';
    });

    editor.addEventListener('drop', (e) => {
      if (!draggedMediaNode) return;
      e.preventDefault();
      if (dropCaret) dropCaret.style.display = 'none';

      let range;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
      } else if (e.rangeParent) {
        range = document.createRange();
        range.setStart(e.rangeParent, e.rangeOffset);
      }

      if (range) {
        draggedMediaNode.remove();
        range.insertNode(draggedMediaNode);
        draggedMediaNode.style.opacity = '1';
        selectedMediaEl = draggedMediaNode;
        positionOverlayUI(selectedMediaEl);
      }

      draggedMediaNode = null;
    });

    editor.addEventListener('dragend', () => {
      if (draggedMediaNode) {
        draggedMediaNode.style.opacity = '1';
        draggedMediaNode = null;
      }
      if (dropCaret) dropCaret.style.display = 'none';
    });

    // Double click handler for quick custom input modal
    editor.addEventListener('dblclick', (e) => {
      const target = getMediaTarget(e.target);
      if (target) {
        const curWidth = target.style.width || target.style.maxWidth || '100%';
        window.showCustomInputModal({
          title: 'Dimensioni Elemento',
          message: 'Modifica la larghezza dell\'immagine o del video:',
          defaultValue: curWidth,
          placeholder: 'es: 100%, 75%, 50%, 350px'
        }, (custom) => {
          if (custom) {
            target.style.width = custom;
            positionOverlayUI(target);
          }
        });
      }
    });

    // Reposition toolbar & handle on scroll/resize
    window.addEventListener('scroll', () => {
      if (selectedMediaEl && toolbar.style.display !== 'none') {
        positionOverlayUI(selectedMediaEl);
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (selectedMediaEl && toolbar.style.display !== 'none') {
        positionOverlayUI(selectedMediaEl);
      }
    });
  }

  setupWYSIWYGMediaController();
});

window.submitArticleAsDraft = function() {
  const statusEl = document.getElementById('artStatus') || document.getElementById('artWorkflowStatusSelect');
  if (statusEl) statusEl.value = 'draft';
  const form = document.getElementById('articleForm');
  if (form) {
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  }
};

window.currentFont = 'Inter';

window.renderCustomFontOptions = function(filterQuery = '') {
  const listContainer = document.getElementById('fontOptionsList');
  if (!listContainer) return;

  const query = (filterQuery || '').toLowerCase().trim();
  let html = '';
  const activeFontName = window.currentFont || 'Inter';

  fontCategoriesData.forEach(cat => {
    const matchingFonts = cat.fonts.filter(f => !query || f.name.toLowerCase().includes(query) || f.label.toLowerCase().includes(query));
    if (matchingFonts.length > 0) {
      html += `<div style="font-size: 0.68rem; font-weight: 800; color: var(--admin-accent, #C85A32); text-transform: uppercase; letter-spacing: 0.08em; margin: 0.6rem 0 0.35rem 0.25rem;">${cat.category}</div>`;
      matchingFonts.forEach(f => {
        const isActive = activeFontName === f.name;
        html += `
          <div onclick="selectCustomFont('${f.name}', '${f.label.replace(/'/g, "\\'")}')" style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; border-radius: 8px; margin-bottom: 0.25rem; cursor: pointer; background: ${isActive ? 'rgba(200, 90, 50, 0.25)' : 'var(--admin-input-bg)'}; border: 1px solid ${isActive ? '#C85A32' : 'var(--admin-input-border)'}; color: var(--admin-text-main); transition: all 0.15s ease;" onmouseover="this.style.background='rgba(200,90,50,0.18)';this.style.borderColor='#C85A32';" onmouseout="this.style.background='${isActive ? 'rgba(200, 90, 50, 0.25)' : 'var(--admin-input-bg)'}';this.style.borderColor='${isActive ? '#C85A32' : 'var(--admin-input-border)'}';">
            <span style="font-family: ${f.font}; font-size: 0.95rem; color: var(--admin-text-main); font-weight: 700;">${f.label}</span>
            ${isActive ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C85A32" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
          </div>
        `;
      });
    }
  });

  if (!html) {
    html = `<div style="font-size: 0.82rem; color: var(--admin-text-muted); padding: 1rem; text-align: center; font-weight: 600;">Nessun font trovato per "${filterQuery}"</div>`;
  }

  listContainer.innerHTML = html;
};

window.filterCustomFonts = function(query) {
  window.renderCustomFontOptions(query);
};

window.selectCustomFont = function(fontName, fontLabel) {
  window.currentFont = fontName;
  const labelEl = document.getElementById('currentFontSelectedLabel');
  if (labelEl) {
    labelEl.textContent = fontLabel;
    labelEl.style.fontFamily = `'${fontName}', sans-serif`;
  }

  window.changeArticleFont(fontName);

  const menu = document.getElementById('customFontDropdownMenu');
  if (menu) menu.style.display = 'none';
};


// Chiudi il menu a tendina quando si clicca fuori
document.addEventListener('click', (e) => {
  const container = document.getElementById('customFontPickerContainer');
  const menu = document.getElementById('customFontDropdownMenu');
  if (container && menu && !container.contains(e.target)) {
    menu.style.display = 'none';
  }
});

window.renderLiveTextPreview = function() {};

window.applyWysiwygCmd = function(cmd, value = null) {
  const editor = document.getElementById('artContent');
  if (!editor) return;
  editor.focus();

  if (cmd === 'bold') {
    document.execCommand('bold', false, null);
  } else if (cmd === 'italic') {
    document.execCommand('italic', false, null);
  } else if (cmd === 'h2') {
    document.execCommand('formatBlock', false, '<h2>');
  } else if (cmd === 'h3') {
    document.execCommand('formatBlock', false, '<h3>');
  } else if (cmd === 'quote') {
    document.execCommand('formatBlock', false, 'blockquote');
  } else if (cmd === 'ul') {
    document.execCommand('insertUnorderedList', false, null);
  } else if (cmd === 'ol') {
    document.execCommand('insertOrderedList', false, null);
  } else if (cmd === 'table') {
    const tableHtml = `<table style="width:100%;border-collapse:collapse;margin:1rem 0;border:1px solid var(--border-color);"><thead><tr style="background:rgba(200,90,50,0.15);"><th style="padding:0.6rem;border:1px solid var(--border-color);">Colonna 1</th><th style="padding:0.6rem;border:1px solid var(--border-color);">Colonna 2</th><th style="padding:0.6rem;border:1px solid var(--border-color);">Colonna 3</th></tr></thead><tbody><tr><td style="padding:0.6rem;border:1px solid var(--border-color);">Dato A</td><td style="padding:0.6rem;border:1px solid var(--border-color);">Dato B</td><td style="padding:0.6rem;border:1px solid var(--border-color);">Dato C</td></tr></tbody></table><p style="text-align: left;"><br></p>`;
    if (typeof window.ensureSelectionIsOutsideBlock === 'function') {
      window.ensureSelectionIsOutsideBlock(editor);
    }
    document.execCommand('insertHTML', false, tableHtml);
  } else if (cmd === 'code') {
    const codeHtml = `<pre style="background:#0f172a;color:#f8fafc;padding:1rem;border-radius:12px;overflow-x:auto;"><code>// Scrivi qui il tuo codice...\nconsole.log("Hello World!");</code></pre><p style="text-align: left;"><br></p>`;
    if (typeof window.ensureSelectionIsOutsideBlock === 'function') {
      window.ensureSelectionIsOutsideBlock(editor);
    }
    document.execCommand('insertHTML', false, codeHtml);
  } else if (cmd === 'box') {
    const boxHtml = `<div style="background:rgba(200,90,50,0.1);border-left:4px solid #C85A32;padding:1rem 1.25rem;border-radius:0 12px 12px 0;margin:1.25rem 0;"><strong>Nota Redazionale:</strong> Scrivi qui la tua nota o approfondimento.</div><p style="text-align: left;"><br></p>`;
    if (typeof window.ensureSelectionIsOutsideBlock === 'function') {
      window.ensureSelectionIsOutsideBlock(editor);
    }
    document.execCommand('insertHTML', false, boxHtml);
  }

  window.renderLiveTextPreview();
};

window.exitBlockCmd = function() {
  const editor = document.getElementById('artContent');
  if (!editor) return;
  editor.focus();

  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  let node = range.startContainer;

  // Trova se siamo dentro un tag PRE, BLOCKQUOTE, FIGURE, IMG, IFRAME o DIV speciale
  let blockElement = null;
  while (node && node !== editor) {
    if (
      node.nodeName === 'PRE' || 
      node.nodeName === 'BLOCKQUOTE' || 
      node.nodeName === 'FIGURE' || 
      node.nodeName === 'IMG' || 
      node.nodeName === 'IFRAME' ||
      (node.nodeName === 'DIV' && (node.style.borderLeft || node.classList.contains('video-container') || node.classList.contains('media-element-wrapper')))
    ) {
      blockElement = node;
      break;
    }
    node = node.parentNode;
  }

  // Se non trovato per selezione indiretta, cerca qualsiasi media attualmente evidenziato o selezionato nell'editor
  if (!blockElement) {
    blockElement = editor.querySelector('[data-media-highlighted="true"]') || 
                   editor.querySelector('img[style*="outline"], figure[style*="outline"], iframe[style*="outline"], .video-container[style*="outline"]');
  }

  // Se siamo dentro un blocco, creiamo un paragrafo sotto di esso
  if (blockElement) {
    const p = document.createElement('p');
    p.style.textAlign = 'left';
    p.innerHTML = '<br>';
    blockElement.parentNode.insertBefore(p, blockElement.nextSibling);

    // Spostiamo il cursore al suo interno
    const newRange = document.createRange();
    newRange.setStart(p, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    p.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  } else {
    // Altrimenti creiamo un paragrafo in fondo all'editor
    const p = document.createElement('p');
    p.style.textAlign = 'left';
    p.innerHTML = '<br>';
    editor.appendChild(p);

    const newRange = document.createRange();
    newRange.setStart(p, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    p.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  if (window.renderLiveTextPreview) window.renderLiveTextPreview();
};

window.openCustomModal = function(type) {
  const backdrop = document.getElementById('customModalBackdrop');
  const box = document.getElementById('customModalBox');
  const title = document.getElementById('customModalTitle');
  const message = document.getElementById('customModalMessage');
  const g1 = document.getElementById('customModalInputGroup1');
  const g2 = document.getElementById('customModalInputGroup2');
  const l1 = document.getElementById('customModalLabel1');
  const l2 = document.getElementById('customModalLabel2');
  const i1 = document.getElementById('customModalInput1');
  const i2 = document.getElementById('customModalInput2');
  const confirmBtn = document.getElementById('customModalConfirmBtn');
  const cancelBtn = document.getElementById('customModalCancelBtn');

  const gFile = document.getElementById('customModalFileGroup');
  const fileInput = document.getElementById('customModalFileInput');

  const gSize = document.getElementById('customModalSizeGroup');
  const sizeSelect = document.getElementById('customModalSizeSelect');

  if (!backdrop) return;

  g1.style.display = 'none';
  g2.style.display = 'none';
  if (gFile) gFile.style.display = 'none';
  if (gSize) gSize.style.display = 'none';
  i1.value = '';
  i2.value = '';
  if (fileInput) fileInput.value = '';

  let uploadedImageDataUrl = '';
  let onConfirmHandler = null;

  if (fileInput) {
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          uploadedImageDataUrl = evt.target.result;
          if (i1) i1.value = `[File Selezionato: ${file.name}]`;
        };
        reader.readAsDataURL(file);
      }
    };
  }

  if (type === 'img') {
    title.textContent = 'Inserisci Immagine nel Testo';
    message.textContent = 'Carica dal dispositivo o inserisci un link web, e seleziona le dimensioni:';
    
    if (gSize) gSize.style.display = 'block';
    if (gFile) gFile.style.display = 'block';

    g1.style.display = 'block';
    l1.textContent = 'Oppure Inserisci Link Web (URL)';
    i1.placeholder = 'https://...';

    g2.style.display = 'block';
    l2.textContent = 'Testo Alternativo e Didascalia (ALT)';
    i2.placeholder = 'Descrizione immagine o didascalia...';

    onConfirmHandler = () => {
      const url = uploadedImageDataUrl || i1.value.trim();
      const alt = i2.value.trim();
      const imgWidth = sizeSelect ? sizeSelect.value : '100%';
      if (url && !url.startsWith('[File Selezionato:')) {
        const figcaptionHtml = alt ? `<figcaption style="font-size:0.82rem;color:var(--text-muted);margin-top:0.45rem;font-style:italic;">${alt}</figcaption>` : '';
        const imgHtml = `<figure class="media-element-wrapper" style="width:${imgWidth};max-width:100%;margin:1.5rem auto;text-align:center;clear:both;display:block;"><img src="${url}" alt="${alt}" style="width:100%;height:auto;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,0.35);display:block;margin:0 auto;border:1px solid var(--border-color);">${figcaptionHtml}</figure><p style="text-align: left;"><br></p>`;
        const editor = document.getElementById('artContent');
        if (editor) {
          editor.focus();
          window.ensureSelectionIsOutsideBlock(editor);
          document.execCommand('insertHTML', false, imgHtml);
          window.renderLiveTextPreview();
        }
      }
    };
  } else if (type === 'video') {
    title.textContent = 'Video YouTube o Vimeo';
    message.textContent = 'Inserisci l\'indirizzo web del video da incorporare nel testo:';
    g1.style.display = 'block';
    l1.textContent = 'Link Video (YouTube o Vimeo)';
    i1.placeholder = 'https://www.youtube.com/watch?v=...';

    onConfirmHandler = () => {
      const videoUrl = i1.value.trim();
      if (videoUrl) {
        let embedHtml = '';
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
          const match = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
          const videoId = match ? match[1] : '';
          if (videoId) {
            embedHtml = `<div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;margin:1.5rem 0;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:12px;border:none;" allowfullscreen></iframe></div><p style="text-align: left;"><br></p>`;
          }
        }
        if (!embedHtml) {
          embedHtml = `<p style="margin:1rem 0; text-align: left;"><a href="${videoUrl}" target="_blank" class="btn btn-secondary">Guarda il Video</a></p><p style="text-align: left;"><br></p>`;
        }
        const editor = document.getElementById('artContent');
        if (editor) {
          editor.focus();
          window.ensureSelectionIsOutsideBlock(editor);
          document.execCommand('insertHTML', false, embedHtml);
          window.renderLiveTextPreview();
        }
      }
    };
  } else if (type === 'cta') {
    title.textContent = 'Pulsante d\'Azione CTA';
    message.textContent = 'Crea un pulsante d\'impatto per guidare i lettori verso un link:';
    g1.style.display = 'block';
    l1.textContent = 'Link Pulsante (URL)';
    i1.placeholder = 'https://...';

    g2.style.display = 'block';
    l2.textContent = 'Testo del Pulsante';
    i2.placeholder = 'Scopri di più';

    onConfirmHandler = () => {
      const link = i1.value.trim();
      const label = i2.value.trim() || 'Scopri di più';
      if (link) {
        const ctaHtml = `<p style="text-align:center;margin:1.5rem 0;"><a href="${link}" style="display:inline-block;background:#C85A32;color:#fff;padding:0.75rem 1.75rem;border-radius:9999px;font-weight:700;text-decoration:none;">${label}</a></p><p style="text-align: left;"><br></p>`;
        const editor = document.getElementById('artContent');
        if (editor) {
          editor.focus();
          window.ensureSelectionIsOutsideBlock(editor);
          document.execCommand('insertHTML', false, ctaHtml);
          window.renderLiveTextPreview();
        }
      }
    };
  } else if (type === 'font') {
    title.textContent = 'Font Personalizzato nel Testo';
    message.textContent = 'Scrivi il nome del font ed il testo da formattare:';
    g1.style.display = 'block';
    l1.textContent = 'Nome Font (es: Playfair Display, Bebas Neue, Dancing Script)';
    i1.value = 'Playfair Display';

    g2.style.display = 'block';
    l2.textContent = 'Testo Formattato';
    i2.placeholder = 'Testo con font speciale...';

    onConfirmHandler = () => {
      const font = i1.value.trim() || 'Playfair Display';
      const text = i2.value.trim() || 'Testo formattato';
      const fontHtml = `<span style="font-family:'${font}', sans-serif;">${text}</span>`;
      const editor = document.getElementById('artContent');
      if (editor) {
        editor.focus();
        document.execCommand('insertHTML', false, fontHtml);
        window.renderLiveTextPreview();
      }
    };
  }

  const closeModal = () => {
    backdrop.style.opacity = '0';
    box.style.transform = 'scale(0.95)';
    setTimeout(() => {
      backdrop.style.display = 'none';
    }, 250);
  };

  confirmBtn.onclick = () => {
    if (onConfirmHandler) onConfirmHandler();
    closeModal();
  };

  cancelBtn.onclick = closeModal;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) closeModal();
  };

  backdrop.style.display = 'flex';
  setTimeout(() => {
    backdrop.style.opacity = '1';
    box.style.transform = 'scale(1)';
    if (g1.style.display === 'block') i1.focus();
  }, 10);
};

window.toggleLiveTextPreviewBox = function() {};

window.insertFormattingTag = function(tag) {
  const textarea = document.getElementById('artContent');
  if (!textarea) return;

  const start = textarea.selectionStart || 0;
  const end = textarea.selectionEnd || 0;
  const text = textarea.value || '';
  const selectedText = text.substring(start, end);

  let replacement = '';
  if (tag === '**' || tag === '*') {
    replacement = `${tag}${selectedText || 'Testo'}${tag}`;
  } else if (tag === '## ' || tag === '### ' || tag === '> ' || tag === '- ' || tag === '1. ') {
    replacement = `\n${tag}${selectedText || 'Testo'}\n`;
  } else {
    replacement = `${tag}${selectedText}`;
  }

  textarea.value = text.substring(0, start) + replacement + text.substring(end);
  textarea.focus();
  const newCursorPos = start + replacement.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos);
  window.renderLiveTextPreview();
};

window.changeArticleFont = function(fontName) {
  const editor = document.getElementById('artContent');
  if (!editor || !fontName) return;

  restoreEditorSelection();
  editor.focus();

  const fontFallbackMap = {
    'Inter': "'Inter', sans-serif",
    'Roboto': "'Roboto', sans-serif",
    'Open Sans': "'Open Sans', sans-serif",
    'Montserrat': "'Montserrat', sans-serif",
    'Poppins': "'Poppins', sans-serif",
    'Outfit': "'Outfit', sans-serif",
    'Lato': "'Lato', sans-serif",
    'Plus Jakarta Sans': "'Plus Jakarta Sans', sans-serif",
    'Raleway': "'Raleway', sans-serif",
    'Work Sans': "'Work Sans', sans-serif",
    'Playfair Display': "'Playfair Display', serif",
    'Merriweather': "'Merriweather', serif",
    'Lora': "'Lora', serif",
    'Cinzel': "'Cinzel', serif",
    'Bodoni Moda': "'Bodoni Moda', serif",
    'Cormorant Garamond': "'Cormorant Garamond', serif",
    'PT Serif': "'PT Serif', serif",
    'Bebas Neue': "'Bebas Neue', sans-serif",
    'Oswald': "'Oswald', sans-serif",
    'Syne': "'Syne', sans-serif",
    'Space Grotesk': "'Space Grotesk', sans-serif",
    'Fira Code': "'Fira Code', monospace",
    'JetBrains Mono': "'JetBrains Mono', monospace",
    'Space Mono': "'Space Mono', monospace",
    'Dancing Script': "'Dancing Script', cursive",
    'Caveat': "'Caveat', cursive",
    'Pacifico': "'Pacifico', cursive"
  };

  const fontFamilyCss = fontFallbackMap[fontName] || `'${fontName}', sans-serif`;

  document.execCommand('fontName', false, 'tempfont');
  const fontEls = editor.querySelectorAll('font[face="tempfont"]');
  fontEls.forEach(el => {
    const span = document.createElement('span');
    span.style.fontFamily = fontFamilyCss;
    span.innerHTML = el.innerHTML;
    el.parentNode.replaceChild(span, el);
  });

  window.renderLiveTextPreview();
};

window.insertSpecialTool = function(type) {
  const textarea = document.getElementById('artContent');
  if (!textarea) return;

  let textToInsert = '';

  if (type === 'font') {
    window.showCustomInputModal({
      title: 'Nome Font Personalizzato',
      message: 'Inserisci il nome del font (es: Playfair Display, Bebas Neue, Montserrat, Fira Code):',
      defaultValue: 'Playfair Display'
    }, (fontName) => {
      if (!fontName) return;
      const editor = document.getElementById('artContent');
      if (editor && editor.isContentEditable) {
        document.execCommand('fontName', false, fontName);
      }
    });
    return;
  } else if (type === 'img') {
    window.showCustomInputModal({
      title: 'Inserisci Immagine inline',
      message: 'Inserisci l\'indirizzo URL dell\'immagine:',
      placeholder: 'https://...'
    }, (url) => {
      if (!url) return;
      window.showCustomInputModal({
        title: 'Testo Alternativo (ALT)',
        message: 'Inserisci la descrizione alternata (facoltativo):',
        placeholder: 'Descrizione immagine...'
      }, (altText) => {
        const alt = altText || '';
        const figcaptionHtml = alt ? `<figcaption style="font-size:0.8rem;color:#94a3b8;margin-top:0.4rem;text-align:center;">${alt}</figcaption>` : '';
        const imgHtml = `<figure class="media-element-wrapper" style="display:block;margin:1.5rem auto;width:100%;max-width:100%;clear:both;text-align:center;"><img src="${url}" alt="${alt}" style="width:100%;height:auto;border-radius:12px;display:block;" />${figcaptionHtml}</figure><p></p>`;
        const editor = document.getElementById('artContent');
        if (editor) {
          editor.focus();
          if (typeof window.ensureSelectionIsOutsideBlock === 'function') {
            window.ensureSelectionIsOutsideBlock(editor);
          }
          document.execCommand('insertHTML', false, imgHtml);
        }
      });
    });
    return;
  } else if (type === 'video') {
    window.showCustomInputModal({
      title: 'Video YouTube o Vimeo',
      message: 'Inserisci l\'indirizzo web del video da incorporare:',
      placeholder: 'https://www.youtube.com/watch?v=...'
    }, (videoUrl) => {
      if (!videoUrl) return;
      let embedHtml = '';
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const match = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        const videoId = match ? match[1] : '';
        if (videoId) {
          embedHtml = `<div class="media-element-wrapper video-container" style="position:relative;padding-bottom:56.25%;height:0;margin:1.5rem auto;width:100%;clear:both;border-radius:12px;overflow:hidden;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:12px;border:none;" allowfullscreen></iframe></div><p></p>`;
        }
      }
      if (!embedHtml) {
        embedHtml = `<p style="text-align:center;margin:1.5rem 0;"><a href="${videoUrl}" target="_blank" class="btn btn-secondary">Guarda il Video</a></p><p></p>`;
      }
      const editor = document.getElementById('artContent');
      if (editor) {
        editor.focus();
        if (typeof window.ensureSelectionIsOutsideBlock === 'function') {
          window.ensureSelectionIsOutsideBlock(editor);
        }
        document.execCommand('insertHTML', false, embedHtml);
      }
    });
    return;
  } else if (type === 'table') {
    textToInsert = `\n\n| Colonne 1 | Colonne 2 | Colonne 3 |\n|---|---|---|\n| Dato A | Dato B | Dato C |\n| Dato D | Dato E | Dato F |\n\n`;
  } else if (type === 'code') {
    textToInsert = `\n\n<pre style="background:#0f172a;color:#f8fafc;padding:1rem;border-radius:12px;overflow-x:auto;"><code>// Scrivi qui il codice...\nconsole.log("Hello World!");</code></pre>\n\n`;
  } else if (type === 'cta') {
    window.showCustomInputModal({
      title: 'Pulsante CTA',
      message: 'Inserisci l\'indirizzo URL di destinazione:',
      defaultValue: 'https://'
    }, (link) => {
      if (!link) return;
      window.showCustomInputModal({
        title: 'Scritta Pulsante',
        message: 'Digita il testo da mostrare nel pulsante:',
        defaultValue: 'Scopri di più'
      }, (label) => {
        if (!label) return;
        const ctaHtml = `<p style="text-align:center;margin:1.5rem 0;"><a href="${link}" style="display:inline-block;background:#C85A32;color:#fff;padding:0.75rem 1.5rem;border-radius:9999px;font-weight:700;text-decoration:none;">${label}</a></p><p></p>`;
        const editor = document.getElementById('artContent');
        if (editor) {
          editor.focus();
          if (typeof window.ensureSelectionIsOutsideBlock === 'function') {
            window.ensureSelectionIsOutsideBlock(editor);
          }
          document.execCommand('insertHTML', false, ctaHtml);
        }
      });
    });
    return;
  } else if (type === 'box') {
    textToInsert = `\n\n<div style="background:rgba(200,90,50,0.1);border-left:4px solid #C85A32;padding:1rem 1.25rem;border-radius:0 12px 12px 0;margin:1.5rem 0;"><strong>Nota Redazionale:</strong> Inserisci qui l'approfondimento o la nota speciale.</div>\n\n`;
  }

  if (textToInsert) {
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const text = textarea.value || '';
    textarea.value = text.substring(0, start) + textToInsert + text.substring(end);
    textarea.focus();
    window.renderLiveTextPreview();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const AUTH_KEY = 'baas_admin_authenticated';
  
  const loginSection = document.getElementById('loginSection');
  const adminSection = document.getElementById('adminSection');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');
  const autoFillLoginBtn = document.getElementById('autoFillLoginBtn');
  
  const tabCreateBtn = document.getElementById('tabCreateBtn');
  const tabManageBtn = document.getElementById('tabManageBtn');
  const tabCreateLabel = document.getElementById('tabCreateLabel');
  const editorTitleLabel = document.getElementById('editorTitleLabel');
  const createTabContent = document.getElementById('createTabContent');
  const manageTabContent = document.getElementById('manageTabContent');

  const articleForm = document.getElementById('articleForm');
  const editingArticleIdInput = document.getElementById('editingArticleId');
  const submitFormBtn = document.getElementById('submitFormBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  
  const artTitleInput = document.getElementById('artTitle');
  const artSubtitleInput = document.getElementById('artSubtitle');
  const artSlugInput = document.getElementById('artSlug');
  const artCategorySelect = document.getElementById('artCategorySelect') || document.getElementById('artCategory');
  const artSubCategoryInput = document.getElementById('artSubCategory');
  const artAuthorInput = document.getElementById('artAuthor');
  const artReadTimeInput = document.getElementById('artReadTime');
  const artContentTextarea = document.getElementById('artContent');

  const artImageInput = document.getElementById('artImage');
  const artFileInput = document.getElementById('artFileInput');
  const fileSelectedBadge = document.getElementById('fileSelectedBadge');
  const previewImg = document.getElementById('previewImg');
  const previewPlaceholder = document.getElementById('previewPlaceholder');
  const imgPreviewBox = document.getElementById('imgPreviewBox');
  const artImageAltInput = document.getElementById('artImageAlt');
  const artImageCaptionInput = document.getElementById('artImageCaption');

  const artIsFeaturedCheckbox = document.getElementById('artIsFeatured');
  const artIsHomeFeaturedCheckbox = document.getElementById('artIsHomeFeatured');
  const artSeriesInput = document.getElementById('artSeries');

  const artSeoTitleInput = document.getElementById('artSeoTitle');
  const artMetaDescriptionInput = document.getElementById('artMetaDescription');
  const artKeywordsInput = document.getElementById('artKeywords');
  const artCanonicalUrlInput = document.getElementById('artCanonicalUrl');
  const artRobotsSelect = document.getElementById('artRobots');
  const artOgTitleInput = document.getElementById('artOgTitle');
  const artOgDescriptionInput = document.getElementById('artOgDescription');

  const artWorkflowStatusSelect = document.getElementById('artWorkflowStatus');
  const artScheduledAtInput = document.getElementById('artScheduledAt');

  // --- TAGS SUITE REDAZIONALE ---
  let tagsList = [];
  const tagsChipsArea = document.getElementById('tagsChipsArea');
  const artTagsInput = document.getElementById('artTagsInput');

  function renderTagsChips() {
    if (!tagsChipsArea) return;
    tagsChipsArea.innerHTML = '';
    tagsList.forEach((tag, idx) => {
      const chip = document.createElement('div');
      chip.className = 'tag-chip';
      chip.style.display = 'inline-flex';
      chip.style.alignItems = 'center';
      chip.style.gap = '0.3rem';
      chip.style.background = 'rgba(200, 90, 50, 0.1)';
      chip.style.color = '#e05a2b';
      chip.style.padding = '0.2rem 0.5rem';
      chip.style.borderRadius = '6px';
      chip.style.fontSize = '0.75rem';
      chip.style.fontWeight = '600';
      chip.innerHTML = `
        <span>${tag}</span>
        <span class="remove-tag-btn" style="cursor:pointer;font-weight:800;" data-index="${idx}">✕</span>
      `;
      tagsChipsArea.appendChild(chip);
    });

    // Aggiungi click listener per rimuovere tag
    tagsChipsArea.querySelectorAll('.remove-tag-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        tagsList.splice(idx, 1);
        renderTagsChips();
      });
    });
  }

  if (artTagsInput) {
    artTagsInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const value = artTagsInput.value.trim();
        if (value && !tagsList.includes(value)) {
          tagsList.push(value);
          renderTagsChips();
          artTagsInput.value = '';
        }
      }
    });
  }
  // ------------------------------

  function generateSlug(text) {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  if (artTitleInput && artSlugInput) {
    artTitleInput.addEventListener('input', () => {
      if (!editingArticleIdInput || !editingArticleIdInput.value) {
        artSlugInput.value = generateSlug(artTitleInput.value);
      }
    });
  }

  const autoGenerateSlugBtn = document.getElementById('autoGenerateSlugBtn');
  if (autoGenerateSlugBtn && artTitleInput && artSlugInput) {
    autoGenerateSlugBtn.addEventListener('click', () => {
      artSlugInput.value = generateSlug(artTitleInput.value);
      showToast('Slug generato dal titolo!');
    });
  }
  const cropFitBtns = document.querySelectorAll('.btn-fit-opt');
  const cropRatioBtns = document.querySelectorAll('.btn-ratio-opt');
  const cropPosBtns = document.querySelectorAll('.btn-pos-opt');
  const presetBtns = document.querySelectorAll('.preset-image-btn');

  const fontOptBtns = document.querySelectorAll('.btn-font-opt');
  const titleColorSwatches = document.querySelectorAll('#titleColorSwatches .color-swatch');
  const textColorSwatches = document.querySelectorAll('#textColorSwatches .color-swatch');
  const artTitleColorPicker = document.getElementById('artTitleColorPicker');
  const artTextColorPicker = document.getElementById('artTextColorPicker');

  const openCropperModalBtn = document.getElementById('openCropperModalBtn');
  const cropperModal = document.getElementById('cropperModal');
  const cropperModalClose = document.getElementById('cropperModalClose');
  const cancelCropBtn = document.getElementById('cancelCropBtn');
  const applyCropBtn = document.getElementById('applyCropBtn');
  const cropperCanvas = document.getElementById('cropperCanvas');
  const cropZoomRange = document.getElementById('cropZoomRange');
  const zoomVal = document.getElementById('zoomVal');
  const rotateLeftBtn = document.getElementById('rotateLeftBtn');
  const rotateRightBtn = document.getElementById('rotateRightBtn');
  const rotateVal = document.getElementById('rotateVal');
  const filterBtns = document.querySelectorAll('.btn-filter-opt');

  let cropperImageObj = new Image();
  let cropZoom = 1;
  let cropAngle = 0;
  let cropFilter = 'none';
  let cropBrightness = 100;
  let cropContrast = 100;
  let cropSaturation = 100;
  let flipX = 1;
  let flipY = 1;
  let currentAspect = '16/9';
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  let currentFit = 'cover';
  let currentRatio = '16/9';
  let currentPos = 'center';
  let currentFont = 'sans';
  let currentTitleColor = '#ffffff';
  let currentTextColor = '#e2e8f0';

  let activeCoverImageData = '';

  const articlesTableBody = document.getElementById('articlesTableBody');
  const totalArticlesBadge = document.getElementById('totalArticlesBadge');
  const resetDataBtn = document.getElementById('resetDataBtn');
  const toastContainer = document.getElementById('toastContainer');

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<div>${message}</div>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function checkAuth() {
    const isAuth = localStorage.getItem(AUTH_KEY) === 'true' || sessionStorage.getItem(AUTH_KEY) === 'true';
    if (isAuth) {
      if (loginSection) loginSection.style.display = 'none';
      if (adminSection) adminSection.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    } else {
      if (loginSection) loginSection.style.display = 'block';
      if (adminSection) adminSection.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }

  let isSubmittingLogin = false;
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmittingLogin) return;
    
    // Se l'utente è già autenticato, non rieseguire il login né mostrare il toast a ripetizione
    if (localStorage.getItem(AUTH_KEY) === 'true' && loginSection && loginSection.style.display === 'none') {
      return;
    }

    isSubmittingLogin = true;
    const email = document.getElementById('loginEmail') ? document.getElementById('loginEmail').value.trim() : '';
    const pass = document.getElementById('loginPassword') ? document.getElementById('loginPassword').value.trim() : '';

    try {
      const res = await fetch('api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem(AUTH_KEY, 'true');
        sessionStorage.setItem(AUTH_KEY, 'true');
        checkAuth();
        showToast('Benvenuto ' + (data.user ? data.user.name : 'Francesco Pisapia') + '!');
        if (loginError) loginError.style.display = 'none';
      } else {
        if (loginError) {
          loginError.style.display = 'block';
          loginError.textContent = data.message || 'Credenziali non valide.';
        }
      }
    } catch (err) {
      if (email === 'admin@thedreamersmagazine.it' && pass === 'password123') {
        localStorage.setItem(AUTH_KEY, 'true');
        sessionStorage.setItem(AUTH_KEY, 'true');
        checkAuth();
        showToast('Benvenuto Francesco Pisapia!');
        if (loginError) loginError.style.display = 'none';
      } else {
        if (loginError) {
          loginError.style.display = 'block';
          loginError.textContent = 'Credenziali non valide.';
        }
      }
    } finally {
      setTimeout(() => { isSubmittingLogin = false; }, 800);
    }
  });

  if (autoFillLoginBtn) {
    autoFillLoginBtn.addEventListener('click', () => {
      const emailEl = document.getElementById('loginEmail');
      const passEl = document.getElementById('loginPassword');
      if (emailEl) emailEl.value = 'admin@thedreamersmagazine.it';
      if (passEl) passEl.value = 'password123';

      const copyText = 'Email: admin@thedreamersmagazine.it\nPassword: password123';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyText).then(() => {
          showToast('Credenziali compilate e copiate negli appunti!');
        }).catch(() => {
          showToast('Credenziali compilate nei campi!');
        });
      } else {
        showToast('Credenziali compilate nei campi!');
      }
    });
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    checkAuth();
    showToast('Disconnessione effettuata.');
  });

  const tabImportBtn = document.getElementById('tabImportBtn');
  const importTabContent = document.getElementById('importTabContent');
  const tabMessagesBtn = document.getElementById('tabMessagesBtn');
  const messagesTabContent = document.getElementById('messagesTabContent');
  const refreshMessagesBtn = document.getElementById('refreshMessagesBtn');
  const messagesListContainer = document.getElementById('messagesListContainer');
  const totalMessagesBadge = document.getElementById('totalMessagesBadge');
  const countAllMsg = document.getElementById('countAllMsg');
  const countUnreadMsg = document.getElementById('countUnreadMsg');
  let currentMsgFilter = 'all';
  let cachedMessages = [];

  const startWpFetchBtn = document.getElementById('startWpFetchBtn');
  const wpSiteUrlInput = document.getElementById('wpSiteUrlInput');
  const wpFetchLimitSelect = document.getElementById('wpFetchLimitSelect');
  const wpDefaultCategorySelect = document.getElementById('wpDefaultCategorySelect');
  const wpImportStatus = document.getElementById('wpImportStatus');
  const startJsonImportBtn = document.getElementById('startJsonImportBtn');
  const jsonImportFileInput = document.getElementById('jsonImportFileInput');

  function switchTab(activeBtn, activeContent) {
    const allBtns = [
      document.getElementById('tabCreateBtn'),
      document.getElementById('tabManageBtn'),
      document.getElementById('tabImportBtn'),
      document.getElementById('tabMessagesBtn')
    ];
    const allContents = [
      document.getElementById('createTabContent'),
      document.getElementById('manageTabContent'),
      document.getElementById('importTabContent'),
      document.getElementById('messagesTabContent')
    ];

    allBtns.forEach(btn => btn?.classList.remove('active'));
    allContents.forEach(cnt => { if (cnt) cnt.style.display = 'none'; });
    
    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.style.display = 'block';
  }

  const headerTabsContainer = document.querySelector('.admin-header-tabs');
  if (headerTabsContainer) {
    headerTabsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-link');
      if (!btn) return;
      
      const btnId = btn.id;
      if (btnId === 'tabCreateBtn') {
        switchTab(tabCreateBtn, createTabContent);
      } else if (btnId === 'tabManageBtn') {
        switchTab(tabManageBtn, manageTabContent);
      } else if (btnId === 'tabImportBtn') {
        switchTab(tabImportBtn, importTabContent);
      } else if (btnId === 'tabMessagesBtn') {
        switchTab(document.getElementById('tabMessagesBtn'), document.getElementById('messagesTabContent'));
        loadAdminMessages();
      }
    });
  }

  if (refreshMessagesBtn) {
    refreshMessagesBtn.addEventListener('click', () => loadAdminMessages());
  }

  let selectedMsgId = null;
  let searchQuery = '';

  const msgSearchInput = document.getElementById('msgSearchInput');
  const messageDetailPane = document.getElementById('messageDetailPane');
  const countUnreadKpi = document.getElementById('countUnreadKpi');
  const countTotalKpi = document.getElementById('countTotalKpi');

  if (msgSearchInput) {
    msgSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderAdminMessages();
    });
  }

  async function loadAdminMessages() {
    if (!messagesListContainer) return;
    messagesListContainer.innerHTML = `<div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">Caricamento messaggi dal Database...</div>`;

    try {
      const response = await fetch('api/leggi_contatti.php?action=list');
      const data = await response.json();

      if (data.success) {
        cachedMessages = data.messages || [];
        
        // Aggiornamento KPI
        if (totalMessagesBadge) totalMessagesBadge.textContent = data.unread || '0';
        if (countAllMsg) countAllMsg.textContent = data.total || '0';
        if (countUnreadMsg) countUnreadMsg.textContent = data.unread || '0';
        if (countUnreadKpi) countUnreadKpi.textContent = data.unread || '0';
        if (countTotalKpi) countTotalKpi.textContent = data.total || '0';

        renderAdminMessages();
      } else {
        throw new Error(data.message || 'Errore durante la lettura dei messaggi.');
      }
    } catch (err) {
      console.warn('Errore lettura messaggi:', err);
      messagesListContainer.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1.5rem; border-radius: 14px; color: #f87171; text-align: left;">
          <strong>Impossibile caricare i messaggi dal Database:</strong> ${err.message}<br>
          <small style="margin-top: 0.5rem; display: block; color: var(--text-muted);">Assicurati che XAMPP (Apache e MySQL) sia attivo e che la pagina sia aperta su http://localhost/SitoChecco/admin.html</small>
        </div>
      `;
    }
  }

  function renderAdminMessages() {
    let filtered = cachedMessages;
    
    // Filtro Tab Stato
    if (currentMsgFilter === 'new') filtered = cachedMessages.filter(m => m.status === 'new');
    else if (currentMsgFilter === 'read') filtered = cachedMessages.filter(m => m.status === 'read' || m.status === 'replied');
    else if (currentMsgFilter === 'archived') filtered = cachedMessages.filter(m => m.status === 'archived');

    // Filtro Ricerca Testuale
    if (searchQuery) {
      filtered = filtered.filter(m => 
        (m.name && m.name.toLowerCase().includes(searchQuery)) ||
        (m.email && m.email.toLowerCase().includes(searchQuery)) ||
        (m.subject && m.subject.toLowerCase().includes(searchQuery)) ||
        (m.message && m.message.toLowerCase().includes(searchQuery))
      );
    }

    if (filtered.length === 0) {
      messagesListContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; background: var(--bg-primary); border-radius: 16px; border: 1px dashed var(--border-color);">
          <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">Nessun messaggio trovato</div>
          <div style="font-size: 0.82rem; color: var(--text-muted);">Non ci sono messaggi in arrivo per questo filtro.</div>
        </div>
      `;
      renderEmptyDetailPane();
      return;
    }

    // Se nessun messaggio è attualmente selezionato o se quello selezionato è stato eliminato
    if (!selectedMsgId || !filtered.some(m => String(m.id) === String(selectedMsgId))) {
      selectedMsgId = filtered[0].id;
    }

    // Render Lista Sinistra
    messagesListContainer.innerHTML = filtered.map(msg => {
      const isSelected = String(msg.id) === String(selectedMsgId);
      const isNew = msg.status === 'new';
      
      const initials = msg.name ? msg.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'M';
      
      const statusBadge = isNew
        ? `<span style="background: rgba(200, 90, 50, 0.2); color: #e05a2b; padding: 0.15rem 0.5rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700;">NUOVO</span>`
        : (msg.status === 'archived' 
          ? `<span style="background: rgba(156, 163, 175, 0.15); color: #9ca3af; padding: 0.15rem 0.5rem; border-radius: 6px; font-size: 0.7rem;">Archiviato</span>`
          : `<span style="background: rgba(34, 197, 94, 0.15); color: #4ade80; padding: 0.15rem 0.5rem; border-radius: 6px; font-size: 0.7rem;">Letto</span>`);

      const dateShort = msg.created_at ? new Date(msg.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : '';
      const excerpt = msg.message ? (msg.message.length > 55 ? msg.message.substring(0, 55) + '...' : msg.message) : '';

      return `
        <div class="admin-msg-card ${isSelected ? 'selected' : ''}" data-msg-id="${msg.id}" style="
          background: ${isSelected ? 'rgba(200, 90, 50, 0.08)' : 'var(--bg-primary)'};
          border: 1px solid ${isSelected ? '#C85A32' : (isNew ? 'rgba(200, 90, 50, 0.3)' : 'var(--border-color)')};
          padding: 1.1rem;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        ">
          <div style="display: flex; gap: 0.85rem; align-items: flex-start;">
            
            <div style="
              width: 40px; height: 40px; border-radius: 12px;
              background: ${isNew ? 'linear-gradient(135deg, #C85A32, #991b1b)' : 'rgba(255, 255, 255, 0.05)'};
              color: #ffffff; display: flex; align-items: center; justify-content: center;
              font-weight: 800; font-size: 0.85rem; flex-shrink: 0;
            ">
              ${initials}
            </div>

            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                <strong style="font-size: 0.92rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(msg.name)}</strong>
                <span style="font-size: 0.72rem; color: var(--text-muted); flex-shrink: 0;">${dateShort}</span>
              </div>

              <div style="font-size: 0.8rem; font-weight: 600; color: ${isNew ? '#f97316' : 'var(--text-secondary)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0.3rem;">
                ${escapeHtml(msg.subject || 'Oggetto Generale')}
              </div>

              <div style="font-size: 0.78rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${escapeHtml(excerpt)}
              </div>
            </div>

          </div>
        </div>
      `;
    }).join('');

    // Click Listener per selezionare un messaggio
    messagesListContainer.querySelectorAll('.admin-msg-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-msg-id');
        selectedMsgId = id;
        
        // Se il messaggio è nuovo, lo segniamo come letto automaticamente all'apertura
        const targetMsg = cachedMessages.find(m => String(m.id) === String(id));
        if (targetMsg && targetMsg.status === 'new') {
          updateMsgStatus(id, 'read', false);
        }

        renderAdminMessages();
      });
    });

    // Render Pannello Dettaglio Destra
    renderActiveDetailPane();
  }

  function renderEmptyDetailPane() {
    if (!messageDetailPane) return;
    messageDetailPane.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; color: var(--text-muted); padding: 3rem;">
        <div style="font-size: 1.2rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.35rem;">Nessun messaggio selezionato</div>
        <p style="font-size: 0.85rem; max-width: 300px;">Seleziona un messaggio dalla colonna a sinistra per vederne i dettagli.</p>
      </div>
    `;
  }

  function renderActiveDetailPane() {
    if (!messageDetailPane) return;
    const msg = cachedMessages.find(m => String(m.id) === String(selectedMsgId));
    if (!msg) {
      renderEmptyDetailPane();
      return;
    }

    const initials = msg.name ? msg.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'M';
    const dateFull = msg.created_at ? new Date(msg.created_at).toLocaleString('it-IT', { dateStyle: 'full', timeStyle: 'short' }) : '';
    
    const isNew = msg.status === 'new';
    const isArchived = msg.status === 'archived';

    messageDetailPane.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; text-align: left; width: 100%;">
        
        <!-- Detail Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 1.25rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          
          <div style="display: flex; gap: 1rem; align-items: center;">
            <div style="
              width: 52px; height: 52px; border-radius: 16px;
              background: linear-gradient(135deg, #C85A32, #991b1b);
              color: #ffffff; display: flex; align-items: center; justify-content: center;
              font-weight: 800; font-size: 1.1rem; flex-shrink: 0; box-shadow: 0 8px 16px rgba(200, 90, 50, 0.25);
            ">
              ${initials}
            </div>

            <div>
              <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.15rem;">
                ${escapeHtml(msg.name)}
              </h3>
              <div style="font-size: 0.85rem; color: #e05a2b; font-weight: 500;">
                <a href="mailto:${escapeHtml(msg.email)}" style="color: #e05a2b; text-decoration: none;">${escapeHtml(msg.email)}</a>
              </div>
            </div>
          </div>

          <!-- Actions Toolbar -->
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <a href="mailto:${escapeHtml(msg.email)}?subject=Re: ${encodeURIComponent(msg.subject || 'Risposta Redazione')}" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.5rem 0.9rem; font-weight: 700; border-radius: 10px;">
              Rispondi via Email
            </a>

            ${isNew 
              ? `<button id="detailMarkReadBtn" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.5rem 0.85rem; border-radius: 10px;">Segna come Letto</button>`
              : `<button id="detailMarkUnreadBtn" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.5rem 0.85rem; border-radius: 10px;">Segna come Non Letto</button>`
            }

            ${!isArchived 
              ? `<button id="detailArchiveBtn" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.5rem 0.85rem; border-radius: 10px;">Archivia</button>`
              : `<button id="detailUnarchiveBtn" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.5rem 0.85rem; border-radius: 10px;">Ripristina</button>`
            }

            <button id="detailDeleteBtn" class="btn btn-danger" style="font-size: 0.8rem; padding: 0.5rem 0.85rem; background: #dc2626; border-radius: 10px; color: #fff;">
              Elimina
            </button>
          </div>

        </div>

        <!-- Subject & Meta Banner -->
        <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); padding: 1rem 1.25rem; border-radius: 14px; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 0.15rem; letter-spacing: 0.05em;">Oggetto della richiesta</span>
            <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">
              ${escapeHtml(msg.subject || 'Generale')}
            </div>
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); text-align: right;">
            Data di ricezione: <strong>${dateFull}</strong>
          </div>
        </div>

        <!-- Full Message Paper Box -->
        <div style="
          flex: 1;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--border-color);
          padding: 1.5rem;
          border-radius: 16px;
          font-size: 0.95rem;
          color: var(--text-primary);
          line-height: 1.7;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-y: auto;
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
        ">
${escapeHtml(msg.message)}
        </div>

      </div>
    `;

    // Bind Detail Pane Action Buttons
    const detailMarkReadBtn = document.getElementById('detailMarkReadBtn');
    if (detailMarkReadBtn) detailMarkReadBtn.addEventListener('click', () => updateMsgStatus(msg.id, 'read'));

    const detailMarkUnreadBtn = document.getElementById('detailMarkUnreadBtn');
    if (detailMarkUnreadBtn) detailMarkUnreadBtn.addEventListener('click', () => updateMsgStatus(msg.id, 'new'));

    const detailArchiveBtn = document.getElementById('detailArchiveBtn');
    if (detailArchiveBtn) detailArchiveBtn.addEventListener('click', () => updateMsgStatus(msg.id, 'archived'));

    const detailUnarchiveBtn = document.getElementById('detailUnarchiveBtn');
    if (detailUnarchiveBtn) detailUnarchiveBtn.addEventListener('click', () => updateMsgStatus(msg.id, 'read'));

    const detailDeleteBtn = document.getElementById('detailDeleteBtn');
    if (detailDeleteBtn) detailDeleteBtn.addEventListener('click', () => deleteMsg(msg.id));
  }

  async function updateMsgStatus(id, newStatus, reloadUI = true) {
    try {
      const res = await fetch('api/leggi_contatti.php?action=update_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        if (reloadUI) {
          showToast('Stato messaggio aggiornato!');
          loadAdminMessages();
        } else {
          // Aggiornamento silenzioso in background del modello locale
          const msgObj = cachedMessages.find(m => String(m.id) === String(id));
          if (msgObj) msgObj.status = newStatus;
        }
      }
    } catch (e) {
      if (reloadUI) showToast('Errore durante l\'aggiornamento', 'error');
    }
  }

  async function deleteMsg(id) {
    window.showCustomConfirmModal({
      title: 'Elimina Messaggio',
      message: 'Sei sicuro di voler eliminare definitivamente questo messaggio dal database?',
      confirmText: 'Elimina Ora',
      cancelText: 'Annulla',
      isDanger: true
    }, async (confirmed) => {
      if (!confirmed) return;
      try {
        const res = await fetch('api/leggi_contatti.php?action=delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Messaggio eliminato!');
          selectedMsgId = null;
          loadAdminMessages();
        }
      } catch (e) {
        showToast('Errore durante l\'eliminazione', 'error');
      }
    });
  }

  document.querySelectorAll('#msgFilterGroup .btn-filter-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#msgFilterGroup .btn-filter-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMsgFilter = btn.getAttribute('data-msg-filter');
      renderAdminMessages();
    });
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function updateTypographyUI() {
    fontOptBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-font') === currentFont));
    titleColorSwatches.forEach(s => s.classList.toggle('active', s.getAttribute('data-color') === currentTitleColor));
    artTitleColorPicker.value = currentTitleColor;
    textColorSwatches.forEach(s => s.classList.toggle('active', s.getAttribute('data-color') === currentTextColor));
    artTextColorPicker.value = currentTextColor;
  }

  fontOptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFont = btn.getAttribute('data-font');
      updateTypographyUI();
    });
  });

  titleColorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      currentTitleColor = swatch.getAttribute('data-color');
      updateTypographyUI();
    });
  });

  if (artTitleColorPicker) {
    artTitleColorPicker.addEventListener('input', (e) => {
      currentTitleColor = e.target.value;
      updateTypographyUI();
    });
  }

  textColorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      currentTextColor = swatch.getAttribute('data-color');
      updateTypographyUI();
    });
  });

  if (artTextColorPicker) {
    artTextColorPicker.addEventListener('input', (e) => {
      currentTextColor = e.target.value;
      updateTypographyUI();
    });
  }

  window.removeCoverImage = function() {
    activeCoverImageData = '';
    window.activeCoverImageData = '';
    const artImageInput = document.getElementById('artImage');
    const artFileInput = document.getElementById('artFileInput');
    const fileSelectedBadge = document.getElementById('fileSelectedBadge');

    if (artImageInput) artImageInput.value = '';
    if (artFileInput) artFileInput.value = '';
    if (fileSelectedBadge) {
      fileSelectedBadge.style.display = 'none';
      fileSelectedBadge.textContent = '';
    }

    updateImagePreview('');
    if (window.showToast) window.showToast('Immagine di copertina rimossa.', 'info');
  };

  function updateImagePreview(src, skipInputUpdate = false) {
    const cleanSrc = src ? src.trim() : '';
    activeCoverImageData = cleanSrc;
    window.activeCoverImageData = cleanSrc;
    
    const imgEl = document.getElementById('previewImg');
    const placeholderEl = document.getElementById('previewPlaceholder');
    const boxEl = document.getElementById('imgPreviewBox');
    const removeBtn = document.getElementById('removeCoverImgBtn');
    const artImageInput = document.getElementById('artImage');

    if (artImageInput && !skipInputUpdate) {
      artImageInput.value = cleanSrc;
    }

    if (cleanSrc && imgEl) {
      imgEl.src = cleanSrc;
      imgEl.style.width = '100%';
      imgEl.style.height = '100%';
      imgEl.style.objectFit = currentFit || 'cover';
      imgEl.style.objectPosition = currentPos || 'center';
      imgEl.style.display = 'block';

      if (placeholderEl) {
        placeholderEl.style.display = 'none';
      }

      if (removeBtn) {
        removeBtn.style.display = 'flex';
      }

      if (boxEl) {
        if (currentRatio === '16/9') boxEl.style.height = '180px';
        else if (currentRatio === '4/3') boxEl.style.height = '210px';
        else if (currentRatio === '1/1') boxEl.style.height = '250px';
        else boxEl.style.height = '160px';
      }
    } else {
      if (imgEl) {
        imgEl.src = '';
        imgEl.style.display = 'none';
      }
      if (placeholderEl) {
        placeholderEl.textContent = 'Anteprima Copertina';
        placeholderEl.style.display = 'block';
      }
      if (removeBtn) {
        removeBtn.style.display = 'none';
      }
    }
    if (typeof updateSeoLivePreviews === 'function') {
      updateSeoLivePreviews();
    }
  }

  function updateSeoLivePreviews() {
    const seoTitleVal = artSeoTitleInput ? artSeoTitleInput.value.trim() : '';
    const metaDescVal = artMetaDescriptionInput ? artMetaDescriptionInput.value.trim() : '';
    const ogTitleVal = artOgTitleInput ? artOgTitleInput.value.trim() : '';
    const ogDescVal = artOgDescriptionInput ? artOgDescriptionInput.value.trim() : '';
    const slugVal = artSlugInput ? artSlugInput.value.trim() : '';

    const articleTitle = artTitleInput ? artTitleInput.value.trim() : '';
    const articleSubtitle = artSubtitleInput ? artSubtitleInput.value.trim() : '';

    // Character counters
    const seoTitleCounter = document.getElementById('seoTitleCounter');
    if (seoTitleCounter) {
      seoTitleCounter.textContent = seoTitleVal.length;
      if (seoTitleVal.length > 60) {
        seoTitleCounter.style.color = '#ef4444';
      } else {
        seoTitleCounter.style.color = '';
      }
    }

    const metaDescCounter = document.getElementById('metaDescCounter');
    if (metaDescCounter) {
      metaDescCounter.textContent = metaDescVal.length;
      if (metaDescVal.length > 160) {
        metaDescCounter.style.color = '#ef4444';
      } else {
        metaDescCounter.style.color = '';
      }
    }

    // Google SERP Preview
    const serpTitleEl = document.getElementById('serpPreviewTitle');
    if (serpTitleEl) {
      serpTitleEl.textContent = seoTitleVal || articleTitle || "Titolo dell'Articolo su Google";
    }

    const serpDescEl = document.getElementById('serpPreviewDesc');
    if (serpDescEl) {
      serpDescEl.textContent = metaDescVal || articleSubtitle || "Inserisci la Meta Description per vedere l'anteprima del testo esatto su Google.";
    }

    const serpUrlEl = document.getElementById('serpPreviewUrl');
    if (serpUrlEl) {
      serpUrlEl.textContent = `https://thedreamersmagazine.it/${slugVal}`;
    }

    // Social Preview
    const socialTitleEl = document.getElementById('socialPreviewTitle');
    if (socialTitleEl) {
      socialTitleEl.textContent = ogTitleVal || seoTitleVal || articleTitle || "Titolo Articolo";
    }

    const socialDescEl = document.getElementById('socialPreviewDesc');
    if (socialDescEl) {
      socialDescEl.textContent = ogDescVal || metaDescVal || articleSubtitle || "Descrizione di anteprima della scheda social...";
    }

    // Social Cover Preview
    const socialImg = document.getElementById('socialPreviewImg');
    const socialPlaceholder = document.getElementById('socialPreviewImgPlaceholder');
    const coverSrc = activeCoverImageData || (artImageInput ? artImageInput.value.trim() : '');
    
    if (socialImg) {
      if (coverSrc) {
        socialImg.src = coverSrc;
        socialImg.style.display = 'block';
        if (socialPlaceholder) socialPlaceholder.style.display = 'none';
      } else {
        socialImg.src = '';
        socialImg.style.display = 'none';
        if (socialPlaceholder) socialPlaceholder.style.display = 'flex';
      }
    }
  }

  // Register SEO input synchronization listeners
  [
    artTitleInput,
    artSubtitleInput,
    artSlugInput,
    artSeoTitleInput,
    artMetaDescriptionInput,
    artOgTitleInput,
    artOgDescriptionInput
  ].forEach(input => {
    if (input) {
      input.addEventListener('input', updateSeoLivePreviews);
    }
  });

  // Call initial preview update
  setTimeout(updateSeoLivePreviews, 100);

  function updateCropButtonsUI() {
    cropFitBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-fit') === currentFit));
    cropRatioBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-ratio') === currentRatio));
    cropPosBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-pos') === currentPos));
  }

  cropFitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFit = btn.getAttribute('data-fit');
      updateCropButtonsUI();
      updateImagePreview(activeCoverImageData || artImageInput.value);
    });
  });

  cropRatioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentRatio = btn.getAttribute('data-ratio');
      updateCropButtonsUI();
      updateImagePreview(activeCoverImageData || artImageInput.value);
    });
  });

  cropPosBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentPos = btn.getAttribute('data-pos');
      updateCropButtonsUI();
      updateImagePreview(activeCoverImageData || artImageInput.value);
    });
  });

  function drawCropperCanvas() {
    if (!cropperCanvas || !cropperImageObj || !cropperImageObj.src) return;
    const ctx = cropperCanvas.getContext('2d');
    if (!ctx) return;
    const width = cropperCanvas.width;
    const height = cropperCanvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    ctx.translate(width / 2 + panX, height / 2 + panY);
    ctx.rotate((cropAngle * Math.PI) / 180);
    ctx.scale(cropZoom * flipX, cropZoom * flipY);

    let combinedFilter = `brightness(${cropBrightness}%) contrast(${cropContrast}%) saturate(${cropSaturation}%)`;
    if (cropFilter && cropFilter !== 'none') {
      combinedFilter += ` ${cropFilter}`;
    }
    ctx.filter = combinedFilter;

    const imgWidth = width;
    const aspectRatio = (cropperImageObj.width && cropperImageObj.height) ? (cropperImageObj.height / cropperImageObj.width) : 0.5625;
    const imgHeight = aspectRatio * width;
    ctx.drawImage(cropperImageObj, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

    ctx.restore();
  }

  function resetCropperValues() {
    cropZoom = 1;
    cropAngle = 0;
    cropFilter = 'none';
    cropBrightness = 100;
    cropContrast = 100;
    cropSaturation = 100;
    flipX = 1;
    flipY = 1;
    panX = 0;
    panY = 0;

    const cropZoomRange = document.getElementById('cropZoomRange');
    const cropBrightnessRange = document.getElementById('cropBrightnessRange');
    const cropContrastRange = document.getElementById('cropContrastRange');
    const cropSaturateRange = document.getElementById('cropSaturateRange');
    const zoomVal = document.getElementById('zoomVal');
    const rotateVal = document.getElementById('rotateVal');
    const brightVal = document.getElementById('brightVal');
    const contrastVal = document.getElementById('contrastVal');
    const saturateVal = document.getElementById('saturateVal');
    const flipHBtn = document.getElementById('flipHBtn');
    const flipVBtn = document.getElementById('flipVBtn');

    if (cropZoomRange) cropZoomRange.value = 1;
    if (cropBrightnessRange) cropBrightnessRange.value = 100;
    if (cropContrastRange) cropContrastRange.value = 100;
    if (cropSaturateRange) cropSaturateRange.value = 100;

    if (zoomVal) zoomVal.textContent = '100%';
    if (rotateVal) rotateVal.textContent = '0°';
    if (brightVal) brightVal.textContent = '100%';
    if (contrastVal) contrastVal.textContent = '100%';
    if (saturateVal) saturateVal.textContent = '100%';

    if (flipHBtn) flipHBtn.classList.remove('active');
    if (flipVBtn) flipVBtn.classList.remove('active');

    const filterBtns = document.querySelectorAll('.btn-filter-opt');
    filterBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === 'none'));

    drawCropperCanvas();
  }

  function openCropperModal() {
    if (typeof window.clearWysiwygSelection === 'function') {
      window.clearWysiwygSelection();
    }
    const imgPreviewEl = document.getElementById('previewImg');
    const src = activeCoverImageData || (artImageInput ? artImageInput.value.trim() : '') || (imgPreviewEl && imgPreviewEl.src && imgPreviewEl.style.display !== 'none' ? imgPreviewEl.src : '');
    if (!src) {
      showToast('Carica o incolla prima un\'immagine di copertina!', 'danger');
      return;
    }

    cropperImageObj = new Image();
    
    // Non impostiamo crossOrigin per i file locali (data:) per evitare blocchi del browser
    if (!src.startsWith('data:')) {
      cropperImageObj.crossOrigin = 'Anonymous';
    }

    cropperImageObj.onload = () => {
      resetCropperValues();

      if (cropperModal) {
        cropperModal.classList.add('active', 'open');
        cropperModal.setAttribute('aria-hidden', 'false');
      }
      drawCropperCanvas();
    };

    cropperImageObj.onerror = () => {
      // Fallback senza crossOrigin per immagini esterne protette
      if (cropperImageObj.crossOrigin) {
        cropperImageObj.crossOrigin = null;
        cropperImageObj.src = src;
      } else {
        showToast('Impossibile caricare questa immagine nel ritaglio Canvas', 'danger');
      }
    };

    cropperImageObj.src = src;
  }

  function closeCropperModal() {
    if (cropperModal) {
      cropperModal.classList.remove('active', 'open');
      cropperModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (openCropperModalBtn) openCropperModalBtn.addEventListener('click', openCropperModal);
  if (cropperModalClose) cropperModalClose.addEventListener('click', closeCropperModal);
  if (cancelCropBtn) cancelCropBtn.addEventListener('click', closeCropperModal);

  const resetCropBtn = document.getElementById('resetCropBtn');
  if (resetCropBtn) resetCropBtn.addEventListener('click', resetCropperValues);

  // Aspect ratio handlers
  const aspectBtns = document.querySelectorAll('.btn-aspect-opt');
  aspectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      aspectBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAspect = btn.getAttribute('data-aspect');
      if (cropperCanvas) {
        if (currentAspect === '16/9') { cropperCanvas.width = 640; cropperCanvas.height = 360; }
        else if (currentAspect === '4/3') { cropperCanvas.width = 640; cropperCanvas.height = 480; }
        else if (currentAspect === '1/1') { cropperCanvas.width = 500; cropperCanvas.height = 500; }
        else if (currentAspect === '21/9') { cropperCanvas.width = 700; cropperCanvas.height = 300; }
        drawCropperCanvas();
      }
    });
  });

  // Zoom handler
  if (cropZoomRange) {
    cropZoomRange.addEventListener('input', (e) => {
      cropZoom = parseFloat(e.target.value);
      const zoomVal = document.getElementById('zoomVal');
      if (zoomVal) zoomVal.textContent = Math.round(cropZoom * 100) + '%';
      drawCropperCanvas();
    });
  }

  // Rotate handlers
  if (rotateLeftBtn) {
    rotateLeftBtn.addEventListener('click', () => {
      cropAngle = (cropAngle - 90) % 360;
      const rotateVal = document.getElementById('rotateVal');
      if (rotateVal) rotateVal.textContent = cropAngle + '°';
      drawCropperCanvas();
    });
  }

  if (rotateRightBtn) {
    rotateRightBtn.addEventListener('click', () => {
      cropAngle = (cropAngle + 90) % 360;
      const rotateVal = document.getElementById('rotateVal');
      if (rotateVal) rotateVal.textContent = cropAngle + '°';
      drawCropperCanvas();
    });
  }

  // Flip H/V handlers
  const flipHBtn = document.getElementById('flipHBtn');
  const flipVBtn = document.getElementById('flipVBtn');
  if (flipHBtn) {
    flipHBtn.addEventListener('click', () => {
      flipX = flipX * -1;
      flipHBtn.classList.toggle('active', flipX === -1);
      drawCropperCanvas();
    });
  }
  if (flipVBtn) {
    flipVBtn.addEventListener('click', () => {
      flipY = flipY * -1;
      flipVBtn.classList.toggle('active', flipY === -1);
      drawCropperCanvas();
    });
  }

  // Brightness, Contrast, Saturation handlers
  const cropBrightnessRange = document.getElementById('cropBrightnessRange');
  if (cropBrightnessRange) {
    cropBrightnessRange.addEventListener('input', (e) => {
      cropBrightness = parseInt(e.target.value, 10);
      const brightVal = document.getElementById('brightVal');
      if (brightVal) brightVal.textContent = cropBrightness + '%';
      drawCropperCanvas();
    });
  }

  const cropContrastRange = document.getElementById('cropContrastRange');
  if (cropContrastRange) {
    cropContrastRange.addEventListener('input', (e) => {
      cropContrast = parseInt(e.target.value, 10);
      const contrastVal = document.getElementById('contrastVal');
      if (contrastVal) contrastVal.textContent = cropContrast + '%';
      drawCropperCanvas();
    });
  }

  const cropSaturateRange = document.getElementById('cropSaturateRange');
  if (cropSaturateRange) {
    cropSaturateRange.addEventListener('input', (e) => {
      cropSaturation = parseInt(e.target.value, 10);
      const saturateVal = document.getElementById('saturateVal');
      if (saturateVal) saturateVal.textContent = cropSaturation + '%';
      drawCropperCanvas();
    });
  }

  // Filter preset buttons
  const cropFilterBtns = document.querySelectorAll('.btn-filter-opt');
  cropFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cropFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cropFilter = btn.getAttribute('data-filter');
      drawCropperCanvas();
    });
  });

  // Drag pan interaction
  if (cropperCanvas) {
    cropperCanvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
    });
  }

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    drawCropperCanvas();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  if (applyCropBtn) {
    applyCropBtn.addEventListener('click', () => {
      try {
        const croppedDataUrl = cropperCanvas.toDataURL('image/jpeg', 0.92);
        if (artImageInput) artImageInput.value = '';
        updateImagePreview(croppedDataUrl);
        closeCropperModal();
        showToast('Ritaglio applicato con successo!');
      } catch (e) {
        console.error('Error cropping image:', e);
        showToast('Immagine esterna protetta da CORS. Carica una foto dal dispositivo.', 'danger');
      }
    });
  }



  if (artImageInput) {
    artImageInput.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      if (url) {
        if (artFileInput) artFileInput.value = '';
        if (fileSelectedBadge) fileSelectedBadge.style.display = 'none';
        updateImagePreview(url);
      } else {
        updateImagePreview('');
      }
    });
  }

  presetBtns.forEach(btn => {
    if (btn.hasAttribute('data-url')) {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        artImageInput.value = url;
        artFileInput.value = '';
        if (fileSelectedBadge) fileSelectedBadge.style.display = 'none';
        updateImagePreview(url);
      });
    }
  });

  // ------------------------------------------------------------------------
  // TUTORIAL BOX & GUIDA ADMIN
  // ------------------------------------------------------------------------
  window.toggleAdminTutorial = function() {
    const box = document.getElementById('adminTutorialBox');
    if (box) {
      const isHidden = window.getComputedStyle(box).display === 'none' || box.style.display === 'none';
      box.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const toggleTutorialBtn = document.getElementById('toggleTutorialBtn');
  const closeTutorialBtn = document.getElementById('closeTutorialBtn');

  if (toggleTutorialBtn) {
    toggleTutorialBtn.addEventListener('click', window.toggleAdminTutorial);
  }
  if (closeTutorialBtn) {
    closeTutorialBtn.addEventListener('click', window.toggleAdminTutorial);
  }

  // Compressione e Conversione immagini multi-formato (JPG, PNG, WebP, AVIF, GIF, BMP, SVG)
  function processAndCompressImageWebP(file) {
    if (!file) return;
    const origSizeKb = Math.round(file.size / 1024);
    const fileName = file.name ? file.name.toLowerCase() : '';
    const isSvg = file.type === 'image/svg+xml' || fileName.endsWith('.svg');

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawResult = e.target.result;

      // Impostazione immediata e sicura dell'immagine di copertina
      updateImagePreview(rawResult);

      if (fileSelectedBadge) {
        fileSelectedBadge.style.display = 'inline-block';
        fileSelectedBadge.textContent = isSvg ? `Vettoriale SVG (${origSizeKb} KB)` : `Foto Pronta (${origSizeKb} KB)`;
      }

      showToast('Immagine di copertina caricata con successo!');

      if (isSvg) return;

      // Ottimizzazione canvas WebP in background
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1600;
          let width = img.width || 800;
          let height = img.height || 600;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          let finalDataUrl = canvas.toDataURL('image/webp', 0.82);
          
          if (finalDataUrl && finalDataUrl.length > 50 && finalDataUrl !== 'data:,') {
            updateImagePreview(finalDataUrl);
            const webpSizeKb = Math.round((finalDataUrl.length * 3) / 4 / 1024);
            if (fileSelectedBadge) {
              fileSelectedBadge.textContent = `Foto Ottimizzata: ${origSizeKb} KB > ${webpSizeKb} KB`;
            }
          }
        } catch (err) {
          console.warn('Ottimizzazione canvas fallback:', err);
        }
      };

      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  }

  const dropzone = document.getElementById('fileUploadDropzone');
  if (dropzone && artFileInput) {
    artFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        processAndCompressImageWebP(file);
      }
    });

    dropzone.addEventListener('click', (e) => {
      if (e.target !== artFileInput) {
        artFileInput.click();
      }
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.style.borderColor = '#C85A32';
      dropzone.style.background = 'rgba(200, 90, 50, 0.15)';
    });

    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.style.borderColor = 'rgba(200, 90, 50, 0.4)';
      dropzone.style.background = 'var(--bg-primary)';
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.style.borderColor = 'rgba(200, 90, 50, 0.4)';
      dropzone.style.background = 'var(--bg-primary)';
      const file = (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) || (artFileInput.files && artFileInput.files[0]);
      if (file) {
        processAndCompressImageWebP(file);
      }
    });
  }

  // ------------------------------------------------------------------------
  // ANTEPRIMA LIVE TESTO & TOOLBAR FORMATTAZIONE RICCA
  // ------------------------------------------------------------------------


  // Event Listeners per tutti i pulsanti di formattazione della Toolbar (.tool-btn)
  document.querySelectorAll('.editor-toolbar .tool-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tag = btn.getAttribute('data-tag');
      if (!tag || !artContentTextarea) return; // I pulsanti speciali con ID hanno i propri handler

      const start = artContentTextarea.selectionStart || 0;
      const end = artContentTextarea.selectionEnd || 0;
      const text = artContentTextarea.value || '';
      const selectedText = text.substring(start, end);

      let replacement = '';
      if (tag === '**' || tag === '*') {
        replacement = `${tag}${selectedText || 'Testo'}${tag}`;
      } else if (tag === '## ' || tag === '### ' || tag === '> ' || tag === '- ' || tag === '1. ') {
        replacement = `\n${tag}${selectedText || 'Testo'}\n`;
      } else {
        replacement = `${tag}${selectedText}`;
      }

      artContentTextarea.value = text.substring(0, start) + replacement + text.substring(end);
      artContentTextarea.focus();
      const newCursorPos = start + replacement.length;
      artContentTextarea.setSelectionRange(newCursorPos, newCursorPos);
      updateLiveTextPreview();
    });
  });

  // Toolbar Avanzata Formattazione Ricca (Pulsanti Speciali)
  const toolInsertImgBtn = document.getElementById('toolInsertImgBtn');
  const toolInsertVideoBtn = document.getElementById('toolInsertVideoBtn');
  const toolInsertTableBtn = document.getElementById('toolInsertTableBtn');
  const toolInsertCodeBtn = document.getElementById('toolInsertCodeBtn');
  const toolInsertCtaBtn = document.getElementById('toolInsertCtaBtn');
  const toolInsertBoxBtn = document.getElementById('toolInsertBoxBtn');

  function insertTextAtCursor(textToInsert) {
    const editor = document.getElementById('artContent');
    if (!editor) return;

    if (editor.isContentEditable) {
      editor.focus();
      if (
        textToInsert.includes('<figure') || 
        textToInsert.includes('<div') || 
        textToInsert.includes('<table') || 
        textToInsert.includes('<pre') || 
        textToInsert.includes('<p style=')
      ) {
        if (typeof window.ensureSelectionIsOutsideBlock === 'function') {
          window.ensureSelectionIsOutsideBlock(editor);
        }
      }
      const sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = textToInsert;
        const frag = document.createDocumentFragment();
        let node, lastNode;
        while ((node = tempDiv.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (lastNode) {
          range.setStartAfter(lastNode);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } else {
        editor.innerHTML += textToInsert;
      }
    } else {
      const start = editor.selectionStart || 0;
      const end = editor.selectionEnd || 0;
      const text = editor.value || '';
      editor.value = text.substring(0, start) + textToInsert + text.substring(end);
    }
  }

  if (toolInsertImgBtn) {
    toolInsertImgBtn.addEventListener('click', () => {
      window.showCustomInputModal({
        title: 'Inserisci Immagine nel Testo',
        message: 'Inserisci l\'indirizzo URL dell\'immagine da mostrare:',
        placeholder: 'https://...'
      }, (url) => {
        if (url) {
          window.showCustomInputModal({
            title: 'Testo Alternativo (ALT)',
            message: 'Inserisci una descrizione facoltativa per l\'immagine (o lascia vuoto):',
            placeholder: 'es: Attore sul red carpet'
          }, (altText) => {
            const alt = altText || '';
            const figcaptionHtml = alt ? `<figcaption style="font-size:0.8rem;color:#94a3b8;margin-top:0.4rem;text-align:center;">${alt}</figcaption>` : '';
            const figureHtml = `<figure class="media-element-wrapper" style="display:block;margin:1.5rem auto;width:100%;max-width:100%;clear:both;text-align:center;"><img src="${url}" alt="${alt}" style="width:100%;height:auto;border-radius:12px;display:block;" />${figcaptionHtml}</figure><p style="text-align: left;"><br></p>`;
            insertTextAtCursor(figureHtml);
          });
        }
      });
    });
  }

  if (toolInsertVideoBtn) {
    toolInsertVideoBtn.addEventListener('click', () => {
      window.showCustomInputModal({
        title: 'Incorpora Video',
        message: 'Inserisci il link del video YouTube o Vimeo:',
        placeholder: 'https://www.youtube.com/watch?v=...'
      }, (videoUrl) => {
        if (videoUrl) {
          let embedHtml = '';
          if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            const match = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
            const videoId = match ? match[1] : '';
            if (videoId) {
              embedHtml = `<div class="media-element-wrapper video-container" style="position:relative;padding-bottom:56.25%;height:0;margin:1.5rem auto;width:100%;clear:both;border-radius:12px;overflow:hidden;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:12px;border:none;" allowfullscreen></iframe></div><p style="text-align: left;"><br></p>`;
            }
          }
          if (!embedHtml) {
            embedHtml = `<p style="text-align:center;margin:1.5rem 0;"><a href="${videoUrl}" target="_blank" class="btn btn-secondary">Guarda il Video</a></p><p style="text-align: left;"><br></p>`;
          }
          insertTextAtCursor(embedHtml);
        }
      });
    });
  }

  if (toolInsertTableBtn) {
    toolInsertTableBtn.addEventListener('click', () => {
      const tableMarkdown = `\n\n| Colonne 1 | Colonne 2 | Colonne 3 |\n|---|---|---|\n| Dato A | Dato B | Dato C |\n| Dato D | Dato E | Dato F |\n\n`;
      insertTextAtCursor(tableMarkdown);
    });
  }

  if (toolInsertCodeBtn) {
    toolInsertCodeBtn.addEventListener('click', () => {
      insertTextAtCursor(`<pre style="background:#0f172a;color:#f8fafc;padding:1rem;border-radius:12px;overflow-x:auto;"><code>// Scrivi qui il codice...\nconsole.log("Hello World!");</code></pre><p style="text-align: left;"><br></p>`);
    });
  }

  if (toolInsertCtaBtn) {
    toolInsertCtaBtn.addEventListener('click', () => {
      window.showCustomInputModal({
        title: 'Pulsante CTA Call To Action',
        message: 'Inserisci l\'indirizzo URL di destinazione del pulsante:',
        defaultValue: 'https://',
        placeholder: 'https://...'
      }, (link) => {
        if (link) {
          window.showCustomInputModal({
            title: 'Testo del Pulsante',
            message: 'Digita la scritta da mostrare all\'interno del pulsante:',
            defaultValue: 'Scopri di più',
            placeholder: 'es: Guarda Ora / Leggi di più'
          }, (label) => {
            if (label) {
              insertTextAtCursor(`<p style="text-align:center;margin:1.5rem 0;"><a href="${link}" style="display:inline-block;background:#C85A32;color:#fff;padding:0.75rem 1.5rem;border-radius:9999px;font-weight:700;text-decoration:none;">${label}</a></p><p style="text-align: left;"><br></p>`);
            }
          });
        }
      });
    });
  }

  // Toolbar inserimento box info senza emoji
  if (toolInsertBoxBtn) {
    toolInsertBoxBtn.addEventListener('click', () => {
      insertTextAtCursor(`<div style="background:rgba(200,90,50,0.1);border-left:4px solid #C85A32;padding:1rem 1.25rem;border-radius:0 12px 12px 0;margin:1.5rem 0;"><strong>Nota Redazionale:</strong> Inserisci qui l'approfondimento o la nota speciale.</div><p style="text-align: left;"><br></p>`);
    });
  }

  function resetFormToCreateMode() {
    if (articleForm) articleForm.reset();
    const editingInput = document.getElementById('editingArticleId');
    if (editingInput) editingInput.value = '';
    const artContentEl = document.getElementById('artContent');
    if (artContentEl) artContentEl.innerHTML = '';
    
    tagsList = [];
    renderTagsChips();
    
    if (typeof removeCoverImage === 'function') removeCoverImage();
    
    if (editorTitleLabel) editorTitleLabel.textContent = 'Crea Nuovo Articolo';
    if (submitFormBtn) submitFormBtn.textContent = 'Pubblica Subito';
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
  }

  // ------------------------------------------------------------------------
  // SEZIONE GESTISCI ARTICOLI: KPI, RICERCA & FILTRI
  // ------------------------------------------------------------------------
  const kpiTotalArtCount = document.getElementById('kpiTotalArtCount');
  const kpiPublishedArtCount = document.getElementById('kpiPublishedArtCount');
  const kpiDraftArtCount = document.getElementById('kpiDraftArtCount');
  const kpiFeaturedArtCount = document.getElementById('kpiFeaturedArtCount');

  const manageSearchInput = document.getElementById('manageSearchInput');
  const manageCategoryFilter = document.getElementById('manageCategoryFilter');
  const manageStatusFilter = document.getElementById('manageStatusFilter');

  let rawArticlesList = [];

  function filterAndRenderArticles() {
    if (!rawArticlesList) return;

    const query = manageSearchInput ? manageSearchInput.value.toLowerCase().trim() : '';
    const selectedCat = manageCategoryFilter ? manageCategoryFilter.value : 'ALL';
    const selectedStatus = manageStatusFilter ? manageStatusFilter.value : 'ALL';

    const filtered = rawArticlesList.filter(art => {
      const matchSearch = !query || 
        (art.title && art.title.toLowerCase().includes(query)) ||
        (art.slug && art.slug.toLowerCase().includes(query)) ||
        (art.author && art.author.toLowerCase().includes(query));

      const matchCat = selectedCat === 'ALL' || art.category === selectedCat;

      let matchStatus = true;
      if (selectedStatus === 'published') matchStatus = art.status === 'published' || !art.status;
      else if (selectedStatus === 'draft') matchStatus = art.status === 'draft';
      else if (selectedStatus === 'featured') matchStatus = !!art.isFeatured || !!art.isHomeFeatured;

      return matchSearch && matchCat && matchStatus;
    });

    renderAdminTableRows(filtered);
  }

  if (manageSearchInput) manageSearchInput.addEventListener('input', filterAndRenderArticles);
  if (manageCategoryFilter) manageCategoryFilter.addEventListener('change', filterAndRenderArticles);
  if (manageStatusFilter) manageStatusFilter.addEventListener('change', filterAndRenderArticles);

  function resetArticleForm() {
    if (editingArticleIdInput) editingArticleIdInput.value = '';
    if (articleForm) articleForm.reset();
    activeCoverImageData = '';
    tagsList = [];
    renderTagsChips();
    updateImagePreview('');
    if (editorTitleLabel) editorTitleLabel.textContent = 'Crea Nuovo Articolo';
    if (submitFormBtn) submitFormBtn.textContent = 'Pubblica Subito';
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
  }

  function resetFormToCreateMode() {
    resetArticleForm();
  }

  function startEditingArticle(article) {
    if (!article) return;
    if (editingArticleIdInput) editingArticleIdInput.value = article.id || '';

    if (artTitleInput) artTitleInput.value = article.title || '';
    if (artSubtitleInput) artSubtitleInput.value = article.subtitle || '';
    if (artSlugInput) artSlugInput.value = article.slug || '';
    if (artCategorySelect) artCategorySelect.value = article.category || 'News';
    if (artSubCategoryInput) artSubCategoryInput.value = article.subCategory || '';
    
    const authorEl = document.getElementById('artAuthor');
    if (authorEl) authorEl.value = article.author || 'Admin';

    const readTimeEl = document.getElementById('artReadTime');
    if (readTimeEl) readTimeEl.value = article.readTime || '3 min';

    const artContentEl = document.getElementById('artContent');
    if (artContentEl) {
      artContentEl.innerHTML = article.content || '';
      renderLiveTextPreview();
    }

    tagsList = Array.isArray(article.tags) ? [...article.tags] : [];
    renderTagsChips();

    if (artIsFeaturedCheckbox) artIsFeaturedCheckbox.checked = !!article.isFeatured;
    if (artIsHomeFeaturedCheckbox) artIsHomeFeaturedCheckbox.checked = !!article.isHomeFeatured;
    if (artSeriesInput) artSeriesInput.value = article.series || '';

    if (artImageAltInput) artImageAltInput.value = article.imageAlt || '';
    if (artImageCaptionInput) artImageCaptionInput.value = article.imageCaption || '';

    if (artSeoTitleInput) artSeoTitleInput.value = article.seoTitle || '';
    if (artMetaDescriptionInput) artMetaDescriptionInput.value = article.metaDescription || '';
    if (artKeywordsInput) artKeywordsInput.value = article.keywords || '';
    if (artCanonicalUrlInput) artCanonicalUrlInput.value = article.canonicalUrl || '';
    if (artRobotsSelect) artRobotsSelect.value = article.robots || 'index, follow';
    if (artOgTitleInput) artOgTitleInput.value = article.ogTitle || '';
    if (artOgDescriptionInput) artOgDescriptionInput.value = article.ogDescription || '';
    if (artWorkflowStatusSelect) artWorkflowStatusSelect.value = article.status || 'published';
    if (artScheduledAtInput) artScheduledAtInput.value = article.scheduledAt || '';

    // Caricamento dell'immagine di copertina salvata nell'anteprima
    if (article.image) {
      updateImagePreview(article.image);
    }

    if (editorTitleLabel) editorTitleLabel.textContent = 'Modifica Articolo';
    if (submitFormBtn) submitFormBtn.textContent = 'Salva Modifiche';
    if (cancelEditBtn) cancelEditBtn.style.display = 'inline-block';

    // Passa alla scheda Crea / Modifica Articolo
    if (tabCreateBtn) tabCreateBtn.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', resetArticleForm);
  }

  function renderAdminTable(articles) {
    rawArticlesList = articles || [];
    totalArticlesBadge.textContent = articles.length;

    // Aggiornamento KPI
    if (kpiTotalArtCount) kpiTotalArtCount.textContent = articles.length;
    if (kpiPublishedArtCount) kpiPublishedArtCount.textContent = articles.filter(a => a.status === 'published' || !a.status).length;
    if (kpiDraftArtCount) kpiDraftArtCount.textContent = articles.filter(a => a.status === 'draft').length;
    if (kpiFeaturedArtCount) kpiFeaturedArtCount.textContent = articles.filter(a => a.isFeatured || a.isHomeFeatured).length;

    filterAndRenderArticles();
  }

  function renderAdminTableRows(articles) {
    if (!articlesTableBody) return;

    if (articles.length === 0) {
      articlesTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem 1.5rem;">
            Nessun articolo trovato per i filtri selezionati.
          </td>
        </tr>
      `;
      return;
    }

    articlesTableBody.innerHTML = articles.map(art => {
      const isDraft = art.status === 'draft';
      const isFeatured = !!art.isFeatured || !!art.isHomeFeatured;
      
      let statusBadgeHtml = '';
      if (isDraft) {
        statusBadgeHtml = `<span style="background: rgba(251, 191, 36, 0.15); border: 1px solid rgba(251, 191, 36, 0.3); color: #fbbf24; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.72rem; font-weight: 700;">Bozza</span>`;
      } else {
        statusBadgeHtml = `<span style="background: rgba(52, 211, 153, 0.15); border: 1px solid rgba(52, 211, 153, 0.3); color: #34d399; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.72rem; font-weight: 700;">Pubblicato</span>`;
      }

      if (isFeatured) {
        statusBadgeHtml += ` <span style="background: rgba(200, 90, 50, 0.15); border: 1px solid rgba(200, 90, 50, 0.3); color: #e05a2b; padding: 0.2rem 0.5rem; border-radius: 9999px; font-size: 0.72rem; font-weight: 700;">In Evidenza</span>`;
      }

      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 1rem 1.5rem;">
            <img src="${art.image}" alt="${escapeHtml(art.title)}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 10px; border: 1px solid var(--border-color);" onError="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'">
          </td>
          <td style="padding: 1rem 0.5rem;">
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem;">
              ${escapeHtml(art.title)}
            </div>
            ${art.slug ? `<div style="font-size: 0.72rem; color: #e05a2b; font-family: monospace; margin-top: 0.1rem;">/${escapeHtml(art.slug)}</div>` : ''}
          </td>
          <td style="padding: 1rem 0.5rem;">
            <span style="background: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-secondary); padding: 0.25rem 0.65rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">
              ${escapeHtml(art.category)} ${art.subCategory ? `› ${escapeHtml(art.subCategory)}` : ''}
            </span>
          </td>
          <td style="padding: 1rem 0.5rem;">
            ${statusBadgeHtml}
          </td>
          <td style="padding: 1rem 0.5rem; color: var(--text-muted); font-size: 0.78rem;">
            <div style="color: var(--text-primary); font-weight: 600;">${escapeHtml(art.author || 'Admin')}</div>
            <div>${new Date(art.createdAt).toLocaleDateString('it-IT')}</div>
          </td>
          <td style="padding: 1rem 1.5rem; text-align: right;">
            <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-edit-art" data-id="${art.id}" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; border-radius: 8px;">
                Modifica
              </button>
              <button class="btn btn-danger btn-delete-art" data-id="${art.id}" style="padding: 0.35rem 0.75rem; font-size: 0.78rem; border-radius: 8px; background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3);">
                Elimina
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    articlesTableBody.querySelectorAll('.btn-edit-art').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const article = rawArticlesList.find(a => a.id === id);
        if (article) startEditingArticle(article);
      });
    });

    articlesTableBody.querySelectorAll('.btn-delete-art').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        window.showCustomConfirmModal({
          title: 'Elimina Articolo',
          message: 'Sei sicuro di voler eliminare questo articolo dal database?',
          confirmText: 'Elimina',
          cancelText: 'Annulla',
          isDanger: true
        }, async (confirmed) => {
          if (confirmed) {
            const success = await window.baas.deleteArticle(id);
            if (success) {
              showToast('Articolo eliminato!', 'danger');
            }
          }
        });
      });
    });
  }

  async function saveArticleHandler(targetStatus = 'published') {
    const statusEl = document.getElementById('artStatus') || document.getElementById('artWorkflowStatusSelect');
    if (statusEl) statusEl.value = targetStatus;

    try {
      const editingId = editingArticleIdInput ? editingArticleIdInput.value : '';
      const title = artTitleInput ? artTitleInput.value.trim() : '';
      if (!title) {
        showToast('Inserisci un titolo per l\'articolo', 'error');
        return;
      }

      const subtitle = artSubtitleInput ? artSubtitleInput.value.trim() : '';
      const slug = artSlugInput && artSlugInput.value ? artSlugInput.value.trim() : generateSlug(title);
      const category = artCategorySelect ? artCategorySelect.value : 'News';
      const subCategory = artSubCategoryInput ? artSubCategoryInput.value.trim() : '';
      const author = artAuthorInput ? artAuthorInput.value.trim() : 'Francesco Pisapia';
      const artContentEl = document.getElementById('artContent');
      const content = artContentEl ? (artContentEl.innerHTML || artContentEl.value || '').trim() : '';

      const words = content ? content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0;
      const readTime = Math.max(1, Math.ceil(words / 200)) + ' min';

      const payload = {
        title,
        subtitle,
        slug,
        category,
        subCategory,
        tags: [...tagsList],
        isFeatured: artIsFeaturedCheckbox ? artIsFeaturedCheckbox.checked : false,
        isHomeFeatured: artIsHomeFeaturedCheckbox ? artIsHomeFeaturedCheckbox.checked : false,
        series: artSeriesInput ? artSeriesInput.value.trim() : '',
        
        image: activeCoverImageData || (artImageInput ? artImageInput.value.trim() : '') || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
        imageFit: currentFit,
        imageRatio: currentRatio,
        imagePos: currentPos,
        imageAlt: artImageAltInput ? artImageAltInput.value.trim() : '',
        imageCaption: artImageCaptionInput ? artImageCaptionInput.value.trim() : '',

        fontFamily: currentFont,
        titleColor: currentTitleColor,
        textColor: currentTextColor,
        readTime,
        content,
        excerpt: subtitle !== '' ? subtitle : (content.length > 140 ? content.substring(0, 140) + '...' : content),
        author,

        // Suite SEO
        seoTitle: artSeoTitleInput ? artSeoTitleInput.value.trim() : '',
        metaDescription: artMetaDescriptionInput ? artMetaDescriptionInput.value.trim() : '',
        canonicalUrl: artCanonicalUrlInput ? artCanonicalUrlInput.value.trim() : '',
        robots: artRobotsSelect ? artRobotsSelect.value : 'index, follow',
        ogTitle: artOgTitleInput ? artOgTitleInput.value.trim() : '',
        ogDescription: artOgDescriptionInput ? artOgDescriptionInput.value.trim() : '',
        ogImage: activeCoverImageData || (artImageInput ? artImageInput.value.trim() : ''),
        keywords: artKeywordsInput ? artKeywordsInput.value.trim() : '',

        // Workflow
        status: targetStatus,
        scheduledAt: artScheduledAtInput ? artScheduledAtInput.value : null
      };

      if (editingId) {
        payload.id = editingId;
        await window.baas.updateArticle(editingId, payload);
        showToast(`Articolo aggiornato con successo!`);
      } else {
        await window.baas.addArticle(payload);
        showToast(targetStatus === 'draft' ? `Bozza salvata con successo!` : `Articolo "${title}" pubblicato con successo!`);
      }

      const freshArticles = await window.baas.loadArticlesFromBackend();
      renderAdminTable(freshArticles);
      resetFormToCreateMode();
    } catch (err) {
      console.error('Errore invio articolo:', err);
      showToast('Errore durante la pubblicazione: ' + err.message, 'error');
    }
  }

  const saveDraftBtn = document.getElementById('saveDraftBtn');
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', (e) => {
      if (e) e.preventDefault();
      saveArticleHandler('draft');
    });
  }

  if (submitFormBtn) {
    submitFormBtn.addEventListener('click', (e) => {
      if (e) e.preventDefault();
      saveArticleHandler('published');
    });
  }

  if (articleForm) {
    articleForm.addEventListener('submit', (e) => {
      if (e) e.preventDefault();
      const statusEl = document.getElementById('artStatus') || document.getElementById('artWorkflowStatusSelect');
      const targetStatus = statusEl ? statusEl.value : 'published';
      saveArticleHandler(targetStatus);
    });
  }

  window.submitArticleAsDraft = function() {
    saveArticleHandler('draft');
  };

  resetDataBtn.addEventListener('click', () => {
    window.showCustomConfirmModal({
      title: 'Elimina Tutti gli Articoli',
      message: 'Sei sicuro di voler eliminare TUTTI gli articoli dal database? Questa azione non può essere annullata.',
      confirmText: 'Elimina Tutto',
      cancelText: 'Annulla',
      isDanger: true
    }, (confirmed) => {
      if (confirmed) {
        window.baas.clearAllArticles();
        resetFormToCreateMode();
        showToast('Tutti gli articoli sono stati eliminati!');
      }
    });
  });

  // ------------------------------------------------------------------------
  // WORDPRESS REST API AUTOMATIC IMPORTER (WITH CORS PROXY FALLBACK)
  // ------------------------------------------------------------------------
  if (startWpFetchBtn && wpSiteUrlInput) {
    startWpFetchBtn.addEventListener('click', async () => {
      let siteUrl = wpSiteUrlInput.value.trim().replace(/\/+$/, '');
      if (!siteUrl) {
        showToast('Inserisci un URL valido per il sito WordPress', 'error');
        return;
      }

      if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
        siteUrl = 'https://' + siteUrl;
      }

      const limit = wpFetchLimitSelect ? wpFetchLimitSelect.value : '100';
      const defaultCat = wpDefaultCategorySelect ? wpDefaultCategorySelect.value : 'News';
      const endpoint = `${siteUrl}/wp-json/wp/v2/posts?per_page=${limit}&_embed=1`;

      startWpFetchBtn.disabled = true;
      startWpFetchBtn.textContent = '⌛ Connessione a WordPress in corso...';
      if (wpImportStatus) {
        wpImportStatus.style.display = 'block';
        wpImportStatus.style.color = '#3b82f6';
        wpImportStatus.textContent = 'Connessione al server WordPress in corso...';
      }

      try {
        let wpPosts = null;

        // Try direct fetch first
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            wpPosts = await response.json();
          }
        } catch (errDirect) {
          console.warn('Direct fetch failed or CORS blocked. Trying CORS proxy...', errDirect);
        }

        // Try CORS Proxy fallback if direct fetch failed
        if (!wpPosts || !Array.isArray(wpPosts)) {
          if (wpImportStatus) wpImportStatus.textContent = 'Tentativo tramite Proxy CORS...';
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(endpoint)}`;
          const proxyRes = await fetch(proxyUrl);
          if (proxyRes.ok) {
            wpPosts = await proxyRes.json();
          }
        }

        if (!Array.isArray(wpPosts) || wpPosts.length === 0) {
          throw new Error('Nessun articolo trovato sul sito WordPress specificato');
        }

        const parsedArticles = wpPosts.map((post, idx) => {
          let coverImage = '';
          if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
            coverImage = post._embedded['wp:featuredmedia'][0].source_url || '';
          }

          let category = defaultCat;
          if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0]) {
            const terms = post._embedded['wp:term'][0];
            if (terms.length > 0) {
              const termName = terms[0].name.toLowerCase();
              if (termName.includes('film') || termName.includes('cinema')) category = 'Film';
              else if (termName.includes('serie') || termName.includes('tv')) category = 'Serie TV';
              else if (termName.includes('approfondiment')) category = 'Approfondimenti';
              else if (termName.includes('intervist')) category = 'Interviste';
              else category = 'News';
            }
          }

          let author = 'Redazione';
          if (post._embedded && post._embedded['author'] && post._embedded['author'][0]) {
            author = post._embedded['author'][0].name || 'Redazione';
          }

          const rawExcerpt = post.excerpt ? post.excerpt.rendered : '';
          const cleanExcerpt = rawExcerpt.replace(/<[^>]*>?/gm, '').trim();
          const rawContent = post.content ? post.content.rendered : '';

          return {
            id: 'wp-' + post.id,
            title: post.title ? post.title.rendered.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'").replace(/&amp;/g, '&') : 'Articolo',
            category: category,
            image: coverImage || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
            excerpt: cleanExcerpt,
            content: rawContent,
            author: author,
            createdAt: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
            readTime: '3 min'
          };
        });

        const count = await window.baas.bulkImportArticles(parsedArticles);
        showToast(`Importati con successo ${count} articoli da WordPress!`);
        if (wpImportStatus) {
          wpImportStatus.style.color = '#10b981';
          wpImportStatus.textContent = `Importazione completata! ${count} articoli aggiunti con successo al database.`;
        }

      } catch (err) {
        console.error('Errore importazione WordPress:', err);
        showToast('Errore durante l\'importazione: ' + err.message, 'error');
        if (wpImportStatus) {
          wpImportStatus.style.color = '#ef4444';
          wpImportStatus.textContent = `Errore: ${err.message}. Prova ad utilizzare l'Opzione 2 (caricamento del file XML esportato da WordPress).`;
        }
      } finally {
        startWpFetchBtn.disabled = false;
        startWpFetchBtn.textContent = 'Avvia Importazione Automatica';
      }
    });
  }

  // ------------------------------------------------------------------------
  // FILE IMPORTER (XML WXR & JSON)
  // ------------------------------------------------------------------------
  const fileImportStatus = document.getElementById('fileImportStatus');

  if (startJsonImportBtn && jsonImportFileInput) {
    startJsonImportBtn.addEventListener('click', () => {
      const file = jsonImportFileInput.files[0];
      if (!file) {
        showToast('Seleziona prima un file XML o JSON da caricare', 'error');
        return;
      }

      if (fileImportStatus) {
        fileImportStatus.style.display = 'block';
        fileImportStatus.style.color = '#3b82f6';
        fileImportStatus.textContent = 'Lettura ed elaborazione del file in corso...';
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileContent = e.target.result;
          let parsedArticles = [];

          if (file.name.endsWith('.xml') || fileContent.trim().startsWith('<?xml') || fileContent.includes('<rss')) {
            // Robust WordPress XML (WXR Export) Parser
            try {
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(fileContent, 'text/xml');
              const items = xmlDoc.getElementsByTagName('item');

              for (let i = 0; i < items.length; i++) {
                const item = items[i];

                const getTag = (name) => {
                  const nsEls = item.getElementsByTagNameNS('*', name);
                  if (nsEls && nsEls.length > 0 && nsEls[0].textContent) return nsEls[0].textContent;
                  const directEls = item.getElementsByTagName(name);
                  if (directEls && directEls.length > 0 && directEls[0].textContent) return directEls[0].textContent;
                  const wpEls = item.getElementsByTagName('wp:' + name);
                  if (wpEls && wpEls.length > 0 && wpEls[0].textContent) return wpEls[0].textContent;
                  const contentEls = item.getElementsByTagName('content:' + name);
                  if (contentEls && contentEls.length > 0 && contentEls[0].textContent) return contentEls[0].textContent;
                  const dcEls = item.getElementsByTagName('dc:' + name);
                  if (dcEls && dcEls.length > 0 && dcEls[0].textContent) return dcEls[0].textContent;
                  const excerptEls = item.getElementsByTagName('excerpt:' + name);
                  if (excerptEls && excerptEls.length > 0 && excerptEls[0].textContent) return excerptEls[0].textContent;
                  return '';
                };

                const postType = getTag('post_type') || 'post';
                const status = getTag('status') || 'publish';

                if (postType !== 'post' && postType !== '' && postType !== 'page') continue;
                if (status === 'trash' || status === 'inherit') continue;

                const title = getTag('title') || 'Articolo senza titolo';
                let content = getTag('encoded') || getTag('content') || '';
                let excerpt = getTag('excerpt') || '';
                const author = getTag('creator') || getTag('author') || 'Redazione';
                const pubDate = getTag('pubDate') || getTag('post_date') || new Date().toISOString();

                if (!excerpt && content) {
                  excerpt = content.replace(/<[^>]*>?/gm, '').substring(0, 180).trim() + '...';
                } else {
                  excerpt = excerpt.replace(/<[^>]*>?/gm, '').trim();
                }

                let image = '';
                const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
                if (imgMatch) image = imgMatch[1];
                if (!image) {
                  image = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
                }

                let category = 'News';
                const catEls = item.querySelectorAll('category');
                catEls.forEach(c => {
                  const domain = c.getAttribute('domain');
                  const cName = c.textContent.trim();
                  if (!cName) return;
                  if (domain === 'category' || !domain) {
                    const lower = cName.toLowerCase();
                    if (lower.includes('film') || lower.includes('cinema')) category = 'Film';
                    else if (lower.includes('serie') || lower.includes('tv')) category = 'Serie TV';
                    else if (lower.includes('approfondiment')) category = 'Approfondimenti';
                    else if (lower.includes('intervist')) category = 'Interviste';
                    else if (category === 'News') category = cName;
                  }
                });

                parsedArticles.push({
                  id: 'wp-xml-' + i + '-' + Date.now(),
                  title: title.trim(),
                  category: category,
                  image: image,
                  excerpt: excerpt,
                  content: content,
                  author: author,
                  createdAt: new Date(pubDate).toString() !== 'Invalid Date' ? new Date(pubDate).toISOString() : new Date().toISOString(),
                  readTime: '3 min'
                });
              }
            } catch (domErr) {
              console.warn('DOMParser failed, trying Regex XML parser:', domErr);
            }

            // Fallback Regex Parser if DOMParser returned 0 items
            if (parsedArticles.length === 0) {
              const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
              let match;
              let regIdx = 0;
              while ((match = itemRegex.exec(fileContent)) !== null) {
                const itemStr = match[1];
                const getRegexTag = (tag) => {
                  const reg = new RegExp(`<(${tag}|[a-z0-9_-]+:${tag})[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/\\1>`, 'i');
                  const m = itemStr.match(reg);
                  if (m) return (m[2] !== undefined ? m[2] : m[3] || '').trim();
                  return '';
                };

                const postType = getRegexTag('post_type') || 'post';
                if (postType !== 'post' && postType !== 'page' && postType !== '') continue;

                const title = getRegexTag('title') || 'Articolo';
                const content = getRegexTag('encoded') || getRegexTag('content') || '';
                let excerpt = getRegexTag('excerpt') || content.replace(/<[^>]*>?/gm, '').substring(0, 180) + '...';
                const author = getRegexTag('creator') || 'Redazione';
                const pubDate = getRegexTag('pubDate') || new Date().toISOString();

                let image = '';
                const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
                if (imgMatch) image = imgMatch[1];
                if (!image) {
                  image = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
                }

                parsedArticles.push({
                  id: 'wp-xml-reg-' + regIdx + '-' + Date.now(),
                  title: title.trim(),
                  category: 'News',
                  image: image,
                  excerpt: excerpt,
                  content: content,
                  author: author,
                  createdAt: pubDate,
                  readTime: '3 min'
                });
                regIdx++;
              }
            }

          } else {
            // Parse JSON file
            const data = JSON.parse(fileContent);
            parsedArticles = Array.isArray(data) ? data : (data.articles || data.posts || []);
          }

          if (!parsedArticles || parsedArticles.length === 0) {
            throw new Error('Nessun articolo valido trovato nel file caricato. Assicurati che sia un file XML esportato da WordPress.');
          }

          const count = await window.baas.bulkImportArticles(parsedArticles, true);
          showToast(`Importati con successo ${count} articoli dal file!`);
      if (fileImportStatus) {
        fileImportStatus.style.color = '#10b981';
        fileImportStatus.textContent = `Importazione completata! ${count} articoli aggiunti dal file.`;
      }
      jsonImportFileInput.value = '';

    } catch (err) {
      console.error('Errore lettura file:', err);
      showToast('Errore nel file: ' + err.message, 'error');
      if (fileImportStatus) {
        fileImportStatus.style.color = '#ef4444';
        fileImportStatus.textContent = `Errore: ${err.message}`;
      }
    }
      };
      reader.readAsText(file);
    });
  }

window.initWYSIWYGMediaController = function() {
  const editor = document.getElementById('artContent');
  if (!editor) return;

  let toolbar = document.getElementById('wysiwygMediaToolbar');
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.id = 'wysiwygMediaToolbar';
    toolbar.style.cssText = `
      position: absolute;
      z-index: 99999;
      display: none;
      background: #0f172a;
      border: 1px solid rgba(249, 115, 22, 0.6);
      border-radius: 10px;
      padding: 0.35rem 0.65rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
      align-items: center;
      gap: 0.4rem;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      user-select: none;
    `;
    document.body.appendChild(toolbar);
  }

  let resizeHandle = document.getElementById('wysiwygMediaResizeHandle');
  if (!resizeHandle) {
    resizeHandle = document.createElement('div');
    resizeHandle.id = 'wysiwygMediaResizeHandle';
    resizeHandle.title = 'Trascina con il mouse per ridimensionare a mano (Foto e Video YouTube)';
    resizeHandle.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v6h-6"></path><path d="M21 3l-9 9"></path><path d="M3 21l9-9"></path></svg>`;
    resizeHandle.style.cssText = `
      position: absolute;
      z-index: 99999;
      display: none;
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #f97316, #C85A32);
      border: 2px solid #ffffff;
      border-radius: 50%;
      cursor: nwse-resize;
      box-shadow: 0 4px 14px rgba(0,0,0,0.6);
      align-items: center;
      justify-content: center;
      user-select: none;
      transition: transform 0.15s ease;
    `;
    document.body.appendChild(resizeHandle);
  }

  let selectedMedia = null;

  function updateToolbarPosition() {
    if (!selectedMedia || !document.body.contains(selectedMedia)) {
      hideControls();
      return;
    }

    const rect = selectedMedia.getBoundingClientRect();
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    toolbar.style.display = 'flex';
    toolbar.style.top = Math.max(10, rect.top + scrollY - 46) + 'px';
    toolbar.style.left = Math.max(10, rect.left + scrollX + (rect.width / 2) - (toolbar.offsetWidth / 2)) + 'px';

    resizeHandle.style.display = 'flex';
    resizeHandle.style.top = (rect.bottom + scrollY - 14) + 'px';
    resizeHandle.style.left = (rect.right + scrollX - 14) + 'px';

    if (selectedMedia.dataset.mediaHighlighted !== 'true') {
      selectedMedia.style.outline = '3px solid #f97316';
      selectedMedia.style.outlineOffset = '4px';
      selectedMedia.style.borderRadius = '12px';
      selectedMedia.dataset.mediaHighlighted = 'true';
    }
  }

  function hideControls() {
    if (selectedMedia) {
      selectedMedia.style.outline = '';
      selectedMedia.style.outlineOffset = '';
      delete selectedMedia.dataset.mediaHighlighted;
    }
    selectedMedia = null;
    if (toolbar) toolbar.style.display = 'none';
    if (resizeHandle) resizeHandle.style.display = 'none';
  }

  function renderToolbarButtons() {
    if (!toolbar) return;
    toolbar.innerHTML = `
      <span style="font-size: 0.68rem; font-weight: 800; color: #f97316; text-transform: uppercase; margin-right: 0.15rem; white-space: nowrap;">Ridimensiona:</span>
      <button type="button" class="media-size-btn" data-size="25%" style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); color: #fff; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700; cursor: pointer;">25%</button>
      <button type="button" class="media-size-btn" data-size="50%" style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); color: #fff; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700; cursor: pointer;">50%</button>
      <button type="button" class="media-size-btn" data-size="75%" style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); color: #fff; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700; cursor: pointer;">75%</button>
      <button type="button" class="media-size-btn" data-size="100%" style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); color: #fff; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.72rem; font-weight: 700; cursor: pointer;">100%</button>
      
      <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.25); margin: 0 0.25rem;"></div>

      <button type="button" id="mediaDeleteBtn" title="Elimina Foto/Video dall'articolo" style="background: rgba(225, 29, 72, 0.95); border: none; color: #fff; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.72rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; box-shadow: 0 2px 8px rgba(225,29,72,0.4);">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        <span>Rimuovi</span>
      </button>
    `;

    toolbar.querySelectorAll('.media-size-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!selectedMedia) return;
        const size = btn.getAttribute('data-size');
        applyMediaWidth(selectedMedia, size);
        updateToolbarPosition();
        if (window.renderLiveTextPreview) window.renderLiveTextPreview();
      });
    });

    const delBtn = toolbar.querySelector('#mediaDeleteBtn');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (selectedMedia) {
          selectedMedia.remove();
          hideControls();
          if (window.renderLiveTextPreview) window.renderLiveTextPreview();
          if (window.showToast) window.showToast('Elemento multimediale rimosso.', 'info');
        }
      });
    }
  }

  function applyMediaWidth(el, widthVal) {
    if (!el) return;

    if (el.classList.contains('video-container') || el.tagName === 'IFRAME') {
      const container = el.classList.contains('video-container') ? el : (el.closest('.video-container') || el);
      container.style.width = widthVal;
      container.style.maxWidth = '100%';
      container.style.margin = '1.5rem auto';
      if (typeof widthVal === 'string' && widthVal.endsWith('px')) {
        const pxNum = parseInt(widthVal);
        container.style.height = Math.round(pxNum * 0.5625) + 'px';
        container.style.paddingBottom = '0';
      } else {
        container.style.height = '0';
        container.style.paddingBottom = '56.25%';
      }
      return;
    }

    const figureOrImg = el.tagName === 'IMG' ? (el.closest('figure') || el) : el;
    figureOrImg.style.width = widthVal;
    figureOrImg.style.maxWidth = '100%';
    figureOrImg.style.margin = '1.5rem auto';
    figureOrImg.style.display = 'block';

    const img = figureOrImg.tagName === 'IMG' ? figureOrImg : figureOrImg.querySelector('img');
    if (img) {
      img.style.width = '100%';
      img.style.height = 'auto';
    }
  }

  renderToolbarButtons();

  editor.addEventListener('click', (e) => {
    const target = e.target.closest('img, figure, .video-container, iframe');
    if (target && editor.contains(target)) {
      if (selectedMedia && selectedMedia !== target) {
        selectedMedia.style.outline = '';
        selectedMedia.style.outlineOffset = '';
        delete selectedMedia.dataset.mediaHighlighted;
      }
      selectedMedia = target;
      updateToolbarPosition();
    } else {
      hideControls();
    }
  });

  document.addEventListener('click', (e) => {
    if (editor && !editor.contains(e.target) && toolbar && !toolbar.contains(e.target) && resizeHandle && !resizeHandle.contains(e.target)) {
      hideControls();
    }
  });

  window.addEventListener('scroll', updateToolbarPosition, { passive: true });
  window.addEventListener('resize', updateToolbarPosition, { passive: true });
  editor.addEventListener('scroll', updateToolbarPosition, { passive: true });

  let isDragging = false;
  let startX = 0;
  let startWidth = 0;

  resizeHandle.addEventListener('mousedown', (e) => {
    if (!selectedMedia) return;
    e.preventDefault();
    e.stopPropagation();

    isDragging = true;
    startX = e.clientX;
    startWidth = selectedMedia.offsetWidth;
    document.body.style.cursor = 'nwse-resize';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !selectedMedia) return;

    const dx = e.clientX - startX;
    const editorWidth = editor.clientWidth - 40;
    const newWidth = Math.max(120, Math.min(editorWidth, startWidth + dx));

    applyMediaWidth(selectedMedia, newWidth + 'px');
    updateToolbarPosition();
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.cursor = '';
      if (window.renderLiveTextPreview) window.renderLiveTextPreview();
    }
  });

  // Gestore per uscire dai blocchi di codice (<pre>) premendo Invio due volte
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      let node = range.startContainer;
      
      // Risali fino a trovare l'elemento PRE
      let preElement = null;
      while (node && node !== editor) {
        if (node.nodeName === 'PRE') {
          preElement = node;
          break;
        }
        node = node.parentNode;
      }
      
      if (preElement) {
        // Verifica se il cursore è alla fine del blocco di codice
        const isAtEnd = (el, r) => {
          const tempRange = document.createRange();
          tempRange.selectNodeContents(el);
          tempRange.setStart(r.endContainer, r.endOffset);
          return tempRange.toString().trim() === '';
        };
        
        if (isAtEnd(preElement, range)) {
          const text = preElement.textContent;
          // Se la riga corrente è vuota (es. termina con \n), usciamo dal blocco codice
          if (text.endsWith('\n') || text.trim() === '' || text.endsWith('\n\n')) {
            e.preventDefault();
            
            // Rimuovi l'ultimo newline all'interno del codice per non lasciare righe bianche pendenti
            const code = preElement.querySelector('code') || preElement;
            let lastTextNode = null;
            const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT, null, false);
            while (walker.nextNode()) {
              lastTextNode = walker.currentNode;
            }
            if (lastTextNode && lastTextNode.nodeValue.endsWith('\n')) {
              lastTextNode.nodeValue = lastTextNode.nodeValue.slice(0, -1);
            }
            
            // Crea un nuovo paragrafo inseribile sotto il blocco PRE
            const p = document.createElement('p');
            p.style.textAlign = 'left';
            p.innerHTML = '<br>';
            preElement.parentNode.insertBefore(p, preElement.nextSibling);
            
            // Posiziona il cursore all'inizio del nuovo paragrafo
            const newRange = document.createRange();
            newRange.setStart(p, 0);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
            
            p.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            if (window.renderLiveTextPreview) window.renderLiveTextPreview();
            return;
          }
        }
      }
    }
  });

  // Gestore click sul contenitore dell'editor per evitare che il cursore rimanga bloccato se l'ultimo elemento è speciale (es. PRE, TABLE, ecc.)
  editor.addEventListener('click', (e) => {
    if (e.target === editor) {
      const lastChild = editor.lastChild;
      if (lastChild) {
        // Se l'ultimo elemento è bloccante o speciale
        if (
          lastChild.nodeName === 'PRE' || 
          lastChild.nodeName === 'BLOCKQUOTE' || 
          lastChild.nodeName === 'TABLE' || 
          lastChild.nodeName === 'FIGURE' || 
          lastChild.nodeName === 'IMG' || 
          lastChild.nodeName === 'IFRAME' || 
          lastChild.classList.contains('media-element-wrapper') || 
          lastChild.classList.contains('video-container')
        ) {
          const p = document.createElement('p');
          p.style.textAlign = 'left';
          p.innerHTML = '<br>';
          editor.appendChild(p);
          
          const sel = window.getSelection();
          const range = document.createRange();
          range.setStart(p, 0);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          p.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          if (window.renderLiveTextPreview) window.renderLiveTextPreview();
        }
      }
    }
  });
};

  window.baas.subscribe((articles) => {
    renderAdminTable(articles);
  });

  checkAuth();
  window.initWYSIWYGMediaController();
});
