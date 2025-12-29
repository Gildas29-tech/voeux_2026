// ============================================
// CONFIGURATION
// ============================================
const ADMIN_TOKEN = "ROYALS2026";
const STORAGE_KEY = "voeux_locaux";
const MAX_MESSAGES = 100;

// Références globales
let db = null;
let firebaseModules = null;
let unsubscribeListener = null;
let localMessages = [];
let isAdminMode = false;

// ============================================
// GESTION DE LA MUSIQUE
// ============================================
let backgroundMusic = null;
let isMusicPlaying = false;

function initMusic() {
    backgroundMusic = document.getElementById('background-music');
    
    // Vérifier si l'utilisateur a déjà interagi avec la page
    let userInteracted = false;
    
    // Fonction pour démarrer la musique après interaction utilisateur
    function startMusicAfterInteraction() {
        if (!userInteracted && backgroundMusic) {
            try {
                backgroundMusic.volume = 0.5; // Volume à 50%
                backgroundMusic.loop = true;
                backgroundMusic.play().then(() => {
                    isMusicPlaying = true;
                    updateMusicButton();
                    console.log("🎵 Musique démarrée automatiquement");
                }).catch(error => {
                    console.log("🎵 Musique en attente d'interaction utilisateur");
                });
            } catch (error) {
                console.error("Erreur démarrage musique:", error);
            }
        }
    }
    
    // Essayer de démarrer la musique immédiatement
    setTimeout(startMusicAfterInteraction, 1000);
    
    // Écouter les interactions utilisateur
    document.addEventListener('click', function() {
        if (!userInteracted && backgroundMusic && !isMusicPlaying) {
            userInteracted = true;
            try {
                backgroundMusic.play().then(() => {
                    isMusicPlaying = true;
                    updateMusicButton();
                });
            } catch (error) {
                console.error("Erreur démarrage musique après interaction:", error);
            }
        }
    });
    
    // Initialiser le contrôle du volume
    const volumeSlider = document.getElementById('volume-slider');
    const volumeValue = document.getElementById('volume-value');
    
    if (volumeSlider && volumeValue && backgroundMusic) {
        // Récupérer le volume sauvegardé ou utiliser 50% par défaut
        const savedVolume = localStorage.getItem('musicVolume');
        const initialVolume = savedVolume ? parseInt(savedVolume) / 100 : 0.5;
        
        backgroundMusic.volume = initialVolume;
        volumeSlider.value = initialVolume * 100;
        volumeValue.textContent = Math.round(initialVolume * 100);
        
        // Mettre à jour le volume quand le slider change
        volumeSlider.addEventListener('input', function() {
            const volume = this.value / 100;
            backgroundMusic.volume = volume;
            volumeValue.textContent = this.value;
            
            // Sauvegarder le volume
            localStorage.setItem('musicVolume', this.value);
        });
    }
    
    // Gestion du bouton musique
    const musicToggle = document.getElementById('music-toggle');
    const volumeControl = document.getElementById('volume-control');
    
    if (musicToggle) {
        musicToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMusic();
        });
        
        // Afficher/masquer le contrôle de volume
        musicToggle.addEventListener('mouseenter', function() {
            if (volumeControl) {
                volumeControl.classList.add('show');
            }
        });
        
        musicToggle.addEventListener('mouseleave', function() {
            setTimeout(() => {
                if (volumeControl && !volumeControl.matches(':hover')) {
                    volumeControl.classList.remove('show');
                }
            }, 300);
        });
        
        if (volumeControl) {
            volumeControl.addEventListener('mouseenter', function() {
                this.classList.add('show');
            });
            
            volumeControl.addEventListener('mouseleave', function() {
                setTimeout(() => {
                    if (!musicToggle.matches(':hover')) {
                        this.classList.remove('show');
                    }
                }, 300);
            });
        }
    }
}

