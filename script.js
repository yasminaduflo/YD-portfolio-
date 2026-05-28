// ================================
// PORTFOLIO YASMINA DUFLO — script.js
// ================================

// Année dans le footer
const anneeEl = document.getElementById('annee');
if (anneeEl) anneeEl.textContent = new Date().getFullYear();

// Curseur personnalisé (desktop uniquement)
const cursor = document.getElementById('cursor');
if (cursor && window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  document.querySelectorAll('a, button, .projet-card, .comp-pill').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('big'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
  });
}

// Menu burger
const burger = document.getElementById('burger');
const nav = document.getElementById('main-nav');
const overlay = document.getElementById('menu-overlay');
const fermer = document.getElementById('fermer-menu');

function ouvrirMenu() {
  nav?.classList.add('ouvert');
  overlay?.classList.add('actif');
  burger?.setAttribute('aria-expanded', 'true');
  fermer?.focus();
}
function fermerMenu() {
  nav?.classList.remove('ouvert');
  overlay?.classList.remove('actif');
  burger?.setAttribute('aria-expanded', 'false');
  burger?.focus();
}

burger?.addEventListener('click', ouvrirMenu);
fermer?.addEventListener('click', fermerMenu);
overlay?.addEventListener('click', fermerMenu);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { fermerMenu(); fermerModal(); } });

// ================================
// MODAL
// ================================

let modalEl = null;

