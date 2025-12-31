// ============================================
// CONFIGURATION
// ============================================
const ADMIN_TOKEN = "ROYAL";
const MAX_FLAKES = 200; // Beaucoup plus de flocons
const MESSAGES_PER_PAGE = 10;

// Variables globales
let isAdminMode = false;
let isSending = false;
let confettiAnimation = null;
let allWishes = [];
let currentPage = 1;
let totalMessages = 0;
let snowflakesInterval = null;

// ============================================
// INITIALISATION PRINCIPALE
// ============================================
document.addEventListener("DOMContentLoaded", function() {
    console.log("🎉 Initialisation de Royal's Vœux 2026...");
    
    // Initialiser tout
    initAllComponents();
    
    // Remplir nom
    const savedName = localStorage.getItem("visitorName");
    if (savedName && document.getElementById("name")) {
        document.getElementById("name").value = savedName;
    }
    
    // Démarrer les animations IMMÉDIATEMENT
    startCountdown();
    createSnowflakes();
    initConfetti();
    
    // Vérifier Firebase
    setTimeout(() => {
        if (window.firebaseDb && window.firebaseModules) {
            console.log("✅ Firebase détecté, chargement des vœux...");
            loadWishesFromFirebase();
        } else {
            console.warn("⚠️ Firebase non détecté");
        }
    }, 1500);
    
    console.log("✅ Application prête !");
});

// ============================================
// INITIALISATION DE TOUS LES COMPOSANTS
// ============================================
function initAllComponents() {
    console.log("🔄 Initialisation des composants...");
    
    // 1. Menu mobile
    initMobileMenu();
    
    // 2. Thème
    initTheme();
    
    // 3. Musique
    initMusic();
    
    // 4. Retour en haut
    initBackToTop();
    
    // 5. Compteur de caractères
    initCharCounter();
    
    // 6. Boutons événements
    initEventButtons();
    
    // 7. Formulaire
    initForm();
}

function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = mobileMenu.classList.toggle('active');
            menuBtn.textContent = isActive ? '✕' : '☰';
        });
        
        document.addEventListener('click', function(event) {
            if (!menuBtn.contains(event.target) && !mobileMenu.contains(event.target) && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                menuBtn.textContent = '☰';
            }
        });
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }
    
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener("click", toggleTheme);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    showNotification(`${isDark ? "Mode sombre" : "Mode clair"} activé`, "info");
    updateSnowflakes();
}

function initMusic() {
    const musicToggle = document.getElementById('music-toggle');
    const backgroundMusic = document.getElementById('background-music');
    
    if (musicToggle && backgroundMusic) {
        const savedVolume = localStorage.getItem('musicVolume') || 50;
        backgroundMusic.volume = savedVolume / 100;
        
        musicToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (backgroundMusic.paused) {
                backgroundMusic.play().then(() => {
                    musicToggle.innerHTML = '🎵 Musique';
                }).catch(err => {
                    console.log("Audio bloqué:", err);
                    musicToggle.innerHTML = '🔇 Musique';
                });
            } else {
                backgroundMusic.pause();
                musicToggle.innerHTML = '🔇 Musique';
            }
        });
        
        const volumeSlider = document.getElementById('volume-slider');
        const volumeValue = document.getElementById('volume-value');
        const volumeControl = document.getElementById('volume-control');
        
        if (volumeSlider && volumeValue && volumeControl) {
            volumeSlider.value = savedVolume;
            volumeValue.textContent = savedVolume;
            
            volumeSlider.addEventListener('input', function() {
                const volume = this.value / 100;
                backgroundMusic.volume = volume;
                volumeValue.textContent = this.value;
                localStorage.setItem('musicVolume', this.value);
            });
            
            musicToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                volumeControl.classList.toggle('show');
            });
            
            document.addEventListener('click', function() {
                volumeControl.classList.remove('show');
            });
            
            volumeControl.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }
}

