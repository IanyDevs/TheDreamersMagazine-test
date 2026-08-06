/* ==========================================================================
   BaaS Service - Unified Backend-as-a-Service Layer
   Supporta MySQL locale/Aruba (api/articoli.php) e fallback LocalStorage
   ========================================================================== */

class BaasService {
  constructor() {
    this.STORAGE_KEY = 'baas_blog_articles_v1';
    this.LISTENERS = [];
    this.broadcastChannel = null;
    this.API_URL = 'api/articoli.php';
    
    this.initLocalEngine();
  }

  initLocalEngine() {
    if ('BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('baas_blog_sync_channel');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'ARTICLES_UPDATED') {
          this.notifyListeners(event.data.articles);
        }
      };
    }
  }

  subscribe(callback) {
    if (typeof callback === 'function') {
      this.LISTENERS.push(callback);
      // Caricamento iniziale asincrono da MySQL o LocalStorage
      this.loadArticlesFromBackend().then(articles => callback(articles));
    }
    return () => {
      this.LISTENERS = this.LISTENERS.filter(fn => fn !== callback);
    };
  }

  notifyListeners(articles) {
    this.LISTENERS.forEach(callback => {
      try { callback(articles); } catch (e) {}
    });
  }

  async loadArticlesFromBackend() {
    try {
      const response = await fetch(`${this.API_URL}?action=list&_t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.articles)) {
          const localArticles = this.getArticlesFromLocal();
          
          const mergedMap = new Map();
          // Prima carica gli articoli dal backend MySQL/SQLite
          data.articles.forEach(art => {
            if (art && art.id) mergedMap.set(String(art.id), art);
          });
          // Poi unisci gli articoli creati o salvati in locale che non sono ancora a DB (ID temporanei "art-")
          localArticles.forEach(art => {
            if (art && art.id && String(art.id).startsWith('art-') && !mergedMap.has(String(art.id))) {
              mergedMap.set(String(art.id), art);
            }
          });
          
          const finalArticles = Array.from(mergedMap.values());
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(finalArticles));
          return finalArticles;
        }
      }
    } catch (err) {
      console.warn('Connessione al backend MySQL non riuscita, uso LocalStorage:', err);
    }
    return this.getArticlesFromLocal();
  }

  getArticlesFromLocal() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading articles from BaaS:', e);
      return [];
    }
  }

  getArticles() {
    return this.getArticlesFromLocal();
  }

  async addArticle(articleData) {
    let createdArticle = null;

    // 1. Invio a MySQL via API PHP
    try {
      const response = await fetch(`${this.API_URL}?action=create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.id) {
          createdArticle = {
            id: String(result.id),
            ...articleData,
            createdAt: new Date().toISOString()
          };
        }
      }
    } catch (err) {
      console.warn('Salvataggio su MySQL non disponibile, salvo in LocalStorage:', err);
    }

    if (!createdArticle) {
      createdArticle = {
        id: 'art-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        ...articleData,
        createdAt: new Date().toISOString()
      };
    }

    // 2. Salva SEMPRE in LocalStorage immediatamente per risposta istantanea
    const articles = this.getArticlesFromLocal();
    const existingIdx = articles.findIndex(a => String(a.id) === String(createdArticle.id));
    if (existingIdx >= 0) {
      articles[existingIdx] = createdArticle;
    } else {
      articles.unshift(createdArticle);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));

    // 3. Notifica tutte le schede aperte
    this.notifyListeners(articles);
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'ARTICLES_UPDATED', articles });
    }

    // 4. Sincronizzazione di sfondo da DB
    this.loadArticlesFromBackend().then(fresh => {
      if (Array.isArray(fresh) && fresh.length > 0) {
        this.notifyListeners(fresh);
      }
    });

    return createdArticle;
  }

  async updateArticle(id, updatedData) {
    let updatedArticle = { id: String(id), ...updatedData, updatedAt: new Date().toISOString() };

    try {
      const response = await fetch(`${this.API_URL}?action=update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedData, id })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          updatedArticle = { ...updatedArticle, ...result };
        }
      }
    } catch (err) {
      console.warn('Aggiornamento su MySQL non disponibile, uso LocalStorage:', err);
    }

    // Salva SEMPRE in LocalStorage
    let articles = this.getArticlesFromLocal();
    const index = articles.findIndex(art => String(art.id) === String(id));
    if (index !== -1) {
      articles[index] = { ...articles[index], ...updatedArticle };
    } else {
      articles.unshift(updatedArticle);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));

    this.notifyListeners(articles);
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'ARTICLES_UPDATED', articles });
    }

    return updatedArticle;
  }

  async deleteArticle(id) {
    try {
      await fetch(`${this.API_URL}?action=delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (err) {
      console.warn('Eliminazione su MySQL non disponibile:', err);
    }

    let articles = this.getArticlesFromLocal();
    articles = articles.filter(art => String(art.id) !== String(id));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));

    this.notifyListeners(articles);
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'ARTICLES_UPDATED', articles });
    }
    return true;
  }

  clearAllArticles() {
    try {
      fetch(`${this.API_URL}?action=clear`, { method: 'POST' });
    } catch (e) {}

    localStorage.removeItem(this.STORAGE_KEY);
    this.notifyListeners([]);
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'ARTICLES_UPDATED', articles: [] });
    }
  }
}

window.baas = new BaasService();
