/**
 * WithMe App - Data Layer
 * JSON veri yükleme ve n8n webhook entegrasyonu
 */

const WithMeData = {
  // n8n Webhook URL'leri - Buraya kendi n8n instance URL'lerinizi yazın
  N8N_WEBHOOKS: {
    etkinlikOlustur: 'https://YOUR_N8N_DOMAIN/webhook/etkinlik-olustur',
    birlikteGit: 'https://YOUR_N8N_DOMAIN/webhook/birlikte-git',
    derdiniAnlat: 'https://n8n.fatiherencetin.com/webhook/derdini-anlat',
    geriBildirim: 'https://n8n.fatiherencetin.com/webhook/geri-bildirim'
  },

  // JSON verilerini yükle
  async loadJSON(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Veri yüklenemedi (${path}):`, error);
      return [];
    }
  },

  // n8n webhook'a POST gönder
  async postToWebhook(webhookKey, data) {
    const url = this.N8N_WEBHOOKS[webhookKey];
    if (!url || url.includes('YOUR_N8N_DOMAIN')) {
      console.warn('n8n webhook URL yapılandırılmamış:', webhookKey);
      // Geliştirme modunda simüle et
      return { success: true, simulated: true };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: 'withme-app'
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Webhook hatası (${webhookKey}):`, error);
      throw error;
    }
  },

  // Etkinlikleri yükle
  async getEtkinlikler() {
    return this.loadJSON('data/etkinlikler.json');
  },

  // Tek etkinlik getir
  async getEtkinlik(id) {
    const etkinlikler = await this.getEtkinlikler();
    return etkinlikler.find(e => e.id === parseInt(id));
  },

  // Hakları yükle
  async getHaklar() {
    return this.loadJSON('data/haklar.json');
  },

  // Tek hak getir
  async getHak(id) {
    const haklar = await this.getHaklar();
    return haklar.find(h => h.id === parseInt(id));
  },

  // STK'ları yükle
  async getStklar() {
    return this.loadJSON('data/stklar.json');
  },

  // Etkinlik oluştur -> n8n
  async createEtkinlik(formData) {
    return this.postToWebhook('etkinlikOlustur', formData);
  },

  // Derdini Anlat -> n8n
  async submitDert(formData) {
    return this.postToWebhook('derdiniAnlat', formData);
  },

  // Birlikte Gidelim -> n8n
  async birlikteGit(data) {
    return this.postToWebhook('birlikteGit', data);
  },

  // Geri Bildirim -> n8n
  async submitGeriBildirim(formData) {
    return this.postToWebhook('geriBildirim', formData);
  }
};

// Tarih formatlama yardımcısı
function formatTarih(tarihStr) {
  const date = new Date(tarihStr);
  const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const gunler = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return `${date.getDate()} ${aylar[date.getMonth()]} ${date.getFullYear()}, ${gunler[date.getDay()]}`;
}

// URL parametresi okuma
function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