function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            backToTopBtn.style.display = window.pageYOffset > 300 ? 'flex' : 'none';
        });
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function initCharCounter() {
    const messageInput = document.getElementById('message');
    const charCount = document.getElementById('char-count');
    
    if (messageInput && charCount) {
        messageInput.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            if (count > 450) {
                charCount.style.color = '#ef4444';
            } else if (count > 400) {
                charCount.style.color = '#f59e0b';
            } else {
                charCount.style.color = '';
            }
        });
    }
}

function initEventButtons() {
    const celebrateBtn = document.getElementById('celebrate-btn');
    if (celebrateBtn) {
        celebrateBtn.addEventListener('click', function() {
            launchConfetti();
        });
    }
    
    const celebrateBtnMobile = document.getElementById('celebrate-btn-mobile');
    if (celebrateBtnMobile) {
        celebrateBtnMobile.addEventListener('click', function() {
            launchConfetti();
        });
    }
}

function initForm() {
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
        messageTextarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                submitMessage();
            }
        });
    }
    
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitMessage);
    }
}

// ============================================
// FLOCONS DE NEIGE - BEAUCOUP PLUS NOMBREUX
// ============================================
function createSnowflakes() {
    console.log("❄️ Création des flocons de neige...");
    const container = document.getElementById('snowflakes-container');
    if (!container) {
        console.error("❌ Conteneur de flocons non trouvé!");
        return;
    }
    
    const snowflakes = ['❄', '❅', '❆', '✦', '✧', '＊', '❉', '✱', '✳', '❋'];
    container.innerHTML = '';
    
    // Créer BEAUCOUP de flocons
    for (let i = 0; i < MAX_FLAKES; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        // Taille très variée
        const size = Math.random() * 2.5 + 0.2;
        snowflake.style.fontSize = `${size}rem`;
        
        // Type de flocon aléatoire
        snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        
        // Position horizontale aléatoire
        snowflake.style.left = `${Math.random() * 100}vw`;
        
        // Opacité variée
        snowflake.style.opacity = 0.2 + Math.random() * 0.8;
        
        // Vitesse très variée (1-10 secondes)
        const speed = 1 + Math.random() * 9;
        const delay = Math.random() * 5;
        
        // Choix de l'animation
        const animations = ['fall-slow', 'fall-medium', 'fall-fast', 'fall-very-fast'];
        const animation = animations[Math.floor(Math.random() * animations.length)];
        
        // Appliquer l'animation
        snowflake.style.animation = `${animation} ${speed}s linear infinite ${delay}s`;
        
        // Classe dark mode si nécessaire
        if (document.body.classList.contains('dark-mode')) {
            snowflake.classList.add('dark-mode');
        }
        
        container.appendChild(snowflake);
    }
    
    console.log(`✅ ${MAX_FLAKES} flocons créés`);
    
    // Régénérer les flocons toutes les 30 secondes pour éviter les accumulations
    if (snowflakesInterval) {
        clearInterval(snowflakesInterval);
    }
    
    snowflakesInterval = setInterval(() => {
        const flakes = document.querySelectorAll('.snowflake');
        if (flakes.length < MAX_FLAKES * 0.5) {
            createSnowflakes();
        }
    }, 30000);
}

function updateSnowflakes() {
    const isDark = document.body.classList.contains('dark-mode');
    const snowflakes = document.querySelectorAll('.snowflake');
    
    snowflakes.forEach(flake => {
        if (isDark) {
            flake.classList.add('dark-mode');
        } else {
            flake.classList.remove('dark-mode');
        }
    });
}

