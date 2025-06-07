
export type Locale = 'en' | 'rw' | 'fr' | 'sw' | 'es' | 'de';

export const locales: { code: Locale; name: string; flag?: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' }, // Example flag, can adjust
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export type Translations = {
  [key: string]: {
    [L in Locale]?: string;
  };
};

export const translations: Translations = {
  // Navigation
  'nav.home': { en: 'Home', rw: 'Ahabanza', fr: 'Accueil', sw: 'Nyumbani', es: 'Inicio', de: 'Startseite' },
  'nav.about': { en: 'About Us', rw: 'Abo Turibo', fr: 'À Propos', sw: 'Kuhusu Sisi', es: 'Nosotros', de: 'Über Uns' },
  'nav.books': { en: 'Books', rw: 'Ibitabo', fr: 'Livres', sw: 'Vitabu', es: 'Libros', de: 'Bücher' },
  'nav.choirs': { en: 'Choirs', rw: 'Amakorali', fr: 'Chorales', sw: 'Kwaya', es: 'Coros', de: 'Chöre' },
  'nav.unions': { en: 'Unions', rw: 'Amatsinda', fr: 'Unions', sw: 'Jumuiya', es: 'Uniones', de: 'Vereinigungen' },
  'nav.videos': { en: 'Videos', rw: 'Amavidewo', fr: 'Vidéos', sw: 'Video', es: 'Videos', de: 'Videos' },
  'nav.ceremonies': { en: 'Ceremonies', rw: 'Imigenzo', fr: 'Cérémonies', sw: 'Sherehe', es: 'Ceremonias', de: 'Zeremonien' },
  'nav.contact': { en: 'Contact', rw: 'Twandikire', fr: 'Contact', sw: 'Mawasiliano', es: 'Contacto', de: 'Kontakt' },
  'nav.events': { en: 'Events', rw: 'Ibyabaye', fr: 'Événements', sw: 'Matukio', es: 'Eventos', de: 'Veranstaltungen'},

  // Auth
  'auth.login': { en: 'Login', rw: 'Injira', fr: 'Connexion', sw: 'Ingia', es: 'Iniciar Sesión', de: 'Anmelden' },
  'auth.register': { en: 'Register', rw: 'Iyandikishe', fr: 'S\'inscrire', sw: 'Jisajili', es: 'Registrarse', de: 'Registrieren' },

  // Header Dropdown
  'header.dashboard': { en: 'Dashboard', rw: 'Imbonerahamwe', fr: 'Tableau de Bord', sw: 'Dashibodi', es: 'Panel', de: 'Dashboard' },
  'header.profile': { en: 'Profile', rw: 'Umwirondoro', fr: 'Profil', sw: 'Wasifu', es: 'Perfil', de: 'Profil' },
  'header.adminSettings': { en: 'Admin Settings', rw: 'Igenamiterere ry\'Ubuyobozi', fr: 'Paramètres Admin', sw: 'Mipangilio ya Admin', es: 'Configuración Admin', de: 'Admin-Einstellungen' },
  'header.logout': { en: 'Log out', rw: 'Sohoka', fr: 'Déconnexion', sw: 'Toka', es: 'Cerrar Sesión', de: 'Abmelden' },
  
  // Footer
  'footer.rights': { en: 'All rights reserved.', rw: 'Uburenganzira bwose burasigasiriwe.', fr: 'Tous droits réservés.', sw: 'Haki zote zimehifadhiwa.', es: 'Todos los derechos reservados.', de: 'Alle Rechte vorbehalten.' },
  
  // App Name - consider if this should be translated or remain consistent
  'appName': { 
    en: 'Rubavu Anglican Connect', 
    rw: 'Rubavu Anglican Connect', 
    fr: 'Rubavu Anglican Connect', 
    sw: 'Rubavu Anglican Connect',
    es: 'Rubavu Anglican Connect',
    de: 'Rubavu Anglican Connect'
  },
  // Page Titles (examples, add more as needed)
  'page.about.title': { en: 'About Us', rw: 'Abo Turibo', fr: 'À Propos de Nous', sw: 'Kuhusu Sisi', es: 'Sobre Nosotros', de: 'Über Uns' },
  'page.contact.title': { en: 'Contact Us', rw: 'Twandikire', fr: 'Contactez-Nous', sw: 'Wasiliana Nasi', es: 'Contáctanos', de: 'Kontaktieren Sie Uns' },
};

export function translate(key: string, locale: Locale, fallbackLocale: Locale = 'en'): string {
  return translations[key]?.[locale] || translations[key]?.[fallbackLocale] || key;
}
