// Paste your OpenAI key here for AI tag suggestion (optional)
const openaiApiKey = ''; // 'sk-...'

let history = JSON.parse(localStorage.getItem('aliasHist') || '[]');
let favs = JSON.parse(localStorage.getItem('favAliases') || '[]');
let aliasHistory = [];

function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark');
  body.classList.toggle('light');
  const themeButton = document.getElementById('themeToggle');
  themeButton.textContent = body.classList.contains('dark') ? '🌙' : '🌞';
}

function toggleDrawer() {
  const drawer = document.getElementById('historyDrawer');
  drawer.classList.toggle('open');
  renderHistory();
}

function generate() {
  const emailInput = document.getElementById('email');
  const tagSelect = document.getElementById('tagSelect');
  const out = document.getElementById('aliasList');
  out.innerHTML = '';

  const email = emailInput.value.trim();
  const tag = tagSelect.value.trim();

  if (!email.endsWith('@gmail.com')) return alert('Please enter a valid Gmail address.');

  const user = email.split('@')[0];
  const domain = '@gmail.com';

  // Dot variants generator (max 512 variants)
  const variants = new Set();

  function dotVariants(str) {
    const n = str.length - 1;
    for (let m = 0; m < Math.min(512, 1 << n); m++) {
      let s = '';
      const b = m.toString(2).padStart(n, '0');
      for (let i = 0; i < str.length; i++) {
        s += str[i];
        if (i < n && b[i] === '1') s += '.';
      }
      variants.add(s);
    }
  }

  dotVariants(user);

  aliasHistory = [];

  variants.forEach((v) => {
    let alias = v + (tag ? '+' + tag : '') + domain;
    aliasHistory.push(alias);

    const div = document.createElement('div');
    div.className = 'alias-item';
    div.textContent = alias;

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'alias-copy';
    copyBtn.textContent = '📋';
    copyBtn.title = 'Copy alias';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(alias);
      playSound('copy');
      animateButton(copyBtn);
    };

    // Favorite button
    const favBtn = document.createElement('button');
    favBtn.className = 'fav-btn';
    favBtn.textContent = favs.includes(alias) ? '⭐' : '☆';
    favBtn.title = 'Toggle favorite';
    favBtn.onclick = () => {
      toggleFavorite(alias, favBtn);
    };

    out.append(div, copyBtn, favBtn);
  });

  // Save history
  history.unshift({ email, tag, time: new Date().toISOString() });
  if (history.length > 20) history.pop();
  localStorage.setItem('aliasHist', JSON.stringify(history));

  renderHistory();
  applySearchFilter();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = '';
  history.forEach((h) => {
    const p = document.createElement('div');
    p.className = 'history-item';
    p.textContent = `${h.email} +${h.tag || '(none)'} @ ${new Date(h.time).toLocaleString()}`;
    list.appendChild(p);
  });
}

function toggleFavorite(alias, button) {
  const idx = favs.indexOf(alias);
  if (idx >= 0) {
    favs.splice(idx, 1);
    button.textContent = '☆';
  } else {
    favs.push(alias);
    button.textContent = '⭐';
  }
  localStorage.setItem('favAliases', JSON.stringify(favs));
}

function exportHistory(type) {
  let data = '';
  if (type === 'csv') {
    data = 'Email,Tag,Time\n' + history.map((h) => `${h.email},${h.tag},${h.time}`).join('\n');
    download(data, 'history.csv', 'text/csv');
  } else if (type === 'json') {
    data = JSON.stringify(history, null, 2);
    download(data, 'history.json', 'application/json');
  } else if (type === 'txt') {
    data = history.map((h) => `${h.email} +${h.tag} @ ${new Date(h.time).toLocaleString()}`).join('\n');
    download(data, 'history.txt', 'text/plain');
  }
}

function download(content, filename, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = filename;
  a.click();
  a.remove();
}

function animateButton(btn) {
  btn.style.transform = 'scale(1.3)';
  setTimeout(() => {
    btn.style.transform = '';
  }, 150);
}

function playSound(type) {
  if (!window.Audio) return;
  let audio;
  if (type === 'copy') {
    audio = new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
  }
  if (audio) audio.play();
}

function applySearchFilter() {
  const q = document.getElementById('searchBox').value.toLowerCase();
  document.querySelectorAll('.alias-item').forEach((el) => {
    el.style.display = el.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// Event Listeners
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.querySelector('.drawer-toggle').addEventListener('click', toggleDrawer);
document.getElementById('searchBox').addEventListener('input', applySearchFilter);

// Init particles.js background
particlesJS.load('particles-js', 'particles.json', () => {
  console.log('Particles.js loaded');
});