// ============================================
// COMPTE À REBOURS - FONCTIONNEL
// ============================================
function startCountdown() {
    console.log("⏳ Démarrage du compte à rebours...");
    
    const targetDate = new Date(2026, 0, 1, 0, 0, 0); // 1er Janvier 2026
    
    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;
        
        // Si le Nouvel An est arrivé
        if (diff <= 0) {
            updateCountdownElements(0, 0, 0, 0);
            
            if (!window.hasCelebratedNewYear) {
                window.hasCelebratedNewYear = true;
                if (typeof launchConfetti === 'function') {
                    launchConfetti();
                }
                showNotification("🎉 BONNE ANNÉE 2026 ! 🎉", "success");
                
                // Animation spéciale
                const countdownTitle = document.querySelector('.countdown-title');
                if (countdownTitle) {
                    countdownTitle.textContent = "🎉 BONNE ANNÉE 2026 ! 🎉";
                    countdownTitle.style.color = '#FFD700';
                    countdownTitle.style.animation = 'pulse 1s infinite';
                }
            }
            return;
        }
        
        // Calculer le temps restant
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Mettre à jour les éléments
        updateCountdownElements(days, hours, minutes, seconds);
    }
    
    function updateCountdownElements(days, hours, minutes, seconds) {
        const daysEl = document.getElementById("cd-days");
        const hoursEl = document.getElementById("cd-hours");
        const minsEl = document.getElementById("cd-mins");
        const secsEl = document.getElementById("cd-secs");
        const progressBar = document.getElementById("countdown-progress");
        
        // Jours
        if (daysEl) {
            const oldDays = parseInt(daysEl.textContent) || 0;
            if (oldDays !== days) {
                daysEl.classList.add('tick');
                setTimeout(() => daysEl.classList.remove('tick'), 300);
            }
            daysEl.textContent = days;
        }
        
        // Heures
        if (hoursEl) {
            const formattedHours = hours.toString().padStart(2, "0");
            if (hoursEl.textContent !== formattedHours) {
                hoursEl.classList.add('tick');
                setTimeout(() => hoursEl.classList.remove('tick'), 300);
            }
            hoursEl.textContent = formattedHours;
        }
        
        // Minutes
        if (minsEl) {
            const formattedMinutes = minutes.toString().padStart(2, "0");
            if (minsEl.textContent !== formattedMinutes) {
                minsEl.classList.add('tick');
                setTimeout(() => minsEl.classList.remove('tick'), 300);
            }
            minsEl.textContent = formattedMinutes;
        }
        
        // Secondes (toujours animées)
        if (secsEl) {
            const formattedSeconds = seconds.toString().padStart(2, "0");
            secsEl.classList.add('tick');
            setTimeout(() => secsEl.classList.remove('tick'), 300);
            secsEl.textContent = formattedSeconds;
        }
        
        // Barre de progression
        if (progressBar) {
            const totalSeconds = 365 * 24 * 60 * 60; // Une année en secondes
            const elapsedSeconds = (365 - days) * 24 * 60 * 60 + 
                                  (24 - hours) * 60 * 60 + 
                                  (60 - minutes) * 60 + 
                                  (60 - seconds);
            const progress = (elapsedSeconds / totalSeconds) * 100;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
    }
    
    // Démarrer immédiatement
    updateCountdown();
    
    // Mettre à jour toutes les secondes
    setInterval(updateCountdown, 1000);
    
    console.log("✅ Compte à rebours démarré");
}

// ============================================
// CONFÉTTIS - FONCTIONNEL
// ============================================
function initConfetti() {
    console.log("🎊 Initialisation des confettis...");
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) {
        console.error("❌ Canvas des confettis non trouvé!");
        return;
    }
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let confettiParticles = [];
    let animationId = null;
    
    class ConfettiParticle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = -10;
            this.size = Math.random() * 12 + 3;
            this.speedY = Math.random() * 5 + 2;
            this.speedX = Math.random() * 4 - 2;
            this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 10 - 5;
            this.shape = Math.random() > 0.5 ? 'circle' : 'rect';
            this.opacity = 1;
        }
        
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotationSpeed;
            
            // Faire tomber plus naturellement
            this.speedY += 0.05; // Gravité
            this.speedX *= 0.99; // Résistance air
            
            // Réinitialiser si parti du bas
            if (this.y > canvas.height) {
                this.y = -10;
                this.x = Math.random() * canvas.width;
                this.speedY = Math.random() * 5 + 2;
                this.speedX = Math.random() * 4 - 2;
            }
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.globalAlpha = this.opacity;
            
            if (this.shape === 'circle') {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            }
            
            ctx.restore();
        }
    }
    
    function createConfetti(count = 200) {
        confettiParticles = [];
        for (let i = 0; i < count; i++) {
            confettiParticles.push(new ConfettiParticle());
        }
    }
    
    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confettiParticles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        animationId = requestAnimationFrame(animateConfetti);
    }
    
    window.launchConfetti = function() {
        console.log("🎊 Lancement des confettis!");
        if (!canvas) return;
        
        // Arrêter l'animation précédente
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        // Afficher le canvas
        canvas.style.display = 'block';
        canvas.style.opacity = '1';
        
        // Créer les confettis
        createConfetti(200);
        
        // Démarrer l'animation
        animateConfetti();
        
        // Arrêter après 6 secondes
        setTimeout(() => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            
            // Faire disparaître progressivement
            let opacity = 1;
            const fadeOut = setInterval(() => {
                opacity -= 0.05;
                canvas.style.opacity = opacity;
                
                if (opacity <= 0) {
                    clearInterval(fadeOut);
                    canvas.style.display = 'none';
                    canvas.style.opacity = 1;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }, 50);
        }, 6000);
    };
    
    // Redimensionnement
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    console.log("✅ Confettis initialisés");
}

