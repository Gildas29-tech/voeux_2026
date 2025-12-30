// ============================================
// CONFIGURATION
// ============================================
const ADMIN_TOKEN = "ROYAL";
const STORAGE_KEY = "voeux_locaux";
const MAX_MESSAGES = 100;

// Variables globales
let isAdminMode = false;
let localMessages = [];
let confettiEffect = null;

// ============================================
// INITIALISATION DE L'APPLICATION
// ============================================
document.addEventListener("DOMContentLoaded", function() {
    console.log("🎉 Initialisation de Royal's Vœux 2026...");
    
    // Initialiser les composants
    initMobileMenu();
    initTheme();
    initMusic();
    initBackToTop();
    initCharacterCounter();
    createSnowflakes();
    initConfetti();
    
    // Charger les messages locaux
    loadLocalMessages();
    
    // Remplir le nom si déjà connu
    const savedName = localStorage.getItem("visitorName");
    if (savedName) {
        document.getElementById("name").value = savedName;
    }
    
    // Attacher les événements des boutons
    attachButtonEvents();
    
    // Démarrer le compte à rebours
    startCountdown();
    
    console.log("✅ Application prête !");
});

// ============================================
// MENU MOBILE
// ============================================
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!menuBtn || !mobileMenu) return;
    
    menuBtn.addEventListener('click', function() {
        const isActive = mobileMenu.classList.toggle('active');
        menuBtn.textContent = isActive ? '✕' : '☰';
    });
}

// ============================================
// GESTION DU THÈME
// ============================================
function initTheme() {
    const themeToggle = document.getElementById("theme-toggle");
    const themeToggleMobile = document.getElementById("theme-toggle-mobile");
    
    // Vérifier le thème sauvegardé
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        updateThemeButtons("☀️", "Mode clair");
    }
    
    // Attacher les événements
    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener("click", toggleTheme);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle("dark-mode");
    const newTheme = isDark ? "dark" : "light";
    const icon = isDark ? "☀️" : "🌙";
    const title = isDark ? "Mode clair" : "Mode sombre";
    
    localStorage.setItem("theme", newTheme);
    updateThemeButtons(icon, title);
    showNotification(`${isDark ? "Mode sombre" : "Mode clair"} activé`, "info");
}

function updateThemeButtons(icon, title) {
    document.querySelectorAll('.theme-icon').forEach(btn => {
        btn.textContent = icon;
        btn.parentElement.title = title;
    });
}

// ============================================
// GESTION DE LA MUSIQUE
// ============================================
function initMusic() {
    const musicToggle = document.getElementById('music-toggle');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    const backgroundMusic = document.getElementById('background-music');
    
    if (!backgroundMusic) return;
    
    // Volume par défaut
    const savedVolume = localStorage.getItem('musicVolume') || 30;
    backgroundMusic.volume = savedVolume / 100;
    
    if (volumeSlider && volumeValue) {
        volumeSlider.value = savedVolume;
        volumeValue.textContent = savedVolume;
        
        volumeSlider.addEventListener('input', function() {
            const volume = this.value / 100;
            backgroundMusic.volume = volume;
            volumeValue.textContent = this.value;
            localStorage.setItem('musicVolume', this.value);
        });
    }
    
    if (musicToggle) {
        musicToggle.addEventListener('click', function() {
            if (backgroundMusic.paused) {
                backgroundMusic.play();
                musicToggle.innerHTML = '🎵 Musique';
                musicToggle.classList.remove('paused');
                showNotification("🎵 Musique activée", "info");
            } else {
                backgroundMusic.pause();
                musicToggle.innerHTML = '🔇 Musique';
                musicToggle.classList.add('paused');
                showNotification("🔇 Musique désactivée", "info");
            }
        });
    }
    
    // Démarrer la musique après interaction
    let userInteracted = false;
    const startMusic = () => {
        if (!userInteracted) {
            userInteracted = true;
            backgroundMusic.play().catch(e => console.log("Musique en attente..."));
        }
    };
    
    document.addEventListener('click', startMusic);
    document.addEventListener('touchstart', startMusic);
}

