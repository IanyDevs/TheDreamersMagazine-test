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
      const readTime = calculateReadingTime(article.fullContent || article.excerpt || article.content);
      const authorInitials = (article.author || 'EP').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

      li.innerHTML = `
        <article class="card">
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
                <div class="card-author-avatar-initials">${authorInitials}</div>
                <span class="card-author-name">${article.author || 'Redazione'}</span>
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

  // Bind Subscription & Initial Load AFTER renderArticles is defined
  loadArticlesFromStore();
  renderArticles();

  if (window.baas && typeof window.baas.subscribe === 'function') {
    window.baas.subscribe((updatedArticles) => {
      articles = updatedArticles || [];
      renderArticles();
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

    let navHtml = '<div class="pagination-container">';

    // Previous Button
    navHtml += `
      <button class="page-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''} aria-label="Pagina precedente">
        &laquo;
      </button>
    `;

    // Numeric Buttons
    for (let i = 1; i <= totalPages; i++) {
      navHtml += `
        <button class="page-btn num-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
    }

    // Next Button
    navHtml += `
      <button class="page-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Pagina successiva">
        &raquo;
      </button>
    `;

    navHtml += '</div>';
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

    const authorKey = article.author && article.author.toLowerCase().indexOf('enzo') !== -1 ? 'enzo-peluso' : 'francesco-pisapia';
    const memberData = teamMembersData[authorKey] || { initials: 'FP', role: 'Redattore' };

    const initialsEl = document.getElementById('modalAuthorInitials');
    if (initialsEl) initialsEl.textContent = memberData.initials || 'FP';

    if (modalAuthorName) modalAuthorName.textContent = article.author || 'Francesco Pisapia';

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

    const footerAvatar = document.getElementById('modalFooterAvatar');
    if (footerAvatar) footerAvatar.textContent = memberData.initials;

    const footerAuthorName = document.getElementById('modalFooterAuthorName');
    if (footerAuthorName) footerAuthorName.textContent = article.author;

    // Connect Author Card & Footer Signature to open Team Member Profile Modal
    const authorCard = articleModal.querySelector('.modal-author-card');
    if (authorCard) {
      authorCard.title = `Vedi il profilo completo di ${article.author}`;
      authorCard.onclick = () => {
        closeArticleModal();
        setTimeout(() => {
          openTeamMemberModal(authorKey);
        }, 150);
      };
    }

    const footerAuthorBox = articleModal.querySelector('.modal-footer-author-box');
    if (footerAuthorBox) {
      footerAuthorBox.title = `Vedi il profilo completo di ${article.author}`;
      footerAuthorBox.onclick = () => {
        closeArticleModal();
        setTimeout(() => {
          openTeamMemberModal(authorKey);
        }, 150);
      };
    }

    const footerClose = document.getElementById('modalFooterCloseAction');
    if (footerClose) {
      footerClose.onclick = closeArticleModal;
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && articleModal && articleModal.classList.contains('open')) {
      closeArticleModal();
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

  // ------------------------------------------------------------------------
  // Redazione Team Member Profile Modal Handler
  // ------------------------------------------------------------------------
  const teamMembersData = {
    'enzo-peluso': {
      name: 'Enzo Peluso',
      role: 'Fondatore & Redattore',
      initials: 'EP',
      badge: 'Fondatore',
      location: 'Napoli, Italia',
      bio: 'Appassionato di grande cinema, cultura pop e nuove tecnologie visive. Cura le recensioni dei blockbuster, le anteprime esclusive ed approfondimenti critici per The Dreamers Magazine.',
      bioExtended: 'Enzo ha fondato The Dreamers Magazine con l\'obiettivo di creare una testata indipendente e innovativa dedita al racconto del cinema moderno e classico. Tra i suoi ambiti d\'interesse figurano il cinema fantastico, le grandi saghe cinematografiche, il montaggio ed il suono nel cinema d\'azione.',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' },
        { name: 'X / Twitter', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>', handle: '-', url: '#' },
        { name: 'Email', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>', handle: '-', url: '#' }
      ]
    },
    'francesco-pisapia': {
      name: 'Francesco Pisapia',
      role: 'Redattore Capo & Critico',
      initials: 'FP',
      badge: 'Redattore Capo',
      location: 'Napoli / Roma, Italia',
      bio: 'Specializzato in serie TV, crime thriller e reportage dai principali festival cinematografici italiani ed internazionali come il Giffoni Film Festival e la Mostra del Cinema di Venezia.',
      bioExtended: 'Francesco guida l\'area critica e le notizie sulla serialità televisiva. Segue da vicino le grandi produzioni per piattaforme streaming come HBO, Netflix e Disney+, realizzando analisi approfondite sulle strutture narrative ed i personaggi dei thriller moderni.',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' },
        { name: 'X / Twitter', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>', handle: '-', url: '#' },
        { name: 'Email', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>', handle: '-', url: '#' }
      ]
    }
  };

  let teamModalOverlay = null;

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
              <div class="team-stat-item">
                <div class="team-stat-val">Dreamers</div>
                <div class="team-stat-lbl">Testata Editoriale</div>
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

    teamModalOverlay.addEventListener('click', (e) => {
      if (e.target === teamModalOverlay) {
        closeTeamMemberModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && teamModalOverlay && teamModalOverlay.classList.contains('open')) {
        closeTeamMemberModal();
      }
    });
  }

  function openTeamMemberModal(memberKey) {
    createTeamModalDOM();
    const data = teamMembersData[memberKey];
    if (!data) return;

    const memberArticlesCount = articles.filter(a => a.author.toLowerCase() === data.name.toLowerCase()).length;

    document.getElementById('teamModalAvatar').textContent = data.initials;
    document.getElementById('teamModalName').textContent = data.name;
    document.getElementById('teamModalRole').textContent = data.role;
    document.getElementById('teamModalLocationText').textContent = data.location;
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

    teamModalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeTeamMemberModal() {
    if (teamModalOverlay) {
      teamModalOverlay.classList.remove('open');
      document.body.style.overflow = '';
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
  // Init App
  // ------------------------------------------------------------------------
  renderArticles();
  initCookieBanner();
  initHeaderScroll();
  initScrollToTop();
  setupModalReadingProgress();
  initTeamMemberTriggers();
  initContactForm();

});