// ============================================
// FIREBASE - CHARGEMENT DES VŒUX
// ============================================
async function loadWishesFromFirebase() {
    console.log("📥 Chargement des vœux depuis Firebase...");
    
    if (!window.firebaseDb || !window.firebaseModules) {
        console.warn("⚠️ Firebase non disponible");
        updateFirebaseStatus(false);
        return;
    }
    
    try {
        const { collection, getDocs, query, orderBy, limit } = window.firebaseModules;
        
        // Charger les 100 derniers vœux
        const q = query(
            collection(window.firebaseDb, "wishes"),
            orderBy("timestamp", "desc"),
            limit(100)
        );
        
        const querySnapshot = await getDocs(q);
        allWishes = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            allWishes.push({
                id: doc.id,
                name: data.name || "Anonyme",
                text: data.text || "",
                time: data.timestamp?.toDate?.() || new Date(data.createdAt || Date.now()),
                visitorId: data.visitorId || "inconnu"
            });
        });
        
        totalMessages = allWishes.length;
        console.log(`✅ ${totalMessages} vœux chargés`);
        
        updateFirebaseStatus(true);
        updateStats();
        
        if (isAdminMode) {
            displayWishesInAdmin();
        }
        
    } catch (error) {
        console.error("❌ Erreur chargement vœux:", error);
        updateFirebaseStatus(false);
    }
}

function updateFirebaseStatus(connected) {
    const statusText = document.getElementById('firebase-status-text');
    const indicator = document.getElementById('firebase-status-indicator');
    const adminStatus = document.getElementById('firebase-status-admin');
    
    if (statusText) {
        statusText.textContent = connected ? 
            `Firebase: Connecté (${totalMessages} vœux)` : 
            "Firebase: Hors ligne";
        statusText.style.color = connected ? '#10b981' : '#f59e0b';
    }
    
    if (indicator) {
        indicator.className = connected ? 'status-indicator online' : 'status-indicator offline';
        indicator.textContent = '●';
    }
    
    if (adminStatus) {
        adminStatus.textContent = connected ? 
            `Firebase: Connecté (${totalMessages} vœux)` : 
            "Firebase: Hors ligne";
    }
}

