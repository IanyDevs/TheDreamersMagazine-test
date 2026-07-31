/* ==========================================================================
   Admin Panel Logic - Admin.js (Minimal Test Site)
   ========================================================================== */

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
  
  const artImageInput = document.getElementById('artImage');
  const artFileInput = document.getElementById('artFileInput');
  const fileSelectedBadge = document.getElementById('fileSelectedBadge');
  const previewImg = document.getElementById('previewImg');
  const previewPlaceholder = document.getElementById('previewPlaceholder');
  const imgPreviewBox = document.getElementById('imgPreviewBox');
  const presetBtns = document.querySelectorAll('.btn-preset');
  const toolBtns = document.querySelectorAll('.tool-btn');
  const artContentTextarea = document.getElementById('artContent');

  const cropFitBtns = document.querySelectorAll('.btn-crop-opt');
  const cropRatioBtns = document.querySelectorAll('.btn-ratio-opt');
  const cropPosBtns = document.querySelectorAll('.btn-pos-opt');

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
    const isAuth = sessionStorage.getItem(AUTH_KEY) === 'true';
    if (isAuth) {
      loginSection.style.display = 'none';
      adminSection.style.display = 'block';
      logoutBtn.style.display = 'inline-flex';
    } else {
      loginSection.style.display = 'block';
      adminSection.style.display = 'none';
      logoutBtn.style.display = 'none';
    }
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();

    if (email === 'admin@blog.com' && pass === 'password123') {
      sessionStorage.setItem(AUTH_KEY, 'true');
      checkAuth();
      showToast('Autenticazione effettuata!');
      loginError.style.display = 'none';
    } else {
      loginError.style.display = 'block';
      loginError.textContent = 'Credenziali non valide. Usa admin@blog.com e password123';
    }
  });

  if (autoFillLoginBtn) {
    autoFillLoginBtn.addEventListener('click', () => {
      document.getElementById('loginEmail').value = 'admin@blog.com';
      document.getElementById('loginPassword').value = 'password123';
      showToast('Credenziali compilate.');
    });
  }

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_KEY);
    checkAuth();
    showToast('Disconnessione effettuata.');
  });

  const tabImportBtn = document.getElementById('tabImportBtn');
  const importTabContent = document.getElementById('importTabContent');

  const startWpFetchBtn = document.getElementById('startWpFetchBtn');
  const wpSiteUrlInput = document.getElementById('wpSiteUrlInput');
  const wpFetchLimitSelect = document.getElementById('wpFetchLimitSelect');
  const wpDefaultCategorySelect = document.getElementById('wpDefaultCategorySelect');
  const wpImportStatus = document.getElementById('wpImportStatus');
  const startJsonImportBtn = document.getElementById('startJsonImportBtn');
  const jsonImportFileInput = document.getElementById('jsonImportFileInput');

  tabCreateBtn.addEventListener('click', () => {
    tabCreateBtn.classList.add('active');
    tabManageBtn.classList.remove('active');
    if (tabImportBtn) tabImportBtn.classList.remove('active');
    createTabContent.style.display = 'block';
    manageTabContent.style.display = 'none';
    if (importTabContent) importTabContent.style.display = 'none';
  });

  tabManageBtn.addEventListener('click', () => {
    tabManageBtn.classList.add('active');
    tabCreateBtn.classList.remove('active');
    if (tabImportBtn) tabImportBtn.classList.remove('active');
    manageTabContent.style.display = 'block';
    createTabContent.style.display = 'none';
    if (importTabContent) importTabContent.style.display = 'none';
  });

  if (tabImportBtn && importTabContent) {
    tabImportBtn.addEventListener('click', () => {
      tabImportBtn.classList.add('active');
      tabCreateBtn.classList.remove('active');
      tabManageBtn.classList.remove('active');
      importTabContent.style.display = 'block';
      createTabContent.style.display = 'none';
      manageTabContent.style.display = 'none';
    });
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

  artTitleColorPicker.addEventListener('input', (e) => {
    currentTitleColor = e.target.value;
    updateTypographyUI();
  });

  textColorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      currentTextColor = swatch.getAttribute('data-color');
      updateTypographyUI();
    });
  });

  artTextColorPicker.addEventListener('input', (e) => {
    currentTextColor = e.target.value;
    updateTypographyUI();
  });

  function updateImagePreview(src) {
    activeCoverImageData = src ? src.trim() : '';
    if (activeCoverImageData) {
      previewImg.src = activeCoverImageData;
      previewImg.style.objectFit = currentFit;
      previewImg.style.objectPosition = currentPos;
      
      if (currentRatio === '16/9') imgPreviewBox.style.height = '180px';
      else if (currentRatio === '4/3') imgPreviewBox.style.height = '210px';
      else if (currentRatio === '1/1') imgPreviewBox.style.height = '250px';

      previewImg.style.display = 'block';
      previewPlaceholder.style.display = 'none';
    } else {
      previewImg.style.display = 'none';
      previewPlaceholder.style.display = 'block';
    }
  }

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
    if (!cropperImageObj.src) return;
    const ctx = cropperCanvas.getContext('2d');
    const width = cropperCanvas.width;
    const height = cropperCanvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    ctx.translate(width / 2 + panX, height / 2 + panY);
    ctx.rotate((cropAngle * Math.PI) / 180);
    ctx.scale(cropZoom, cropZoom);

    ctx.filter = cropFilter;

    const imgWidth = width;
    const imgHeight = (cropperImageObj.height / cropperImageObj.width) * width;
    ctx.drawImage(cropperImageObj, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

    ctx.restore();
  }

  function openCropperModal() {
    const src = activeCoverImageData || artImageInput.value;
    if (!src) {
      showToast('Seleziona prima un\'immagine di copertina!', 'danger');
      return;
    }

    cropperImageObj = new Image();
    cropperImageObj.crossOrigin = 'Anonymous';
    cropperImageObj.onload = () => {
      cropZoom = 1;
      cropAngle = 0;
      cropFilter = 'none';
      panX = 0;
      panY = 0;
      cropZoomRange.value = 1;
      zoomVal.textContent = '100%';
      rotateVal.textContent = '0°';
      
      filterBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === 'none'));

      cropperModal.classList.add('active');
      drawCropperCanvas();
    };
    cropperImageObj.src = src;
  }

  function closeCropperModal() {
    cropperModal.classList.remove('active');
  }

  openCropperModalBtn.addEventListener('click', openCropperModal);
  cropperModalClose.addEventListener('click', closeCropperModal);
  cancelCropBtn.addEventListener('click', closeCropperModal);

  cropZoomRange.addEventListener('input', (e) => {
    cropZoom = parseFloat(e.target.value);
    zoomVal.textContent = Math.round(cropZoom * 100) + '%';
    drawCropperCanvas();
  });

  rotateLeftBtn.addEventListener('click', () => {
    cropAngle = (cropAngle - 90) % 360;
    rotateVal.textContent = cropAngle + '°';
    drawCropperCanvas();
  });

  rotateRightBtn.addEventListener('click', () => {
    cropAngle = (cropAngle + 90) % 360;
    rotateVal.textContent = cropAngle + '°';
    drawCropperCanvas();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cropFilter = btn.getAttribute('data-filter');
      drawCropperCanvas();
    });
  });

  cropperCanvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    drawCropperCanvas();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  applyCropBtn.addEventListener('click', () => {
    try {
      const croppedDataUrl = cropperCanvas.toDataURL('image/jpeg', 0.92);
      artImageInput.value = '';
      updateImagePreview(croppedDataUrl);
      closeCropperModal();
      showToast('Ritaglio applicato con successo!');
    } catch (e) {
      console.error('Error cropping image:', e);
      showToast('Errore durante il ritaglio', 'danger');
    }
  });

  artFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Src = event.target.result;
        artImageInput.value = '';
        updateImagePreview(base64Src);
        
        fileSelectedBadge.style.display = 'inline-block';
        fileSelectedBadge.textContent = `File: ${file.name}`;
        showToast(`Immagine caricata!`);
      };
      reader.readAsDataURL(file);
    }
  });

  artImageInput.addEventListener('input', (e) => {
    if (e.target.value.trim() !== '') {
      artFileInput.value = '';
      fileSelectedBadge.style.display = 'none';
    }
    updateImagePreview(e.target.value);
  });

  presetBtns.forEach(btn => {
    if (btn.hasAttribute('data-url')) {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        artImageInput.value = url;
        artFileInput.value = '';
        fileSelectedBadge.style.display = 'none';
        updateImagePreview(url);
      });
    }
  });

  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-tag');
      const start = artContentTextarea.selectionStart;
      const end = artContentTextarea.selectionEnd;
      const text = artContentTextarea.value;
      const selected = text.substring(start, end);

      let replacement = '';
      if (tag === '**' || tag === '*') {
        replacement = `${tag}${selected || 'testo'}${tag}`;
      } else {
        replacement = `${tag}${selected}`;
      }

      artContentTextarea.value = text.substring(0, start) + replacement + text.substring(end);
      artContentTextarea.focus();
    });
  });

  function resetFormToCreateMode() {
    articleForm.reset();
    editingArticleIdInput.value = '';
    activeCoverImageData = '';
    artFileInput.value = '';
    fileSelectedBadge.style.display = 'none';
    
    currentFit = 'cover';
    currentRatio = '16/9';
    currentPos = 'center';
    currentFont = 'sans';
    currentTitleColor = '#ffffff';
    currentTextColor = '#e2e8f0';

    updateCropButtonsUI();
    updateTypographyUI();
    updateImagePreview('');

    tabCreateLabel.textContent = 'Crea Articolo';
    editorTitleLabel.textContent = 'Titolo Articolo';
    submitFormBtn.innerHTML = 'Pubblica Articolo';
    cancelEditBtn.style.display = 'none';
  }

  cancelEditBtn.addEventListener('click', () => {
    resetFormToCreateMode();
    showToast('Modifica annullata.');
  });

  function startEditingArticle(article) {
    editingArticleIdInput.value = article.id;
    document.getElementById('artTitle').value = article.title || '';
    document.getElementById('artExcerpt').value = article.excerpt || '';
    
    const catRadio = document.querySelector(`input[name="artCategory"][value="${article.category}"]`);
    if (catRadio) catRadio.checked = true;

    document.getElementById('artAuthor').value = article.author || 'Admin';
    document.getElementById('artReadTime').value = article.readTime || '2 min';
    document.getElementById('artContent').value = article.content || '';

    if (article.image && article.image.startsWith('data:')) {
      artImageInput.value = '';
      fileSelectedBadge.style.display = 'inline-block';
      fileSelectedBadge.textContent = 'Immagine da dispositivo';
    } else {
      artImageInput.value = article.image || '';
      fileSelectedBadge.style.display = 'none';
    }

    currentFit = article.imageFit || 'cover';
    currentRatio = article.imageRatio || '16/9';
    currentPos = article.imagePos || 'center';
    currentFont = article.fontFamily || 'sans';
    currentTitleColor = article.titleColor || '#ffffff';
    currentTextColor = article.textColor || '#e2e8f0';

    updateCropButtonsUI();
    updateTypographyUI();
    updateImagePreview(article.image || '');

    tabCreateLabel.textContent = 'Modifica Articolo';
    editorTitleLabel.textContent = 'Modifica Titolo Articolo';
    submitFormBtn.innerHTML = 'Salva Modifiche';
    cancelEditBtn.style.display = 'inline-flex';

    tabCreateBtn.click();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Stai modificando "${article.title}"`);
  }

  function renderAdminTable(articles) {
    totalArticlesBadge.textContent = articles.length;

    if (articles.length === 0) {
      articlesTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
            Nessun articolo presente. Creane uno nuovo.
          </td>
        </tr>
      `;
      return;
    }

    articlesTableBody.innerHTML = articles.map(art => `
      <tr>
        <td>
          <img src="${art.image}" alt="${art.title}" class="table-article-thumb" onError="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'">
        </td>
        <td class="table-article-title" style="font-family: ${art.fontFamily === 'serif' ? 'Playfair Display' : (art.fontFamily === 'mono' ? 'Courier Prime' : (art.fontFamily === 'display' ? 'Outfit' : 'Inter'))}; color: ${art.titleColor || '#ffffff'};">${art.title}</td>
        <td>
          <span style="background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); color: var(--text-secondary); padding: 0.25rem 0.65rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 500;">
            ${art.category}
          </span>
        </td>
        <td style="color: var(--text-muted); font-size: 0.8rem;">
          ${new Date(art.createdAt).toLocaleDateString('it-IT')}
        </td>
        <td>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-edit-art" data-id="${art.id}" style="padding: 0.3rem 0.65rem; font-size: 0.78rem;">
              Modifica
            </button>
            <button class="btn btn-danger btn-delete-art" data-id="${art.id}" style="padding: 0.3rem 0.65rem; font-size: 0.78rem;">
              Elimina
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    articlesTableBody.querySelectorAll('.btn-edit-art').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const article = articles.find(a => a.id === id);
        if (article) startEditingArticle(article);
      });
    });

    articlesTableBody.querySelectorAll('.btn-delete-art').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Sei sicuro di voler eliminare questo articolo?')) {
          const success = await window.baas.deleteArticle(id);
          if (success) {
            showToast('Articolo eliminato!', 'danger');
          }
        }
      });
    });
  }

  articleForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const editingId = editingArticleIdInput.value;
    const title = document.getElementById('artTitle').value;
    const excerpt = document.getElementById('artExcerpt').value;
    const category = document.querySelector('input[name="artCategory"]:checked').value;
    const author = document.getElementById('artAuthor').value;
    const readTime = document.getElementById('artReadTime').value;
    const content = document.getElementById('artContent').value;

    const payload = {
      title,
      category,
      image: activeCoverImageData || artImageInput.value || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      imageFit: currentFit,
      imageRatio: currentRatio,
      imagePos: currentPos,
      fontFamily: currentFont,
      titleColor: currentTitleColor,
      textColor: currentTextColor,
      readTime,
      content,
      excerpt: excerpt.trim() !== '' ? excerpt : (content.length > 140 ? content.substring(0, 140) + '...' : content),
      author: author || 'Admin'
    };

    if (editingId) {
      const updatedArt = await window.baas.updateArticle(editingId, payload);
      resetFormToCreateMode();
      showToast(`Articolo "${updatedArt.title}" aggiornato!`);
    } else {
      const newArt = await window.baas.addArticle(payload);
      resetFormToCreateMode();
      showToast(`Articolo "${newArt.title}" pubblicato!`);
    }
  });

  resetDataBtn.addEventListener('click', () => {
    if (confirm('Sei sicuro di voler eliminare TUTTI gli articoli dal database?')) {
      window.baas.clearAllArticles();
      resetFormToCreateMode();
      showToast('Tutti gli articoli sono stati eliminati!');
    }
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
          wpImportStatus.textContent = `✅ Importazione completata! ${count} articoli aggiunti con successo al database.`;
        }

      } catch (err) {
        console.error('Errore importazione WordPress:', err);
        showToast('Errore durante l\'importazione: ' + err.message, 'error');
        if (wpImportStatus) {
          wpImportStatus.style.color = '#ef4444';
          wpImportStatus.textContent = `❌ Errore: ${err.message}. Prova ad utilizzare l'Opzione 2 (caricamento del file XML esportato da WordPress).`;
        }
      } finally {
        startWpFetchBtn.disabled = false;
        startWpFetchBtn.textContent = '🚀 Avvia Importazione Automatica';
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
            fileImportStatus.textContent = `✅ Importazione completata! ${count} articoli aggiunti dal file.`;
          }
          jsonImportFileInput.value = '';

        } catch (err) {
          console.error('Errore lettura file:', err);
          showToast('Errore nel file: ' + err.message, 'error');
          if (fileImportStatus) {
            fileImportStatus.style.color = '#ef4444';
            fileImportStatus.textContent = `❌ Errore: ${err.message}`;
          }
        }
      };
      reader.readAsText(file);
    });
  }

  window.baas.subscribe((articles) => {
    renderAdminTable(articles);
  });

  checkAuth();
});
