// tabs.js
// Robust tab controller for Alliance Tracker
// - wires .tab-btn and .bottom-nav-btn (data-tab) to panels
// - finds panels by id or data-panel/data-tab-content/data-view
// - hides/shows panels by adding/removing the Tailwind-compatible 'hidden' class
// - preserves and toggles an 'active' class on buttons and sets aria-selected
// - persists last-open tab in localStorage

(function(){
  'use strict';
  var STORAGE_KEY = 'alliance.activeTab';

  function qsAll(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function findPanelByName(name){
    if(!name) return null;
    var candidates = [
      '#' + name,
      '[data-panel="'+name+'"]',
      '[data-tab-content="'+name+'"]',
      '[data-view="'+name+'"]',
      '[data-section="'+name+'"]',
      '.tab-'+name,
      '.tab-'+name+'-panel'
    ];
    for(var i=0;i<candidates.length;i++){
      try{
        var el = document.querySelector(candidates[i]);
        if(el) return el;
      }catch(e){ /* ignore invalid selectors */ }
    }
    // fallback: look for section or div whose id contains the name
    var byId = document.getElementById(name);
    if(byId) return byId;
    return null;
  }

  function allPanels(){
    // collect potential panel nodes to hide/show
    var sel = '[data-panel],[data-tab-content],[data-view],.tab-pane,section[id],div[id]';
    return qsAll(sel).filter(function(el){
      // only keep visible sections in the primary content area (ignore header/footer small elems)
      return el.closest('header')===null && el.closest('nav')===null;
    });
  }

  function hideAll(){
    allPanels().forEach(function(p){
      p.classList.add('hidden');
      // also set aria-hidden
      p.setAttribute('aria-hidden','true');
    });
  }

  function setActiveButton(btn){
    qsAll('.tab-btn, .bottom-nav-btn').forEach(function(b){
      b.classList.remove('active');
      b.setAttribute('aria-selected','false');
    });
    if(btn){
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
    }
  }

  function showTab(name, btn){
    if(!name) return;
    var panel = findPanelByName(name);
    setActiveButton(btn);
    hideAll();
    if(panel){
      panel.classList.remove('hidden');
      panel.removeAttribute('aria-hidden');
    } else {
      // best-effort: try to show element that has data-tab equal to name
      var alt = document.querySelector('[data-tab="'+name+'-panel"], [data-tab="'+name+'"][role="tabpanel"]');
      if(alt){ alt.classList.remove('hidden'); alt.removeAttribute('aria-hidden'); }
      else console.warn('tabs.js: panel not found for', name);
    }
    try{ localStorage.setItem(STORAGE_KEY,name); }catch(e){}
  }

  function init(){
    var btns = qsAll('.tab-btn, .bottom-nav-btn');
    if(!btns.length) return;

    btns.forEach(function(btn){
      // ensure accessible role/attributes
      btn.setAttribute('role','tab');
      if(!btn.hasAttribute('tabindex')) btn.setAttribute('tabindex','0');
      btn.addEventListener('click', function(e){
        var tab = btn.getAttribute('data-tab');
        if(!tab) return;
        showTab(tab, btn);
      });
      btn.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); btn.click(); }
      });
    });

    // initial tab: preference in localStorage, then .active present on a button, else first button
    var preferred = null;
    try{ preferred = localStorage.getItem(STORAGE_KEY); }catch(e){}
    var initialBtn = null;
    if(preferred){ initialBtn = btns.find(function(b){ return b.getAttribute('data-tab')===preferred; }); }
    if(!initialBtn){ initialBtn = btns.find(function(b){ return b.classList.contains('active'); }); }
    if(!initialBtn){ initialBtn = btns[0]; }

    // hide all panels, then show initial
    hideAll();
    if(initialBtn){ showTab(initialBtn.getAttribute('data-tab'), initialBtn); }

    console.log('tabs.js: initialized, active tab:', (initialBtn && initialBtn.getAttribute('data-tab')) || 'none');
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else init();
})();