// ============================================
// BOUTON RETOUR EN HAUT
// ============================================
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', function() {
        backToTopBtn.style.display = window.pageYOffset > 300 ? 'flex' : 'none';
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// COMPTEUR DE CARACTÈRES
// ============================================
function initCharacterCounter() {
    const messageInput = document.getElementById('message');
    const charCount = document.getElementById('char-count');
    
    if (!messageInput || !charCount) return;
    
    messageInput.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count;
        
        if (count > 500) {
            charCount.style.color = 'var(--error-color)';
        } else if (count > 400) {
            charCount.style.color = 'var(--warning-color)';
        } else {
            charCount.style.color = 'var(--muted-color)';
        }
    });
}

// ============================================
// FLOCONS DE NEIGE - VERSION CORRIGÉE
// ============================================
function createSnowflakes() {
    const container = document.getElementById('snowflakes-container');
    if (!container) return;
    
    const snowflakes = ['❄', '❅', '❆', '＊', '·', '✽', '✻', '❉'];
    const isDarkMode = document.body.classList.contains('dark-mode');
    const flakeCount = window.innerWidth < 768 ? 80 : 150;
    
    // Vider le conteneur
    container.innerHTML = '';
    
    for (let i = 0; i < flakeCount; i++) {
        const snowflake = document.createElement('div');
        const sizeClass = Math.random() > 0.7 ? 'large' : (Math.random() > 0.5 ? 'medium' : 'small');
        
        snowflake.className = `snowflake ${sizeClass} ${isDarkMode ? 'dark-mode' : ''}`;
        snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.opacity = 0.6 + Math.random() * 0.4;
        
        // Animation aléatoire
        let animationName = 'fall';
        let duration = 8 + Math.random() * 4;
        
        if (Math.random() > 0.7) {
            animationName = 'fall-very-fast';
            duration = 3 + Math.random() * 2;
        } else if (Math.random() > 0.4) {
            animationName = 'fall-fast';
            duration = 5 + Math.random() * 3;
        }
        
        snowflake.style.animation = `${animationName} ${duration}s linear infinite ${Math.random() * 5}s`;
        
        container.appendChild(snowflake);
    }
}

// ============================================
// CONFETTIS - VERSION SIMPLIFIÉE
// ============================================
function initConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId = null;
    
    // Redimensionnement du canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Créer les particules de confettis
    function createConfetti() {
        particles = [];
        const colors = ['#FFD700', '#bfa06a', '#243b6b', '#4CAF50', '#9C27B0', '#2196F3', '#FF9800'];
        
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 2,
                angle: Math.random() * Math.PI * 2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }
    
    // Animer les confettis
    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.y += p.speed;
            p.x += Math.sin(p.angle) * 0.5;
            p.rotation += p.rotationSpeed;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            ctx.restore();
            
            // Réinitialiser si hors écran
            if (p.y > canvas.height + 50) {
                p.y = -50;
                p.x = Math.random() * canvas.width;
            }
        });
        
        animationId = requestAnimationFrame(animateConfetti);
    }
    
    // Fonction pour lancer les confettis
    window.launchConfetti = function() {
        createConfetti();
        canvas.style.display = 'block';
        
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        animateConfetti();
        
        // Arrêter après 5 secondes
        setTimeout(() => {
            cancelAnimationFrame(animationId);
            setTimeout(() => {
                canvas.style.display = 'none';
                particles = [];
            }, 1000);
        }, 5000);
    };
}

// ============================================
// ATTACHER LES ÉVÉNEMENTS DES BOUTONS
// ============================================
function attachButtonEvents() {
    // Bouton Célébrer
    const celebrateBtns = document.querySelectorAll('#celebrate-btn, #celebrate-btn-mobile');
    celebrateBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (window.launchConfetti) {
                window.launchConfetti();
                showNotification("🎊 Célébrons la nouvelle année !", "success");
            }
        });
    });
    
    // Bouton Admin
    const adminBtns = document.querySelectorAll('.admin-btn, [onclick*="openAdminLogin"]');
    adminBtns.forEach(btn => {
        btn.addEventListener('click', openAdminLogin);
    });
    
    // Formulaire
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitMessage);
    }
    
    // Boutons de fermeture
    document.querySelectorAll('.close-wish-card, .close-modal-btn, .close-admin-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('close-wish-card')) {
                closeWishCard();
            } else if (this.classList.contains('close-modal-btn')) {
                closeAdminLogin();
            } else if (this.classList.contains('close-admin-btn')) {
                closeAdminPanel();
            }
        });
    });
}

// ============================================
// CARTE DE VŒUX
// ============================================
let lastWishSender = '';
let lastWishMessage = '';

