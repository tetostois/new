import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-green-700 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4 ml-9">
            <a href="/" className="flex items-center">
              <img 
                src="/images/05.png" 
                alt="Logo ENALE" 
                className="h-16 w-78 object-cover"
              />
            </a>
            {/* Réseaux sociaux */}
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                <img src="/icons/linkedin.svg" alt="LinkedIn" className="h-6 w-6" />
              </a>
              <a href="https://wa.me/+237695835877" target="_blank" rel="noopener noreferrer">
                <img src="/icons/whatsapp.svg" alt="WhatsApp" className="h-6 w-6" />
              </a>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                <img src="/icons/facebook.svg" alt="Facebook" className="h-6 w-6" />
              </a>
            </div>

          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Liens Rapides</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-white/80 hover:text-white transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/a-propos" className="text-white/80 hover:text-white transition-colors">
                  À propos
                </a>
              </li>
            </ul>
          </div>

          {/* Certifications */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Certifications</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <h1 className="text-white/80 hover:text-white transition-colors">
                  Initiation Pratique Générale
                </h1>
              </li>
              <li>
                <h1 className="text-white/80 hover:text-white transition-colors">
                  Cadre & Manager
                </h1>
              </li>
              <li>
                <h1 className="text-white/80 hover:text-white transition-colors">
                  Rentabilité Entrepreneuriale
                </h1>
              </li>
              <li>
                <h1 className="text-white/80 hover:text-white transition-colors">
                  Chef d'entreprise
                </h1>
              </li>
              <li>
                <h1 className="text-white/80 hover:text-white transition-colors">
                  Investisseur Africain
                </h1>
              </li>
              <li>
                <h1 className="text-white/80 hover:text-white transition-colors">
                  Ingénieries Spécifiques
                </h1>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Contact</h4>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@programmeleadership.org</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+237 695 83 58 77 / +237 672 64 33 53</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Palais de Congrès, Bastos Golf, Yaoundé Cameroun</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      {/* Image en dessous du footer */}
      <div className="relative w-full">
        {/* Image avec assombrissement */}
        <img
          src="/images/02.png"
          alt="Bannière"
          className="w-full h-auto object-cover brightness-20"
        />
        {/* Superposition noire */}
  <div className="absolute inset-0 bg-black bg-opacity-60"></div>

        {/* Texte centré au milieu de l'image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white text-center text-sm md:text-lg px-4">
            © 2024 ENALE Programme LEADERSHIP. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