function toggleMusic() {
    if (!backgroundMusic) return;
    
    try {
        if (isMusicPlaying) {
            backgroundMusic.pause();
            isMusicPlaying = false;
        } else {
            backgroundMusic.play().then(() => {
                isMusicPlaying = true;
            }).catch(error => {
                console.error("Erreur démarrage musique:", error);
                showNotification("Cliquez n'importe où sur la page pour activer la musique", "warning");
            });
        }
        updateMusicButton();
    } catch (error) {
        console.error("Erreur contrôle musique:", error);
    }
}

function updateMusicButton() {
    const musicToggle = document.getElementById('music-toggle');
    if (!musicToggle) return;
    
    if (isMusicPlaying) {
        musicToggle.innerHTML = '🎵 Musique';
        musicToggle.classList.remove('paused');
    } else {
        musicToggle.innerHTML = '🔇 Musique';
        musicToggle.classList.add('paused');
    }
}

// ============================================
// ANIMATIONS - FLOCONS DE NEIGE ET CONFETTIS
// ============================================

// 1. FLOCONS DE NEIGE
function createSnowflakes() {
    const container = document.getElementById('snowflakes-container');
    const snowflakes = ['❄', '❅', '❆', '＊', '·', '✽', '✻', '❉'];
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    for (let i = 0; i < 150; i++) {
        const snowflake = document.createElement('div');
        const sizeClass = Math.random() > 0.7 ? 'large' : (Math.random() > 0.5 ? 'medium' : 'small');
        snowflake.className = `snowflake ${sizeClass} ${isDarkMode ? 'dark-mode' : ''}`;
        snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        snowflake.style.left = `${Math.random() * 100}vw`;
        
        let animationType = 'fall';
        let duration = 0;
        
        if (Math.random() > 0.7) {
            animationType = 'fall-very-fast';
            duration = 3 + Math.random() * 2;
        } else if (Math.random() > 0.4) {
            animationType = 'fall-fast';
            duration = 5 + Math.random() * 3;
        } else {
            animationType = 'fall';
            duration = 8 + Math.random() * 4;
        }
        
        const delay = Math.random() * 5;
        snowflake.style.animationName = animationType;
        snowflake.style.animationDuration = `${duration}s`;
        snowflake.style.animationDelay = `${delay}s`;
        snowflake.style.animationTimingFunction = 'linear';
        snowflake.style.animationIterationCount = 'infinite';
        snowflake.style.opacity = 0.6 + Math.random() * 0.4;
        snowflake.style.filter = `blur(${Math.random() * 0.5}px)`;
        
        container.appendChild(snowflake);
    }
    
    console.log(`🎉 ${container.children.length} flocons de neige créés`);
}

function updateSnowflakesTheme() {
    const snowflakes = document.querySelectorAll('.snowflake');
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    snowflakes.forEach(flake => {
        if (isDarkMode) {
            flake.classList.add('dark-mode');
        } else {
            flake.classList.remove('dark-mode');
        }
    });
}

