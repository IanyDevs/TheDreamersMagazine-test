/* ==========================================================================
   BaaS Service - Unified Backend-as-a-Service Layer
   ========================================================================== */

class BaasService {
  constructor() {
    this.STORAGE_KEY = 'baas_blog_articles_v1';
    this.LISTENERS = [];
    this.broadcastChannel = null;
    
    this.initLocalEngine();
  }

  initLocalEngine() {
    // Clear everything in localStorage as requested by user
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));

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
      callback(this.getArticles());
    }
    return () => {
      this.LISTENERS = this.LISTENERS.filter(fn => fn !== callback);
    };
  }

  notifyListeners(articles) {
    this.LISTENERS.forEach(callback => callback(articles));
  }

  getArticles() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading articles from BaaS:', e);
      return [];
    }
  }

  async addArticle(articleData) {
    const articles = this.getArticles();
    
    const newArticle = {
      id: 'art-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: articleData.title.trim(),
      category: articleData.category || 'Categoria 1',
      image: articleData.image.trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
      imageFit: articleData.imageFit || 'cover',
      imageRatio: articleData.imageRatio || '16/9',
      imagePos: articleData.imagePos || 'center',
      fontFamily: articleData.fontFamily || 'sans',
      titleColor: articleData.titleColor || '#ffffff',
      textColor: articleData.textColor || '#e2e8f0',
      excerpt: articleData.excerpt.trim() || articleData.content.substring(0, 140) + '...',
      content: articleData.content.trim(),
      author: articleData.author || 'Admin',
      createdAt: new Date().toISOString(),
      readTime: articleData.readTime || '2 min'
    };

    articles.unshift(newArticle);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));

    this.notifyListeners(articles);
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'ARTICLES_UPDATED', articles });
    }

    return newArticle;
  }

  async updateArticle(id, updatedData) {
    let articles = this.getArticles();
    const index = articles.findIndex(art => art.id === id);

    if (index !== -1) {
      articles[index] = {
        ...articles[index],
        title: updatedData.title.trim(),
        category: updatedData.category || articles[index].category,
        image: updatedData.image ? updatedData.image.trim() : articles[index].image,
        imageFit: updatedData.imageFit || articles[index].imageFit || 'cover',
        imageRatio: updatedData.imageRatio || articles[index].imageRatio || '16/9',
        imagePos: updatedData.imagePos || articles[index].imagePos || 'center',
        fontFamily: updatedData.fontFamily || articles[index].fontFamily || 'sans',
        titleColor: updatedData.titleColor || articles[index].titleColor || '#ffffff',
        textColor: updatedData.textColor || articles[index].textColor || '#e2e8f0',
        excerpt: updatedData.excerpt.trim() || articles[index].excerpt,
        content: updatedData.content.trim(),
        author: updatedData.author || articles[index].author,
        readTime: updatedData.readTime || articles[index].readTime,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));

      this.notifyListeners(articles);
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'ARTICLES_UPDATED', articles });
      }
      return articles[index];
    }
    return null;
  }

  async deleteArticle(id) {
    let articles = this.getArticles();
    const initialLength = articles.length;
    
    articles = articles.filter(art => art.id !== id);

    if (articles.length !== initialLength) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));
      
      this.notifyListeners(articles);
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'ARTICLES_UPDATED', articles });
      }
      return true;
    }
    return false;
  }

  async bulkImportArticles(importedArray, overwrite = false) {
    let currentArticles = overwrite ? [] : this.getArticles();
    let importedCount = 0;

    importedArray.forEach((art, index) => {
      const exists = currentArticles.some(existing => 
        existing.id === art.id || 
        (existing.title && art.title && existing.title.toLowerCase().trim() === art.title.toLowerCase().trim())
      );

      if (!exists || overwrite) {
        const formattedArt = {
          id: art.id || ('art-wp-' + Date.now() + '-' + index),
          title: (art.title || 'Senza Titolo').trim(),
          category: art.category || 'News',
          image: art.image || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
          imageFit: art.imageFit || 'cover',
          imageRatio: art.imageRatio || '16/9',
          imagePos: art.imagePos || 'center',
          fontFamily: art.fontFamily || 'sans',
          titleColor: art.titleColor || '#ffffff',
          textColor: art.textColor || '#e2e8f0',
          excerpt: art.excerpt ? art.excerpt.replace(/<[^>]*>?/gm, '').trim() : (art.content ? art.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' : ''),
          content: art.content ? art.content.trim() : '',
          author: art.author || 'Redazione',
          createdAt: art.createdAt || new Date().toISOString(),
          readTime: art.readTime || '3 min'
        };

        currentArticles.unshift(formattedArt);
        importedCount++;
      }
    });

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentArticles));
    this.notifyListeners(currentArticles);
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'ARTICLES_UPDATED', articles: currentArticles });
    }

    return importedCount;
  }

  clearAllArticles() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    this.notifyListeners([]);
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'ARTICLES_UPDATED', articles: [] });
    }
  }

  resetToMockData() {
    this.clearAllArticles();
  }
}

window.baas = new BaasService();