// ============================================
// ENVOI DE MESSAGE
// ============================================
async function submitMessage() {
    if (isSending) {
        showNotification("Patientez...", "info");
        return;
    }
    
    const nameInput = document.getElementById("name");
    const messageInput = document.getElementById("message");
    const submitBtn = document.getElementById("submit-btn");
    
    if (!nameInput || !messageInput || !submitBtn) {
        showNotification("Erreur formulaire", "error");
        return;
    }
    
    const name = (nameInput.value || "").trim();
    const message = (messageInput.value || "").trim();
    
    if (!message) {
        showNotification("Écrivez vos vœux ! ✍️", "error");
        messageInput.focus();
        return;
    }
    
    if (message.length > 500) {
        showNotification("500 caractères max", "error");
        return;
    }
    
    if (name) {
        localStorage.setItem("visitorName", name);
    }
    
    isSending = true;
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Envoi...</span>';
    
    try {
        if (!window.firebaseDb || !window.firebaseModules) {
            throw new Error("Firebase non disponible");
        }
        
        const { collection, addDoc } = window.firebaseModules;
        
        const messageData = {
            name: name || "Anonyme",
            text: message,
            timestamp: new Date().toISOString(),
            visitorId: getVisitorId(),
            date: new Date().toLocaleDateString('fr-FR')
        };
        
        const docRef = await addDoc(collection(window.firebaseDb, "wishes"), messageData);
        
        showNotification(`✨ Merci ${name || ''} ! ✅`, "success");
        
        messageInput.value = "";
        document.getElementById('char-count').textContent = "0";
        
        showWishCard(name || "Anonyme", message);
        
        allWishes.unshift({
            id: docRef.id,
            name: name || "Anonyme",
            text: message,
            time: new Date(),
            visitorId: getVisitorId()
        });
        
        totalMessages++;
        updateStats();
        updateFirebaseStatus(true);
        
        setTimeout(launchConfetti, 300);
        
        setTimeout(loadWishesFromFirebase, 2000);
        
    } catch (error) {
        console.error("Erreur:", error);
        showNotification(error.code === 'permission-denied' ? 
            "🔒 Erreur permission" : "❌ Erreur d'envoi", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        isSending = false;
    }
}

// ============================================
// STATISTIQUES
// ============================================
function updateStats() {
    setTimeout(() => {
        const totalCountEl = document.getElementById('admin-total-count');
        const onlineCountEl = document.getElementById('admin-online-count');
        const localCountEl = document.getElementById('admin-local-count');
        const visitorsCountEl = document.getElementById('admin-visitors-count');
        const messagesCountEl = document.getElementById('admin-messages-count');
        const backupCountEl = document.getElementById('backup-count');
        const localIndicator = document.getElementById('local-status-indicator');
        
        if (totalCountEl) {
            totalCountEl.textContent = totalMessages;
            totalCountEl.style.animation = 'tick 0.5s ease';
            setTimeout(() => totalCountEl.style.animation = '', 500);
        }
        
        if (onlineCountEl) onlineCountEl.textContent = totalMessages;
        if (localCountEl) localCountEl.textContent = "0";
        if (messagesCountEl) messagesCountEl.textContent = totalMessages;
        if (backupCountEl) backupCountEl.textContent = totalMessages;
        
        const uniqueVisitors = countUniqueVisitors();
        if (visitorsCountEl) visitorsCountEl.textContent = uniqueVisitors;
        
        if (localIndicator) {
            localIndicator.className = 'status-indicator offline';
            localIndicator.textContent = '●';
        }
    }, 100);
}

function countUniqueVisitors() {
    const visitors = new Set();
    allWishes.forEach(wish => {
        if (wish.visitorId) visitors.add(wish.visitorId);
    });
    return visitors.size;
}

// ============================================
// AFFICHAGE ADMIN
// ============================================
function displayWishesInAdmin() {
    if (!isAdminMode) return;
    
    const wishesList = document.getElementById('admin-wishes-list');
    if (!wishesList) return;
    
    wishesList.innerHTML = '';
    
    if (allWishes.length === 0) {
        wishesList.innerHTML = `
            <div class="admin-wishes-empty">
                <div style="font-size: 3rem; opacity: 0.5;">✨</div>
                <div style="margin-top: 15px;">
                    <strong>Aucun vœu pour le moment</strong><br>
                    <span style="font-size: 0.9rem;">Les vœux apparaîtront ici</span>
                </div>
            </div>
        `;
        return;
    }
    
    const start = (currentPage - 1) * MESSAGES_PER_PAGE;
    const end = start + MESSAGES_PER_PAGE;
    const pageWishes = allWishes.slice(start, end);
    
    pageWishes.forEach((wish, index) => {
        const wishItem = document.createElement('div');
        wishItem.className = 'admin-wish-item';
        wishItem.style.animationDelay = `${index * 0.05}s`;
        
        const time = new Date(wish.time);
        const timeStr = time.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
        
        wishItem.innerHTML = `
            <div class="admin-wish-header">
                <div class="admin-wish-author">
                    <span style="display:inline-block; width:24px; height:24px; background:var(--secondary-color); color:white; border-radius:50%; text-align:center; line-height:24px; margin-right:8px; font-size:0.8rem;">
                        ${wish.name.charAt(0).toUpperCase()}
                    </span>
                    ${wish.name}
                </div>
                <div class="admin-wish-time">${timeStr}</div>
            </div>
            <div class="admin-wish-content">${wish.text}</div>
            <div style="font-size:0.8rem; color:var(--muted-color); margin-top:8px;">
                Visiteur: ${wish.visitorId.substring(0, 8)}...
                <button onclick="deleteWish('${wish.id}')" style="float:right; background:#ef4444; color:white; border:none; padding:2px 8px; border-radius:4px; font-size:0.7rem; cursor:pointer;">
                    Supprimer
                </button>
            </div>
        `;
        
        wishesList.appendChild(wishItem);
    });
    
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(allWishes.length / MESSAGES_PER_PAGE);
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (pageInfo) pageInfo.textContent = `Page ${currentPage}/${totalPages}`;
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    
    if (prevBtn) {
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                displayWishesInAdmin();
            }
        };
    }
    
    if (nextBtn) {
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayWishesInAdmin();
            }
        };
    }
}

