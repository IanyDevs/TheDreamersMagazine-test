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

    let authorKey = 'francesco-pisapia';
    if (article.author) {
      const artAuthLower = article.author.toLowerCase().trim();
      const matchedKey = Object.keys(teamMembersData).find(key => {
        const member = teamMembersData[key];
        const memberNameLower = member.name.toLowerCase().trim();
        return artAuthLower.includes(key.toLowerCase().trim()) || 
               artAuthLower.includes(memberNameLower) || 
               memberNameLower.includes(artAuthLower);
      });
      if (matchedKey) authorKey = matchedKey;
    }
    const memberData = teamMembersData[authorKey] || { initials: 'FP', role: 'Redattore' };

    const initialsEl = document.getElementById('modalAuthorInitials');
    if (initialsEl) {
      if (memberData.image) {
        initialsEl.innerHTML = `<img src="${memberData.image}" alt="${memberData.name}">`;
      } else {
        initialsEl.textContent = memberData.initials || 'FP';
      }
    }

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

  // ----------------------------------------------------------------
  const teamMembersData = {
    'enzo-peluso': {
      name: 'Enzo Peluso',
      role: 'Co-Fondatore-ViceDirettore & Redattore',
      initials: 'EP',
      badge: 'Fondatore',
      bio: '27 anni, la mia passione inizia da bambino grazie al Giffoni Film Festival. Giro i più importanti festival europei con l’obiettivo di avvicinare quante più persone al cinema',
      image: 'assets/foto/enzo peluso.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' }
      ]
    },
    'francesco-pisapia': {
      name: 'Francesco Pisapia',
      role: 'Fondatore-Direttore & Caporedattore',
      initials: 'FP',
      badge: 'Redattore Capo',
      bio: 'Lavoro al sito con l’obiettivo di raccontare il cinema con passione, cura e attenzione. Ho fondato questo progetto per condividere il mio amore per il cinema e seguo con costanza i principali festival cinematografici italiani, senza perdermi le nuove uscite in sala e tutto ciò che accade nel panorama cinematografico.',
      image: 'assets/foto/Francesco Pisapia.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' }
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
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' }
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
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' }
      ]
    },
    'Benedetta de Martino': {
      name: 'Benedetta de Martino',
      role: 'Redattrice',
      initials: 'BdM',
      badge: 'Redazione',
      bio: 'Tra una colonna sonora indimenticabile e una sala cinematografica: è lì che mi trovate. Vivo di cinema e musica: amo raccontare le emozioni che nascono quando immagini e note si incontrano. Scrivo per condividere questa crescente passione.',
      image: 'assets/foto/Benedetta de Martino.jpeg',
      socials: [
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' }
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
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' }
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
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' }
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
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' }
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
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' }
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
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' }
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
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' }
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
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' }
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
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' }
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
        { name: 'Instagram', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>', handle: '-', url: '#' }
      ]
    }
  };

  let teamModalOverlay = null;
  let currentMemberKey = null;

  const teamMemberKeysOrder = [
    'francesco-pisapia',
    'enzo-peluso',
    'francesca-siciliano',
    'sarah-bonfanti',
    'Benedetta de Martino',
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

  function navigateTeamMember(direction) {
    if (!currentMemberKey) return;
    const currentIndex = teamMemberKeysOrder.indexOf(currentMemberKey);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) {
      nextIndex = teamMemberKeysOrder.length - 1;
    } else if (nextIndex >= teamMemberKeysOrder.length) {
      nextIndex = 0;
    }

    openTeamMemberModal(teamMemberKeysOrder[nextIndex]);
  }

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