// 2. CONFETTIS - EXPLOSION DE 5 SECONDES
class ConfettiEffect {
    constructor() {
        this.canvas = document.getElementById('confetti-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.active = false;
        this.animationId = null;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    // EXPLOSION DE 5 SECONDES
    launch() {
        if (this.active) {
            this.particles = [];
        }
        
        this.active = true;
        this.canvas.style.display = 'block';
        
        // Couleurs festives
        const colors = [
            '#FFD700', '#bfa06a', '#243b6b', '#4CAF50', '#9C27B0',
            '#2196F3', '#FF9800', '#E91E63', '#00BCD4', '#FF5722'
        ];
        
        // 500 particules pour une explosion spectaculaire
        for (let i = 0; i < 500; i++) {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const distance = Math.random() * 50;
            
            this.particles.push({
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                startX: centerX,
                startY: centerY,
                size: Math.random() * 12 + 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: speed,
                angle: angle,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05,
                shape: ['circle', 'rect', 'star'][Math.floor(Math.random() * 3)],
                life: 1.0,
                decay: 0.002,
                gravity: 0.05,
                wind: (Math.random() - 0.5) * 0.2,
                wobble: Math.random() * 0.5
            });
        }
        
        this.animate();
        
        // Arrêter après 5 secondes exactement
        setTimeout(() => {
            this.active = false;
            setTimeout(() => {
                if (!this.active) {
                    this.canvas.style.display = 'none';
                    this.particles = [];
                    if (this.animationId) {
                        cancelAnimationFrame(this.animationId);
                        this.animationId = null;
                    }
                }
            }, 1000);
        }, 5000);
    }
    
    animate() {
        if (!this.active && this.particles.length === 0) {
            return;
        }
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += Math.cos(p.angle) * p.speed + p.wind + Math.sin(Date.now() * 0.002 + i) * p.wobble;
            p.y += Math.sin(p.angle) * p.speed + p.gravity;
            p.rotation += p.rotationSpeed;
            p.life -= p.decay;
            
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.globalAlpha = p.life * 0.9;
            this.ctx.fillStyle = p.color;
            
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            if (p.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.shape === 'star') {
                this.ctx.beginPath();
                const spikes = 5;
                for (let j = 0; j < spikes * 2; j++) {
                    const radius = j % 2 === 0 ? p.size / 2 : p.size / 4;
                    const angle = (Math.PI * j) / spikes;
                    this.ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                }
                this.ctx.closePath();
                this.ctx.fill();
            } else {
                const cornerRadius = 4;
                this.ctx.beginPath();
                this.ctx.roundRect(-p.size / 2, -p.size / 2, p.size, p.size, cornerRadius);
                this.ctx.fill();
            }
            
            this.ctx.restore();
            
            if (p.life <= 0 || p.y > this.canvas.height + 100 || p.y < -100 || p.x > this.canvas.width + 100 || p.x < -100) {
                this.particles.splice(i, 1);
            }
        }
        
        if (this.active || this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }
}

const confettiEffect = new ConfettiEffect();

// ============================================
// CARTE DE VŒUX AVEC BOUTON RETOUR
// ============================================
let lastWishSender = '';
let lastWishMessage = '';

function showWishCard(senderName, message) {
    lastWishSender = senderName;
    lastWishMessage = message;
    
    // Phrases de vœux aléatoires
    const wishPhrases = [
        "Que cette nouvelle année 2026 vous apporte bonheur, santé et prospérité !",
        "Je vous souhaite une année remplie de joie, d'amour et de réussite dans tous vos projets.",
        "Puisse 2026 être pour vous une année de paix, de santé et de réalisations personnelles.",
        "Je vous adresse mes meilleurs vœux pour une année 2026 lumineuse et pleine de bonnes surprises.",
        "Que cette nouvelle année soit le début d'une période fantastique remplie de moments précieux.",
        "Je vous souhaite santé, bonheur et succès dans toutes vos entreprises pour 2026.",
        "Puisse cette année vous apporter tout ce que vous désirez et plus encore !"
    ];
    
    const randomPhrase = wishPhrases[Math.floor(Math.random() * wishPhrases.length)];
    
    document.getElementById('wish-card-from').textContent = `De la part de GILDAS`;
    document.getElementById('wish-card-message').innerHTML = `
        <strong>Cher ${senderName},</strong><br><br>
        Merci du fond du cœur pour vos merveilleux vœux !<br><br>
        "${message}"<br><br>
        En retour, ${randomPhrase}<br><br>
        Profitons ensemble de cette nouvelle année pour réaliser nos rêves les plus chers !
    `;
    
    document.getElementById('wish-card-modal').style.display = 'flex';
}

function closeWishCard() {
    document.getElementById('wish-card-modal').style.display = 'none';
    // Si la personne ne veut pas partager, on retourne simplement au site
    showNotification("✨ Retour au site", "info");
}

function shareOnWhatsApp() {
    const text = `🎉 Carte de Vœux 2026 🎉\n\nDe la part de ${lastWishSender}\n\n"${lastWishMessage}"\n\nJe te souhaite une merveilleuse année 2026 pleine de bonheur, santé et succès !\n\nEnvoyé via le site de vœux de Royal's 🎊\n#Vœux2026 #BonneAnnée`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function shareOnFacebook() {
    const text = `🎉 Je viens de recevoir une magnifique carte de vœux 2026 ! 🎊\n\nPartagez vos vœux sur le site de Royal's : ${window.location.href}\n\n#Vœux2026 #BonneAnnée #RoyalsVœux`;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

function copyWishCard() {
    const text = `🎉 Carte de Vœux 2026 🎉\n\nDe la part de ${lastWishSender}\n\n"${lastWishMessage}"\n\nJe te souhaite une merveilleuse année 2026 pleine de bonheur, santé et succès !\n\nEnvoyé via le site de vœux de Royal's 🎊\n#Vœux2026 #BonneAnnée`;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification("📋 Texte copié dans le presse-papier !", "success");
    }).catch(err => {
        console.error('Erreur de copie : ', err);
        showNotification("❌ Erreur lors de la copie", "error");
    });
}

// Fermer la carte avec ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('wish-card-modal').style.display === 'flex') {
        closeWishCard();
    }
});