function showWishCard(senderName, message) {
    lastWishSender = senderName;
    lastWishMessage = message;
    
    const wishPhrases = [
        "Que cette nouvelle année 2026 vous apporte bonheur, santé et prospérité !",
        "Je vous souhaite une année remplie de joie, d'amour et de réussite dans tous vos projets.",
        "Puisse 2026 être pour vous une année de paix, de santé et de réalisations personnelles."
    ];
    
    const randomPhrase = wishPhrases[Math.floor(Math.random() * wishPhrases.length)];
    
    document.getElementById('wish-card-from').textContent = `De la part de GILDAS`;
    document.getElementById('wish-card-message').innerHTML = `
        <strong>Cher ${senderName},</strong><br><br>
        Merci du fond du cœur pour vos merveilleux vœux !<br><br>
        "${message}"<br><br>
        En retour, ${randomPhrase}<br><br>
        Profitons ensemble de cette nouvelle année !
    `;
    
    document.getElementById('wish-card-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeWishCard() {
    document.getElementById('wish-card-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function shareOnWhatsApp() {
    const text = `🎉 Carte de Vœux 2026 🎉\n\nDe la part de ${lastWishSender}\n\n"${lastWishMessage}"\n\nEnvoyé via le site de vœux de Royal's 🎊`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareOnFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
}

function copyWishCard() {
    const text = `🎉 Carte de Vœux 2026 🎉\n\nDe la part de ${lastWishSender}\n\n"${lastWishMessage}"`;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification("📋 Texte copié !", "success");
    }).catch(() => {
        showNotification("❌ Erreur lors de la copie", "error");
    });
}

// ============================================
// GESTION DES MESSAGES
// ============================================
function loadLocalMessages() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        localMessages = raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Erreur lecture localStorage:", e);
        localMessages = [];
    }
}

function saveLocalMessage(message) {
    try {
        localMessages.push(message);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localMessages.slice(-MAX_MESSAGES)));
        return true;
    } catch (e) {
        console.error("Erreur sauvegarde locale:", e);
        return false;
    }
}

function getVisitorId() {
    let visitorId = localStorage.getItem("visitorId");
    if (!visitorId) {
        visitorId = "visitor_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("visitorId", visitorId);
    }
    return visitorId;
}

async function submitMessage() {
    const nameInput = document.getElementById("name");
    const messageInput = document.getElementById("message");
    const submitBtn = document.getElementById("submit-btn");
    
    const name = (nameInput.value || "").trim();
    const message = (messageInput.value || "").trim();
    
    if (!message) {
        showNotification("Veuillez écrire un message", "error");
        return;
    }
    
    if (message.length > 500) {
        showNotification("Message trop long (max 500 caractères)", "error");
        return;
    }
    
    if (name) {
        localStorage.setItem("visitorName", name);
    }
    
    const newMessage = {
        name: name || localStorage.getItem("visitorName") || "Anonyme",
        text: message,
        time: new Date().toISOString(),
        visitorId: getVisitorId(),
        localId: "local_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        synced: false,
        source: "local"
    };
    
    // Désactiver le bouton pendant l'envoi
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Envoi...</span>';
    
    // Sauvegarder localement
    saveLocalMessage(newMessage);
    
    // Simuler un envoi (on peut ajouter Firebase plus tard)
    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-icon">✨</span><span class="btn-text">Envoyer mes vœux</span>';
        
        messageInput.value = "";
        document.getElementById('char-count').textContent = "0";
        
        showNotification("✨ Merci pour vos vœux !", "success");
        
        // Afficher la carte de vœux
        setTimeout(() => {
            showWishCard(newMessage.name, newMessage.text);
        }, 800);
        
        // Lancer les confettis
        setTimeout(() => {
            if (window.launchConfetti) window.launchConfetti();
        }, 1200);
    }, 1500);
}

