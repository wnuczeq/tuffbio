// --- CONFIGURATION ---
const DISCORD_ID = "1259193637900779591"; // Your Discord ID for Lanyard API

// View count is now handled by the backend
// localStorage.setItem('axol_views', 0); 

// DOM Elements
const entryScreen = document.getElementById('entry-screen');
const mainContent = document.getElementById('main-content');
const backgroundOverlay = document.getElementById('background-overlay');
const audio = document.getElementById('main-audio');
const playPauseBtn = document.getElementById('play-pause-btn');
const volumeSlider = document.getElementById('volume-slider');
const progressBar = document.getElementById('progress-bar');
const loopBtn = document.getElementById('loop-btn');
const playerCover = document.getElementById('local-cover');
const viewCountEl = document.getElementById('view-count');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const cursor = document.getElementById('custom-cursor');
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

// --- CUSTOM CURSOR & 3D TILT EFFECT ---
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // --- Global 3D Tilt (All elements move together) ---
    const tiltElements = document.querySelectorAll('.glass-card, .social-item');
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const rotateX = (e.clientY - centerY) / 30;
    const rotateY = (centerX - e.clientX) / 30;
    
    tiltElements.forEach(el => {
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
});

document.addEventListener('mouseleave', () => {
    const tiltElements = document.querySelectorAll('.glass-card, .social-item');
    tiltElements.forEach(el => {
        el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    });
});

// --- Typewriter Effect ---
const usernameEl = document.getElementById('discord-username');
const text = "axolek";
let index = 0;
let isDeleting = false;

function type() {
    const currentText = text.slice(0, index);
    usernameEl.textContent = currentText;
    if (!isDeleting && index < text.length) { index++; setTimeout(type, 200); }
    else if (isDeleting && index > 0) { index--; setTimeout(type, 100); }
    else { isDeleting = !isDeleting; setTimeout(type, 1500); }
}
type();

// --- Background Particles ---
let particles = [];
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0; if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0; if (this.y < 0) this.y = canvas.height;
    }
    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    }
}
function initParticles() { for (let i = 0; i < 60; i++) particles.push(new Particle()); }
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
initParticles(); animateParticles();

// --- Background Fallback ---
function setBackground() {
    const overlay = document.getElementById('background-overlay');
    const img = new Image();
    img.src = 'background.png';
    img.onload = () => { overlay.style.backgroundImage = "url('background.png')"; };
    img.onerror = () => {
        const imgJpg = new Image();
        imgJpg.src = 'background.jpg';
        imgJpg.onload = () => { overlay.style.backgroundImage = "url('background.jpg')"; };
    };
}
setBackground();

// Discord Elements
const discordAvatar = document.getElementById('discord-avatar');
const statusDot = document.getElementById('status-dot');
const activityContainer = document.getElementById('activity-container');
const spotifyPresence = document.getElementById('spotify-presence');

// --- Entry Logic ---
entryScreen.addEventListener('click', () => {
    entryScreen.classList.add('fade-out');
    mainContent.classList.remove('hidden');
    backgroundOverlay.style.filter = "blur(4px) brightness(0.2)";
    audio.play();
    updatePlayIcon(true);
});

// --- DISCORD PRESENCE (LANYARD API) ---
// This function fetches your live Discord status, avatar, and activity.
function updateDiscordPresence() {
    fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) return;
            const user = data.data;
            const userObj = user.discord_user;
            discordAvatar.src = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${userObj.avatar}.${userObj.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`;
            document.getElementById('discord-tag').textContent = `@${userObj.username}`;

            const bannerEl = document.querySelector('.card-banner');
            if (userObj.banner) {
                bannerEl.style.background = `url(https://cdn.discordapp.com/banners/${DISCORD_ID}/${userObj.banner}.${userObj.banner.startsWith('a_') ? 'gif' : 'png'}?size=600) center/cover`;
            } else { bannerEl.style.background = "#050505"; }

            statusDot.className = user.discord_status;
            document.querySelector('.avatar-wrapper').className = `avatar-wrapper ${user.discord_status}`;

            const activity = user.activities.find(a => a.type !== 2 && a.type !== 4);
            const activityTitle = activityContainer.querySelector('.section-title');
            const activityName = activityContainer.querySelector('.activity-name');
            if (activity) {
                activityTitle.textContent = activity.type === 0 ? "PLAYING" : "ACTIVITY";
                activityName.textContent = activity.name;
            } else {
                activityTitle.textContent = "ACTIVITY";
                activityName.textContent = "Currently doing nothing";
            }

            if (user.listening_to_spotify) {
                spotifyPresence.classList.remove('hidden');
                document.getElementById('spotify-song').textContent = user.spotify.song;
                document.getElementById('spotify-artist').textContent = user.spotify.artist;
                document.getElementById('spotify-album-art').src = user.spotify.album_art_url;
            } else { spotifyPresence.classList.add('hidden'); }
        })
        .catch(err => console.error(err));
}
setInterval(updateDiscordPresence, 10000);
updateDiscordPresence();

