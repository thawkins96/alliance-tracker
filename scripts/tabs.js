// tabs.js — improved, tolerant tab controller
// - restricts panel toggling to a main content container when present
// - accepts common panel id/attribute patterns (name, name-panel, panel-name, data-tab-panel)
// - narrows hideAll so unrelated header/nav elements are not hidden
// - preserves accessible attributes and localStorage persistence

(function(){
  'use strict';
  var STORAGE_KEY = 'alliance.activeTab';

  function qsAll(sel, root){ root = root || document; return Array.prototype.slice.call(root.querySelectorAll(sel)); }

  function getContainer(){
    // prefer an explicit app/content container so we don't hide unrelated elements
    var c = document.querySelector('#content, main, #app, .app-content, .content, [data-app-content]');
    if(c) return c;
    // fallback: if the page uses a #main or .main wrapper
    c = document.querySelector('#main, .main');
    if(c) return c;
    // last resort: document.body — but we'll emit a warning so maintainers know
    console.warn('tabs.js: no content container found; falling back to document.body (this may hide unrelated elements)');
    return document.body;
  }

  var CONTAINER = getContainer();

  function findPanelByName(name){
    if(!name) return null;
    var candidates = [
      '#' + name,
      '#' + name + '-panel',
      '#panel-' + name,
      '[data-panel="'+name+'"]',
      '[data-tab-panel="'+name+'"]',
      '[data-tab-content="'+name+'"]',
      '[data-view="'+name+'"]',
      '[data-section="'+name+'"]',
      '.tab-' + name,
      '.tab-' + name + '-panel',
      '[role="tabpanel"][data-tab="'+name+'"]',
      '[data-tab="'+name+'-panel"]'
    ];

    for(var i=0;i<candidates.length;i++){
      try{
        var el = CONTAINER.querySelector(candidates[i]);
        if(el) return el;
      }catch(e){ /* ignore invalid selectors */ }
    }

    // last-ditch: search by id anywhere in document (but prefer container)
    var byId = CONTAINER.querySelector('[id*="'+name+'"]');
    if(byId) return byId;

    // final fallback: global search (only if container wasn't body)
    if(CONTAINER !== document.body){
      byId = document.querySelector('[id*="'+name+'"]');
      if(byId) return byId;
    }

    return null;
  }

  function allPanels(){
    // collect tab panels inside the container only
    var sel = '[data-panel],[data-tab-panel],[data-tab-content],[data-view],.tab-pane,[role="tabpanel"],[id$="-panel"],[id^="panel-"]';
    var nodes = qsAll(sel, CONTAINER);
    // filter out nodes inside header/nav inside the container (rare) for safety
    return nodes.filter(function(el){
      return el.closest('header')===null && el.closest('nav')===null;
    });
  }

  function hideAll(){
    allPanels().forEach(function(p){
      if(!p.classList.contains('hidden')) p.classList.add('hidden');
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
      // best-effort: try a couple of fallback selectors across the document
      var alt = document.querySelector('[data-tab="'+name+'-panel"], [data-tab="'+name+'"][role="tabpanel"], #'+name+'-panel, #panel-'+name);
      if(alt){
        alt.classList.remove('hidden'); alt.removeAttribute('aria-hidden');
      } else {
        console.warn('tabs.js: panel not found for', name);
      }
    }

    try{ localStorage.setItem(STORAGE_KEY,name); }catch(e){ }
  }

  function init(){
    var btns = qsAll('.tab-btn, .bottom-nav-btn');
    if(!btns.length) return;

    btns.forEach(function(btn){
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