// ============================================
// INITIALISATION DU THÈME
// ============================================
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
        themeToggle.title = 'Passer en mode clair';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.textContent = '🌙';
        themeToggle.title = 'Passer en mode sombre';
    }
    
    themeToggle.addEventListener('click', function() {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = '🌙';
            themeToggle.title = 'Passer en mode sombre';
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '☀️';
            themeToggle.title = 'Passer en mode clair';
        }
        
        updateSnowflakesTheme();
    });
}

// ============================================
// FONCTIONS ADMIN
// ============================================
function openAdminLogin() {
    document.getElementById('admin-login-modal').style.display = 'flex';
}

function closeAdminLogin() {
    document.getElementById('admin-login-modal').style.display = 'none';
    document.getElementById('admin-password').value = '';
}

// ============================================
// GESTION DES VISITEURS
// ============================================
function getVisitorId() {
    let visitorId = localStorage.getItem("visitorId");
    if (!visitorId) {
        visitorId = "visitor_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("visitorId", visitorId);
    }
    return visitorId;
}

function getVisitorName() {
    return localStorage.getItem("visitorName") || "";
}

function setVisitorName(name) {
    if (name && name.trim()) {
        localStorage.setItem("visitorName", name.trim());
    }
}

// ============================================
// GESTION DES MESSAGES LOCAUX
// ============================================
function getLocalMessages() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        localMessages = raw ? JSON.parse(raw) : [];
        return localMessages.slice(-MAX_MESSAGES);
    } catch (e) {
        console.error("Erreur lecture localStorage:", e);
        localMessages = [];
        return [];
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

function markLocalMessageAsSynced(localId) {
    localMessages = localMessages.map(msg => 
        msg.localId === localId ? { ...msg, synced: true, syncedAt: new Date().toISOString() } : msg
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localMessages.slice(-MAX_MESSAGES)));
}

