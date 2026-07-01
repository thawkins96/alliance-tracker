document.addEventListener('DOMContentLoaded', function () {
  // Stronger Pages compatibility shim for GitHub Pages/project sites.
  // Purpose: many elements are hidden with the Tailwind pattern "hidden md:block"
  // but the responsive "md:" rules may be missing in an inline/trimmed CSS build.
  // This shim safely reveals elements on desktop widths so the site is usable while
  // a proper compiled CSS is restored.

  try {
    if (window.innerWidth >= 768) {
      // 1) Reveal any element that uses md: utilities by matching class attribute
      // containing the substring "md:" (works regardless of escaping).
      var mdEls = document.querySelectorAll('[class*="md:"]');
      mdEls.forEach(function (el) {
        if (el.classList && el.classList.contains('hidden')) el.classList.remove('hidden');
      });

      // 2) Extra safety: reveal top-level structural children if still hidden
      // (header, nav, main, section, footer). This prevents an entirely blank page
      // while keeping deeply-nested elements untouched.
      ['HEADER','NAV','MAIN','SECTION','FOOTER','DIV'].forEach(function(tag){
        var nodes = document.querySelectorAll('body > ' + tag.toLowerCase());
        nodes.forEach(function (el) {
          if (el.classList && el.classList.contains('hidden')) el.classList.remove('hidden');
        });
      });

      // 3) Fallback: if nothing visible at all, reveal the first few direct children
      // of body to ensure the app shell appears. Very conservative (only removes
      // hidden from first 5 children).
      var visibleCount = Array.from(document.body.children).filter(function(c){
        return window.getComputedStyle(c).display !== 'none';
      }).length;
      if (visibleCount === 0) {
        Array.from(document.body.children).slice(0,5).forEach(function(el){
          if (el.classList && el.classList.contains('hidden')) el.classList.remove('hidden');
        });
      }
    }
  } catch (e) {
    // Never throw — shim should be safe and silent in production
    console.warn('pages-fix.js error', e);
  }
});
