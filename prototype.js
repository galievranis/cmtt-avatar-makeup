(() => {
  const status = document.createElement('div');
  status.className = 'prototype-status';
  status.setAttribute('role', 'status');
  document.body.append(status);
  let statusTimer;
  const announce = message => {
    status.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { status.textContent = ''; }, 3000);
  };
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
  const saved = read('prototype-bookmarks');
  const follows = read('prototype-follows');
  const persist = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch {} };
  const contentKey = el => el.closest('.content')?.querySelector('.content-title')?.textContent.trim() || document.title;
  const authorKey = el => el.closest('.content-header')?.querySelector('.author__name')?.textContent.trim() || document.querySelector('.subsite-card__name h1')?.textContent.trim() || 'Блог';
  const updateFollow = (button, active) => {
    button.textContent = active ? 'Вы подписаны' : 'Подписаться';
    button.setAttribute('aria-pressed', String(active));
  };
  document.querySelectorAll('button').forEach(button => {
    if (button.textContent.trim() === 'Подписаться') {
      button.dataset.follow = authorKey(button);
      updateFollow(button, !!follows[button.dataset.follow]);
    }
    if (button.matches('.bookmark-button') || /закладки/.test(button.title)) {
      button.dataset.bookmark = contentKey(button);
      const active = !!saved[button.dataset.bookmark];
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', active ? 'Убрать из закладок' : 'Добавить в закладки');
    }
  });
  const account = document.querySelector('.account-button');
  account?.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); location.href = './blog.html'; }
  });
  let menu, menuTrigger;
  const closeMenu = (restore = false) => {
    menu?.remove(); menu = null;
    menuTrigger?.setAttribute('aria-expanded', 'false');
    if (restore) menuTrigger?.focus();
  };
  const openMenu = trigger => {
    closeMenu(); menuTrigger = trigger;
    menu = document.createElement('div'); menu.className = 'prototype-popover'; menu.setAttribute('role', 'menu');
    const link = document.createElement('a'); link.href = './blog.html'; link.textContent = 'Открыть блог'; link.setAttribute('role', 'menuitem'); menu.append(link);
    const bookmark = document.createElement('button'); bookmark.type = 'button'; bookmark.textContent = 'В закладки'; bookmark.setAttribute('role', 'menuitem');
    bookmark.onclick = () => {
      const key = contentKey(trigger); saved[key] = !saved[key]; persist('prototype-bookmarks', saved);
      announce(saved[key] ? 'Пост сохранён' : 'Пост удалён из закладок'); closeMenu(true);
    };
    menu.append(bookmark); document.body.append(menu);
    const rect = trigger.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(rect.right - 200, innerWidth - 216)) + 'px';
    menu.style.top = Math.max(8, Math.min(rect.bottom + 6, innerHeight - menu.offsetHeight - 8)) + 'px';
    trigger.setAttribute('aria-expanded', 'true'); link.focus();
  };
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(true); });
  document.addEventListener('click', event => {
    if (menu && !menu.contains(event.target) && !menuTrigger?.contains(event.target)) closeMenu();
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.follow) {
      const key = button.dataset.follow; follows[key] = !follows[key]; persist('prototype-follows', follows);
      document.querySelectorAll('[data-follow]').forEach(other => { if (other.dataset.follow === key) updateFollow(other, follows[key]); });
    } else if (button.dataset.bookmark) {
      const key = button.dataset.bookmark; saved[key] = !saved[key]; persist('prototype-bookmarks', saved);
      document.querySelectorAll('[data-bookmark]').forEach(other => {
        if (other.dataset.bookmark !== key) return;
        other.setAttribute('aria-pressed', String(!!saved[key]));
        other.setAttribute('aria-label', saved[key] ? 'Убрать из закладок' : 'Добавить в закладки');
        const use = other.querySelector('use'); if (use) use.setAttribute('href', saved[key] ? '#sprite-bookmark_active' : '#sprite-bookmark');
      });
      announce(saved[key] ? 'Пост сохранён' : 'Пост удалён из закладок');
    } else if (button.querySelector('.icon--dots')) {
      openMenu(button);
    } else if (button.textContent.trim() === 'Показать полностью') {
      const content = button.closest('.content'); content?.classList.add('prototype-expanded'); button.hidden = true;
      if (content && !/post(?:\.html)?\/?$/.test(location.pathname)) {
        const link = document.createElement('a'); link.href = './post.html'; link.className = 'link-button link-button--default'; link.textContent = 'Читать статью'; button.after(link);
      }
    } else if (button.matches('.sidebar__title--collapsible')) {
      const section = button.closest('.sidebar__section'); const children = section?.querySelector('.sidebar__section-content');
      if (children) { children.hidden = !children.hidden; button.setAttribute('aria-expanded', String(!children.hidden)); }
    }
  });
  const tabs = document.querySelectorAll('.subsite-tabs a, .subsite-tabs button');
  const feed = document.querySelector('.blog-page > .content-list');
  if (feed) tabs.forEach(tab => tab.addEventListener('click', event => {
    event.preventDefault();
    const comments = tab.textContent.trim() === 'Комментарии';
    feed.hidden = comments;
    let panel = document.querySelector('.prototype-comments');
    if (!panel) {
      panel = document.createElement('section'); panel.className = 'prototype-comments';
      const title = document.createElement('h2'); title.textContent = 'Комментарии автора'; panel.append(title);
      const text = document.createElement('p'); text.textContent = 'В демонстрационном профиле пока нет комментариев.'; panel.append(text); feed.after(panel);
    }
    panel.hidden = !comments;
    tabs.forEach(other => { other.setAttribute('aria-current', other === tab ? 'page' : 'false'); other.classList.toggle('tabs__tab--active', other === tab); });
  }));
})();
