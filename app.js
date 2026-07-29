// ===== Chronomètre PWA - Application =====

// --- Éléments DOM ---
const chronoDisplay = document.getElementById('chronoDisplay');
const chronoLaps = document.getElementById('chronoLaps');
const btnStart = document.getElementById('btnStart');
const btnLap = document.getElementById('btnLap');
const btnReset = document.getElementById('btnReset');
const timeDisplay = document.getElementById('timeDisplay');
const timePeriod = document.getElementById('timePeriod');
const dateDay = document.getElementById('dateDay');
const dateFull = document.getElementById('dateFull');
const lapsSection = document.getElementById('lapsSection');
const lapsList = document.getElementById('lapsList');
const offlineBadge = document.getElementById('offlineBadge');

// --- État du chronomètre ---
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let running = false;
let laps = [];
let lapStartTime = 0;

// --- Formatage du temps ---
function formatTime(ms) {
    const totalCentiseconds = Math.floor(ms / 10);
    const centi = totalCentiseconds % 100;
    const totalSeconds = Math.floor(totalCentiseconds / 100);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centi).padStart(2, '0')}`;
}

function formatLapTime(ms) {
    const totalCentiseconds = Math.floor(ms / 10);
    const centi = totalCentiseconds % 100;
    const totalSeconds = Math.floor(totalCentiseconds / 100);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centi).padStart(2, '0')}`;
}

// --- Mise à jour de l'affichage ---
function updateChronoDisplay() {
    const now = Date.now();
    const total = elapsedTime + (running ? now - startTime : 0);
    chronoDisplay.textContent = formatTime(total);
    
    if (running && laps.length > 0) {
        const lapElapsed = now - lapStartTime;
        chronoLaps.textContent = `Tour: ${formatLapTime(lapElapsed)}`;
    } else if (!running && laps.length > 0) {
        chronoLaps.textContent = '';
    }
}

// --- Démarrer / Pause ---
function toggleStart() {
    if (!running) {
        // Démarrer
        running = true;
        startTime = Date.now();
        if (laps.length === 0) lapStartTime = startTime;
        else lapStartTime = Date.now();
        
        timerInterval = setInterval(updateChronoDisplay, 10);
        chronoDisplay.classList.add('running');
        btnStart.classList.add('running');
        btnStart.querySelector('span').textContent = 'Pause';
        btnStart.querySelector('svg').innerHTML = '<rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/>';
        btnLap.disabled = false;
        btnReset.disabled = false;
    } else {
        // Pause
        pause();
    }
}

function pause() {
    running = false;
    elapsedTime += Date.now() - startTime;
    clearInterval(timerInterval);
    timerInterval = null;
    updateChronoDisplay();
    chronoDisplay.classList.remove('running');
    btnStart.classList.remove('running');
    btnStart.querySelector('span').textContent = 'Démarrer';
    btnStart.querySelector('svg').innerHTML = '<polygon points="5,3 19,12 5,21" fill="currentColor"/>';
    chronoLaps.textContent = '';
}

// --- Tour (Lap) ---
function addLap() {
    const now = Date.now();
    const lapTime = now - lapStartTime;
    const totalTime = elapsedTime + (now - startTime);
    
    laps.push({ lap: laps.length + 1, lapTime, totalTime });
    lapStartTime = now;
    
    renderLaps();
    chronoLaps.textContent = '';
}

// --- Réinitialiser ---
function reset() {
    if (running) pause();
    elapsedTime = 0;
    laps = [];
    lapStartTime = 0;
    chronoDisplay.textContent = '00:00:00.00';
    chronoLaps.textContent = '';
    chronoDisplay.classList.remove('running');
    btnStart.classList.remove('running');
    btnStart.querySelector('span').textContent = 'Démarrer';
    btnStart.querySelector('svg').innerHTML = '<polygon points="5,3 19,12 5,21" fill="currentColor"/>';
    btnLap.disabled = true;
    btnReset.disabled = true;
    lapsSection.style.display = 'none';
    lapsList.innerHTML = '';
}

// --- Rendu de la liste des tours ---
function renderLaps() {
    lapsSection.style.display = 'block';
    lapsList.innerHTML = '';
    
    // Afficher du plus récent au plus ancien
    const reversed = [...laps].reverse();
    reversed.forEach(l => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="lap-number">Tour ${l.lap}</span>
            <span class="lap-time">${formatLapTime(l.lapTime)}</span>
            <span class="lap-total">${formatLapTime(l.totalTime)}</span>
        `;
        lapsList.appendChild(li);
    });
}

// ===== Horloge & Date =====
function updateDateTime() {
    const now = new Date();
    
    // Heure (format 24h)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    
    // Période
    const h = now.getHours();
    if (h >= 5 && h < 12) timePeriod.textContent = 'Matin';
    else if (h >= 12 && h < 17) timePeriod.textContent = 'Après-midi';
    else if (h >= 17 && h < 21) timePeriod.textContent = 'Soirée';
    else timePeriod.textContent = 'Nuit';
    
    // Date
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    dateDay.textContent = String(now.getDate()).padStart(2, '0');
    dateFull.textContent = `${jours[now.getDay()]} ${now.getDate()} ${mois[now.getMonth()]} ${now.getFullYear()}`;
}

// ===== Service Worker =====
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('✅ Service Worker enregistré', reg.scope))
        .catch(err => console.log('❌ Service Worker échec', err));
}

// ===== État réseau =====
function updateOnlineStatus() {
    if (navigator.onLine) {
        offlineBadge.classList.remove('show');
    } else {
        offlineBadge.classList.add('show');
        setTimeout(() => offlineBadge.classList.remove('show'), 3000);
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// ===== Événements =====
btnStart.addEventListener('click', toggleStart);
btnLap.addEventListener('click', addLap);
btnReset.addEventListener('click', reset);

// Raccourcis clavier
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        toggleStart();
    } else if (e.code === 'KeyL') {
        e.preventDefault();
        if (running) addLap();
    } else if (e.code === 'KeyR') {
        e.preventDefault();
        reset();
    }
});

// ===== Initialisation =====
updateDateTime();
updateChronoDisplay();

// Mise à jour de l'horloge chaque seconde
setInterval(updateDateTime, 1000);

console.log('⏱️  Chronomètre PWA prêt !');
console.log('   [ESPACE] Démarrer/Pause  |  [L] Tour  |  [R] Reset');
