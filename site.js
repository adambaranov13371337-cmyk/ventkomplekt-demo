(() => {
  const menu = document.querySelector('.menu');
  const nav = document.getElementById('nav');
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  const dialog = document.querySelector('dialog');
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-photo]');
    if (!trigger || !dialog.showModal) return;
    event.preventDefault();
    const image = dialog.querySelector('img');
    image.src = trigger.dataset.photo;
    image.alt = trigger.querySelector('img')?.alt || '';
    dialog.showModal();
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
  const hero = document.querySelector('.hero-image');
  if (hero) {
    let pending = false;
    window.addEventListener('scroll', () => {
      if (pending || reduced.matches) return;
      pending = true;
      requestAnimationFrame(() => {
        hero.style.setProperty('--shift', Math.min(11, scrollY * .035) + 'px');
        pending = false;
      });
    }, {passive:true});
  }
  if ('IntersectionObserver' in window && !reduced.matches) {
    document.documentElement.classList.add('motion');
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.remove('wait');
        observer.unobserve(entry.target);
      }
    }, {threshold:.16});
    document.querySelectorAll('.fact').forEach(el => {el.classList.add('wait');observer.observe(el)});
  }
})();