// --- Audio Player ---
let isPlaying = false;
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function updatePlayIcon(playing) {
    isPlaying = playing;
    playPauseBtn.querySelector('i').className = playing ? 'fas fa-pause' : 'fas fa-play';
}

audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});

playPauseBtn.addEventListener('click', () => {
    if (audio.paused) { audio.play(); updatePlayIcon(true); }
    else { audio.pause(); updatePlayIcon(false); }
});

volumeSlider.addEventListener('input', (e) => { audio.volume = e.target.value; });

audio.addEventListener('timeupdate', () => { 
    progressBar.style.width = `${(audio.currentTime / audio.duration) * 100}%`; 
    currentTimeEl.textContent = formatTime(audio.currentTime);
});

loopBtn.addEventListener('click', () => { audio.loop = !audio.loop; loopBtn.style.color = audio.loop ? 'var(--accent-blue)' : '#fff'; });

document.querySelector('.progress-container').addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
});

// --- VIEW COUNTER (BACKEND INTEGRATION) ---
// Connects to the local Express server to track global views.
const API_URL = "http://localhost:3000/api/views";

async function updateViews() {
    try {
        // 1. Fetch current count
        const response = await fetch(API_URL);
        const data = await response.json();
        let count = data.count;

        // 2. Check if we should increment (once per person)
        if (!localStorage.getItem('axol_viewed')) {
            const incResponse = await fetch(`${API_URL}/increment`, { method: 'POST' });
            const incData = await incResponse.json();
            count = incData.count;
            localStorage.setItem('axol_viewed', 'true');
        }

        // 3. Animate the counter
        animateCounter(count);
    } catch (err) {
        console.error("View counter error:", err);
        // Fallback to local if backend is down
        let localViews = parseInt(localStorage.getItem('axol_views_local') || 0);
        if (!sessionStorage.getItem('axol_session_viewed')) {
            localViews++;
            localStorage.setItem('axol_views_local', localViews);
            sessionStorage.setItem('axol_session_viewed', 'true');
        }
        animateCounter(localViews);
    }
}

function animateCounter(target) {
    let current = 0;
    const interval = setInterval(() => {
        current += Math.ceil(target / 50) || 1;
        if (current >= target) {
            current = target;
            clearInterval(interval);
        }
        viewCountEl.textContent = current.toLocaleString();
    }, 20);
}
// --- Clock ---
function updateClock() {
    const timeEl = document.getElementById('local-time');
    if (!timeEl) return;
    const now = new Date();
    const options = { timeZone: 'Europe/Warsaw', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
    timeEl.textContent = now.toLocaleTimeString('en-GB', options);
}
setInterval(updateClock, 1000);
updateClock();

// --- Copy Discord Tag ---
const discordTag = document.getElementById('discord-tag');
if (discordTag) {
    discordTag.addEventListener('click', () => {
        const text = discordTag.textContent.replace('@', '');
        navigator.clipboard.writeText(text).then(() => {
            const originalText = discordTag.textContent;
            discordTag.textContent = 'Copied to clipboard!';
            discordTag.style.color = 'var(--accent-blue)';
            setTimeout(() => {
                discordTag.textContent = originalText;
                discordTag.style.color = '';
            }, 2000);
        });
    });
}

// --- Visualizer Logic ---
const visualizer = document.getElementById('visualizer');
audio.addEventListener('play', () => visualizer.classList.add('active'));
audio.addEventListener('pause', () => visualizer.classList.remove('active'));

updateViews();
