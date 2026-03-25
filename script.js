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
        transition: background 0.2s;
      ">✕</button>

      <img id="modal-img" src="" alt="" style="
        width: 100%; max-height: 500px;
        object-fit: contain; display: block;
        background: #1a1208;
      ">

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
}

function ouvrirModal(projet) {
  if (!modalEl) creerModal();

  const imgs = projet.imgs || [projet.img];
  let indexActuel = 0;

  const modalImgEl = document.getElementById('modal-img');
  modalImgEl.src = imgs[0];
  modalImgEl.alt = projet.alt || projet.titre;

  // Slider
  const contenu = document.getElementById('modal-contenu');

  // Retire les anciennes flèches si elles existent
  contenu.querySelectorAll('.slider-btn').forEach(b => b.remove());

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
      z-index: 10; transition: background 0.2s;
    `;

    const btnNext = document.createElement('button');
    btnNext.className = 'slider-btn slider-next';
    btnNext.setAttribute('aria-label', 'Image suivante');
    btnNext.textContent = '→';
    btnNext.style.cssText = btnPrev.style.cssText.replace('left: 1rem', 'right: 1rem; left: auto');

    btnPrev.addEventListener('click', () => {
      indexActuel = (indexActuel - 1 + imgs.length) % imgs.length;
      modalImgEl.src = imgs[indexActuel];
    });
    btnNext.addEventListener('click', () => {
      indexActuel = (indexActuel + 1) % imgs.length;
      modalImgEl.src = imgs[indexActuel];
    });

    contenu.appendChild(btnPrev);
    contenu.appendChild(btnNext);
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
// CHARGEMENT JSON (page projets)
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

    card.innerHTML = `
      <img src="${p.img}" alt="${p.alt || p.titre}">
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

    // Curseur sur les cartes
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

// Compteur caractères
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