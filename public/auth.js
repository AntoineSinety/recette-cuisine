// Authentification simple côté client pour GitHub Pages
(function() {
    'use strict';
    
    const CORRECT_PASSWORD = 'baby';
    const SESSION_KEY = 'recette_auth';
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 heures
    
    function isAuthenticated() {
        const authData = localStorage.getItem(SESSION_KEY);
        if (!authData) return false;
        
        try {
            const { timestamp, password } = JSON.parse(authData);
            const now = new Date().getTime();
            
            // Vérifier si la session est expirée
            if (now - timestamp > SESSION_DURATION) {
                localStorage.removeItem(SESSION_KEY);
                return false;
            }
            
            return password === CORRECT_PASSWORD;
        } catch (error) {
            localStorage.removeItem(SESSION_KEY);
            return false;
        }
    }
    
    function authenticate() {
        const password = prompt('🔒 Accès restreint\n\nVeuillez entrer le mot de passe :');
        
        if (password === null) {
            // Utilisateur a annulé
            document.body.innerHTML = `
                <div style="
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    height: 100vh; 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                    margin: 0;
                ">
                    <div>
                        <h1 style="font-size: 3em; margin-bottom: 0.5em;">🔒</h1>
                        <h2 style="margin-bottom: 1em;">Accès requis</h2>
                        <p style="font-size: 1.1em; margin-bottom: 2em;">
                            Cette application nécessite une authentification.
                        </p>
                        <button 
                            onclick="location.reload()" 
                            style="
                                padding: 12px 24px; 
                                font-size: 1em; 
                                background: rgba(255,255,255,0.2); 
                                color: white; 
                                border: 2px solid rgba(255,255,255,0.5);
                                border-radius: 25px; 
                                cursor: pointer;
                                transition: all 0.3s ease;
                            "
                            onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                            onmouseout="this.style.background='rgba(255,255,255,0.2)'"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            `;
            return false;
        }
        
        if (password === CORRECT_PASSWORD) {
            // Sauvegarder l'authentification
            localStorage.setItem(SESSION_KEY, JSON.stringify({
                password: password,
                timestamp: new Date().getTime()
            }));
            return true;
        } else {
            alert('❌ Mot de passe incorrect');
            return authenticate(); // Réessayer
        }
    }
    
    function showAuthError() {
        document.body.innerHTML = `
            <div style="
                display: flex; 
                align-items: center; 
                justify-content: center; 
                height: 100vh; 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                color: white;
                text-align: center;
                margin: 0;
            ">
                <div>
                    <h1 style="font-size: 3em; margin-bottom: 0.5em;">⛔</h1>
                    <h2 style="margin-bottom: 1em;">Accès refusé</h2>
                    <p style="font-size: 1.1em; margin-bottom: 2em;">
                        Mot de passe incorrect. Veuillez réessayer.
                    </p>
                    <button 
                        onclick="location.reload()" 
                        style="
                            padding: 12px 24px; 
                            font-size: 1em; 
                            background: rgba(255,255,255,0.2); 
                            color: white; 
                            border: 2px solid rgba(255,255,255,0.5);
                            border-radius: 25px; 
                            cursor: pointer;
                            transition: all 0.3s ease;
                        "
                        onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                        onmouseout="this.style.background='rgba(255,255,255,0.2)'"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        `;
    }
    
    // Vérification au chargement de la page
    function initAuth() {
        if (!isAuthenticated()) {
            // Masquer le contenu pendant l'authentification
            if (document.body) {
                document.body.style.visibility = 'hidden';
            }
            
            if (!authenticate()) {
                return; // L'utilisateur a annulé
            }
            
            // Restaurer la visibilité
            if (document.body) {
                document.body.style.visibility = 'visible';
            }
        }
    }
    
    // Attendre que le DOM soit prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuth);
    } else {
        // DOM déjà chargé
        initAuth();
    }
    
    // Ajouter un bouton de déconnexion (optionnel)
    window.logout = function() {
        localStorage.removeItem(SESSION_KEY);
        location.reload();
    };
    
})();