function creerModal() {
  if (document.getElementById('modal-projet')) return;

  const modal = document.createElement('div');
  modal.id = 'modal-projet';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modal-titre');
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(26,18,8,0.85);
    display: flex; align-items: center; justify-content: center;
    padding: 1.5rem;
    opacity: 0; pointer-events: none;
    transition: opacity 0.3s ease;
  `;

  modal.innerHTML = `
    <div id="modal-contenu" style="
      background: var(--cream); max-width: 800px; width: 100%;
      max-height: 90vh; overflow-y: auto;
      position: relative;
    ">
      <button id="modal-fermer" aria-label="Fermer" style="
        position: absolute; top: 1rem; right: 1rem;
        background: var(--ink); color: var(--cream);
        border: none; width: 36px; height: 36px;
        font-size: 1.1rem; display: flex; align-items: center;
        justify-content: center; z-index: 10;
        transition: background 0.2s; cursor: pointer;
      ">✕</button>

      <div id="modal-img-wrap" style="
        position: relative; overflow: hidden;
        background: #1a1208; height: 500px;
        display: flex; align-items: center; justify-content: center;
      ">
        <img id="modal-img" src="" alt="" style="
          max-width: 100%; max-height: 100%;
          object-fit: contain; display: block;
          transform-origin: 0 0;
          transform: scale(1) translate(0px, 0px);
          transition: transform 0.2s ease;
          cursor: zoom-in;
          user-select: none;
          -webkit-user-drag: none;
        ">
        <div id="zoom-bar" style="
          position: absolute; bottom: 0.75rem; right: 0.75rem;
          display: flex; gap: 0.4rem; align-items: center;
          background: rgba(26,18,8,0.7); padding: 0.4rem 0.6rem;
          backdrop-filter: blur(4px); z-index: 5;
        ">
          <button id="zoom-in" aria-label="Zoomer" title="Zoomer" style="
            background: none; border: 1px solid rgba(255,255,255,0.3);
            color: #fff; width: 30px; height: 30px; font-size: 1rem;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: background 0.2s;
          ">+</button>
          <button id="zoom-out" aria-label="Dézoomer" title="Dézoomer" style="
            background: none; border: 1px solid rgba(255,255,255,0.3);
            color: #fff; width: 30px; height: 30px; font-size: 1rem;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: background 0.2s;
          ">−</button>
          <button id="zoom-reset" aria-label="Réinitialiser le zoom" title="Reset" style="
            background: none; border: 1px solid rgba(255,255,255,0.3);
            color: #fff; width: 30px; height: 30px; font-size: 0.85rem;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: background 0.2s;
          ">↺</button>
        </div>
      </div>

      <div style="padding: 2rem;">
        <p id="modal-categorie" style="
          font-size: 0.75rem; letter-spacing: 0.25em;
          text-transform: uppercase; color: var(--rose);
          margin-bottom: 0.75rem;
        "></p>
        <h2 id="modal-titre" style="
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 300; color: var(--ink);
          margin-bottom: 1rem; line-height: 1.1;
        "></h2>
        <p id="modal-desc" style="
          font-size: 0.95rem; line-height: 1.9;
          color: var(--muted); font-weight: 300;
          margin-bottom: 1.5rem;
        "></p>
        <div id="modal-actions" style="display: flex; gap: 1rem; flex-wrap: wrap;"></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modalEl = modal;

  modal.addEventListener('click', e => { if (e.target === modal) fermerModal(); });
  document.getElementById('modal-fermer').addEventListener('click', fermerModal);
  document.getElementById('modal-fermer').addEventListener('mouseenter', () => cursor?.classList.add('big'));
  document.getElementById('modal-fermer').addEventListener('mouseleave', () => cursor?.classList.remove('big'));

  // ---- ZOOM + PAN ----
  let zoomLevel = 1;
  let panX = 0, panY = 0;
  const zoomStep = 0.4;
  const zoomMin = 1;
  const zoomMax = 4;

  // État drag
  let isDragging = false;
  let dragStartX = 0, dragStartY = 0;
  let panStartX = 0, panStartY = 0;

  function appliquerTransform(animate = true) {
    const img = document.getElementById('modal-img');
    if (!img) return;
    img.style.transition = animate ? 'transform 0.2s ease' : 'none';
    img.style.transform = `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`;
    img.style.cursor = zoomLevel > 1 ? 'grab' : 'zoom-in';
  }

  function clampPan() {
    const wrap = document.getElementById('modal-img-wrap');
    const img = document.getElementById('modal-img');
    if (!wrap || !img) return;
    const wrapW = wrap.clientWidth;
    const wrapH = wrap.clientHeight;
    const imgW = img.clientWidth;
    const imgH = img.clientHeight;
    const maxX = Math.max(0, (imgW * zoomLevel - wrapW) / (2 * zoomLevel));
    const maxY = Math.max(0, (imgH * zoomLevel - wrapH) / (2 * zoomLevel));
    panX = Math.min(maxX, Math.max(-maxX, panX));
    panY = Math.min(maxY, Math.max(-maxY, panY));
  }

  document.getElementById('zoom-in').addEventListener('click', () => {
    zoomLevel = Math.min(zoomMax, +(zoomLevel + zoomStep).toFixed(1));
    clampPan();
    appliquerTransform();
  });

  document.getElementById('zoom-out').addEventListener('click', () => {
    zoomLevel = Math.max(zoomMin, +(zoomLevel - zoomStep).toFixed(1));
    if (zoomLevel === zoomMin) { panX = 0; panY = 0; }
    clampPan();
    appliquerTransform();
  });

  document.getElementById('zoom-reset').addEventListener('click', () => {
    zoomLevel = 1; panX = 0; panY = 0;
    appliquerTransform();
  });

  // Clic image = toggle zoom x2
  document.getElementById('modal-img').addEventListener('click', e => {
    if (isDragging) return;
    if (zoomLevel === 1) {
      zoomLevel = 2;
    } else {
      zoomLevel = 1; panX = 0; panY = 0;
    }
    clampPan();
    appliquerTransform();
  });

  // Drag pour se déplacer
  const imgEl = document.getElementById('modal-img');

  imgEl.addEventListener('mousedown', e => {
    if (zoomLevel <= 1) return;
    isDragging = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    panStartX = panX;
    panStartY = panY;
    imgEl.style.cursor = 'grabbing';

    const onMouseMove = e => {
      const dx = (e.clientX - dragStartX) / zoomLevel;
      const dy = (e.clientY - dragStartY) / zoomLevel;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) isDragging = true;
      panX = panStartX + dx;
      panY = panStartY + dy;
      clampPan();
      appliquerTransform(false);
    };

    const onMouseUp = () => {
      imgEl.style.cursor = zoomLevel > 1 ? 'grab' : 'zoom-in';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setTimeout(() => { isDragging = false; }, 50);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // Touch drag (mobile)
  imgEl.addEventListener('touchstart', e => {
    if (zoomLevel <= 1 || e.touches.length !== 1) return;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
    panStartX = panX;
    panStartY = panY;
  }, { passive: true });

  imgEl.addEventListener('touchmove', e => {
    if (zoomLevel <= 1 || e.touches.length !== 1) return;
    e.preventDefault();
    const dx = (e.touches[0].clientX - dragStartX) / zoomLevel;
    const dy = (e.touches[0].clientY - dragStartY) / zoomLevel;
    panX = panStartX + dx;
    panY = panStartY + dy;
    clampPan();
    appliquerTransform(false);
  }, { passive: false });

  // Reset zoom à chaque ouverture
  modalEl._resetZoom = () => {
    zoomLevel = 1; panX = 0; panY = 0;
    appliquerTransform();
  };
}

function ouvrirModal(projet) {
  if (!modalEl) creerModal();

  modalEl._resetZoom?.();

  const imgs = projet.imgs || [projet.img];
  let indexActuel = 0;

  const modalImgEl = document.getElementById('modal-img');
  const contenu = document.getElementById('modal-contenu');
  const zoomBar = document.getElementById('zoom-bar');
  const wrap = document.getElementById('modal-img-wrap');

  contenu.querySelectorAll('.modal-video, .slider-btn').forEach(el => el.remove());

  if (projet.video) {
    modalImgEl.style.display = 'none';
    if (zoomBar) zoomBar.style.display = 'none';
    const iframe = document.createElement('iframe');
    iframe.className = 'modal-video';
    iframe.src = projet.video;
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'autoplay');
    iframe.style.cssText = `
      width: 100%; height: 100%;
      border: none; display: block;
      background: #000; position: absolute; inset: 0;
    `;
    wrap.insertBefore(iframe, wrap.querySelector('#zoom-bar'));
  } else {
    modalImgEl.style.display = 'block';
    if (zoomBar) zoomBar.style.display = 'flex';
    modalImgEl.src = imgs[0];
    modalImgEl.alt = projet.alt || projet.titre;

    if (imgs.length > 1) {
      const btnPrev = document.createElement('button');
      btnPrev.className = 'slider-btn slider-prev';
      btnPrev.setAttribute('aria-label', 'Image précédente');
      btnPrev.textContent = '←';
      btnPrev.style.cssText = `
        position: absolute; top: 50%; left: 1rem;
        transform: translateY(-50%);
        background: var(--ink); color: var(--cream);
        border: none; width: 40px; height: 40px;
        font-size: 1.2rem; display: flex;
        align-items: center; justify-content: center;
        z-index: 10; transition: background 0.2s; cursor: pointer;
      `;
      const btnNext = document.createElement('button');
      btnNext.className = 'slider-btn slider-next';
      btnNext.setAttribute('aria-label', 'Image suivante');
      btnNext.textContent = '→';
      btnNext.style.cssText = btnPrev.style.cssText.replace('left: 1rem', 'right: 4.5rem; left: auto');

      btnPrev.addEventListener('click', () => {
        indexActuel = (indexActuel - 1 + imgs.length) % imgs.length;
        modalImgEl.src = imgs[indexActuel];
        modalEl._resetZoom?.();
      });
      btnNext.addEventListener('click', () => {
        indexActuel = (indexActuel + 1) % imgs.length;
        modalImgEl.src = imgs[indexActuel];
        modalEl._resetZoom?.();
      });

      contenu.appendChild(btnPrev);
      contenu.appendChild(btnNext);
    }
  }

  document.getElementById('modal-titre').textContent = projet.titre;
  document.getElementById('modal-categorie').textContent = projet.categorie;
  document.getElementById('modal-desc').textContent = projet.desc;

  const actions = document.getElementById('modal-actions');
  actions.innerHTML = '';
  if (projet.lien) {
    const btnLien = document.createElement('a');
    btnLien.href = projet.lien; btnLien.target = '_blank'; btnLien.rel = 'noopener';
    btnLien.textContent = 'Voir le site'; btnLien.style.cssText = btnStyle(false);
    actions.appendChild(btnLien);
  }
  if (projet.download) {
    const btnDl = document.createElement('a');
    btnDl.href = projet.download; btnDl.target = '_blank'; btnDl.rel = 'noopener';
    btnDl.textContent = '↓ Télécharger'; btnDl.style.cssText = btnStyle(true);
    actions.appendChild(btnDl);
  }

  modalEl.style.opacity = '1';
  modalEl.style.pointerEvents = 'all';
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-fermer').focus();
}

function fermerModal() {
  if (!modalEl) return;
  const iframe = modalEl.querySelector('.modal-video');
  if (iframe) iframe.remove();
  const modalImgEl = document.getElementById('modal-img');
  if (modalImgEl) modalImgEl.style.display = 'block';
  const zoomBar = document.getElementById('zoom-bar');
  if (zoomBar) zoomBar.style.display = 'flex';
  modalEl._resetZoom?.();
  modalEl.style.opacity = '0';
  modalEl.style.pointerEvents = 'none';
  document.body.style.overflow = '';
}

function btnStyle(outline) {
  return outline
    ? `display:inline-flex;align-items:center;gap:0.5rem;font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--ink);text-decoration:none;border:1px solid var(--ink);padding:0.75rem 1.5rem;transition:all 0.2s;font-family:'DM Sans',sans-serif;`
    : `display:inline-flex;align-items:center;gap:0.5rem;font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;background:var(--ink);color:var(--cream);text-decoration:none;border:1px solid var(--ink);padding:0.75rem 1.5rem;transition:all 0.2s;font-family:'DM Sans',sans-serif;`;
}

// ================================
// CHARGEMENT JSON
// ================================

let tousLesProjets = [];

async function chargerProjets() {
  const grille = document.getElementById('grille-projets');
  if (!grille) return;
  try {
    const res = await fetch('projets.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    tousLesProjets = await res.json();
    afficherProjets(tousLesProjets);
  } catch (err) {
    console.error('Erreur chargement projets :', err);
    grille.innerHTML = '<p style="color:var(--muted);padding:2rem;">Impossible de charger les projets.</p>';
  }
}

function afficherProjets(liste) {
  const grille = document.getElementById('grille-projets');
  if (!grille) return;
  grille.innerHTML = '';

  liste.forEach((p, i) => {
    const delay = i % 3 === 1 ? ' reveal-d1' : i % 3 === 2 ? ' reveal-d2' : '';
    const card = document.createElement('article');
    card.className = 'projet-card reveal' + delay + (p.large ? ' large' : '');
    card.dataset.cat = p.tag;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Voir le projet : ${p.titre}`);

    const playIcon = p.video ? `<div class="play-icon" aria-hidden="true">▶</div>` : '';

    card.innerHTML = `
      <img src="${p.img}" alt="${p.alt || p.titre}" style="object-fit: cover; width: 100%; height: 100%;">
      ${playIcon}
      <div class="projet-overlay" aria-hidden="true">
        <h3 class="projet-title">${p.titre}</h3>
      </div>
    `;

    card.addEventListener('click', () => {
      if (p.lien && !p.download && !p.desc) {
        window.open(p.lien, '_blank');
      } else {
        ouvrirModal(p);
      }
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });

    grille.appendChild(card);
    card.addEventListener('mouseenter', () => cursor?.classList.add('big'));
    card.addEventListener('mouseleave', () => cursor?.classList.remove('big'));
    observer.observe(card);
  });
}

chargerProjets();

// ================================
// FILTRES
// ================================

document.querySelectorAll('.filtre-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtre-btn').forEach(f => { f.classList.remove('actif'); f.removeAttribute('aria-pressed'); });
    btn.classList.add('actif');
    btn.setAttribute('aria-pressed', 'true');
    const cat = btn.dataset.filtre;
    if (tousLesProjets.length > 0) {
      const filtres = cat === 'tous' ? tousLesProjets : tousLesProjets.filter(p => p.tag === cat);
      afficherProjets(filtres);
    } else {
      document.querySelectorAll('.projet-card[data-cat]').forEach(p => {
        p.style.display = (cat === 'tous' || p.dataset.cat === cat) ? 'block' : 'none';
      });
    }
  });
});

// ================================
// VALIDATION FORMULAIRE
// ================================

const form = document.getElementById('form-contact');

function valider(champ, errId, ok, txt) {
  const el = document.getElementById(errId);
  if (!el) return ok;
  champ.setAttribute('aria-invalid', ok ? 'false' : 'true');
  el.textContent = ok ? '' : txt;
  return ok;
}

form?.addEventListener('submit', e => {
  const nom = form.querySelector('#nom');
  const email = form.querySelector('#email');
  const message = form.querySelector('#message');
  const v1 = valider(nom, 'nom-error', nom.value.trim().length > 0, 'Le nom est requis.');
  const v2 = valider(email, 'email-error', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value), 'Email invalide.');
  const v3 = valider(message, 'message-error', message.value.trim().length >= 10, 'Minimum 10 caractères.');
  if (!v1 || !v2 || !v3) {
    e.preventDefault();
    if (!v1) nom.focus();
    else if (!v2) email.focus();
    else message.focus();
  }
});

form?.querySelectorAll('input, textarea').forEach(f => {
  f.addEventListener('input', () => {
    if (f.id === 'nom' && f.value.trim()) valider(f, 'nom-error', true, '');
    if (f.id === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) valider(f, 'email-error', true, '');
    if (f.id === 'message' && f.value.trim().length >= 10) valider(f, 'message-error', true, '');
  });
});

const msgArea = document.getElementById('message');
const restant = document.getElementById('restant');
msgArea?.addEventListener('input', () => {
  if (restant) restant.textContent = (msgArea.maxLength || 500) - msgArea.value.length;
});

// ================================
// ANIMATIONS SCROLL
// ================================

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
