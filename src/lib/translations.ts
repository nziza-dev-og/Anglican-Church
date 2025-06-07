
export type Locale = 'en' | 'rw' | 'fr' | 'sw' | 'es' | 'de';

export const locales: { code: Locale; name: string; flag?: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export type Translations = {
  [key: string]: {
    [L in Locale]?: string;
  };
};

// Helper for placeholder translations
const placeholder = (enText: string) => ({
  en: enText,
  rw: `${enText} (rw)`,
  fr: `${enText} (fr)`,
  sw: `${enText} (sw)`,
  es: `${enText} (es)`,
  de: `${enText} (de)`,
});

export const translations: Translations = {
  // App Name
  'appName': {
    en: 'Rubavu Anglican Connect',
    rw: 'Rubavu Anglican Connect',
    fr: 'Rubavu Anglican Connect',
    sw: 'Rubavu Anglican Connect',
    es: 'Rubavu Anglican Connect',
    de: 'Rubavu Anglican Connect'
  },

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
  'auth.login.title': placeholder('Login to Your Account'),
  'auth.login.noAccount': placeholder("Don't have an account?"),
  'auth.register.title': placeholder('Create Your Account'),
  'auth.register.hasAccount': placeholder('Already have an account?'),
  'auth.welcomeMessage': placeholder('Welcome to Rubavu Anglican Connect'),


  // Header Dropdown
  'header.dashboard': { en: 'Dashboard', rw: 'Imbonerahamwe', fr: 'Tableau de Bord', sw: 'Dashibodi', es: 'Panel', de: 'Dashboard' },
  'header.profile': { en: 'Profile', rw: 'Umwirondoro', fr: 'Profil', sw: 'Wasifu', es: 'Perfil', de: 'Profil' },
  'header.adminSettings': { en: 'Admin Settings', rw: 'Igenamiterere ry\'Ubuyobozi', fr: 'Paramètres Admin', sw: 'Mipangilio ya Admin', es: 'Configuración Admin', de: 'Admin-Einstellungen' },
  'header.logout': { en: 'Log out', rw: 'Sohoka', fr: 'Déconnexion', sw: 'Toka', es: 'Cerrar Sesión', de: 'Abmelden' },
  'header.selectLanguage': placeholder('Select Language'),
  'header.languages': placeholder('Languages'),
  'header.userRole': placeholder('Role:'),


  // Footer
  'footer.rights': { en: 'All rights reserved.', rw: 'Uburenganzira bwose burasigasiriwe.', fr: 'Tous droits réservés.', sw: 'Haki zote zimehifadhiwa.', es: 'Todos los derechos reservados.', de: 'Alle Rechte vorbehalten.' },

  // General
  'general.loading': placeholder('Loading...'),
  'general.actions': placeholder('Actions'),
  'general.edit': placeholder('Edit'),
  'general.delete': placeholder('Delete'),
  'general.save': placeholder('Save Changes'),
  'general.add': placeholder('Add'),
  'general.cancel': placeholder('Cancel'),
  'general.viewDetails': placeholder('View Details'),
  'general.category': placeholder('Category:'),
  'general.by': placeholder('By'),
  'general.noDescription': placeholder('No description available.'),
  'general.download': placeholder('Download'),
  'general.type': placeholder('Type:'),
  'general.submit': placeholder('Submit'),
  'general.back': placeholder('Back'),
  'general.optional': placeholder('Optional'),
  'general.error.mustBeLoggedIn': placeholder('You must be logged in.'),
  'general.error.unexpected': placeholder('An unexpected error occurred. Please try again.'),
  'general.success': placeholder('Success!'),
  'general.failure': placeholder('Failed'),

  // About Page
  'about.title': placeholder('About Us'),
  'about.subtitle': placeholder('Learn more about the Anglican Church in Rubavu, our history, mission, and values.'),
  'about.history.title': placeholder('Our History'),
  'about.history.paragraph1': placeholder("The Anglican Church in Rubavu has a rich history rooted in faith and community service. Established in [Year of Establishment, e.g., 1985], our church has grown from a small fellowship to a vibrant congregation. We have been a spiritual home for generations, witnessing God's faithfulness through various seasons. Our journey is one of perseverance, prayer, and a deep commitment to spreading the Gospel in Rubavu and beyond."),
  'about.history.paragraph2': placeholder("Over the years, we have expanded our ministries, built lasting relationships, and contributed to the well-being of our local area. We cherish our heritage and look forward to what God has in store for our future."),
  'about.coreValues.title': placeholder('Our Core Values'),
  'about.coreValues.community.title': placeholder('Community'),
  'about.coreValues.community.description': placeholder('Fostering a welcoming and supportive family of believers.'),
  'about.coreValues.worship.title': placeholder('Worship'),
  'about.coreValues.worship.description': placeholder('Gathering to honor God with heartfelt praise and reverence.'),
  'about.coreValues.service.title': placeholder('Service'),
  'about.coreValues.service.description': placeholder("Extending God's love through compassionate action and outreach."),
  'about.coreValues.discipleship.title': placeholder('Discipleship'),
  'about.coreValues.discipleship.description': placeholder('Growing in faith and knowledge of Jesus Christ.'),
  'about.missionVision.title': placeholder('Our Mission & Vision'),
  'about.mission.title': placeholder('Mission'),
  'about.mission.description': placeholder("To make disciples of Jesus Christ by proclaiming the Gospel, nurturing believers in their faith journey, and serving our community with love and compassion, reflecting God's kingdom on earth."),
  'about.vision.title': placeholder('Vision'),
  'about.vision.description': placeholder("To be a transformative, Christ-centered community that shines as a beacon of hope, faith, and love in Rubavu, empowering individuals to live purposeful lives according to God's will."),
  'about.leadership.title': placeholder('Leadership'),
  'about.leadership.description': placeholder("Our church is led by a dedicated team of pastors, deacons, and lay leaders committed to serving the congregation and upholding our church's values. (More details about specific leaders can be added here or on a separate leadership page if needed)."),

  // Contact Page
  'contact.title': placeholder('Contact Us'),
  'contact.subtitle': placeholder("We'd love to hear from you. Reach out with any questions or inquiries."),
  'contact.form.title': placeholder('Send us a Message'),
  'contact.form.name.label': placeholder('Full Name'),
  'contact.form.name.placeholder': placeholder('John Doe'),
  'contact.form.name.error': placeholder('Name must be at least 2 characters.'),
  'contact.form.email.label': placeholder('Email Address'),
  'contact.form.email.placeholder': placeholder('you@example.com'),
  'contact.form.email.error': placeholder('Please enter a valid email address.'),
  'contact.form.subject.label': placeholder('Subject'),
  'contact.form.subject.placeholder': placeholder('Regarding...'),
  'contact.form.subject.error': placeholder('Subject must be at least 5 characters.'),
  'contact.form.message.label': placeholder('Message'),
  'contact.form.message.placeholder': placeholder('Your message here...'),
  'contact.form.message.error': placeholder('Message must be at least 10 characters.'),
  'contact.form.button.send': placeholder('Send Message'),
  'contact.form.toast.success.title': placeholder('Message Sent!'),
  'contact.form.toast.success.description': placeholder("Thank you for contacting us. We'll get back to you soon."),
  'contact.info.title': placeholder('Our Information'),
  'contact.info.address.title': placeholder('Address'),
  'contact.info.address.value': placeholder('123 Church Street, Rubavu, Rwanda'),
  'contact.info.phone.title': placeholder('Phone'),
  'contact.info.phone.value': placeholder('(+250) 7XX XXX XXX'),
  'contact.info.email.title': placeholder('Email'),
  'contact.info.email.value': placeholder('info@rubavuanglican.org'),
  'contact.findUs.title': placeholder('Find Us'),

  // Dashboard Main Page
  'dashboard.welcome': placeholder('Welcome,'), // Name will be appended
  'dashboard.overviewSubtitle': placeholder("Here's an overview of your dashboard. Your role:"), // Role will be appended
  'dashboard.noSections.title': placeholder('Dashboard Overview'),
  'dashboard.noSections.description': placeholder("You currently don't have specific sections assigned to your role other than profile management. Explore the site or contact an administrator if you believe this is an error."),
  'dashboard.card.goTo': placeholder('Go to'), // Section title will be appended
  'dashboard.profile.title': placeholder('My Profile'),
  'dashboard.profile.description': placeholder('View and update your personal information.'),
  'dashboard.admin.users.title': placeholder('Manage Users'),
  'dashboard.admin.users.description': placeholder('Oversee user accounts and roles.'),
  'dashboard.admin.events.title': placeholder('Manage Events'),
  'dashboard.admin.events.description': placeholder('Create and update church events.'),
  'dashboard.admin.books.title': placeholder('Manage Books'),
  'dashboard.admin.books.description': placeholder('Add and organize digital library content.'),
  'dashboard.admin.videos.title': placeholder('Manage Videos'),
  'dashboard.admin.videos.description': placeholder('Upload and manage video gallery.'),
  'dashboard.admin.ceremonies.title': placeholder('Manage Ceremonies'),
  'dashboard.admin.ceremonies.description': placeholder('Record and share church ceremonies.'),
  'dashboard.admin.choirs.title': placeholder('Manage Choirs Info'),
  'dashboard.admin.choirs.description': placeholder('Update general information about choirs.'),
  'dashboard.admin.unions.title': placeholder('Manage Unions Info'),
  'dashboard.admin.unions.description': placeholder('Update general information about unions.'),
  'dashboard.admin.settings.title': placeholder('App Settings'),
  'dashboard.admin.settings.description': placeholder('Configure application-wide settings.'),
  'dashboard.pastor.members.title': placeholder('View Members List'),
  'dashboard.pastor.members.description': placeholder('Access the church member directory.'),
  'dashboard.pastor.activities.title': placeholder('Manage Activities'),
  'dashboard.pastor.activities.description': placeholder('Oversee specific church activities.'),
  'dashboard.choirAdmin.manage.title': placeholder('Manage My Choir'),
  'dashboard.choirAdmin.manage.description': placeholder('Administer your choir members and events.'),
  'dashboard.unionAdmin.manage.title': placeholder('Manage My Union'),
  'dashboard.unionAdmin.manage.description': placeholder('Administer your union members and events.'),

  // Admin Books Page
  'admin.books.title': placeholder('Manage Books'),
  'admin.books.subtitle': placeholder('Add, edit, or remove books from the digital library.'),
  'admin.books.addNew': placeholder('Add New Book'),
  'admin.books.form.editTitle': placeholder('Edit Book'),
  'admin.books.form.addTitle': placeholder('Add a New Book'),
  'admin.books.empty.title': placeholder('No Books in Library'),
  'admin.books.empty.description': placeholder('Click "Add New Book" to get started.'),
  'admin.books.delete.confirm.title': placeholder('Are you sure?'),
  'admin.books.delete.confirm.description': placeholder('This action cannot be undone. This will permanently delete the book'), // Book title will be appended
  'admin.books.toast.deleted.title': placeholder('Book Deleted'),
  'admin.books.toast.deleted.description': placeholder('has been removed.'), // Book title will be prepended
  'admin.books.toast.error.fetch': placeholder('Could not fetch books.'),
  'admin.books.toast.error.delete': placeholder('Could not delete book.'),

  // BookForm Component
  'bookForm.title.label': placeholder('Book Title'),
  'bookForm.title.placeholder': placeholder("The Pilgrim's Progress"),
  'bookForm.title.error': placeholder('Title must be at least 3 characters.'),
  'bookForm.author.label': placeholder('Author (Optional)'),
  'bookForm.author.placeholder': placeholder('John Bunyan'),
  'bookForm.description.label': placeholder('Description (Optional)'),
  'bookForm.description.placeholder': placeholder('A brief summary of the book...'),
  'bookForm.category.label': placeholder('Category (Optional)'),
  'bookForm.category.placeholder': placeholder('e.g., Theology, Biography'),
  'bookForm.source.label': placeholder('Book Source'),
  'bookForm.source.upload': placeholder('Upload File'),
  'bookForm.source.url': placeholder('Use URL'),
  'bookForm.file.label': placeholder('Book File (PDF, EPUB, etc.)'),
  'bookForm.url.label': placeholder('Book URL'),
  'bookForm.url.placeholder': placeholder('https://example.com/book.pdf'),
  'bookForm.coverSource.label': placeholder('Cover Image Source (Optional)'),
  'bookForm.coverSource.upload': placeholder('Upload Image'),
  'bookForm.coverSource.url': placeholder('Use Image URL'),
  'bookForm.coverFile.label': placeholder('Cover Image File'),
  'bookForm.coverUrl.label': placeholder('Cover Image URL'),
  'bookForm.coverUrl.placeholder': placeholder('https://example.com/cover.jpg'),
  'bookForm.error.sourceRequired': placeholder('Book file or URL is required based on selection.'),
  'bookForm.error.coverRequired': placeholder('Cover image file or URL is required if method is selected, or clear selection if no cover.'),
  'bookForm.error.noDownloadUrl': placeholder('Book file or URL is required.'),
  'bookForm.toast.updated.title': placeholder('Book Updated'),
  'bookForm.toast.updated.description': placeholder('has been successfully updated.'), // Book title prepended
  'bookForm.toast.added.title': placeholder('Book Added'),
  'bookForm.toast.added.description': placeholder('has been successfully added.'), // Book title prepended
  'bookForm.toast.failed.title': placeholder('Failed to Save Book'),
  'bookForm.toast.failed.description': placeholder('Could not save the book. Please try again.'),
  'bookForm.button.add': placeholder('Add Book'),
  'bookForm.button.save': placeholder('Save Changes'),

  // Home Page - AboutSnippet
  'home.aboutSnippet.title': placeholder('About Rubavu Anglican Church'),
  'home.aboutSnippet.paragraph1': placeholder('The Anglican Church in Rubavu is a vibrant community dedicated to spiritual growth, fellowship, and serving our neighbours. We strive to be a beacon of hope and love in Rubavu.'),
  'home.aboutSnippet.mission.title': placeholder('Our Mission'),
  'home.aboutSnippet.mission.description': placeholder('To share the Gospel, nurture believers, and impact our community positively.'),
  'home.aboutSnippet.vision.title': placeholder('Our Vision'),
  'home.aboutSnippet.vision.description': placeholder('A Christ-centered community transforming lives in Rubavu and beyond.'),
  'home.aboutSnippet.discoverMore': placeholder('Discover More'),

  // Home Page - FeaturedEvents
  'home.featuredEvents.title': placeholder('Featured Events'), // also "Upcoming Events"
  'home.featuredEvents.upcomingTitle': placeholder('Upcoming Events'),
  'home.featuredEvents.empty': placeholder('No upcoming events at the moment. Please check back later.'),
  'home.featuredEvents.viewAll': placeholder('View All Events'),

  // Home Page - HeroSection
  'home.hero.title': placeholder('Welcome to Rubavu Anglican Connect'),
  'home.hero.subtitle': placeholder('Connecting our community through faith, fellowship, and service. Discover upcoming events, resources, and ways to get involved.'),
  'home.hero.button.events': placeholder('Upcoming Events'),
  'home.hero.button.about': placeholder('Learn More About Us'),

  // Home Page - PersonalizedRecommendations
  'home.recommendations.title': placeholder('For You'),
  'home.recommendations.subtitle': placeholder('Personalized suggestions based on your profile and interests.'),
  'home.recommendations.error': placeholder('Could not load recommendations at this time.'),
  'home.recommendations.button.checkItOut': placeholder('Check it out'),

};

export function translate(key: string, locale: Locale, fallbackLocale: Locale = 'en'): string {
  // Attempt to find the translation for the given locale
  let translation = translations[key]?.[locale];

  // If not found for the specific locale, try the fallback locale
  if (translation === undefined) {
    translation = translations[key]?.[fallbackLocale];
  }

  // If still not found (e.g. key doesn't exist at all), return the key itself as a fallback
  // and log a warning to help with development.
  if (translation === undefined) {
    console.warn(`Translation key "${key}" not found for locale "${locale}" or fallback "${fallbackLocale}".`);
    return key;
  }
  return translation;
}
