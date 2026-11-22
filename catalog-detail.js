(() => {
  const links = Array.from(document.querySelectorAll('.cd-sidemenu a'));
  const sections = links.map(link => document.getElementById(link.hash.slice(1)));
  function mark() {
    const threshold = Math.min(innerHeight * 0.3, 170);
    const index = sections.findLastIndex(section => section.getBoundingClientRect().top <= threshold);
    links.forEach((link, i) => {
      if (i === Math.max(0, index)) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; mark(); });
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  const menus = document.querySelectorAll('.cd-picker, .cd-jump');
  document.addEventListener('click', event => {
    menus.forEach(menu => {
      if (!menu.contains(event.target) || event.target.closest('a')) menu.open = false;
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    menus.forEach(menu => {
      if (!menu.open) return;
      menu.open = false;
      menu.querySelector('summary').focus();
    });
  });
  mark();
})();
const catalogTables = document.querySelectorAll('.cd-table');
const tableResize = new ResizeObserver(entries => {
  for (const { target } of entries) {
    const hint = target.previousElementSibling;
    if (hint?.classList.contains('cd-scrollhint')) {
      const room = target.scrollWidth - target.clientWidth;
      hint.hidden = room < 2;
      if (target.tabIndex !== (room >= 2 ? 0 : -1)) target.tabIndex = room >= 2 ? 0 : -1;
    }
  }
});
catalogTables.forEach(table => {
  const hint = document.createElement('span');
  hint.textContent = 'Сдвиньте таблицу, чтобы увидеть все столбцы';
  hint.className = 'cd-scrollhint';
  hint.hidden = true;
  table.before(hint);
  tableResize.observe(table);
});
