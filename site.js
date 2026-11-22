(() => {
  const menu = document.querySelector('.menu');
  const nav = document.getElementById('nav');
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  function closeMenu() {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('click', event => {
    if (!event.target.closest('header') || event.target.closest('nav a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      menu.focus();
    }
  });

  const dialog = document.querySelector('dialog');
  const dialogImage = dialog.querySelector('img');
  const photoButtons = [...document.querySelectorAll('[data-photo]')];
  const toolbar = document.createElement('div');
  toolbar.className = 'light-toolbar';
  const label = document.createElement('span');
  label.setAttribute('aria-live', 'polite');
  toolbar.append(label);
  function navigationButton(text, glyph) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', text);
    button.textContent = glyph;
    toolbar.append(button);
    return button;
  }
  const previous = navigationButton('Предыдущая фотография', '←');
  const next = navigationButton('Следующая фотография', '→');
  dialog.append(toolbar);
  let current = 0;
  let collection = [];
  function showPhoto(index) {
    current = Math.max(0, Math.min(collection.length - 1, index));
    const trigger = collection[current];
    dialogImage.src = trigger.dataset.photo;
    dialogImage.alt = trigger.querySelector('img')?.alt || trigger.getAttribute('aria-label') || 'Фотография объекта';
    label.textContent = dialogImage.alt;
    previous.hidden = next.hidden = collection.length < 2;
    previous.disabled = current === 0;
    next.disabled = current === collection.length - 1;
  }
  photoButtons.forEach(trigger => trigger.addEventListener('click', event => {
    if (!dialog.showModal) return;
    event.preventDefault();
    const group = trigger.closest('[data-photo-group], .rail, .photowall, .object-wall, main');
    collection = group ? [...group.querySelectorAll('[data-photo]')] : [trigger];
    showPhoto(collection.indexOf(trigger));
    dialog.showModal();
  }));
  previous.addEventListener('click', () => showPhoto(current - 1));
  next.addEventListener('click', () => showPhoto(current + 1));
  dialog.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    showPhoto(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.closest('.close')) dialog.close();
  });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.scrollingElement;
  let frame = 0, target = 0, owner = null, previousTime = 0;
  const bound = (v, max) => Math.min(max, Math.max(0, v));
  const read = el => el === root ? window.scrollY : el.scrollLeft;
  const write = (el, v) => {
    if (el === root) window.scrollTo({top:v, behavior:'instant'});
    else el.scrollTo({left:v, behavior:'instant'});
  };
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    owner = null;
  }
  function tick(time) {
    if (!owner) return;
    const pos = read(owner), distance = target - pos;
    if (Math.abs(distance) < 1.6) {
      write(owner, target);
      stop();
      return;
    }
    const dt = previousTime ? Math.min(60, time - previousTime) : 16;
    previousTime = time;
    const step = Math.sign(distance) * Math.max(1, Math.abs(distance) * (1 - Math.exp(-dt / 65)));
    write(owner, pos + step);
    frame = requestAnimationFrame(tick);
  }
  function animate(el, delta, max) {
    if (owner !== el) {
      stop();
      owner = el;
      target = read(el);
    }
    target = bound(target + delta, max);
    if (!frame) frame = requestAnimationFrame(tick);
  }
  document.addEventListener('wheel', event => {
    if (event.defaultPrevented || event.ctrlKey || dialog.open || !event.cancelable) return;
    const rail = event.target.closest('.rail');
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    const delta = (horizontal ? event.deltaX : event.deltaY) * unit;
    if (!delta || event.shiftKey) return;
    if (rail) {
      const max = rail.scrollWidth - rail.clientWidth;
      const pos = read(rail);
      if (max > 1 && (delta < 0 ? pos > 1 : pos < max - 1)) {
        event.preventDefault();
        if (reduced.matches) write(rail, bound(pos + delta, max));
        else animate(rail, delta, max);
        return;
      }
    }
    if (horizontal || reduced.matches || event.target.closest('.table-scroll,.sidemenu,nav.open') || Math.abs(delta) < 38) {
      stop();
      return;
    }
    const max = root.scrollHeight - innerHeight;
    if (delta < 0 ? scrollY < 1 : scrollY > max - 1) return;
    event.preventDefault();
    animate(root, delta, max);
  }, {passive:false});
  ['touchstart','pointerdown','keydown'].forEach(type => window.addEventListener(type, stop, {passive:true}));
  reduced.addEventListener('change', stop);
  document.querySelectorAll('.rail').forEach(rail => rail.addEventListener('keydown', event => {
    if (event.target !== rail || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const width = rail.firstElementChild?.getBoundingClientRect().width || rail.clientWidth;
    const left = event.key === 'Home' ? 0 : event.key === 'End' ? rail.scrollWidth :
      rail.scrollLeft + (event.key === 'ArrowRight' ? width : -width);
    rail.scrollTo({left, behavior: reduced.matches ? 'instant' : 'smooth'});
  }));
})();
