// Simple IP-based access control (client-side only)
async function checkIPAccess() {
    try {
        // Récupérer l'IP publique du visiteur
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const visitorIP = data.ip;
        
        // Liste des IPs autorisées (remplacez par votre IP)
        const allowedIPs = [
            // Ajoutez votre IP publique ici
            // '123.456.789.000',
        ];
        
        // Si la liste est vide, autoriser tous les accès (mode développement)
        if (allowedIPs.length === 0) {
            console.log('Mode développement : accès autorisé à tous');
            return true;
        }
        
        // Vérifier si l'IP est autorisée
        if (!allowedIPs.includes(visitorIP)) {
            document.body.innerHTML = `
                <div style="
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    height: 100vh; 
                    font-family: Arial, sans-serif;
                    background: #f0f0f0;
                    color: #333;
                    text-align: center;
                ">
                    <div>
                        <h1>🔒 Accès Restreint</h1>
                        <p>Désolé, l'accès à ce site est limité.</p>
                        <p style="color: #666; font-size: 0.9em;">IP: ${visitorIP}</p>
                    </div>
                </div>
            `;
            return false;
        }
        
        console.log(`Accès autorisé pour l'IP: ${visitorIP}`);
        return true;
        
    } catch (error) {
        console.log('Erreur de vérification IP, accès autorisé par défaut:', error);
        return true; // Autoriser en cas d'erreur
    }
}

// Vérifier l'accès au chargement de la page
checkIPAccess();