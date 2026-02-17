/**
 * DKD Run 2026 - PCMC Event RSVP App
 * Handles registration, localStorage persistence, and social sharing
 */

const STORAGE_KEY = 'dkd-run-2026-responses';

// DOM Elements
const yesCountEl = document.getElementById('yesCount');
const noCountEl = document.getElementById('noCount');
const registrationForm = document.getElementById('registrationForm');
const declineForm = document.getElementById('declineForm');
const successState = document.getElementById('successState');
const rsvpButtons = document.querySelectorAll('.rsvp-buttons .btn');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const shareUrlEl = document.getElementById('shareUrl');

// State
let currentResponse = null;

// Load and display responses
function loadResponses() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"yes":[],"no":[]}');
    return data;
  } catch {
    return { yes: [], no: [] };
  }
}

function saveResponses(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  updateCounts();
}

function updateCounts() {
  const data = loadResponses();
  animateNumber(yesCountEl, data.yes.length);
  animateNumber(noCountEl, data.no.length);
}

function animateNumber(el, target) {
  const current = parseInt(el.textContent) || 0;
  if (current === target) return;
  
  const duration = 500;
  const start = performance.now();
  
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const value = Math.round(current + (target - current) * eased);
    el.textContent = value;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// Show form based on response type
function showForm(response) {
  currentResponse = response;
  rsvpButtons.forEach(btn => btn.style.display = 'none');
  
  if (response === 'yes') {
    registrationForm.classList.remove('hidden');
    declineForm.classList.add('hidden');
  } else {
    declineForm.classList.remove('hidden');
    registrationForm.classList.add('hidden');
  }
}

function showSuccess() {
  registrationForm.classList.add('hidden');
  declineForm.classList.add('hidden');
  successState.classList.remove('hidden');
  rsvpButtons.forEach(btn => btn.style.display = 'inline-flex');
  
  // Create confetti burst
  createConfetti();
  
  // Set share URL
  const url = window.location.href;
  shareUrlEl.textContent = `Share: ${url}`;
}

function resetUI() {
  registrationForm.classList.add('hidden');
  declineForm.classList.add('hidden');
  successState.classList.add('hidden');
  rsvpButtons.forEach(btn => btn.style.display = 'inline-flex');
  registrationForm.reset();
  declineForm.reset();
  currentResponse = null;
}

// Confetti effect
function createConfetti() {
  const colors = ['#ff3d00', '#ffea00', '#00e676', '#ffffff'];
  const container = document.createElement('div');
  container.className = 'confetti';
  document.body.appendChild(container);
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confettiDrop {
      0% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
      100% { opacity: 0; transform: translate(var(--dx), 80vh) rotate(720deg); }
    }
  `;
  if (!document.getElementById('confetti-style')) {
    style.id = 'confetti-style';
    document.head.appendChild(style);
  }
  
  for (let i = 0; i < 60; i++) {
    const dx = (Math.random() - 0.5) * 400 + 'px';
    const piece = document.createElement('div');
    piece.style.cssText = `
      position: fixed;
      width: ${Math.random() * 8 + 4}px;
      height: ${Math.random() * 8 + 4}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${40 + Math.random() * 20}vw;
      top: 25vh;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation: confettiDrop ${1.5 + Math.random() * 1.5}s ease-out forwards;
      animation-delay: ${i * 0.025}s;
      --dx: ${dx};
    `;
    container.appendChild(piece);
  }
  
  setTimeout(() => container.remove(), 4000);
}

// Event: RSVP Button click
rsvpButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const response = btn.dataset.response;
    showForm(response);
  });
});

// Event: Registration form submit (Yes)
registrationForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('participantName').value.trim();
  const email = document.getElementById('participantEmail').value.trim();
  
  if (!name || !email) return;
  
  const data = loadResponses();
  data.yes.push({
    name,
    email,
    timestamp: new Date().toISOString()
  });
  saveResponses(data);
  
  showSuccess();
});

// Event: Decline form submit (No)
declineForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const message = document.getElementById('declineMessage').value.trim();
  
  const data = loadResponses();
  data.no.push({
    message: message || '(No message)',
    timestamp: new Date().toISOString()
  });
  saveResponses(data);
  
  resetUI();
  updateCounts();
  
  // Show brief thank you
  const thankYou = document.createElement('div');
  thankYou.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(20, 20, 31, 0.95);
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.1);
    z-index: 1000;
    font-size: 1.2rem;
    animation: fadeUp 0.3s ease-out;
  `;
  thankYou.textContent = "Thanks for letting us know! See you next time 👋";
  document.body.appendChild(thankYou);
  
  setTimeout(() => thankYou.remove(), 2000);
});

// Share functionality
document.querySelectorAll('.share-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const platform = btn.dataset.share;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("I'm running DKD 2026! March 1st - Are you in? Join me! 🏃");
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }
  });
});

// Copy link
copyLinkBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    const originalText = copyLinkBtn.innerHTML;
    copyLinkBtn.innerHTML = '<span>✓ Copied!</span>';
    copyLinkBtn.style.background = '#00e676';
    copyLinkBtn.style.borderColor = '#00e676';
    setTimeout(() => {
      copyLinkBtn.innerHTML = originalText;
      copyLinkBtn.style.background = '';
      copyLinkBtn.style.borderColor = '';
    }, 2000);
  } catch {
    shareUrlEl.style.display = 'block';
    shareUrlEl.select?.();
  }
});

// Web Share API (native share on mobile)
if (navigator.share && document.querySelector('.share-buttons')) {
  const shareBtn = document.createElement('button');
  shareBtn.className = 'share-btn';
  shareBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
    Share
  `;
  shareBtn.addEventListener('click', async () => {
    try {
      await navigator.share({
        title: 'DKD Run 2026',
        text: "I'm running DKD 2026! March 1st - Are you in?",
        url: window.location.href
      });
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    }
  });
  document.querySelector('.share-buttons').appendChild(shareBtn);
}

// Initialize
updateCounts();
