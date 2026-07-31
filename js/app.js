/* ==========================================================================
   THE DREAMERS MAGAZINE - JAVASCRIPT APPLICATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------------------------------------
  // 1. Articles Database (Curated, Rich & Ordered Collection)
  // ------------------------------------------------------------------------
  const articles = [
    {
      id: 1,
      category: 'Film',
      title: 'SPIDER-MAN: BRAND NEW DAY – Spider-Man torna a essere una storia su Peter Parker. Un film più intimo, più maturo, che mette al centro la solitudine, la crescita e il peso delle responsabilità',
      excerpt: 'Articolo di Enzo Peluso. Spider-Man: Brand New Day rappresenta una vera svolta per il percorso del supereroe Marvel, riportando l\'attenzione sull\'uomo dietro la maschera.',
      fullContent: `
        <p><strong>Articolo di Enzo Peluso</strong></p>
        <p>Spider-Man: Brand New Day rappresenta una vera svolta per il percorso cinematico di Peter Parker. Dopo le incredibili battaglie multiversali dei capitoli precedenti, questo nuovo film sceglie una direzione coraggiosa e intimista: spogliare l'eroe di ogni certezza e rimettere al centro la sua umanità.</p>
        <p>In una New York cupa, autunnale e affascinante, Peter si ritrova completamente solo a dover ricostruire la propria vita quotidiana. Senza il supporto di grandi tecnologici o alleati leggendari, il peso delle responsabilità torna a farsi sentire in tutta la sua drammatica concretezza.</p>
        <p>La regia punta molto su toni maturi, inquadrature strette sui volti e un ritmo narrativo ragionato che concede ampio spazio ai dilemmi morali ed emotivi del protagonista. Un'opera fondamentale che riconnette i fan all'essenza più autentica dell'arrampicamuri di quartiere.</p>
      `,
      image: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/07/MV5BNGQxY2FkZDktZDI5Yy00ZmEyLTg4NmYtOWIzMDBmMzg2ZWU0XkEyXkFqcGdeQWFybm8@._V1_.jpg',
      author: 'Enzo Peluso',
      authorAvatar: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-WhatsApp-Image-2026-04-02-at-17.42.54-48x48.jpeg',
      date: 'Lug 29, 2026'
    },
    {
      id: 2,
      category: 'Serie TV',
      title: 'FURIOUS: Una caccia a una serial killer tra passato, vendetta e giustizia – recensione della nuova serie HULU con Emmy Rossum',
      excerpt: 'Dal 26 luglio sono disponibili su Disney+ i primi tre episodi di Furious, nuova serie thriller psicologica interpretata da una magistrale Emmy Rossum.',
      fullContent: `
        <p>Dal 26 luglio sono disponibili in streaming i primi tre episodi di <em>Furious</em>, la nuova attesissima serie thriller distribuita da Hulu e Disney+, con protagonista un'intensa Emmy Rossum.</p>
        <p>La trama si snoda su due piani temporali paralleli: da un lato l'ossessiva caccia a un astuto serial killer che sconvolse una piccola cittadina costiera negli anni novanta, dall'altro le ripercussioni psicologiche e i segreti inconfessabili che riemergono nel presente.</p>
        <p>Emmy Rossum offre una delle migliori interpretazioni della sua carriera, trasmettendo con doloroso realismo il trauma, la determinazione e la tensione morale di una donna disposta a tutto pur di far luce sulla verità.</p>
      `,
      image: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/07/compose-1-e1785167445789.webp',
      author: 'Francesco Pisapia',
      authorAvatar: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-WhatsApp-Image-2026-04-02-at-14.08.25-48x48.jpeg',
      date: 'Lug 27, 2026'
    },
    {
      id: 3,
      category: 'Approfondimenti',
      title: 'JE SO’ PAZZO: Presentate in anteprima al Giffoni Film Festival le prime clip del biopic su Pino Daniele',
      excerpt: 'Articolo di Francesco Pisapia. Nella giornata conclusiva del Giffoni Film Festival, sono state presentate in anteprima assoluta le prime sequenze dell\'atteso film dedicato all\'inimitabile artista napoletano.',
      fullContent: `
        <p><strong>Articolo di Francesco Pisapia</strong></p>
        <p>Nella giornata conclusiva della nuova edizione del Giffoni Film Festival, un'ondata di profonda emozione ha travolto la Sala Truffaut durante la proiezione speciale in anteprima delle prime clip inedite di <em>Je so' pazzo</em>, il biopic cinematografico dedicato all'icona della musica italiana Pino Daniele.</p>
        <p>Il progetto racconterà con autenticità la giovinezza del cantautore, dai vicoli di Napoli alle storiche sessioni d'incisione che hanno rivoluzionato la canzone d'autore italiana degli anni '70 e '80.</p>
      `,
      image: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/07/foto-je-so-pazzo-2-high-scaled.jpg',
      author: 'Francesco Pisapia',
      authorAvatar: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-WhatsApp-Image-2026-04-02-at-14.08.25-48x48.jpeg',
      date: 'Lug 25, 2026'
    },
    {
      id: 4,
      category: 'News',
      title: 'Festival del Cinema: annunciata la selezione ufficiale delle opere in concorso e gli ospiti internazionali',
      excerpt: 'Svelato il programma della nuova edizione del prestigioso festival cinematografico con anteprime mondiali dei registi più acclamati.',
      fullContent: `
        <p>È stato finalmente rivelato il cartellone ufficiale del festival di quest'anno, caratterizzato da una selezione varia e internazionale che spazia dai colossal d'autore al cinema indipendente di ricerca.</p>
        <p>Tra i titoli più attesi in concorso figurano i nuovi lavori di acclamati maestri della regia mondiale e opere prime di straordinario talento giovanile.</p>
      `,
      image: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/3297dbcfad1886dd05f161880815fd02948fbc5e.jpg',
      author: 'Enzo Peluso',
      authorAvatar: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-WhatsApp-Image-2026-04-02-at-17.42.54-48x48.jpeg',
      date: 'Lug 20, 2026'
    },
    {
      id: 5,
      category: 'Film',
      title: 'L\'arte della cinematografia moderna: come l\'illuminazione e il colore raccontano le emozioni su grande schermo',
      excerpt: 'Un\'analisi tecnica ed estetica sulle scelte visive dei direttori della fotografia più celebri dell\'era contemporanea.',
      fullContent: `
        <p>Nel cinema contemporaneo, la direzione della fotografia ha raggiunto livelli di espressività paragonabili alla pittura classica. L'uso consapevole dei contrasti di luce, della palette cromatica e delle lenti vintage trasforma ogni fotogramma in un veicolo di significato narrativo.</p>
      `,
      image: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/5409f9b58aba190e5148a1b2aeffc3c3fafd596d.jpg',
      author: 'Francesco Pisapia',
      authorAvatar: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-WhatsApp-Image-2026-04-02-at-14.08.25-48x48.jpeg',
      date: 'Lug 15, 2026'
    },
    {
      id: 6,
      category: 'Serie TV',
      title: 'THE LAST OF US STAGIONE 2 – Le prime immagini dal set mostrano l\'evoluzione di Ellie e Joel',
      excerpt: 'Articolo di Enzo Peluso. HBO diffonde i primi teaser scatti della seconda stagione dell\'acclamato adattamento videoludico.',
      fullContent: `
        <p>HBO ha rilasciato le prime immagini ufficiali della seconda stagione di <em>The Last of Us</em>. La serie torna a raccontare il viaggio di Joel ed Ellie anni dopo gli eventi drammatici della prima stagione.</p>
      `,
      image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
      author: 'Enzo Peluso',
      authorAvatar: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-WhatsApp-Image-2026-04-02-at-17.42.54-48x48.jpeg',
      date: 'Lug 12, 2026'
    },
    {
      id: 7,
      category: 'News',
      title: 'AVATAR 3: FIRE AND ASH – James Cameron rivela il primo concept visivo del Popolo delle Ceneri',
      excerpt: 'Tutte le anticipazioni sul terzo capitolo del franchise kolossal che esplorerà le tribù vulcaniche di Pandora.',
      fullContent: `
        <p>James Cameron ha presentato i primi concept art di <em>Avatar: Fire and Ash</em>, terzo capitolo della saga di Pandora in arrivo al cinema.</p>
      `,
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      author: 'Francesco Pisapia',
      authorAvatar: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-WhatsApp-Image-2026-04-02-at-14.08.25-48x48.jpeg',
      date: 'Lug 08, 2026'
    },
    {
      id: 8,
      category: 'Approfondimenti',
      title: 'IL CINEMA DI CHRISTOPHER NOLAN – Dalla fisica di Interstellar alla poetica del tempo in Oppenheimer',
      excerpt: 'Un saggio critico sull\'evoluzione dello stile registico e delle tematiche filosofiche nel cinema di Nolan.',
      fullContent: `
        <p>Christopher Nolan si attesta come uno dei registi più influenti dell'era contemporanea. La sua capacità di unire il grande spettacolo con concetti filosofici e fisici complessi rende la sua filmografia unica nel panorama mondiale.</p>
      `,
      image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80',
      author: 'Enzo Peluso',
      authorAvatar: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-WhatsApp-Image-2026-04-02-at-17.42.54-48x48.jpeg',
      date: 'Lug 04, 2026'
    },
    {
      id: 9,
      category: 'Film',
      title: 'DUNE: PARTE TRE – Denis Villeneuve conferma l\'inizio della pre-produzione per Messia di Dune',
      excerpt: 'Il regista canadese si prepara a completare la trilogia tratta dai romanzi cult di Frank Herbert con una sceneggiatura ancora più ambiziosa.',
      fullContent: `
        <p>Dopo lo straordinario successo di critica e di pubblico di Dune: Parte Due, Denis Villeneuve ha confermato di aver iniziato la fase di scrittura di <em>Dune: Messia</em>.</p>
      `,
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      author: 'Francesco Pisapia',
      authorAvatar: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-WhatsApp-Image-2026-04-02-at-14.08.25-48x48.jpeg',
      date: 'Giu 28, 2026'
    },
    {
      id: 10,
      category: 'Serie TV',
      title: 'HOUSE OF THE DRAGON 3 – Le prime teorie sulla Danza dei Draghi e il futuro della casata Targaryen',
      excerpt: 'Analisi dei dettagli emersi dal finale della seconda stagione e anticipazioni sulle imminenti battaglie navali e aeree.',
      fullContent: `
        <p>La terza stagione di <em>House of the Dragon</em> si preannuncia come la più ricca di azione e scontri epici dell'intera serie fantasy prodotta da HBO.</p>
      `,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      author: 'Enzo Peluso',
      authorAvatar: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-WhatsApp-Image-2026-04-02-at-17.42.54-48x48.jpeg',
      date: 'Giu 22, 2026'
    },
    {
      id: 11,
      category: 'News',
      title: 'MOSTRA DEL CINEMA DI VENEZIA – Annunciati i Leoni d\'Oro alla carriera e la composizione della Giuria',
      excerpt: 'Ufficializzati i riconoscimenti d\'onore che verranno consegnati durante la serata di apertura del festival in Laguna.',
      fullContent: `
        <p>La Mostra Internazionale d'Arte Cinematografica della Biennale di Venezia ha annunciato la giuria internazionale presieduta quest'anno da eminenti figure del cinema europeo e globale.</p>
      `,
      image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
      author: 'Francesco Pisapia',
      authorAvatar: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-WhatsApp-Image-2026-04-02-at-14.08.25-48x48.jpeg',
      date: 'Giu 18, 2026'
    },
    {
      id: 12,
      category: 'Approfondimenti',
      title: 'LA RINASCITA DEL CINEMA ITALIANO – Da Paolo Sorrentino a Matteo Garrone, il nuovo corso europeo',
      excerpt: 'Uno studio sulle produzioni italiane di maggior impatto internazionale e sull\'evoluzione del linguaggio d\'autore nel nostro Paese.',
      fullContent: `
        <p>Il cinema italiano sta attraversando un momento di straordinaria vitalità creativa e riconoscimento festivaliero a livello internazionale.</p>
      `,
      image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
      author: 'Enzo Peluso',
      authorAvatar: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-WhatsApp-Image-2026-04-02-at-17.42.54-48x48.jpeg',
      date: 'Giu 10, 2026'
    },
    {
      id: 13,
      category: 'Film',
      title: 'IL GLADIATORE II – L\'eredità di Massimo Decimo Meridio e la visione di Ridley Scott',
      excerpt: 'Recensione e analisi approfondita del kolossal epico che riprende le gesta dell\'Impero Romano a distanza di vent\'anni.',
      fullContent: `
        <p>Ridley Scott torna nell'antica Roma con una produzione imponente che esplora il potere, le congiure di palazzo ed il destino dei gladiatori nell'arena.</p>
      `,
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
      author: 'Francesco Pisapia',
      authorAvatar: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-WhatsApp-Image-2026-04-02-at-14.08.25-48x48.jpeg',
      date: 'Giu 05, 2026'
    },
    {
      id: 14,
      category: 'Serie TV',
      title: 'STRANGER THINGS 5 – Svelati i titoli degli episodi finali del capitolo conclusivo',
      excerpt: 'I fratelli Duffer svelano indizi fondamentali sulla resa dei conti a Hawkins e nell\'Sottosopra.',
      fullContent: `
        <p>La quinta ed ultima stagione di <em>Stranger Things</em> promette di chiudere tutte le trame lasciate aperte fin dalla prima stagione della celebre serie cult Netflix.</p>
      `,
      image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      author: 'Enzo Peluso',
      authorAvatar: 'https://www.thedreamersmagazine.it/wp-content/uploads/2026/04/cropped-WhatsApp-Image-2026-04-02-at-17.42.54-48x48.jpeg',
      date: 'Mag 28, 2026'
    }
  ];

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
      const matchCat = (activeCategory === 'Tutti') || (article.category.toLowerCase() === activeCategory.toLowerCase());
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.author.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q)
      );
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      articlesGrid.innerHTML = `
        <li style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <h3>Nessun articolo trovato per la ricerca effettuata.</h3>
          <p style="margin-top: 0.5rem;">Prova a cercare un'altra parola chiave o seleziona un'altra categoria.</p>
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
      // Home Page: display only the 6 latest articles
      paginatedArticles = filtered.slice(0, 6);
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
      const readTime = calculateReadingTime(article.fullContent || article.excerpt);
      
      // Initials helper
      const authorInitials = article.author.split(' ').map(n => n[0]).join('');

      li.innerHTML = `
        <article class="article-card" data-id="${article.id}">
          <div class="card-img-wrapper">
            <div class="card-img-overlay"></div>
            <img src="${article.image}" alt="${article.title}" class="card-img" loading="lazy">
            <span class="card-img-badge">${article.category}</span>
            <span class="card-read-time-badge">⏱️ ${readTime}</span>
          </div>
          <div class="card-content">
            <span class="card-category">${article.category}</span>
            <h2 class="card-title">${article.title}</h2>
            <p class="card-excerpt">${article.excerpt}</p>
            <div class="card-footer-meta">
              <div class="card-author-info">
                <div class="card-author-avatar-initials">${authorInitials}</div>
                <div>
                  <div class="author-name">${article.author}</div>
                  <time class="post-date">${article.date}</time>
                </div>
              </div>
              <div class="card-read-action">
                <span>Leggi</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </div>
        </article>
      `;
      articlesGrid.appendChild(li);
    });

    // Add click listeners to cards
    document.querySelectorAll('.article-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.getAttribute('data-id'), 10);
        openArticleModal(id);
      });
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
  function openArticleModal(id) {
    if (!articleModal) return;

    const article = articles.find(a => a.id === id);
    if (!article) return;

    if (modalHeroImg) {
      modalHeroImg.src = article.image;
      modalHeroImg.alt = article.title;
    }
    if (modalCategoryBadge) modalCategoryBadge.textContent = article.category;
    if (modalTitle) modalTitle.textContent = article.title;

    const authorKey = article.author && article.author.toLowerCase().indexOf('enzo') !== -1 ? 'enzo-peluso' : 'francesco-pisapia';
    const memberData = teamMembersData[authorKey] || { initials: 'DM', role: 'Redattore' };

    const initialsEl = document.getElementById('modalAuthorInitials');
    if (initialsEl) initialsEl.textContent = memberData.initials;

    if (modalAuthorName) modalAuthorName.textContent = article.author;

    const authorRoleEl = document.getElementById('modalAuthorRole');
    if (authorRoleEl) authorRoleEl.textContent = memberData.role || 'Redattore';

    if (modalDate) modalDate.textContent = article.date;

    const rawReadTime = article.readTime || '3 min di lettura';
    const cleanReadTime = rawReadTime.includes('di lettura') ? rawReadTime : `${rawReadTime} di lettura`;
    const readTimeEl = document.getElementById('modalReadTime');
    if (readTimeEl) readTimeEl.textContent = `⏱️ ${cleanReadTime}`;

    if (modalTextContent) modalTextContent.innerHTML = article.fullContent;

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
    document.body.style.overflow = 'hidden';
  }

  function closeArticleModal() {
    if (!articleModal) return;
    articleModal.classList.remove('open');
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
  // 5. Mobile Navigation Menu Toggle
  // ------------------------------------------------------------------------
  if (menuToggleBtn && primaryNavMenu) {
    menuToggleBtn.addEventListener('click', () => {
      primaryNavMenu.classList.add('open');
      menuToggleBtn.setAttribute('aria-expanded', 'true');
    });
  }

  if (menuCloseBtn && primaryNavMenu) {
    menuCloseBtn.addEventListener('click', () => {
      primaryNavMenu.classList.remove('open');
      menuToggleBtn.setAttribute('aria-expanded', 'false');
    });
  }

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
        { name: 'Email Directa', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>', handle: '-', url: '#' }
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
        { name: 'Email Directa', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>', handle: '-', url: '#' }
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

  // ------------------------------------------------------------------------
  // Init App
  // ------------------------------------------------------------------------
  renderArticles();
  initCookieBanner();
  initScrollToTop();
  setupModalReadingProgress();
  initTeamMemberTriggers();

});
