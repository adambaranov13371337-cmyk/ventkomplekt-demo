(() => {
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
  function refreshBoard() {
    frame = 0;
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
  function queueBoard() {
    if (!frame) frame = requestAnimationFrame(refreshBoard);
  }
  window.addEventListener('scroll', queueBoard, {passive: true});
  window.addEventListener('resize', queueBoard);
  window.addEventListener('pageshow', queueBoard);
  queueBoard();
})();
