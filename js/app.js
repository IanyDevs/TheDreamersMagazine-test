/* ==========================================================================
   THE DREAMERS MAGAZINE - JAVASCRIPT APPLICATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Current State
  let activeCategory = document.body.getAttribute('data-page-category') || 'Tutti';
  let searchQuery = '';
  let currentPage = 1;
  const itemsPerPage = 6;

  // DOM Elements
  const articlesGrid = document.getElementById('articlesGrid');
  const paginationWrapper = document.getElementById('paginationWrapper');
  const searchInput = document.getElementById('searchInput');
  const currentCategoryHeading = document.getElementById('currentCategoryHeading');
  const filterPills = document.querySelectorAll('.filter-pill');
  const viewAllBtn = document.getElementById('viewAllBtn');

  // Modal Elements
  const articleModal = document.getElementById('articleModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalHeroImg = document.getElementById('modalHeroImg');
  const modalCategoryBadge = document.getElementById('modalCategoryBadge');
  const modalTitle = document.getElementById('modalTitle');
  const modalAuthorAvatar = document.getElementById('modalAuthorAvatar');
  const modalAuthorName = document.getElementById('modalAuthorName');
  const modalDate = document.getElementById('modalDate');
  const modalTextContent = document.getElementById('modalTextContent');

  // Navigation Mobile Elements
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const menuCloseBtn = document.getElementById('menuCloseBtn');
  const primaryNavMenu = document.getElementById('primaryNavMenu');

  // Contact Form Elements
  const contactForm = document.getElementById('contactForm');
  const formStatusMsg = document.getElementById('formStatusMsg');

  // Cookie Banner Elements
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAcceptBtn = document.getElementById('cookieAcceptBtn');
  const cookieDenyBtn = document.getElementById('cookieDenyBtn');
  const cookieSaveBtn = document.getElementById('cookieSaveBtn');
  const cookieCloseBtn = document.getElementById('cookieCloseBtn');

  // Dynamic Storage Articles
  let articles = [];

  function loadArticlesFromStore() {
    if (window.baas && typeof window.baas.getArticles === 'function') {
      articles = window.baas.getArticles() || [];
    } else {
      articles = [];
    }
  }

  function calculateReadingTime(htmlContent) {
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent || '';
    const text = temp.textContent || temp.innerText || '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const mins = Math.max(1, Math.ceil(words / 180));
    return `${mins} min di lettura`;
  }

  // Dynamic articles team data (declared here so renderArticles can access it)
  let teamMembersData;

  // ------------------------------------------------------------------------
  // 2. Render Articles Function (with Pagination support)
  // ------------------------------------------------------------------------
  function renderArticles() {
    if (!articlesGrid) return;

    articlesGrid.innerHTML = '';

    const filtered = articles.filter(article => {
      // Le bozze (draft) sono visibili esclusivamente nel Pannello Admin
      if (article.status && article.status === 'draft') return false;

      const artCat = (article.category || 'News').toLowerCase().trim();
      const pageCat = activeCategory.toLowerCase().trim();
      
      let matchCat = (pageCat === 'tutti') || (artCat === pageCat);

      if (!matchCat) {
        if ((pageCat.includes('film') || pageCat.includes('cinema')) && (artCat.includes('film') || artCat.includes('cinema') || artCat.includes('recension'))) {
          matchCat = true;
        } else if ((pageCat.includes('serie') || pageCat.includes('tv')) && (artCat.includes('serie') || artCat.includes('tv') || artCat.includes('show'))) {
          matchCat = true;
        } else if (pageCat.includes('news') && (artCat.includes('news') || artCat.includes('notiz') || artCat.includes('attual'))) {
          matchCat = true;
        } else if (pageCat.includes('approfondiment') && (artCat.includes('approfondiment') || artCat.includes('rubrica') || artCat.includes('saggio'))) {
          matchCat = true;
        }
      }

      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (
        (article.title && article.title.toLowerCase().includes(q)) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(q)) ||
        (article.author && article.author.toLowerCase().includes(q)) ||
        artCat.includes(q)
      );

      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      articlesGrid.innerHTML = `
        <li style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem; color: var(--text-secondary); background: #FFFFFF; border-radius: 24px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); margin: 1rem 0;">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">📰</div>
          <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.35rem;">Nessun articolo presente</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted); max-width: 480px; margin: 0 auto 1.25rem auto;">Utilizza il pannello di controllo Admin per importare tutti gli articoli del tuo vecchio sito WordPress.</p>
          <a href="admin.html" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.4rem; font-size: 0.88rem; border-radius: 9999px;">
            <span>Apri Pannello Admin</span>
          </a>
        </li>
      `;
      if (paginationWrapper) paginationWrapper.innerHTML = '';
      return;
    }

    // Determine if pagination applies or home page limit applies
    const isPaginatedPage = Boolean(paginationWrapper);
    const isHomePage = document.body.classList.contains('home-body');
    let paginatedArticles = filtered;

    if (isHomePage) {
      paginatedArticles = filtered.slice(0, 12);
    } else if (isPaginatedPage) {
      const totalPages = Math.ceil(filtered.length / itemsPerPage);
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      const startIndex = (currentPage - 1) * itemsPerPage;
      paginatedArticles = filtered.slice(startIndex, startIndex + itemsPerPage);

      renderPagination(totalPages);
    }

    paginatedArticles.forEach(article => {
      const li = document.createElement('li');
      li.className = 'article-card-item';
      
      // Risolvi immagine autore per la card
      let authorImg = '';
      if (article.author) {
        const artAuthLower = article.author.toLowerCase().trim();
        if (artAuthLower === 'redazione') {
          authorImg = 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-cropped-ext-custom-logo-1775128647772-192x192.webp';
        } else {
          const matchedKey = Object.keys(teamMembersData).find(key => {
            const member = teamMembersData[key];
            const memberNameLower = member.name.toLowerCase().trim();
            return artAuthLower.includes(key.toLowerCase().trim()) || 
                   artAuthLower.includes(memberNameLower) || 
                   memberNameLower.includes(artAuthLower);
          });
          if (matchedKey && teamMembersData[matchedKey].image) {
            authorImg = teamMembersData[matchedKey].image;
          } else {
            authorImg = 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-cropped-ext-custom-logo-1775128647772-192x192.webp';
          }
        }
      } else {
        authorImg = 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-cropped-ext-custom-logo-1775128647772-192x192.webp';
      }

      const avatarHtml = `<img src="${authorImg}" alt="${article.author || 'Redazione'}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;">`;

      li.innerHTML = `
        <article class="article-card">
          <div class="card-img-wrapper">
            <div class="card-img-overlay"></div>
            <img src="${article.image}" alt="${article.title}" class="card-img" loading="lazy">
            <span class="card-img-badge">${article.category || 'News'}</span>
          </div>
          <div class="card-content">
            <span class="card-category">${article.category || 'News'}</span>
            <h2 class="card-title">${article.title}</h2>
            <p class="card-excerpt">${article.excerpt || ''}</p>
            <div class="card-footer-meta">
              <div class="card-author-info">
                <div class="card-author-avatar-initials" style="overflow: hidden; padding: 0;">${avatarHtml}</div>
                <span class="card-author-name author-name" style="color: var(--brand-accent) !important;">${article.author || 'Redazione'}</span>
              </div>
              <div class="card-read-action">
                <span class="card-read-more">Leggi</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </article>
      `;

      li.addEventListener('click', () => openArticleModal(article));
      articlesGrid.appendChild(li);
    });
  }


  // ------------------------------------------------------------------------
  // Render Pagination Bar Controls
  // ------------------------------------------------------------------------
  function renderPagination(totalPages) {
    if (!paginationWrapper) return;
    if (totalPages <= 1) {
      paginationWrapper.innerHTML = '';
      return;
    }

    // Smart window: show at most 5 page numbers around current page
    const delta = 2;
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    let navHtml = `
      <div class="pagination-container">
        <div class="pagination-info">
          Pagina <strong>${currentPage}</strong> di <strong>${totalPages}</strong>
        </div>
        <div class="pagination-controls">
    `;

    // Prev button
    navHtml += `
      <button class="page-btn nav-arrow prev-btn" ${currentPage === 1 ? 'disabled' : ''} aria-label="Pagina precedente">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
    `;

    // First page
    navHtml += `<button class="page-btn num-btn ${currentPage === 1 ? 'active' : ''}" data-page="1">1</button>`;

    // Left ellipsis
    if (rangeStart > 2) {
      navHtml += `<span class="page-ellipsis">…</span>`;
    }

    // Middle pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      navHtml += `<button class="page-btn num-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    // Right ellipsis
    if (rangeEnd < totalPages - 1) {
      navHtml += `<span class="page-ellipsis">…</span>`;
    }

    // Last page
    if (totalPages > 1) {
      navHtml += `<button class="page-btn num-btn ${currentPage === totalPages ? 'active' : ''}" data-page="${totalPages}">${totalPages}</button>`;
    }

    // Next button
    navHtml += `
      <button class="page-btn nav-arrow next-btn" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Pagina successiva">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    `;

    navHtml += `</div></div>`;
    paginationWrapper.innerHTML = navHtml;

    // Attach Event Handlers
    paginationWrapper.querySelectorAll('.num-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.getAttribute('data-page'), 10);
        renderArticles();
        scrollToBlogSection();
      });
    });

    const prevBtn = paginationWrapper.querySelector('.prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderArticles();
          scrollToBlogSection();
        }
      });
    }

    const nextBtn = paginationWrapper.querySelector('.next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderArticles();
          scrollToBlogSection();
        }
      });
    }
  }

  function scrollToBlogSection() {
    const blogSec = document.getElementById('blog');
    if (blogSec) {
      blogSec.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ------------------------------------------------------------------------
  // 3. Filter & Search Handlers
  // ------------------------------------------------------------------------
  function setCategory(catName) {
    activeCategory = catName;
    currentPage = 1; // Reset to page 1 on category change
    if (currentCategoryHeading) {
      currentCategoryHeading.textContent = catName === 'Tutti' ? 'Cinema' : catName;
    }
    
    // Update Pills active state if present
    filterPills.forEach(pill => {
      if (pill.getAttribute('data-cat') === catName) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    renderArticles();
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      currentPage = 1;
      renderArticles();
    });
  }

  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      if (window.location.pathname.indexOf('tutti-gli-articoli.html') === -1) {
        window.location.href = 'tutti-gli-articoli.html';
      } else {
        setCategory('Tutti');
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        renderArticles();
      }
    });
  }

  // ------------------------------------------------------------------------
  // 4. Modal Article Reader
  // ------------------------------------------------------------------------

  /**
   * Restituisce il colore originale se il contrasto con lo sfondo target è
   * sufficiente (ratio >= minRatio), altrimenti restituisce il fallback.
   * @param {string} hexColor  - colore dell'articolo (es. '#FFFFFF')
   * @param {'white'|'dark'} bg - tipo di sfondo del contenitore
   * @param {string} fallback  - colore da usare se il contrasto è scarso
   */
  function getReadableColor(hexColor, bg, fallback) {
    if (!hexColor || typeof hexColor !== 'string') return fallback;
    // Normalizza hex: #rgb -> #rrggbb
    let hex = hexColor.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length !== 6) return fallback;
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    // Luminanza relativa (WCAG)
    const toLinear = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const L = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    // Contrasto con bianco (L=1) o con nero-scuro dell'hero (L≈0.002)
    const bgL = bg === 'white' ? 1 : 0.002;
    const contrast = (Math.max(L, bgL) + 0.05) / (Math.min(L, bgL) + 0.05);
    return contrast >= 3.5 ? hexColor : fallback;
  }

  function openArticleModal(idOrArticle) {
    if (!articleModal) return;

    let article = null;
    if (typeof idOrArticle === 'object' && idOrArticle !== null) {
      article = idOrArticle;
    } else {
      article = articles.find(a => String(a.id) === String(idOrArticle));
    }

    if (!article) return;

    if (modalHeroImg) {
      modalHeroImg.src = article.image || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
      modalHeroImg.alt = article.title || 'Copertina';
    }
    if (modalCategoryBadge) modalCategoryBadge.textContent = article.category || 'News';
    if (modalTitle) {
      modalTitle.textContent = article.title || '';
      // L'hero ha sfondo scuro: il titolo deve avere buon contrasto con il nero
      if (article.titleColor) {
        modalTitle.style.color = getReadableColor(article.titleColor, 'dark', '#FFFFFF');
      } else {
        modalTitle.style.color = '#FFFFFF';
      }
      if (article.fontFamily) modalTitle.style.fontFamily = article.fontFamily + ', sans-serif';
    }

    let authorKey = null;
    let isRedazione = false;
    if (article.author) {
      const artAuthLower = article.author.toLowerCase().trim();
      if (artAuthLower === 'redazione') {
        isRedazione = true;
      } else {
        const matchedKey = Object.keys(teamMembersData).find(key => {
          const member = teamMembersData[key];
          const memberNameLower = member.name.toLowerCase().trim();
          return artAuthLower.includes(key.toLowerCase().trim()) || 
                 artAuthLower.includes(memberNameLower) || 
                 memberNameLower.includes(artAuthLower);
        });
        if (matchedKey) {
          authorKey = matchedKey;
        } else {
          isRedazione = true;
        }
      }
    } else {
      isRedazione = true;
    }
    
    let memberData;
    if (isRedazione) {
      memberData = {
        name: 'Redazione',
        initials: 'R',
        image: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-cropped-ext-custom-logo-1775128647772-192x192.webp',
        role: 'Redazione',
        bio: 'The Dreamers Magazine è una testata editoriale indipendente dedicata alle ultime novità, recensioni e approfondimenti critici sul mondo del cinema e della serialità televisiva.',
        socials: []
      };
    } else {
      memberData = teamMembersData[authorKey] || { initials: 'FP', role: 'Redattore', name: 'Francesco Pisapia' };
    }

    const initialsEl = document.getElementById('modalAuthorInitials');
    if (initialsEl) {
      if (memberData.image) {
        initialsEl.innerHTML = `<img src="${memberData.image}" alt="${memberData.name}">`;
      } else {
        initialsEl.textContent = memberData.initials || 'FP';
      }
    }

    if (modalAuthorName) modalAuthorName.textContent = article.author || 'Redazione';

    const authorRoleEl = document.getElementById('modalAuthorRole');
    if (authorRoleEl) authorRoleEl.textContent = memberData.role || 'Redattore';

    if (modalDate) {
      const rawDate = article.createdAt || article.date;
      if (rawDate) {
        try {
          const d = new Date(rawDate);
          modalDate.textContent = isNaN(d.getTime()) ? rawDate : d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {
          modalDate.textContent = rawDate;
        }
      } else {
        modalDate.textContent = 'Oggi';
      }
    }

    if (modalTextContent) {
      modalTextContent.innerHTML = article.content || article.fullContent || article.excerpt || '';
      // Il corpo dell'articolo è su sfondo bianco: forza sempre un colore leggibile
      if (article.textColor) {
        modalTextContent.style.color = getReadableColor(article.textColor, 'white', '#231F1D');
      } else {
        modalTextContent.style.color = '#231F1D';
      }
      if (article.fontFamily) modalTextContent.style.fontFamily = article.fontFamily + ', sans-serif';
    }

    let writtenByText = document.getElementById('modalFooterWrittenByText');
    if (!writtenByText) {
      const footer = articleModal.querySelector('.modal-article-footer');
      if (footer) {
        writtenByText = document.createElement('span');
        writtenByText.id = 'modalFooterWrittenByText';
        writtenByText.className = 'modal-footer-written-by-clean';
        const closeBtn = document.getElementById('modalFooterCloseAction');
        footer.insertBefore(writtenByText, closeBtn);
      }
    }
    if (writtenByText) {
      const avatarHtml = memberData.image 
        ? `<img src="${memberData.image}" class="modal-footer-author-pill-img" alt="${memberData.name}">`
        : `<div class="modal-footer-author-pill-img" style="background:#7a2812; color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; border: 1.5px solid #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">${memberData.initials || 'R'}</div>`;

      writtenByText.innerHTML = `
        <div class="modal-footer-author-pill">
          ${avatarHtml}
          <span class="modal-footer-author-pill-text">Articolo di <strong>${article.author || 'Redazione'}</strong></span>
        </div>
      `;
    }

    const footerAvatar = document.getElementById('modalFooterAvatar');
    if (footerAvatar) {
      if (memberData.image) {
        footerAvatar.innerHTML = `<img src="${memberData.image}" alt="${memberData.name}">`;
      } else {
        footerAvatar.textContent = memberData.initials || 'FP';
      }
    }

    const footerAuthorName = document.getElementById('modalFooterAuthorName');
    if (footerAuthorName) footerAuthorName.textContent = article.author;

    // Connect Author Card & Footer Signature to open Team Member Profile Modal
    const authorCard = articleModal.querySelector('.modal-author-card');
    if (authorCard) {
      if (isRedazione) {
        authorCard.title = '';
        authorCard.onclick = null;
        authorCard.style.cursor = 'default';
      } else {
        authorCard.style.cursor = 'pointer';
        authorCard.title = `Vedi il profilo completo di ${article.author}`;
        authorCard.onclick = () => {
          closeArticleModal();
          setTimeout(() => {
            openTeamMemberModal(authorKey);
          }, 150);
        };
      }
    }

    const footerAuthorBox = articleModal.querySelector('.modal-footer-author-box');
    if (footerAuthorBox) {
      if (isRedazione) {
        footerAuthorBox.title = '';
        footerAuthorBox.onclick = null;
        footerAuthorBox.style.cursor = 'default';
      } else {
        footerAuthorBox.style.cursor = 'pointer';
        footerAuthorBox.title = `Vedi il profilo completo di ${article.author}`;
        footerAuthorBox.onclick = () => {
          closeArticleModal();
          setTimeout(() => {
            openTeamMemberModal(authorKey);
          }, 150);
        };
      }
    }

    const footerClose = document.getElementById('modalFooterCloseAction');
    if (footerClose) {
      footerClose.onclick = closeArticleModal;
    }

    // Gestione frecce di navigazione tra articoli consecutivi
    const currentIndex = articles.findIndex(a => String(a.id) === String(article.id));
    let prevBtn = document.getElementById('modalPrevArticleBtn');
    let nextBtn = document.getElementById('modalNextArticleBtn');

    if (!prevBtn && articleModal) {
      prevBtn = document.createElement('button');
      prevBtn.id = 'modalPrevArticleBtn';
      prevBtn.className = 'modal-nav-btn prev-btn';
      prevBtn.title = 'Articolo precedente';
      prevBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
      articleModal.appendChild(prevBtn);
    }

    if (!nextBtn && articleModal) {
      nextBtn = document.createElement('button');
      nextBtn.id = 'modalNextArticleBtn';
      nextBtn.className = 'modal-nav-btn next-btn';
      nextBtn.title = 'Articolo successivo';
      nextBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
      articleModal.appendChild(nextBtn);
    }

    if (prevBtn) {
      if (currentIndex > 0) {
        prevBtn.style.display = 'flex';
        prevBtn.onclick = (e) => {
          e.stopPropagation();
          openArticleModal(articles[currentIndex - 1]);
        };
      } else {
        prevBtn.style.display = 'none';
      }
    }

    if (nextBtn) {
      if (currentIndex > -1 && currentIndex < articles.length - 1) {
        nextBtn.style.display = 'flex';
        nextBtn.onclick = (e) => {
          e.stopPropagation();
          openArticleModal(articles[currentIndex + 1]);
        };
      } else {
        nextBtn.style.display = 'none';
      }
    }

    if (typeof renderArticleComments === 'function') {
      renderArticleComments(article.id);
    }

    articleModal.classList.add('open');
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    
    // Reset scroll position to top
    const modalScrollBody = articleModal.querySelector('.modal-scroll-body');
    if (modalScrollBody) {
      modalScrollBody.scrollTop = 0;
    }
  }

  function closeArticleModal() {
    if (!articleModal) return;
    articleModal.classList.remove('open');
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeArticleModal);
  }

  if (articleModal) {
    articleModal.addEventListener('click', (e) => {
      if (e.target === articleModal) {
        closeArticleModal();
      }
    });
  }

  // Inject navigation button CSS styles dynamically
  const navStyles = document.createElement('style');
  navStyles.innerHTML = `
    .modal-nav-btn {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.85);
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 99999999;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.65);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .modal-nav-btn:hover {
      background: var(--brand-accent, #C85A32);
      border-color: var(--brand-accent, #C85A32);
      transform: translateY(-50%) scale(1.1);
      box-shadow: 0 12px 36px rgba(200, 90, 50, 0.5);
    }
    .modal-nav-btn.prev-btn {
      left: 2.5rem;
    }
    .modal-nav-btn.next-btn {
      right: 2.5rem;
    }
    .modal-nav-btn svg {
      width: 26px;
      height: 26px;
      stroke: currentColor;
    }
    @media (max-width: 1100px) {
      .modal-nav-btn.prev-btn { left: 1rem; }
      .modal-nav-btn.next-btn { right: 1rem; }
    }
    @media (max-width: 900px) {
      .modal-nav-btn {
        width: 44px;
        height: 44px;
      }
      .modal-nav-btn.prev-btn { left: 0.5rem; }
      .modal-nav-btn.next-btn { right: 0.5rem; }
      .modal-nav-btn svg { width: 22px; height: 22px; }
    }
    @media (max-width: 600px) {
      .modal-nav-btn {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(navStyles);

  document.addEventListener('keydown', (e) => {
    if (articleModal && articleModal.classList.contains('open')) {
      if (e.key === 'Escape') {
        closeArticleModal();
      } else if (e.key === 'ArrowLeft') {
        const prevBtn = document.getElementById('modalPrevArticleBtn');
        if (prevBtn && prevBtn.style.display !== 'none') {
          prevBtn.click();
        }
      } else if (e.key === 'ArrowRight') {
        const nextBtn = document.getElementById('modalNextArticleBtn');
        if (nextBtn && nextBtn.style.display !== 'none') {
          nextBtn.click();
        }
      }
    }
  });

  // ------------------------------------------------------------------------
  // 5. Mobile Navigation Menu Toggle & Enhancements
  // ------------------------------------------------------------------------
  function closeMobileMenu() {
    if (primaryNavMenu) {
      primaryNavMenu.classList.remove('open');
      if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('body-menu-open');
      document.body.classList.remove('body-menu-open');
    }
  }

  function openMobileMenu() {
    if (primaryNavMenu) {
      if (primaryNavMenu.parentNode !== document.body) {
        document.body.appendChild(primaryNavMenu);
      }
      primaryNavMenu.classList.add('open');
      if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('body-menu-open');
      document.body.classList.add('body-menu-open');
    }
  }

  if (menuToggleBtn && primaryNavMenu) {
    menuToggleBtn.addEventListener('click', () => {
      if (primaryNavMenu.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (menuCloseBtn && primaryNavMenu) {
    menuCloseBtn.addEventListener('click', closeMobileMenu);
  }

  // Auto-close menu when a navigation link is tapped
  if (primaryNavMenu) {
    const navLinks = primaryNavMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // Close menu on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && primaryNavMenu && primaryNavMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // ------------------------------------------------------------------------
  // 6. Contact Form Validation & Submit Simulation
  // ------------------------------------------------------------------------
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      if (!name || !email || !message) {
        if (formStatusMsg) {
          formStatusMsg.textContent = 'Per favore, compila tutti i campi obbligatori (*).';
          formStatusMsg.className = 'form-status-msg error';
        }
        return;
      }

      if (formStatusMsg) {
        formStatusMsg.textContent = 'Invio del messaggio in corso...';
        formStatusMsg.className = 'form-status-msg';
      }

      setTimeout(() => {
        if (formStatusMsg) {
          formStatusMsg.textContent = 'Grazie! Il tuo messaggio è stato inviato con successo.';
          formStatusMsg.className = 'form-status-msg success';
        }
        contactForm.reset();
      }, 1200);
    });
  }

  // ------------------------------------------------------------------------
  // 7. Cookie Consent Banner (GDPR LocalStorage)
  // ------------------------------------------------------------------------
  function initCookieBanner() {
    if (!cookieBanner) return;
    const consent = localStorage.getItem('dreamers_cookie_consent');
    if (consent) {
      cookieBanner.classList.add('hidden');
    }
  }

  function saveConsent(status) {
    if (!cookieBanner) return;
    localStorage.setItem('dreamers_cookie_consent', status);
    cookieBanner.classList.add('hidden');
  }

  if (cookieAcceptBtn) {
    cookieAcceptBtn.addEventListener('click', () => saveConsent('accepted'));
  }
  if (cookieDenyBtn) {
    cookieDenyBtn.addEventListener('click', () => saveConsent('denied'));
  }
  if (cookieSaveBtn) {
    cookieSaveBtn.addEventListener('click', () => saveConsent('custom'));
  }
  if (cookieCloseBtn) {
    cookieCloseBtn.addEventListener('click', () => cookieBanner.classList.add('hidden'));
  }

  // ------------------------------------------------------------------------
  // Scroll To Top Button Handler
  // ------------------------------------------------------------------------
  function initScrollToTop() {
    let scrollBtn = document.getElementById('scrollToTopBtn');
    if (!scrollBtn) {
      scrollBtn = document.createElement('button');
      scrollBtn.id = 'scrollToTopBtn';
      scrollBtn.className = 'scroll-to-top-btn';
      scrollBtn.setAttribute('aria-label', 'Torna in cima alla pagina');
      scrollBtn.title = 'Torna su';
      scrollBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      `;
      document.body.appendChild(scrollBtn);
    }

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.classList.remove('visible');
      }
    });

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ------------------------------------------------------------------------
  // Transparent Header on Scroll Handler
  // ------------------------------------------------------------------------
  function initHeaderScroll() {
    const siteHeader = document.querySelector('.site-header');
    const headerContainer = document.querySelector('.header-container');

    function handleScroll() {
      if (window.scrollY > 25) {
        siteHeader?.classList.add('scrolled');
        headerContainer?.classList.add('scrolled');
      } else {
        siteHeader?.classList.remove('scrolled');
        headerContainer?.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // ------------------------------------------------------------------------
  // Modal Reading Progress Bar Handler
  // ------------------------------------------------------------------------
  function setupModalReadingProgress() {
    if (!articleModal) return;
    const modalDialog = articleModal.querySelector('.modal-dialog');
    if (!modalDialog) return;

    let progressBar = modalDialog.querySelector('.modal-reading-progress-bar');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'modal-reading-progress-bar';
      modalDialog.prepend(progressBar);
    }

    progressBar.style.width = '0%';

    modalDialog.addEventListener('scroll', () => {
      const maxScroll = modalDialog.scrollHeight - modalDialog.clientHeight;
      if (maxScroll > 0) {
        const percent = (modalDialog.scrollTop / maxScroll) * 100;
        progressBar.style.width = Math.min(100, Math.max(0, percent)) + '%';
      }
    });
  }

  // ----------------------------------------------------------------
  teamMembersData = {
    'enzo-peluso': {
      name: 'Enzo Peluso',
      role: 'Co-Fondatore-ViceDirettore & Redattore',
      initials: 'EP',
      badge: 'Fondatore',
      bio: '27 anni, la mia passione inizia da bambino grazie al Giffoni Film Festival. Giro i più importanti festival europei con l’obiettivo di avvicinare quante più persone al cinema.',
      image: 'assets/foto/enzo peluso.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '@enzopelusoo', url: 'https://www.instagram.com/enzopelusoo?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' },
        { name: 'TikTok', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>', handle: '@enzopelusoo', url: 'https://www.tiktok.com/@enzopelusoo' }
      ]
    },
    'francesco-pisapia': {
      name: 'Francesco Pisapia',
      role: 'Fondatore-Direttore & Caporedattore',
      initials: 'FP',
      badge: 'Redattore Capo',
      bio: 'Lavoro al sito con l’obiettivo di raccontare il cinema con passione, cura e attention. Ho fondato questo progetto per condividere il mio amore per il cinema e seguo con costanza i principali festival cinematografici italiani, senza perdermi le nuove uscite in sala e tutto ciò che accade nel panorama cinematografico.',
      image: 'assets/foto/Francesco Pisapia.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '@checcopisapia', url: 'https://www.instagram.com/checcopisapia?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' },
        { name: 'TikTok', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>', handle: '@checcopisapia', url: 'https://www.tiktok.com/@checcopisapia' }
      ]
    },
    'francesca-siciliano': {
      name: 'Francesca Siciliano',
      role: 'Redattrice',
      initials: 'FS',
      badge: 'Redazione',
      bio: '25 anni, laureata in DAMS. Da 4 anni partecipo ai principali festival cinematografici italiani e internazionali dove posso vivere la mia passione per il cinema a 360º. Scrivere per The Dreamers Magazine significa per me avere la possibilità di approfondire ogni giorno le mie conoscenze nel meraviglioso ambito dell’arte cinematografica.',
      image: 'assets/foto/Francesca Siciliano.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '@_francescasiciliano_', url: 'https://www.instagram.com/_francescasiciliano_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' }
      ]
    },
    'sarah-bonfanti': {
      name: 'Sarah Bonfanti',
      role: 'Redattrice',
      initials: 'SB',
      badge: 'Redazione',
      bio: '21 anni, laureata in Comunicazione, Media e Pubblicità. Passo il tempo a guardare film, parlarne e fare la professional fangirl. Scrivo per The Dreamers Magazine fin dagli inizi e ho un talento particolare per perdere la cognizione del tempo quando c\'è una news di cinema da inseguire.',
      image: 'assets/foto/Sarah Bonfanti.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '@sarah_bonfantii_', url: 'https://www.instagram.com/sarah_bonfantii_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' },
        { name: 'TikTok', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>', handle: '@sarah.bonfanti', url: 'https://www.tiktok.com/@sarah.bonfanti' }
      ]
    },
    'Benedetta De Martino': {
      name: 'Benedetta De Martino',
      role: 'Redattrice',
      initials: 'BdM',
      badge: 'Redazione',
      bio: 'Tra una colonna sonora indimenticabile e una sala cinematografica: è lì che mi trovate. Vivo di cinema e musica: amo raccontare le emozioni che nascono quando immagini e note si incontrano. Scrivo per condividere questa crescente passione.',
      image: 'assets/foto/Benedetta De Martino.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '@bbenniluu', url: 'https://www.instagram.com/bbenniluu?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' }
      ]
    },
    'Elena Curti': {
      name: 'Elena Curti',
      role: 'Redattrice' ,
      initials: 'EC',
      badge: 'Redazione',
      bio: 'Sono una ragazza sulla ventina che sogna il cinema, non quello d\'autore né quello mainstream ma il cinema che ti fa viaggiare con la fantasia, vivere nuove esperienze, senza troppe pretese. Mi piace viaggiare e conoscere nuove culture. Parlo inglese, coreano e un pochito di spagnolo.',
      image: 'assets/foto/Elena Curti.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '@eelecurti', url: 'https://www.instagram.com/eelecurti?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' }
      ]
    },
    'Valerio Padoan': {
      name: 'Valerio Padoan',
      role: 'Redattore',
      initials: 'VP',
      badge: 'Redazione',
      bio: 'Mi piace viaggiare con la fantasia ma sempre mantenendo i piedi per terra e uno sguardo sulla realtà. Studio cinema perché amo le storie e gli infiniti modi in cui possono essere rappresentate sul grande schermo. Scrivere per The Dreamers Magazine mi dà la possibilità di approfondire questo mondo.',
      image: 'assets/foto/Valerio Padoan.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '@valerio.padoan', url: 'https://www.instagram.com/valerio.padoan/?utm_source=ig_web_button_share_sheet' }
      ]
    },
    'Maria Carmela Fedele': {
      name: 'Maria Carmela Fedele',
      role: 'Redattrice',
      initials: 'MCF',
      badge: 'Redazione',
      bio: 'Studio musica, una passione che condivido con il cinema e che considero un linguaggio capace di raccontare emozioni e persone. Oltre a scrivere articoli, gestisco la pagina X (Twitter) del Magazine, seguendo e condividendo le ultime novità sul mondo del cinema.',
      image: 'assets/foto/Maria Carmela Fedele.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '@mar.lb0ro777', url: 'https://www.instagram.com/mar.lb0ro777?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' },
        { name: 'TikTok', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>', handle: '@mar.lb0ro777', url: 'https://www.tiktok.com/@mar.lb0ro777' }
      ]
    },
    'Giulia Zuccolo': {
      name: 'Giulia Zuccolo',
      role: 'Redattrice',
      initials: 'GZ',
      badge: 'Redazione',
      bio: 'Classe 2002, cresciuta tra videocassette e il genere horror, ho sviluppato fin da piccola una passione per il cinema. Anche se il mio percorso mi ha portato nel sociale, continuo a credere che il cinema sia uno dei modi più autentici e affascinanti per raccontare la propria storia: sullo schermo come nella vita, può lasciare il segno',
      image: 'assets/foto/Giulia Zuccolo.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '@itsgiuliaz', url: 'https://www.instagram.com/itsgiuliaz?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' },
        { name: 'TikTok', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>', handle: '@boludaenlavida', url: 'https://www.tiktok.com/@boludaenlavida' }
      ]
    },
    'Pietro Armenante': {
      name: 'Pietro Armenante',
      role: 'Collaboratore',
      initials: 'PA',
      badge: 'Redazione',
      bio: 'Vivo letteralmente di pane e cinema. La mia grande passione per il cinema mi ha sempre spinto a confrontarmi con chiunque condividesse questo amore per la settima arte. E quindi, eccomi qui.',
      image: 'assets/foto/Pietrro Armenante.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '@_pieeee__', url: 'https://www.instagram.com/_pieeee__?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' }
      ]
    },
    'Gaia Fabozzo': {
      name: 'Gaia Fabozzo',
      role: 'Collaboratrice',
      initials: 'GF',
      badge: 'Redazione',
      bio: '21 anni, amo il cinema perché è il mio rifugio, mi piace imparare da esso e immergermi in nuove vite e storie. Spero che qui possiate incuriosirvi e amare il cinema con me',
      image: 'assets/foto/Gaia Fabozzo.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '@gaiafabozzoo', url: 'https://www.instagram.com/gaiafabozzoo?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' },
        { name: 'TikTok', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>', handle: '@gaiafabozzo', url: 'https://www.tiktok.com/@gaiafabozzo' }
      ]
    },
    'Pierluigi Esposito': {
      name: 'Pierluigi Esposito',
      role: 'Collaboratore',
      initials: 'P',
      badge: 'Redazione',
      bio: '22 anni, reputo che il cinema e la musica siano importantissimi mezzi di comunicazione e forme d’arte che ci permettono di esprimere sentimenti complessi e sopravvivere. È per questo che parlarne è necessario.',
      image: 'assets/foto/Pierluigi Esposito.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '@pierluigiespositoo_', url: 'https://www.instagram.com/pierluigiespositoo_/?utm_source=ig_web_button_share_sheet' }
      ]
    },
    'Giulia Ricci': {
      name: 'Giulia Ricci',
      role: 'Collaboratrice',
      initials: 'GR',
      badge: 'Redazione',
      bio: 'Appassionata di cinema fin dall\'infanzia grazie alla passione trasmessa dai nonni. Ad oggi studentessa in Scienze della Comunicazione con il sogno di poter collaborare con diverse testate giornalistiche e poter continuare a parlare di cinema ed intrattenimento',
      image: 'assets/foto/giulia ricci.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '@riccigiuliw', url: 'https://www.instagram.com/riccigiuliw/?utm_source=ig_web_button_share_sheet' }
      ]
    },
    'Annapaola Ragosta': {
      name: 'Annapaola Ragosta',
      role: 'Collaboratrice',
      initials: 'AR',
      badge: 'Redazione',
      bio: '24 anni, il mio amore per il cinema nasce da bambina grazie alle grandi interpretazioni di Sophia Loren e in seguito Cate Blanchett. Partecipo ai più importanti festival con l’obiettivo e la speranza di trasmettere la mia passione e che un giorno questa possa diventare il mio principale lavoro',
      image: 'assets/foto/Annapaola Ragosta.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '@annapaolaerre', url: 'https://www.instagram.com/annapaolaerre?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==' },
        { name: 'TikTok', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>', handle: '@annapaolarago', url: 'https://www.tiktok.com/@annapaolarago' }
      ]
    }
  };

  // Bind Subscription & Initial Load AFTER teamMembersData is fully defined
  loadArticlesFromStore();
  renderArticles();

  if (window.baas && typeof window.baas.subscribe === 'function') {
    window.baas.subscribe((updatedArticles) => {
      articles = updatedArticles || [];
      renderArticles();
    });
  }

  let teamModalOverlay = null;
  let currentMemberKey = null;

  // Order derived from teamMembersData to stay always in sync
  const teamMemberKeysOrder = [
    'francesco-pisapia',
    'enzo-peluso',
    'francesca-siciliano',
    'sarah-bonfanti',
    'Benedetta De Martino',
    'Elena Curti',
    'Valerio Padoan',
    'Maria Carmela Fedele',
    'Giulia Zuccolo',
    'Pietro Armenante',
    'Gaia Fabozzo',
    'Pierluigi Esposito',
    'Giulia Ricci',
    'Annapaola Ragosta'
  ];

  let _navigating = false;
  function navigateTeamMember(direction) {
    if (!currentMemberKey || _navigating) return;
    _navigating = true;
    setTimeout(() => { _navigating = false; }, 350);

    // Case-insensitive search in order list to handle any key casing mismatch
    const currentKeyLower = currentMemberKey.toLowerCase();
    const currentIndex = teamMemberKeysOrder.findIndex(
      k => k.toLowerCase() === currentKeyLower
    );
    if (currentIndex === -1) { _navigating = false; return; }

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) {
      nextIndex = teamMemberKeysOrder.length - 1;
    } else if (nextIndex >= teamMemberKeysOrder.length) {
      nextIndex = 0;
    }

    openTeamMemberModal(teamMemberKeysOrder[nextIndex]);
  }

  let _keydownModalListenerAdded = false;
  function createTeamModalDOM() {
    if (document.getElementById('teamMemberModalOverlay')) {
      teamModalOverlay = document.getElementById('teamMemberModalOverlay');
      return;
    }

    teamModalOverlay = document.createElement('div');
    teamModalOverlay.id = 'teamMemberModalOverlay';
    teamModalOverlay.className = 'team-modal-overlay';
    teamModalOverlay.setAttribute('role', 'dialog');
    teamModalOverlay.setAttribute('aria-modal', 'true');

    teamModalOverlay.innerHTML = `
      <!-- Bottone Precedente -->
      <button class="team-modal-nav-btn prev" id="teamModalPrevBtn" aria-label="Profilo precedente">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <!-- Bottone Successivo -->
      <button class="team-modal-nav-btn next" id="teamModalNextBtn" aria-label="Profilo successivo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <div class="team-modal-container">
        <button class="team-modal-close-btn" id="teamModalCloseBtn" aria-label="Chiudi scheda">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="team-modal-scroll-body">
          <div class="team-modal-cover-header">
            <div class="team-modal-header">
              <div class="team-modal-avatar-wrapper" id="teamModalAvatar">EP</div>
              <h2 class="team-modal-name" id="teamModalName">Enzo Peluso</h2>
              <div class="team-modal-role-pill" id="teamModalRole">Fondatore &amp; Redattore</div>
              <div class="team-modal-location" id="teamModalLocation">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span id="teamModalLocationText">Napoli, Italia</span>
              </div>
            </div>
          </div>
          <div class="team-modal-body">
            <div class="team-modal-section-title">Biografia &amp; Profilo</div>
            <p class="team-modal-bio" id="teamModalBio"></p>
            <p class="team-modal-bio" id="teamModalBioExt" style="font-size: 0.93rem; color: var(--text-muted);"></p>
            
            <div class="team-modal-stats">
              <div class="team-stat-item">
                <div class="team-stat-val" id="teamModalArticlesCount">0</div>
                <div class="team-stat-lbl">Articoli Pubblicati</div>
              </div>
            </div>

            <div class="team-modal-section-title">Contatti &amp; Canali Social</div>
            <div class="team-modal-socials-grid" id="teamModalSocials"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(teamModalOverlay);

    const closeBtn = document.getElementById('teamModalCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeTeamMemberModal);
    }

    const prevBtn = document.getElementById('teamModalPrevBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateTeamMember(-1);
      });
    }

    const nextBtn = document.getElementById('teamModalNextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateTeamMember(1);
      });
    }

    teamModalOverlay.addEventListener('click', (e) => {
      if (e.target === teamModalOverlay) {
        closeTeamMemberModal();
      }
    });

    if (!_keydownModalListenerAdded) {
      _keydownModalListenerAdded = true;
      document.addEventListener('keydown', (e) => {
        if (teamModalOverlay && teamModalOverlay.classList.contains('open')) {
          if (e.key === 'Escape') {
            closeTeamMemberModal();
          } else if (e.key === 'ArrowLeft') {
            navigateTeamMember(-1);
          } else if (e.key === 'ArrowRight') {
            navigateTeamMember(1);
          }
        }
      });
    }
  }

  function openTeamMemberModal(memberKey) {
    createTeamModalDOM();
    currentMemberKey = memberKey;
    const data = teamMembersData[memberKey];
    if (!data) return;

    const memberArticlesCount = articles.filter(a => a.author.toLowerCase() === data.name.toLowerCase()).length;

    const avatarContainer = document.getElementById('teamModalAvatar');
    if (data.image) {
      avatarContainer.innerHTML = `<img src="${data.image}" alt="${data.name}">`;
    } else {
      avatarContainer.textContent = data.initials;
    }
    document.getElementById('teamModalName').textContent = data.name;
    document.getElementById('teamModalRole').textContent = data.role;
    
    const locationEl = document.getElementById('teamModalLocation');
    if (locationEl) {
      if (data.location) {
        locationEl.style.display = '';
        document.getElementById('teamModalLocationText').textContent = data.location;
      } else {
        locationEl.style.display = 'none';
      }
    }
    document.getElementById('teamModalBio').textContent = data.bio;
    document.getElementById('teamModalBioExt').textContent = data.bioExtended || '';
    document.getElementById('teamModalArticlesCount').textContent = memberArticlesCount || 8;

    const socialsContainer = document.getElementById('teamModalSocials');
    socialsContainer.innerHTML = '';

    data.socials.forEach(s => {
      const a = document.createElement('a');
      a.className = 'team-social-card';
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = `
        <div class="team-social-icon-box">${s.icon}</div>
        <div class="team-social-info">
          <span class="team-social-title">${s.name}</span>
          <span class="team-social-handle">${s.handle}</span>
        </div>
      `;
      socialsContainer.appendChild(a);
    });

    // Resetta la barra di scorrimento all'inizio
    const scrollBody = teamModalOverlay.querySelector('.team-modal-scroll-body');
    if (scrollBody) {
      scrollBody.scrollTop = 0;
    }

    teamModalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  function closeTeamMemberModal() {
    if (teamModalOverlay) {
      teamModalOverlay.classList.remove('open');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      currentMemberKey = null;
    }
  }

  function initTeamMemberTriggers() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.team-card-trigger, [data-member-id]');
      if (trigger) {
        const memberId = trigger.getAttribute('data-member-id');
        if (memberId && teamMembersData[memberId]) {
          openTeamMemberModal(memberId);
        }
      }
    });

    document.querySelectorAll('.team-card-trigger').forEach(card => {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const memberId = card.getAttribute('data-member-id');
          if (memberId) openTeamMemberModal(memberId);
        }
      });
    });
  }

  function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    const submitBtn = document.getElementById('formSubmitBtn');
    const statusMsg = document.getElementById('formStatusMsg');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contactName')?.value.trim();
      const email = document.getElementById('contactEmail')?.value.trim();
      const subject = document.getElementById('contactSubject')?.value.trim();
      const message = document.getElementById('contactMessage')?.value.trim();

      if (!name || !email || !message) {
        if (statusMsg) {
          statusMsg.className = 'form-status-msg error';
          statusMsg.style.color = '#ef4444';
          statusMsg.textContent = 'Per favore, compila tutti i campi obbligatori (*).';
        }
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (statusMsg) {
        statusMsg.className = 'form-status-msg info';
        statusMsg.style.color = '#3b82f6';
        statusMsg.textContent = 'Invio del messaggio in corso...';
      }

      try {
        const response = await fetch('api/invia_contatto.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, subject, message })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          if (statusMsg) {
            statusMsg.className = 'form-status-msg success';
            statusMsg.style.color = '#22c55e';
            statusMsg.textContent = result.message || 'Messaggio inviato con successo!';
          }
          contactForm.reset();
        } else {
          throw new Error(result.message || 'Si è verificato un errore durante l\'invio.');
        }
      } catch (err) {
        if (statusMsg) {
          statusMsg.className = 'form-status-msg error';
          statusMsg.style.color = '#ef4444';
          if (window.location.protocol === 'file:') {
            statusMsg.textContent = 'Errore: Apri la pagina nel browser scrivendo http://localhost/SitoChecco/contatti.html (non facendo doppio clic sul file .html).';
          } else {
            statusMsg.textContent = 'Errore: ' + err.message;
          }
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ------------------------------------------------------------------------
  // PUBLIC COMMENTS INTERFACE
  // ------------------------------------------------------------------------
  function renderArticleComments(articleId) {
    const paperContainer = document.querySelector('.modal-paper-container');
    if (!paperContainer) return;

    let section = document.getElementById('articleCommentsSection');
    if (!section) {
      section = document.createElement('div');
      section.id = 'articleCommentsSection';
      section.style.cssText = 'margin-top: 4rem; padding-top: 3rem; border-top: 1px solid #e2e8f0; color: #1a202c; text-align: left; font-family: inherit;';
      paperContainer.appendChild(section);
    }

    section.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 2rem;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e05a2b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <h3 style="font-size: 1.4rem; font-weight: 800; margin: 0; color: #111; letter-spacing: -0.02em;">Discussione e Commenti</h3>
      </div>

      <div id="publicCommentsList" style="display: flex; flex-direction: column; gap: 1.15rem; margin-bottom: 3rem;">
        <p style="color: #718096; font-size: 0.85rem;">Caricamento commenti in corso...</p>
      </div>
      
      <form id="publicCommentForm" style="background: #f8fafc; padding: 1.75rem; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="margin-bottom: 0.25rem;">
          <h4 style="font-size: 1.1rem; font-weight: 800; margin: 0 0 0.25rem 0; color: #1e293b;">Lascia un commento</h4>
          <p style="font-size: 0.78rem; color: #64748b; margin: 0;">Partecipa alla discussione. I campi contrassegnati con * sono obbligatori.</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
          <div style="display: flex; flex-direction: column; gap: 0.35rem;">
            <input type="text" id="commAuthorName" placeholder="Il tuo nome *" required style="padding: 0.75rem 1rem; font-size: 0.85rem; border: 1px solid #cbd5e1; border-radius: 10px; background: #fff; color: #0f172a; outline: none; transition: border-color 0.2s; font-family: inherit;">
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.35rem;">
            <input type="email" id="commAuthorEmail" placeholder="La tua email (opzionale)" style="padding: 0.75rem 1rem; font-size: 0.85rem; border: 1px solid #cbd5e1; border-radius: 10px; background: #fff; color: #0f172a; outline: none; transition: border-color 0.2s; font-family: inherit;">
          </div>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 0.35rem;">
          <textarea id="commContent" placeholder="Scrivi qui il tuo messaggio... *" rows="4" required style="padding: 0.75rem 1rem; font-size: 0.85rem; border: 1px solid #cbd5e1; border-radius: 10px; background: #fff; color: #0f172a; outline: none; transition: border-color 0.2s; font-family: inherit; resize: vertical; min-height: 100px;"></textarea>
        </div>
        
        <button type="submit" style="background: #e05a2b; color: #fff; border: none; padding: 0.75rem 1.5rem; font-size: 0.85rem; font-weight: 800; border-radius: 10px; cursor: pointer; align-self: flex-start; transition: background-color 0.2s, transform 0.1s; box-shadow: 0 4px 12px rgba(224, 90, 43, 0.25);">
          Pubblica Commento
        </button>
      </form>
    `;

    const commentsList = document.getElementById('publicCommentsList');
    const commentForm = document.getElementById('publicCommentForm');

    // Carica i commenti esistenti approvati
    fetch(`api/commenti.php?action=list_public&article_id=${encodeURIComponent(articleId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.comments)) {
          if (data.comments.length === 0) {
            commentsList.innerHTML = '<p style="color: #64748b; font-size: 0.85rem; font-style: italic; background: #f8fafc; padding: 1.25rem; border-radius: 14px; border: 1px dashed #e2e8f0; text-align: center; margin: 0;">Nessun commento approvato ancora. Lascia tu il primo commento!</p>';
            return;
          }
          commentsList.innerHTML = '';
          data.comments.forEach(c => {
            const dateObj = new Date(c.created_at);
            const dateStr = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const initials = c.author_name ? c.author_name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2) : '?';
            
            const commentDiv = document.createElement('div');
            commentDiv.style.cssText = 'background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 1.25rem; display: flex; gap: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: transform 0.2s;';
            commentDiv.innerHTML = `
              <div style="width: 40px; height: 40px; border-radius: 50%; background: #f1f5f9; color: #64748b; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid #e2e8f0;">
                ${initials}
              </div>
              <div style="flex-grow: 1;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 0.5rem;">
                  <strong style="font-size: 0.9rem; color: #0f172a; font-weight: 700;">${escapeHtml(c.author_name)}</strong>
                  <span style="font-size: 0.72rem; color: #94a3b8;">${dateStr}</span>
                </div>
                <p style="font-size: 0.86rem; color: #334155; line-height: 1.6; margin: 0; white-space: pre-wrap; font-family: inherit;">${escapeHtml(c.content)}</p>
              </div>
            `;
            commentsList.appendChild(commentDiv);
          });
        }
      })
      .catch(() => {
        commentsList.innerHTML = '<p style="color: #ef4444; font-size: 0.85rem;">Impossibile caricare i commenti.</p>';
      });

    // Gestione invio commento
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('commAuthorName').value.trim();
      const email = document.getElementById('commAuthorEmail').value.trim();
      const content = document.getElementById('commContent').value.trim();
      
      const submitBtn = commentForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Invio in corso...';
      
      try {
        const res = await fetch('api/commenti.php?action=add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            article_id: articleId,
            author_name: name,
            author_email: email,
            content: content
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast('Grazie! Il tuo commento è stato inviato e apparirà non appena approvato da un moderatore.');
          commentForm.reset();
        } else {
          showToast('Errore: ' + data.message, 'error');
        }
      } catch (err) {
        showToast('Impossibile inviare il commento. Riprova più tardi.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Invia Commento';
      }
    });
  }

  function showToast(message, type = 'success') {
    let container = document.getElementById('publicToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'publicToastContainer';
      container.style.cssText = 'position: fixed; bottom: 30px; right: 30px; z-index: 999999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
      padding: 0.9rem 1.4rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 700;
      color: #ffffff;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      min-width: 260px;
      max-width: 400px;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      border: 1px solid ${type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'};
    `;

    const icon = type === 'success' 
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

    toast.innerHTML = `${icon}<span style="line-height:1.4;">${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // ------------------------------------------------------------------------
  // Init App
  // ------------------------------------------------------------------------
  initCookieBanner();
  initHeaderScroll();
  initScrollToTop();
  setupModalReadingProgress();
  initTeamMemberTriggers();
  initContactForm();

});

