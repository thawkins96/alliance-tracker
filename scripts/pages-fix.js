document.addEventListener('DOMContentLoaded', function () {
  // Quick compatibility shim for GitHub Pages/project sites:
  // Tailwind utility classes like "hidden md:block" rely on responsive rules
  // that may be missing in a lightweight build. On desktop widths (>=768px)
  // reveal elements that use md:* visibility utilities by removing the
  // `hidden` class so the site is visible while a proper CSS build is restored.
  try {
    if (window.innerWidth >= 768) {
      var selectors = ['.md\\:block', '.md\\:flex', '.md\\:grid', '.md\\:inline-block', '.md\\:table', '.md\\:inline-flex'];
      var els = document.querySelectorAll(selectors.join(','));
      els.forEach(function (el) {
        if (el.classList && el.classList.contains('hidden')) el.classList.remove('hidden');
      });
    }
  } catch (e) {
    // Fail silently; this shim should never break the page
    console.warn('pages-fix.js error', e);
  }
});