// ============================================
// FONCTIONS FIREBASE
// ============================================
async function initFirebase() {
    try {
        await new Promise(resolve => {
            const checkFirebase = () => {
                if (window.firebaseDb && window.firebaseModules) {
                    db = window.firebaseDb;
                    firebaseModules = window.firebaseModules;
                    console.log("✅ Firebase connecté");
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
        
        listenToFirebaseMessages();
        setTimeout(syncLocalMessages, 2000);
        return true;
    } catch (error) {
        console.error("❌ Erreur initialisation Firebase:", error);
        renderMessages(getLocalMessages());
        return false;
    }
}

function listenToFirebaseMessages() {
    if (!db || !firebaseModules) {
        console.warn("Firebase non disponible");
        return;
    }
    
    if (unsubscribeListener) unsubscribeListener();
    
    const { collection, query, orderBy, limit, onSnapshot } = firebaseModules;
    
    const messagesQuery = query(
        collection(db, "messages"),
        orderBy("timestamp", "desc"),
        limit(50)
    );
    
    unsubscribeListener = onSnapshot(messagesQuery,
        (snapshot) => {
            const firebaseMessages = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                firebaseMessages.push({
                    id: doc.id,
                    name: data.name || "Anonyme",
                    text: data.text || "",
                    time: data.time || (data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString()),
                    visitorId: data.visitorId || "inconnu",
                    source: "firebase",
                    synced: true
                });
            });
            
            const localMessages = getLocalMessages()
                .filter(msg => !msg.synced)
                .map(msg => ({
                    ...msg,
                    source: "local",
                    synced: false
                }));
            
            const allMessages = [...firebaseMessages, ...localMessages];
            allMessages.sort((a, b) => new Date(b.time) - new Date(a.time));
            
            renderMessages(allMessages);
            updateAdminStats(allMessages.length, firebaseMessages.length, localMessages.length);
        },
        (error) => {
            console.error("Erreur écoute Firebase:", error);
        }
    );
}

async function sendMessageToFirebase(message) {
    if (!db || !firebaseModules) {
        throw new Error("Firebase non disponible");
    }
    
    const { collection, addDoc, serverTimestamp } = firebaseModules;
    
    const docRef = await addDoc(collection(db, "messages"), {
        name: message.name,
        text: message.text,
        time: message.time,
        visitorId: message.visitorId,
        localId: message.localId,
        timestamp: serverTimestamp()
    });
    
    return docRef.id;
}

async function syncLocalMessages() {
    if (!db || !firebaseModules) return;
    
    const unsynced = localMessages.filter(msg => !msg.synced);
    
    if (unsynced.length === 0) return;
    
    let successCount = 0;
    for (const msg of unsynced) {
        try {
            await sendMessageToFirebase(msg);
            markLocalMessageAsSynced(msg.localId);
            successCount++;
        } catch (error) {
            console.error("Erreur synchronisation:", error);
        }
    }
    
    if (successCount > 0) {
        showNotification(`${successCount} message(s) synchronisés`, "success");
    }
}

// ============================================
// FONCTIONS PRINCIPALES
// ============================================
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
    
    if (name) setVisitorName(name);
    
    const newMessage = {
        name: name || getVisitorName() || "Anonyme",
        text: message,
        time: new Date().toISOString(),
        visitorId: getVisitorId(),
        localId: "local_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        synced: false,
        source: "local"
    };
    
    submitBtn.textContent = "Envoi en cours...";
    submitBtn.disabled = true;
    
    saveLocalMessage(newMessage);
    renderMessages(getLocalMessages());
    
    let firebaseSuccess = false;
    if (db && firebaseModules) {
        try {
            await sendMessageToFirebase(newMessage);
            markLocalMessageAsSynced(newMessage.localId);
            firebaseSuccess = true;
            showNotification("✨ Votre vœu a été partagé !", "success");
        } catch (error) {
            console.error("Erreur envoi Firebase:", error);
            showNotification("Vœu sauvegardé localement", "warning");
        }
    } else {
        showNotification("Vœu sauvegardé (mode hors ligne)", "info");
    }
    
    submitBtn.textContent = "✨ Envoyer mon vœu";
    submitBtn.disabled = false;
    messageInput.value = "";
    nameInput.value = "";
    messageInput.focus();
    
    // Afficher la carte de vœux
    setTimeout(() => {
        showWishCard(newMessage.name, newMessage.text);
    }, 800);
    
    // Lancer les confettis
    if (firebaseSuccess) {
        setTimeout(() => {
            confettiEffect.launch();
        }, 1200);
    }
}

function renderMessages(messages) {
    const messagesList = document.getElementById("messages-list");
    const countEl = document.getElementById("messages-count");
    const emptyState = document.getElementById("empty-state");
    
    messagesList.innerHTML = "";
    
    if (messages.length === 0) {
        countEl.textContent = "0";
        emptyState.style.display = "flex";
        return;
    }
    
    emptyState.style.display = "none";
    countEl.textContent = messages.length;
    
    messages.slice(0, 30).forEach((msg, index) => {
        const li = document.createElement("li");
        li.className = "message-item";
        li.style.animationDelay = `${index * 0.1}s`;
        
        const avatar = document.createElement("div");
        avatar.className = "message-avatar";
        const firstChar = (msg.name || "").trim().charAt(0).toUpperCase();
        avatar.textContent = firstChar && /[A-ZÀ-ÿ]/.test(firstChar) ? firstChar : "🎉";
        
        const content = document.createElement("div");
        content.className = "message-content";
        
        const meta = document.createElement("div");
        meta.className = "message-meta";
        
        const authorDiv = document.createElement("div");
        authorDiv.className = "message-author";
        authorDiv.textContent = msg.name || "Anonyme";
        
        const timeDiv = document.createElement("div");
        timeDiv.className = "message-time";
        timeDiv.textContent = new Date(msg.time).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
        
        meta.appendChild(authorDiv);
        meta.appendChild(timeDiv);
        
        if (msg.source === "local" && !msg.synced) {
            const badge = document.createElement("span");
            badge.textContent = "🔄";
            badge.title = "En attente de synchronisation";
            badge.style.marginLeft = "5px";
            badge.style.fontSize = "0.8em";
            meta.appendChild(badge);
        }
        
        const text = document.createElement("div");
        text.className = "message-text";
        text.textContent = msg.text;
        
        content.appendChild(meta);
        content.appendChild(text);
        li.appendChild(avatar);
        li.appendChild(content);
        messagesList.appendChild(li);
    });
}

function refreshMessages() {
    const btn = document.querySelector(".refresh-btn");
    btn.style.transform = "rotate(180deg)";
    
    if (db) {
        listenToFirebaseMessages();
        showNotification("Messages actualisés", "info");
    } else {
        renderMessages(getLocalMessages());
        showNotification("Mode local", "warning");
    }
    
    setTimeout(() => {
        btn.style.transform = "rotate(0deg)";
    }, 300);
}

// ============================================
// FONCTIONS ADMIN
// ============================================
function checkAdminLogin() {
    const password = document.getElementById('admin-password').value;
    
    if (password === ADMIN_TOKEN) {
        isAdminMode = true;
        localStorage.setItem('adminToken', ADMIN_TOKEN);
        document.getElementById('admin-login-modal').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        setTimeout(() => {
            document.getElementById('admin-panel').classList.add('open');
        }, 10);
        showNotification("🔧 Mode administrateur activé", "success");
        updateAdminStats();
        document.getElementById('admin-password').value = '';
    } else {
        showNotification("Token incorrect", "error");
    }
}

function closeAdminPanel() {
    document.getElementById('admin-panel').classList.remove('open');
    setTimeout(() => {
        document.getElementById('admin-panel').style.display = 'none';
    }, 300);
}

function updateAdminStats(total = 0, online = 0, local = 0) {
    if (!isAdminMode) return;
    
    const messages = getLocalMessages();
    const firebaseCount = online || 0;
    const localCount = local || messages.length;
    const totalCount = total || messages.length;
    const visitors = new Set(messages.map(m => m.visitorId)).size;
    
    document.getElementById('admin-total-count').textContent = totalCount;
    document.getElementById('admin-online-count').textContent = firebaseCount;
    document.getElementById('admin-local-count').textContent = localCount;
    document.getElementById('admin-visitors-count').textContent = visitors;
}

async function clearAllMessages() {
    if (!confirm("⚠️ Supprimer TOUS les vœux ?\nCette action est irréversible !")) return;
    
    try {
        if (db && firebaseModules) {
            const { collection, getDocs, writeBatch } = firebaseModules;
            const querySnapshot = await getDocs(collection(db, "messages"));
            const batch = writeBatch(db);
            querySnapshot.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
        }
        
        localStorage.removeItem(STORAGE_KEY);
        localMessages = [];
        renderMessages([]);
        updateAdminStats();
        showNotification("✅ Tous les vœux ont été supprimés", "success");
        confettiEffect.launch();
    } catch (error) {
        console.error("Erreur suppression:", error);
        showNotification("❌ Erreur lors de la suppression", "error");
    }
}

function exportMessages() {
    const messages = getLocalMessages();
    if (messages.length === 0) {
        showNotification("Aucun message à exporter", "warning");
        return;
    }
    
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `voeux-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification(`📥 ${messages.length} messages exportés`, "success");
}

function importMessages() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (!Array.isArray(imported)) throw new Error("Format invalide");
                
                const existing = getLocalMessages();
                const allMessages = [...existing, ...imported];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(allMessages.slice(-MAX_MESSAGES)));
                
                renderMessages(getLocalMessages());
                showNotification(`📤 ${imported.length} messages importés`, "success");
            } catch (error) {
                showNotification("❌ Fichier JSON invalide", "error");
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function syncAllMessages() {
    syncLocalMessages();
}

function showDetailedStats() {
    const messages = getLocalMessages();
    const visitors = new Set(messages.map(m => m.visitorId));
    const synced = messages.filter(m => m.synced).length;
    const pending = messages.filter(m => !m.synced).length;
    
    const detailsDiv = document.getElementById('admin-stats-details');
    detailsDiv.innerHTML = `
        <div style="background: rgba(0,0,0,0.05); padding: 15px; border-radius: 10px; margin-top: 15px;">
            <strong>📊 Statistiques détaillées :</strong><br>
            • ${visitors.size} visiteur(s) unique(s)<br>
            • ${synced} message(s) synchronisé(s)<br>
            • ${pending} message(s) en attente<br>
            • ${messages.length} message(s) total<br>
            <div style="margin-top: 10px; font-size: 0.8rem; color: var(--muted-color);">
                Dernière mise à jour : ${new Date().toLocaleTimeString()}
            </div>
        </div>
    `;
}

// ============================================
// ANIMATIONS ET EFFETS
// ============================================
function launchConfetti() {
    confettiEffect.launch();
    
    // Animation de la carte
    const card = document.getElementById('greeting-card');
    if (card) {
        card.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.05)' },
            { transform: 'scale(1)' }
        ], {
            duration: 500,
            easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)'
        });
    }
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// COMPTE À REBOURS
// ============================================
function startCountdown(targetDate) {
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
            confettiEffect.launch();
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
    }
    
    update();
    setInterval(update, 1000);
}

// ============================================
// INITIALISATION
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
    console.log("🎉 Initialisation de l'application Royal's Vœux 2026...");
    
    // Initialiser le thème
    initTheme();
    
    // Initialiser la musique
    initMusic();
    
    // Démarrer les flocons de neige
    createSnowflakes();
    
    // Charger les messages locaux
    getLocalMessages();
    
    // Initialiser Firebase
    setTimeout(initFirebase, 500);
    
    // Remplir le nom si déjà connu
    const savedName = getVisitorName();
    if (savedName) {
        document.getElementById("name").value = savedName;
    }
    
    // Bouton "Fêter !" - EXPLOSION DE 5 SECONDES
    document.getElementById("celebrate-btn").addEventListener("click", () => {
        confettiEffect.launch();
        showNotification("🎊 Fêtez la nouvelle année !", "success");
        
        // Animation du bouton
        const btn = document.getElementById("celebrate-btn");
        btn.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.2)' },
            { transform: 'scale(1)' }
        ], {
            duration: 400,
            easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)'
        });
    });
    
    // Compte à rebours
    const targetDate = new Date(2026, 0, 1, 0, 0, 0);
    startCountdown(targetDate);
    
    console.log("✅ Application Royal's prête avec musique automatique ! 🎵✨");
});