// ============================================
// SUPPRESSION DES VŒUX
// ============================================
async function deleteWish(wishId) {
    if (!confirm("Supprimer ce vœu ?")) return;
    
    if (!window.firebaseDb || !window.firebaseModules) {
        showNotification("Firebase non disponible", "error");
        return;
    }
    
    try {
        const { doc, deleteDoc } = window.firebaseModules;
        
        await deleteDoc(doc(window.firebaseDb, "wishes", wishId));
        
        allWishes = allWishes.filter(wish => wish.id !== wishId);
        totalMessages = allWishes.length;
        
        showNotification("✅ Vœu supprimé", "success");
        updateStats();
        updateFirebaseStatus(true);
        displayWishesInAdmin();
        
    } catch (error) {
        console.error("❌ Erreur suppression:", error);
        showNotification("❌ Erreur suppression", "error");
    }
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
function getVisitorId() {
    let visitorId = localStorage.getItem("visitorId");
    if (!visitorId) {
        visitorId = "visitor_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("visitorId", visitorId);
    }
    return visitorId;
}

// ============================================
// CARTE DE VŒUX
// ============================================
let lastWishSender = '';
let lastWishMessage = '';

function showWishCard(senderName, message) {
    lastWishSender = senderName || "Anonyme";
    lastWishMessage = message;
    
    const fromElement = document.getElementById('wish-card-from');
    const messageElement = document.getElementById('wish-card-message');
    const modal = document.getElementById('wish-card-modal');
    
    if (!fromElement || !messageElement || !modal) return;
    
    fromElement.textContent = `De la part de ${senderName || "Anonyme"}`;
    messageElement.innerHTML = `
        <strong>Cher Gildas,</strong><br><br>
        "${message}"<br><br>
        <em>Je vous souhaite une merveilleuse année 2026 !</em>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeWishCard();
    });
}

function closeWishCard() {
    const modal = document.getElementById('wish-card-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ============================================
// PARTAGE
// ============================================
function shareOnWhatsApp() {
    if (!lastWishSender || !lastWishMessage) return;
    
    const text = `🎉 Carte de vœux 2026 de ${lastWishSender} 🎉\n\n"${lastWishMessage}"\n\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function shareOnFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
}

function copyWishCard() {
    if (!lastWishSender || !lastWishMessage) return;
    
    const text = `🎉 Carte de vœux 2026 🎉\nDe : ${lastWishSender}\nMessage : ${lastWishMessage}\n${window.location.href}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification("Carte copiée ! 📋", "success");
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification("Carte copiée ! 📋", "success");
    });
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.animation = 'slideInRight 0.3s ease';
    
    let container = document.getElementById('notification-toast');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-toast';
        container.className = 'notification-toast';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
    
    notification.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
}

// ============================================
// FONCTIONS ADMIN
// ============================================
function openAdminLogin() {
    const modal = document.getElementById('admin-login-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => document.getElementById('admin-password')?.focus(), 100);
    }
}

function closeAdminLogin() {
    const modal = document.getElementById('admin-login-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        const input = document.getElementById('admin-password');
        if (input) input.value = '';
    }
}

function checkAdminLogin() {
    const password = document.getElementById('admin-password')?.value.trim() || '';
    
    if (password === ADMIN_TOKEN) {
        isAdminMode = true;
        closeAdminLogin();
        
        const panel = document.getElementById('admin-panel');
        if (panel) {
            panel.style.display = 'block';
            setTimeout(() => panel.classList.add('open'), 10);
            
            initializeAdminPanel();
        }
        
        showNotification("🔧 Admin activé", "success");
    } else {
        showNotification("Token incorrect", "error");
        const input = document.getElementById('admin-password');
        if (input) {
            input.value = '';
            input.focus();
        }
    }
}

function initializeAdminPanel() {
    updateFirebaseStatus(window.firebaseDb ? true : false);
    updateStats();
    displayWishesInAdmin();
}

function closeAdminPanel() {
    const panel = document.getElementById('admin-panel');
    if (panel) {
        panel.classList.remove('open');
        setTimeout(() => {
            panel.style.display = 'none';
            isAdminMode = false;
        }, 300);
    }
}

// ============================================
// FONCTIONS ADMIN COMPLÈTES
// ============================================
window.refreshAdminWishes = function() {
    showNotification("🔄 Chargement...", "info");
    loadWishesFromFirebase();
};

window.syncAllMessages = function() {
    showNotification("🔄 Synchronisation...", "info");
    loadWishesFromFirebase();
};

window.clearAllMessages = async function() {
    if (!confirm("⚠️ SUPPRIMER TOUS LES VŒUX ?\nCette action est irréversible !")) {
        return;
    }
    
    if (!window.firebaseDb || !window.firebaseModules) {
        showNotification("Firebase non disponible", "error");
        return;
    }
    
    showNotification("🗑️ Suppression en cours...", "warning");
    
    try {
        const { collection, getDocs, deleteDoc, doc } = window.firebaseModules;
        
        const querySnapshot = await getDocs(collection(window.firebaseDb, "wishes"));
        const deletePromises = [];
        
        querySnapshot.forEach((document) => {
            deletePromises.push(deleteDoc(doc(window.firebaseDb, "wishes", document.id)));
        });
        
        await Promise.all(deletePromises);
        
        allWishes = [];
        totalMessages = 0;
        
        showNotification(`✅ ${deletePromises.length} vœux supprimés`, "success");
        updateStats();
        displayWishesInAdmin();
        
    } catch (error) {
        console.error("❌ Erreur suppression:", error);
        showNotification("❌ Erreur suppression", "error");
    }
};

window.exportMessages = function() {
    if (allWishes.length === 0) {
        showNotification("Aucun vœu à exporter", "warning");
        return;
    }
    
    const dataStr = JSON.stringify(allWishes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `voeux-2026-${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
    
    showNotification(`✅ ${allWishes.length} vœux exportés`, "success");
};

window.exportLocalBackup = function() {
    showNotification("Pas de sauvegarde locale", "info");
};

window.clearLocalBackup = function() {
    showNotification("Pas de sauvegarde locale", "info");
};

// ============================================
// EXPOSITION GLOBALE
// ============================================
window.submitMessage = submitMessage;
window.showWishCard = showWishCard;
window.closeWishCard = closeWishCard;
window.shareOnWhatsApp = shareOnWhatsApp;
window.shareOnFacebook = shareOnFacebook;
window.copyWishCard = copyWishCard;
window.openAdminLogin = openAdminLogin;
window.closeAdminLogin = closeAdminLogin;
window.checkAdminLogin = checkAdminLogin;
window.closeAdminPanel = closeAdminPanel;
window.launchConfetti = launchConfetti;
window.refreshAdminWishes = refreshAdminWishes;
window.syncAllMessages = syncAllMessages;
window.clearAllMessages = clearAllMessages;
window.exportMessages = exportMessages;
window.exportLocalBackup = exportLocalBackup;
window.clearLocalBackup = clearLocalBackup;
window.deleteWish = deleteWish;