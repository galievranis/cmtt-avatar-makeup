(() => {
 const tree = document.querySelector('.comments-tree');
 if (tree) {
   const samples = [
     ['Алексей', 'Для повседневной съёмки разницу, наверное, заметят немногие. Интереснее посмотреть сравнение в одинаковых условиях.'],
     ['Мария', 'Хочется увидеть не только портреты, но и примеры ночью. Там новая камера могла бы быть полезнее.'],
     ['Дмитрий', 'Ремонтопригодность для меня важнее небольшого улучшения камеры. Телефон обычно покупаю на несколько лет.'],
     ['Анна', 'Если батарею можно заменить без сложной разборки, это уже хороший шаг.'],
     ['Илья', 'Жду подробного сравнения с прошлым поколением. По отдельным фотографиям сложно сделать вывод.'],
     ['Екатерина', 'В портретах важны ещё цвет и обработка кожи. Одним размытием фона качество не измерить.'],
     ['Никита', 'Было бы здорово увидеть стоимость замены камеры вместе с результатами разборки.'],
     ['Ольга', 'Пользуюсь старой моделью, пока всё устраивает. Такие обзоры помогают понять, стоит ли обновляться.'],
     ['Павел', 'Любопытно, как этот механизм поведёт себя через несколько лет. Подвижные детали всегда добавляют вопросов.']
   ];
   const templates = [...tree.querySelectorAll('.comment--root')];
   const avatarPool = [...document.querySelectorAll('.author__avatar')];
   samples.forEach(([name, text], index) => {
     const comment = templates[index % templates.length].cloneNode(true);
     comment.dataset.id = 'demo-' + index;
     comment.querySelector('.author__name').textContent = name;
     comment.querySelector('.comment-text').textContent = text;
     comment.querySelectorAll('.comment__expand, .comment-reactions').forEach(el => el.remove());
     const avatar = comment.querySelector('.author__avatar');
     avatar.innerHTML = avatarPool[(index + 4) % avatarPool.length].innerHTML;
     avatar.href = '#demo-user-' + index;
     tree.append(comment);
   });
   document.querySelector('.comments')?.classList.remove('comments--limited');
   document.querySelectorAll('.comments-limit').forEach(el => el.remove());
 }
 const assignments = new Map();
 let previous = {};
 try { previous = JSON.parse(sessionStorage.getItem('avatar-frames') || '{}'); } catch {}
 const next = {};
 const avatars = document.querySelectorAll('.author__avatar, .content-comment__avatar, .header__avatar, .tabbar__avatar, .account-button__inner > .andropov-media, .subsite-avatar');
 avatars.forEach((avatar, i) => {
   const key = avatar.getAttribute('href') || avatar.querySelector('img')?.getAttribute('src') || String(i);
   if (!assignments.has(key)) {
     const choices = Array.from({length: 9}, (_, index) => index + 1).filter(value => value !== previous[key]);
     assignments.set(key, choices[Math.floor(Math.random() * choices.length)]);
     next[key] = assignments.get(key);
   }
   avatar.classList.add('avatar-with-frame');
   const frame = document.createElement('img');
   frame.className = 'avatar-frame';
   frame.src = './frames/' + assignments.get(key) + '.webp';
   frame.alt = '';
   frame.setAttribute('aria-hidden', 'true');
   avatar.append(frame);
 });
 try { sessionStorage.setItem('avatar-frames', JSON.stringify(next)); } catch {}
 document.querySelectorAll('a[href]').forEach(link => {
   const href = link.getAttribute('href');
   if (/^https?:\/\/(www\.)?vc\.ru/.test(href)) {
     link.href = /vc\.ru\/?(?:\?|$)/.test(href) || /\/popular|\/new$|\/my$/.test(href) ? './index.html' : /vc\.ru\/id1198627(?:[/?#]|$)/.test(href) || link.matches('.author__avatar, .author__name') ? './blog.html' : './post.html';
   }
 });
 document.querySelectorAll('.content-title, .content-header__title').forEach(title => {
   if (location.pathname.endsWith('post.html')) return;
   title.style.cursor = 'pointer';
   title.addEventListener('click', () => location.href = './post.html');
 });
 const blogLink = document.querySelector('.account-button');
 if (blogLink) { blogLink.style.cursor = 'pointer'; blogLink.addEventListener('click', () => location.href = './blog.html'); }
})();
