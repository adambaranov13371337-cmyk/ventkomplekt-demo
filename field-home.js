(() => {
  const hero = document.querySelector('.field-hero');
  const photoLayer = hero.querySelector('.field-shots');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const shotButtons = [...document.querySelectorAll('.shot-select')];
  const shots = [...document.querySelectorAll('.field-exposure img')];
  const caption = document.querySelector('.photo-caption');
  shotButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      shotButtons.forEach((item, i) => item.setAttribute('aria-pressed', String(i === index)));
      shots.forEach((image, i) => image.classList.toggle('on', i === index));
      caption.textContent = shots[index].alt;
    });
  });
  const steps = [...document.querySelectorAll('.step')];
  const plates = [...document.querySelectorAll('[data-plate]')];
  const labels = [...document.querySelectorAll('.sheet-key a')];
  const board = document.querySelector('.study');
  let active = -1;
  let frame = 0;
  let photoShift = 0;
  function refreshHero() {
    const rect = hero.getBoundingClientRect();
    const shift = reducedMotion.matches ? 0 : Math.max(0, Math.min(-rect.top, rect.height)) * .24;
    if (shift === photoShift) return;
    photoShift = shift;
    photoLayer.style.transform = shift ? `translate3d(0, ${shift}px, 0)` : '';
  }
  function refreshBoard() {
    const rect = board.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    const threshold = innerHeight * (matchMedia('(max-width:680px)').matches ? .69 : .5);
    let next = 0;
    for (let i = 1; i < steps.length; i++) {
      if (steps[i].getBoundingClientRect().top <= threshold) next = i;
    }
    if (next === active) return;
    active = next;
    plates.forEach((plate, i) => {
      plate.hidden = i !== active;
      plate.classList.toggle('enter', i === active);
      labels[i].classList.toggle('active', i === active);
      if (i === active) labels[i].setAttribute('aria-current', 'step');
      else labels[i].removeAttribute('aria-current');
    });
  }
  function queueScenes() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      refreshHero();
      refreshBoard();
    });
  }
  window.addEventListener('scroll', queueScenes, {passive: true});
  window.addEventListener('resize', queueScenes);
  window.addEventListener('pageshow', queueScenes);
  reducedMotion.addEventListener('change', queueScenes);
  queueScenes();
})();
