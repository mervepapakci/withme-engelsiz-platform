/**
 * BeVoys App - Ortak Bileşenler
 * Sidebar, Bottom Nav, Toast
 *
 * NOT: Bu dosyadaki tüm DOM içerikleri statik/güvenilir kaynaklardan
 * oluşturulmaktadır. Kullanıcı girdisi doğrudan DOM'a eklenmez.
 */

const BeVoysComponents = {

  // Geçerli sayfayı belirle (klasör tabanlı URL'ler için)
  getCurrentPage() {
    const path = window.location.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '');
    const segments = path.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    const pages = ['etkinlikler', 'etkinlik-detay', 'etkinlik-olustur', 'stklar', 'haklar', 'derdini-anlat', 'geri-bildirim'];
    if (pages.includes(lastSegment)) return lastSegment;
    // Sub-pages: derdini-anlat/yeni → derdini-anlat
    const parentSegment = segments[segments.length - 2];
    if (parentSegment && pages.includes(parentSegment)) return parentSegment;
    return 'index';
  },

  // Güvenli element oluşturma yardımcısı
  createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, val]) => {
      if (key === 'className') el.className = val;
      else if (key === 'textContent') el.textContent = val;
      else el.setAttribute(key, val);
    });
    children.forEach(child => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else {
        el.appendChild(child);
      }
    });
    return el;
  },

  // Lucide ikon elementi oluştur (data-lucide kullanır)
  createIcon(name, extraClass) {
    const attrs = { 'data-lucide': name, 'aria-hidden': 'true' };
    if (extraClass) attrs.className = extraClass;
    return this.createElement('i', attrs);
  },

  // Nav link oluştur
  createNavLink(href, iconName, label, isActive) {
    const a = this.createElement('a', {
      href,
      className: isActive ? 'active' : '',
      ...(isActive && { 'aria-current': 'page' })
    });
    a.appendChild(this.createIcon(iconName));
    a.appendChild(document.createTextNode(' ' + label));
    return a;
  },

  // Desktop Sidebar oluştur
  renderSidebar() {
    const current = this.getCurrentPage();
    const navItems = [
      { href: './', icon: 'house', label: 'Ana Sayfa', page: 'index' },
      { href: 'etkinlikler/', icon: 'calendar', label: 'Etkinlikler', pages: ['etkinlikler', 'etkinlik-detay', 'etkinlik-olustur'] },
      { href: 'stklar/', icon: 'users', label: 'STKlar', page: 'stklar' },
      { href: 'haklar/', icon: 'scale', label: 'Haklar', page: 'haklar' },
      { href: 'derdini-anlat/', icon: 'message-square', label: 'Derdini Anlat', page: 'derdini-anlat' },
      { href: 'geri-bildirim/', icon: 'message-circle', label: 'Geri Bildirim', page: 'geri-bildirim' }
    ];

    const sidebar = this.createElement('aside', {
      className: 'sidebar',
      role: 'navigation',
      'aria-label': 'Ana menü'
    });

    // Logo
    const logoDiv = this.createElement('div', { className: 'sidebar-logo' });
    logoDiv.appendChild(this.createIcon('heart-handshake'));
    logoDiv.appendChild(this.createElement('span', { textContent: 'BeVoys' }));
    sidebar.appendChild(logoDiv);

    // Nav
    const nav = this.createElement('nav', { className: 'sidebar-nav' });
    navItems.forEach(item => {
      const isActive = item.page === current || (item.pages && item.pages.includes(current));
      nav.appendChild(this.createNavLink(item.href, item.icon, item.label, isActive));
    });
    sidebar.appendChild(nav);

    // Tema toggle butonu (Geri Bildirim'in altında)
    this.renderThemeToggle(sidebar);

    document.body.prepend(sidebar);
  },

  // Mobile Bottom Navigation oluştur
  renderBottomNav() {
    const current = this.getCurrentPage();
    const tabs = [
      { href: './', icon: 'house', label: 'Ana Sayfa', page: 'index' },
      { href: 'etkinlikler/', icon: 'calendar', label: 'Etkinlikler', pages: ['etkinlikler', 'etkinlik-detay', 'etkinlik-olustur'] },
      { href: 'haklar/', icon: 'scale', label: 'Haklar', page: 'haklar' },
      { href: 'stklar/', icon: 'users', label: 'STKlar', page: 'stklar' },
      { href: 'geri-bildirim/', icon: 'message-circle', label: 'Daha Fazla', pages: ['geri-bildirim', 'derdini-anlat'] }
    ];

    const nav = this.createElement('nav', {
      className: 'bottom-nav',
      role: 'navigation',
      'aria-label': 'Alt menü'
    });

    tabs.forEach(tab => {
      const isActive = tab.page === current || (tab.pages && tab.pages.includes(current));
      nav.appendChild(this.createNavLink(tab.href, tab.icon, tab.label, isActive));
    });

    document.body.appendChild(nav);
  },

  // Toast bildirimi göster
  showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = this.createElement('div', {
      className: `toast ${type}`,
      role: 'alert',
      textContent: message
    });
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Loading spinner göster
  showLoading(container) {
    container.textContent = '';
    const wrapper = this.createElement('div', { className: 'loading', role: 'status' });
    wrapper.appendChild(this.createElement('div', { className: 'spinner' }));
    wrapper.appendChild(this.createElement('span', { className: 'sr-only', textContent: 'Yükleniyor...' }));
    container.appendChild(wrapper);
  },

  // Lucide ikonlarını yenile (dinamik içerik sonrası çağır)
  refreshIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  // Tema yönetimi
  initTheme() {
    const saved = localStorage.getItem('bevoys-theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  },

  toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('bevoys-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('bevoys-theme', 'dark');
    }
    this.updateThemeIcons();
  },

  updateThemeIcons() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const iconName = isDark ? 'sun' : 'moon';
    const label = isDark ? 'Açık Mod' : 'Koyu Mod';

    document.querySelectorAll('.theme-toggle-icon').forEach(el => {
      el.setAttribute('data-lucide', iconName);
    });
    document.querySelectorAll('.theme-toggle-label').forEach(el => {
      el.textContent = label;
    });
    this.refreshIcons();
  },

  // Sidebar tema toggle butonu
  renderThemeToggle(container) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const btn = this.createElement('button', {
      className: 'theme-toggle',
      'aria-label': 'Tema değiştir'
    });
    const icon = this.createIcon(isDark ? 'sun' : 'moon');
    icon.classList.add('theme-toggle-icon');
    btn.appendChild(icon);
    const span = this.createElement('span', {
      className: 'theme-toggle-label',
      textContent: isDark ? 'Açık Mod' : 'Koyu Mod'
    });
    btn.appendChild(span);
    btn.addEventListener('click', () => this.toggleTheme());
    container.appendChild(btn);
  },

  // Mobil tema toggle butonu (sabit, sağ üst)
  renderMobileThemeToggle() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const btn = this.createElement('button', {
      className: 'theme-toggle-mobile',
      'aria-label': 'Tema değiştir'
    });
    const icon = this.createIcon(isDark ? 'sun' : 'moon');
    icon.classList.add('theme-toggle-icon');
    btn.appendChild(icon);
    btn.addEventListener('click', () => this.toggleTheme());
    document.body.appendChild(btn);
  },

  // Tüm ortak bileşenleri yükle
  init() {
    this.initTheme();
    this.renderSidebar();
    this.renderBottomNav();
    this.renderMobileThemeToggle();
    this.refreshIcons();
  }
};

// Sayfa yüklendiğinde bileşenleri oluştur
document.addEventListener('DOMContentLoaded', () => {
  BeVoysComponents.init();
});