// ============================================
// COMPTE À REBOURS
// ============================================
function startCountdown() {
    const targetDate = new Date(2026, 0, 1, 0, 0, 0);
    const daysEl = document.getElementById("cd-days");
    const hoursEl = document.getElementById("cd-hours");
    const minsEl = document.getElementById("cd-mins");
    const secsEl = document.getElementById("cd-secs");
    
    function update() {
        const now = new Date();
        const diff = targetDate - now;
        
        if (diff <= 0) {
            daysEl.textContent = "0";
            hoursEl.textContent = "00";
            minsEl.textContent = "00";
            secsEl.textContent = "00";
            if (window.launchConfetti) window.launchConfetti();
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        daysEl.textContent = days;
        hoursEl.textContent = hours.toString().padStart(2, "0");
        minsEl.textContent = minutes.toString().padStart(2, "0");
        secsEl.textContent = seconds.toString().padStart(2, "0");
        
        // Animation des secondes
        if (seconds === 59) {
            secsEl.classList.add("tick");
            setTimeout(() => secsEl.classList.remove("tick"), 300);
        }
    }
    
    update();
    setInterval(update, 1000);
}

// ============================================
// FONCTIONS ADMIN
// ============================================
function openAdminLogin() {
    document.getElementById('admin-login-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeAdminLogin() {
    document.getElementById('admin-login-modal').style.display = 'none';
    document.getElementById('admin-password').value = '';
    document.body.style.overflow = 'auto';
}

function checkAdminLogin() {
    const password = document.getElementById('admin-password').value;
    
    if (password === ADMIN_TOKEN) {
        isAdminMode = true;
        localStorage.setItem('adminToken', ADMIN_TOKEN);
        closeAdminLogin();
        document.getElementById('admin-panel').style.display = 'block';
        
        setTimeout(() => {
            document.getElementById('admin-panel').classList.add('open');
            renderAdminWishes();
        }, 10);
        
        showNotification("🔧 Mode administrateur activé", "success");
    } else {
        showNotification("Token incorrect", "error");
    }
}

function closeAdminPanel() {
    document.getElementById('admin-panel').classList.remove('open');
    setTimeout(() => {
        document.getElementById('admin-panel').style.display = 'none';
        isAdminMode = false;
    }, 300);
}

function renderAdminWishes() {
    if (!isAdminMode) return;
    
    const wishesList = document.getElementById('admin-wishes-list');
    const messagesCount = document.getElementById('admin-messages-count');
    
    if (!wishesList) return;
    
    wishesList.innerHTML = '';
    
    if (localMessages.length === 0) {
        wishesList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--muted-color);">
                <div style="font-size: 3rem; opacity: 0.5;">✨</div>
                <div style="margin-top: 15px;">
                    <strong>Aucun vœu pour le moment</strong>
                </div>
            </div>
        `;
        if (messagesCount) messagesCount.textContent = "0";
        return;
    }
    
    if (messagesCount) messagesCount.textContent = localMessages.length;
    
    // Afficher les vœux
    localMessages.slice(0, 15).forEach((msg, index) => {
        const wishItem = document.createElement('div');
        wishItem.className = 'admin-wish-item';
        wishItem.style.animationDelay = `${index * 0.1}s`;
        
        wishItem.innerHTML = `
            <div class="admin-wish-header">
                <div class="admin-wish-author">${msg.name || "Anonyme"}</div>
                <div class="admin-wish-time">
                    ${new Date(msg.time).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                    })}
                    ${msg.synced ? "" : " 🔄"}
                </div>
            </div>
            <div class="admin-wish-content">${msg.text}</div>
            <div style="font-size: 0.8rem; color: var(--muted-color); margin-top: 8px;">
                Visiteur: ${msg.visitorId.substring(0, 8)}...
            </div>
        `;
        
        wishesList.appendChild(wishItem);
    });
}

function refreshAdminWishes() {
    loadLocalMessages();
    renderAdminWishes();
    showNotification(`✅ ${localMessages.length} vœux affichés`, "success");
}

function clearAllMessages() {
    if (!confirm("⚠️ Supprimer TOUS les vœux ?\nCette action est irréversible !")) return;
    
    localStorage.removeItem(STORAGE_KEY);
    localMessages = [];
    renderAdminWishes();
    showNotification("✅ Tous les vœux ont été supprimés", "success");
    
    if (window.launchConfetti) window.launchConfetti();
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type = "info") {
    // Supprimer les anciennes notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-suppression
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// ÉVÉNEMENTS GLOBAUX
// ============================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Fermer la carte de vœux
        if (document.getElementById('wish-card-modal').style.display === 'flex') {
            closeWishCard();
        }
        // Fermer le login admin
        if (document.getElementById('admin-login-modal').style.display === 'flex') {
            closeAdminLogin();
        }
        // Fermer le panel admin
        if (document.getElementById('admin-panel').style.display === 'block') {
            closeAdminPanel();
        }
    }
});

// Empêcher le zoom avec Ctrl+scroll
document.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
        e.preventDefault();
    }
}, { passive: false });