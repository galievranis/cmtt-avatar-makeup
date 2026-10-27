(() => {
  const trigger = document.querySelector('.blog-page .subsite-avatar');
  if (!trigger) return;
  const storageKey = 'prototype-profile-appearance';
  let preferences = {};
  try { preferences = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch {}
  const validFrame = value => Number.isInteger(value) && value >= 0 && value <= 9;
  if (!validFrame(preferences.frame)) delete preferences.frame;
  if (!/^data:image\/(png|jpeg|webp);base64,/.test(preferences.avatar || '')) delete preferences.avatar;
  const originalAvatar = trigger.querySelector('picture img');
  const originalSrc = originalAvatar.src;
  const profileAvatars = [...document.querySelectorAll('.blog-page .subsite-avatar, .blog-page .author__avatar')];
  const currentSrc = () => preferences.avatar || originalSrc;
  const status = document.createElement('span'); status.className = 'prototype-status'; status.setAttribute('role', 'status'); document.body.append(status);
  let timer;
  const announce = message => { status.textContent = message; clearTimeout(timer); timer = setTimeout(() => status.textContent = '', 3000); };
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch { announce('Выбор применён, но браузер не смог его сохранить.'); } };
  const apply = () => {
    profileAvatars.forEach(avatar => {
      if (preferences.avatar) {
        const picture = avatar.querySelector('picture');
        picture?.querySelectorAll('source').forEach(source => source.removeAttribute('srcset'));
        const image = picture?.querySelector('img'); if (image) image.src = preferences.avatar;
      }
      let frame = avatar.querySelector(':scope > .avatar-frame');
      if (validFrame(preferences.frame)) {
        if (preferences.frame === 0) { if (frame) frame.hidden = true; }
        else {
          if (!frame) { frame = document.createElement('img'); frame.className = 'avatar-frame'; frame.alt = ''; frame.setAttribute('aria-hidden', 'true'); avatar.append(frame); }
          frame.src = './frames/' + preferences.frame + '.webp'; frame.hidden = false;
        }
      } else if (frame) frame.hidden = false;
    });
  };
  apply();
  trigger.setAttribute('role', 'button'); trigger.tabIndex = 0;
  trigger.setAttribute('aria-label', 'Меню аватарки'); trigger.setAttribute('aria-haspopup', 'menu'); trigger.setAttribute('aria-expanded', 'false');
  const menu = document.createElement('div'); menu.className = 'avatar-menu'; menu.hidden = true; menu.id = 'profile-avatar-menu'; menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', 'Аватарка'); trigger.setAttribute('aria-controls', menu.id);
  const picker = document.createElement('section'); picker.className = 'frame-picker'; picker.hidden = true; picker.id = 'profile-frame-picker'; picker.setAttribute('role', 'dialog'); picker.setAttribute('aria-labelledby', 'frame-picker-title');
  const header = document.createElement('div'); header.className = 'frame-picker__header';
  const title = document.createElement('h2'); title.id = 'frame-picker-title'; title.textContent = 'Рамка';
  const close = document.createElement('button'); close.type = 'button'; close.className = 'frame-picker__close'; close.setAttribute('aria-label', 'Закрыть выбор рамки');
  const cross = document.createElement('img'); cross.src = './icons/cross.svg'; cross.alt = ''; close.append(cross); header.append(title, close);
  const grid = document.createElement('div'); grid.className = 'frame-picker__grid'; grid.setAttribute('role', 'radiogroup'); grid.setAttribute('aria-label', 'Рамки аватарки');
  const hint = document.createElement('p'); hint.className = 'frame-picker__hint'; hint.textContent = 'Выбранная рамка сохранится после обновления страницы.';
  picker.append(header, grid, hint); document.body.append(menu, picker);
  const position = () => {
    const anchor = trigger.getBoundingClientRect();
    const bound = document.documentElement.clientWidth;
    menu.style.left = Math.max(12, Math.min(anchor.left, bound - menu.offsetWidth - 12)) + 'px';
    menu.style.top = Math.max(68, Math.min(anchor.bottom + 8, innerHeight - menu.offsetHeight - 12)) + 'px';
    if (!picker.hidden) {
      const rect = menu.getBoundingClientRect();
      const right = rect.right + 8;
      picker.style.left = (right + picker.offsetWidth <= bound - 12 ? right : Math.max(12, Math.min(rect.left, bound - picker.offsetWidth - 12))) + 'px';
      picker.style.top = Math.max(68, Math.min(right + picker.offsetWidth <= bound - 12 ? rect.top : rect.bottom + 8, innerHeight - picker.offsetHeight - 12)) + 'px';
    }
  };
  let frameItem;
  const closeAll = (restore = false) => { menu.hidden = picker.hidden = true; trigger.setAttribute('aria-expanded', 'false'); frameItem?.setAttribute('aria-expanded', 'false'); if (restore) trigger.focus(); };
  const menuItem = (label, icon, action) => {
    const button = document.createElement('button'); button.type = 'button'; button.setAttribute('role', 'menuitem');
    const image = document.createElement('span'); image.className = 'menu-icon'; image.style.setProperty('--icon', `url("./icons/${icon}.svg")`); image.setAttribute('aria-hidden', 'true');
    button.append(image, document.createTextNode(label)); button.addEventListener('click', action); menu.append(button); return button;
  };
  const viewer = document.createElement('dialog'); viewer.className = 'avatar-viewer'; viewer.setAttribute('aria-labelledby', 'avatar-view-title');
  const viewerHeader = document.createElement('div'); viewerHeader.className = 'avatar-viewer__header';
  const viewerTitle = document.createElement('h2'); viewerTitle.id = 'avatar-view-title'; viewerTitle.textContent = 'Аватарка';
  const viewerClose = close.cloneNode(true); viewerClose.setAttribute('aria-label', 'Закрыть аватарку'); viewerClose.onclick = () => viewer.close(); viewerHeader.append(viewerTitle, viewerClose);
  const viewerPicture = document.createElement('div'); viewerPicture.className = 'avatar-viewer__picture'; viewer.append(viewerHeader, viewerPicture); document.body.append(viewer);
  viewer.addEventListener('click', event => { if (event.target === viewer && (event.clientX < viewer.getBoundingClientRect().left || event.clientX > viewer.getBoundingClientRect().right || event.clientY < viewer.getBoundingClientRect().top || event.clientY > viewer.getBoundingClientRect().bottom)) viewer.close(); });
  viewer.addEventListener('close', () => trigger.focus());
  menuItem('Посмотреть', 'image', () => {
    closeAll(); viewerPicture.replaceChildren(); const image = document.createElement('img'); image.src = currentSrc(); image.alt = 'Аватарка автора блога'; viewerPicture.append(image);
    const frame = trigger.querySelector(':scope > .avatar-frame'); if (frame && !frame.hidden) { const decoration = frame.cloneNode(); decoration.className = 'viewer-frame'; viewerPicture.append(decoration); }
    viewer.showModal();
  });
  const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/png,image/jpeg,image/webp'; input.hidden = true; document.body.append(input);
  menuItem('Изменить', 'pen', () => { closeAll(); input.click(); });
  input.addEventListener('change', async () => {
    const file = input.files?.[0]; if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { announce('Выберите PNG, JPEG или WebP размером до 10 МБ.'); input.value = ''; return; }
    const url = URL.createObjectURL(file);
    try {
      const image = new Image(); image.src = url; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512; const context = canvas.getContext('2d');
      const size = Math.min(image.naturalWidth, image.naturalHeight); context.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, 512, 512);
      preferences.avatar = canvas.toDataURL('image/png'); save(); apply(); announce('Аватарка изменена в этом браузере.');
    } catch { announce('Не удалось открыть изображение.'); }
    finally { URL.revokeObjectURL(url); input.value = ''; trigger.focus(); }
  });
  const names = ['Глитч', 'Шляпа', 'Геймер', 'Ушки', 'Золотая', 'Эффект', 'Космос', 'Огонь', 'Civitai'];
  const renderChoices = () => {
    grid.replaceChildren();
    const options = [{value:null, label:'Случайная'}, {value:0, label:'Без рамки'}, ...names.map((label, i) => ({value:i+1, label}))];
    options.forEach(option => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'frame-choice'; button.setAttribute('role', 'radio'); button.setAttribute('aria-label', option.label);
      const selected = option.value === (preferences.frame ?? null); button.setAttribute('aria-checked', String(selected)); button.tabIndex = selected ? 0 : -1;
      if (option.value === null || option.value === 0) { const label = document.createElement('span'); label.className = 'frame-choice__label'; label.textContent = option.label; button.append(label); }
      else { const image = document.createElement('img'); image.src = currentSrc(); image.alt = ''; image.className = 'frame-choice__avatar'; const decoration = document.createElement('img'); decoration.src = './frames/' + option.value + '.webp'; decoration.alt = ''; decoration.className = 'frame-choice__decoration'; button.append(image, decoration); }
      button.addEventListener('click', () => {
        if (option.value === null) {
          delete preferences.frame;
          profileAvatars.forEach(avatar => { const frame = avatar.querySelector(':scope > .avatar-frame'); if (frame) { frame.src = './frames/' + (Math.floor(Math.random() * 9) + 1) + '.webp'; frame.hidden = false; } });
        } else preferences.frame = option.value;
        save(); apply(); closeAll(true); announce(option.value === null ? 'Включены случайные рамки.' : option.value === 0 ? 'Рамка убрана.' : 'Рамка выбрана.');
      }); grid.append(button);
    });
  };
  frameItem = menuItem('Рамка', 'theme', () => { picker.hidden = !picker.hidden; frameItem.setAttribute('aria-expanded', String(!picker.hidden)); if (!picker.hidden) { renderChoices(); position(); grid.querySelector('[aria-checked=true]').focus(); } });
  frameItem.setAttribute('aria-haspopup', 'dialog'); frameItem.setAttribute('aria-controls', picker.id); frameItem.setAttribute('aria-expanded', 'false');
  close.onclick = () => { picker.hidden = true; frameItem.setAttribute('aria-expanded', 'false'); frameItem.focus(); };
  trigger.addEventListener('click', () => { const opening = menu.hidden; closeAll(); if (opening) { menu.hidden = false; trigger.setAttribute('aria-expanded', 'true'); position(); menu.querySelector('button').focus(); } });
  trigger.addEventListener('keydown', event => { if (['Enter', ' ', 'ArrowDown'].includes(event.key)) { event.preventDefault(); trigger.click(); } });
  document.addEventListener('pointerdown', event => { if (!trigger.contains(event.target) && !menu.contains(event.target) && !picker.contains(event.target)) closeAll(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); if (!picker.hidden) close.click(); else closeAll(true); }
    const items = !picker.hidden && grid.contains(document.activeElement) ? [...grid.querySelectorAll('button')] : !menu.hidden && menu.contains(document.activeElement) ? [...menu.querySelectorAll('button')] : [];
    if (!items.length || !['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); const index = items.indexOf(document.activeElement); const step = !picker.hidden && ['ArrowDown', 'ArrowUp'].includes(event.key) ? 4 : 1;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (['ArrowDown', 'ArrowRight'].includes(event.key) ? step : -step) + items.length) % items.length; items[next].focus();
  });
  window.addEventListener('resize', () => { if (!menu.hidden) position(); });
  window.addEventListener('scroll', () => { if (!menu.hidden) closeAll(); }, {passive:true});
})();
