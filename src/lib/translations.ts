
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
  'nav.chat': { en: 'Chat', rw: 'Ikiganiro', fr: 'Chat', sw: 'Soga', es: 'Chat', de: 'Plaudern'},


  // Auth
  'auth.login': { en: 'Login', rw: 'Injira', fr: 'Connexion', sw: 'Ingia', es: 'Iniciar Sesión', de: 'Anmelden' },
  'auth.register': { en: 'Register', rw: 'Iyandikishe', fr: 'S\'inscrire', sw: 'Jisajili', es: 'Registrarse', de: 'Registrieren' },
  'auth.login.title': placeholder('Login to Your Account'),
  'auth.login.noAccount': placeholder("Don't have an account?"),
  'auth.register.title': placeholder('Create Your Account'),
  'auth.register.hasAccount': placeholder('Already have an account?'),
  'auth.welcomeMessage': placeholder('Welcome to Rubavu Anglican Connect'),
  'auth.email.label': placeholder('Email'),
  'auth.email.placeholder': placeholder('your@email.com'),
  'auth.password.label': placeholder('Password'),
  'auth.password.placeholder': placeholder('••••••••'),
  'auth.password.errorMinLength': placeholder('Password must be at least 6 characters.'),
  'auth.login.error.invalidCredentials': placeholder('Invalid email or password. Please try again.'),
  'auth.login.success.title': placeholder('Login Successful'),
  'auth.login.success.description': placeholder('Welcome back!'),
  'auth.displayName.label': placeholder('Display Name'),
  'auth.displayName.placeholder': placeholder('John Doe'),
  'auth.displayName.errorMinLength': placeholder('Display name must be at least 2 characters.'),
  'auth.confirmPassword.label': placeholder('Confirm Password'),
  'auth.confirmPassword.errorMatch': placeholder("Passwords don't match"),
  'auth.secretCode.label': placeholder('Secret Code (Optional)'),
  'auth.secretCode.placeholder': placeholder('Enter if you have a special role code'),
  'auth.secretCode.description': placeholder('For Church, Choir, or Union Admins.'),
  'auth.register.success.title': placeholder('Registration Successful'),
  'auth.register.success.description': placeholder('Your account has been created.'),
  'auth.register.error.emailInUse': placeholder('This email is already registered. Please login or use a different email.'),


  // Header Dropdown
  'header.dashboard': { en: 'Dashboard', rw: 'Imbonerahamwe', fr: 'Tableau de Bord', sw: 'Dashibodi', es: 'Panel', de: 'Dashboard' },
  'header.profile': { en: 'Profile', rw: 'Umwirondoro', fr: 'Profil', sw: 'Wasifu', es: 'Perfil', de: 'Profil' },
  'header.adminSettings': { en: 'Admin Settings', rw: 'Igenamiterere ry\'Ubuyobozi', fr: 'Paramètres Admin', sw: 'Mipangilio ya Admin', es: 'Configuración Admin', de: 'Admin-Einstellungen' },
  'header.logout': { en: 'Log out', rw: 'Sohoka', fr: 'Déconnexion', sw: 'Toka', es: 'Cerrar Sesión', de: 'Abmelden' },
  'header.selectLanguage': placeholder('Select Language'),
  'header.languages': placeholder('Languages'),
  'header.userRole': placeholder('Role:'), // Role name will be appended
  'header.mobileMenuTitle': placeholder('Menu'),


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
  'general.error.mustBeLoggedIn': placeholder('You must be logged in to perform this action.'),
  'general.error.unexpected': placeholder('An unexpected error occurred. Please try again.'),
  'general.success': placeholder('Success!'),
  'general.failure': placeholder('Failed'),
  'general.notAvailableShort': placeholder('N/A'),
  'general.search': placeholder('Search...'),
  'general.clear': placeholder('Clear'),
  'general.error.title': placeholder('Error'),
  'general.confirmation.title': placeholder('Are you sure?'),
  'general.confirmation.cannotBeUndone': placeholder('This action cannot be undone.'),
  'general.learnMore': placeholder('Learn More'),
  'general.anonymousUser': placeholder('Anonymous User'),


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
  'contact.form.toast.success.titleDb': placeholder('Message Sent!'),
  'contact.form.toast.success.descriptionDb': placeholder("Thank you! Your message has been submitted for review."),
  'contact.form.toast.error.description': placeholder('Could not send your message. Please try again later.'),
  'contact.info.title': placeholder('Our Information'),
  'contact.info.address.title': placeholder('Address'),
  'contact.info.address.value': placeholder('123 Church Street, Rubavu, Rwanda'),
  'contact.info.phone.title': placeholder('Phone'),
  'contact.info.phone.value': placeholder('(+250) 7XX XXX XXX'),
  'contact.info.email.title': placeholder('Email'),
  'contact.info.email.value': placeholder('info@rubavuanglican.org'),
  'contact.findUs.title': placeholder('Find Us'),

  // User Roles
  'userRoles.superAdmin': { en: 'Super Admin', rw: 'Umunyamabanga Mukuru Cyane', fr: 'Super Administrateur', sw: 'Msimamizi Mkuu', es: 'Super Administrador', de: 'Super-Administrator' },
  'userRoles.churchAdmin': { en: 'Church Admin', rw: 'Umunyamabanga w\'Itorero', fr: 'Administrateur de l\'Église', sw: 'Msimamizi wa Kanisa', es: 'Administrador de la Iglesia', de: 'Kirchenadministrator' },
  'userRoles.pastor': { en: 'Pastor', rw: 'Pasitoro', fr: 'Pasteur', sw: 'Mchungaji', es: 'Pastor', de: 'Pastor' },
  'userRoles.chiefPastor': { en: 'Chief Pastor', rw: 'Pasitoro Mukuru', fr: 'Pasteur Principal', sw: 'Mchungaji Mkuu', es: 'Pastor Principal', de: 'Hauptpastor' },
  'userRoles.diacon': { en: 'Diacon', rw: 'Umudiyakoni', fr: 'Diacre', sw: 'Shemasi', es: 'Diácono', de: 'Diakon' },
  'userRoles.choirAdmin': { en: 'Choir Admin', rw: 'Umunyamabanga wa Korali', fr: 'Administrateur de Chorale', sw: 'Msimamizi wa Kwaya', es: 'Administrador de Coro', de: 'Chorleiter' },
  'userRoles.choirMember': { en: 'Choir Member', rw: 'Umuririmbyi', fr: 'Membre de Chorale', sw: 'Mwanakwaya', es: 'Miembro del Coro', de: 'Chormitglied' },
  'userRoles.unionAdmin': { en: 'Union Admin', rw: 'Umunyamabanga w\'Itsinda', fr: 'Administrateur d\'Union', sw: 'Msimamizi wa Jumuiya', es: 'Administrador de Unión', de: 'Unionsleiter' },
  'userRoles.unionMember': { en: 'Union Member', rw: 'Umunyamuryango w\'Itsinda', fr: 'Membre d\'Union', sw: 'Mwanajumuiya', es: 'Miembro de Unión', de: 'Unionsmitglied' },
  'userRoles.regularMember': { en: 'Regular Member', rw: 'Umunyamuryango usanzwe', fr: 'Membre Régulier', sw: 'Mwanachama wa Kawaida', es: 'Miembro Regular', de: 'Reguläres Mitglied' },

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

  // Dashboard Profile Page
  'dashboard.profile.pageTitle': placeholder('My Profile'),
  'dashboard.profile.pageSubtitle': placeholder('View and update your personal information.'),
  'dashboard.profile.form.editTitle': placeholder('Edit Your Profile'),
  'dashboard.profile.form.displayName.label': placeholder('Display Name'),
  'dashboard.profile.form.displayName.description': placeholder('This is your public display name.'),
  'dashboard.profile.form.photo.label': placeholder('Profile Picture'),
  'dashboard.profile.form.photo.description': placeholder('Upload a new profile picture (optional).'),
  'dashboard.profile.form.interests.label': placeholder('Interests'),
  'dashboard.profile.form.interests.description': placeholder('List your interests to help us personalize your experience. Separate interests with a comma.'),
  'dashboard.profile.form.interests.placeholder': placeholder('E.g. Bible Study, Music, Community Service...'),
  'dashboard.profile.form.interests.example': placeholder('Example: Music, Bible Study, Youth Ministry'),
  'dashboard.profile.form.button.update': placeholder('Update Profile'),
  'dashboard.profile.toast.updated.title': placeholder('Profile Updated'),
  'dashboard.profile.toast.updated.description': placeholder('Your profile has been successfully updated.'),
  'dashboard.profile.toast.updateFailed.title': placeholder('Update Failed'),
  'dashboard.profile.toast.updateFailed.description': placeholder('Could not update your profile. Please try again.'),
  'dashboard.profile.loading': placeholder('Loading profile...'),
  'dashboard.profile.notLoggedIn': placeholder('Please log in to view your profile.'),


  // Admin Books Page
  'admin.books.title': placeholder('Manage Books'),
  'admin.books.subtitle': placeholder('Add, edit, or remove books from the digital library.'),
  'admin.books.addNew': placeholder('Add New Book'),
  'admin.books.form.editTitle': placeholder('Edit Book'),
  'admin.books.form.addTitle': placeholder('Add a New Book'),
  'admin.books.empty.title': placeholder('No Books in Library'),
  'admin.books.empty.description': placeholder('Click "Add New Book" to get started.'),
  'admin.books.delete.confirm.title': placeholder('Confirm Deletion'),
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

  // Books Page (Public)
  'books.title': placeholder('Digital Library'),
  'books.subtitle': placeholder('Explore our collection of Christian literature and resources.'),
  'books.empty.title': placeholder('No Books Available'),
  'books.empty.description': placeholder('Our digital library is currently empty. Please check back soon.'),

  // Ceremonies Page (Public)
  'ceremonies.title': placeholder('Church Ceremonies'),
  'ceremonies.subtitle': placeholder('Memories and details from our special church ceremonies and celebrations.'),
  'ceremonies.empty.title': placeholder('No Ceremonies Recorded'),
  'ceremonies.empty.description': placeholder('Details about past ceremonies will be available here soon.'),
  'ceremonies.card.type': placeholder('Type:'),
  'ceremonies.card.noDetails': placeholder('No specific details provided.'),

  // Choirs Page (Public)
  'choirs.title': placeholder('Our Choirs'),
  'choirs.subtitle': placeholder('Discover the talented choirs of Rubavu Anglican Church.'),
  'choirs.empty.title': placeholder('No Choirs Found'),
  'choirs.empty.description': placeholder('Information about our choirs will be available soon.'),
  'choirs.card.chamber': placeholder('Chamber:'),
  'choirs.card.ledBy': placeholder('Led by dedicated administrators.'),

  // Events Page (Public)
  'events.title': placeholder('Church Events'),
  'events.subtitle': placeholder('Stay updated with all our upcoming and past church events.'),
  'events.empty.title': placeholder('No Events Found'),
  'events.empty.description': placeholder('There are currently no events scheduled. Please check back soon!'),

  // Event Detail Page (/events/[id])
  'eventDetail.backButton': placeholder('Back to Events'),
  'eventDetail.notFound': placeholder('Event not found.'),
  'eventDetail.failToLoad': placeholder('Failed to load event details.'),
  'eventDetail.notFound.description': placeholder('The event you are looking for might have been removed or the link is incorrect.'),
  'eventDetail.unavailable': placeholder('Event details are unavailable.'),

  // Unions Page (Public)
  'unions.title': placeholder('Church Unions'),
  'unions.subtitle': placeholder('Learn about our Mothers Union, Fathers Union, and other fellowship groups.'),
  'unions.empty.title': placeholder('No Unions Found'),
  'unions.empty.description': placeholder('Information about our church unions will be available soon.'),
  'unions.card.fellowship': placeholder('Fostering fellowship and spiritual growth.'),

  // Videos Page (Public)
  'videos.title': placeholder('Video Gallery'),
  'videos.subtitle': placeholder('Watch sermons, event highlights, and other inspirational videos.'),
  'videos.empty.title': placeholder('No Videos Available'),
  'videos.empty.description': placeholder('Our video gallery is currently empty. Please check back soon.'),
  'videos.card.watch': placeholder('Watch Video'),
  'videos.card.thumbnailAlt': placeholder('Video thumbnail'),


  // Admin Users Page
  'admin.users.pageTitle': placeholder('Manage Users'),
  'admin.users.pageSubtitle': placeholder('View and manage user roles within the application.'),
  'admin.users.listTitle': placeholder('User List'),
  'admin.users.total': placeholder('Total Users:'),
  'admin.users.empty': placeholder('No users found.'),
  'admin.users.table.user': placeholder('User'),
  'admin.users.table.email': placeholder('Email'),
  'admin.users.table.role': placeholder('Role'),
  'admin.users.table.actions': placeholder('Actions'),
  'admin.users.changeRolePlaceholder': placeholder('Change role'),
  'admin.users.toast.roleUpdated.title': placeholder('Role Updated'),
  'admin.users.toast.roleUpdated.description': placeholder('User role changed to'), // Role name appended
  'admin.users.toast.error.fetch': placeholder('Could not fetch users.'),
  'admin.users.toast.error.updateRole': placeholder('Could not update user role.'),
  'admin.users.cannotChangeOwnRole': placeholder('You cannot change your own role.'),
  'admin.users.permissionDeniedAssignSuperAdmin': placeholder('Only Super Admins can assign Super Admin role.'),
  'admin.users.yourAccount': placeholder('Your Account'),

  // Admin Events Page
  'admin.events.pageTitle': placeholder('Manage Events'),
  'admin.events.pageSubtitle': placeholder('Create, update, and manage church events.'),
  'admin.events.addNew': placeholder('Add New Event'),
  'admin.events.form.editTitle': placeholder('Edit Event'),
  'admin.events.form.addTitle': placeholder('Add a New Event'),
  'admin.events.empty.title': placeholder('No Events Found'),
  'admin.events.empty.description': placeholder('Click "Add New Event" to get started.'),
  'admin.events.delete.confirm.description': placeholder('This action cannot be undone. This will permanently delete the event'), // Event title appended
  'admin.events.toast.deleted.title': placeholder('Event Deleted'),
  'admin.events.toast.deleted.description': placeholder('has been removed.'), // Event title prepended
  'admin.events.toast.error.fetch': placeholder('Could not fetch events.'),
  'admin.events.toast.error.delete': placeholder('Could not delete event.'),

  // EventForm Component
  'eventForm.title.label': placeholder('Event Title'),
  'eventForm.title.placeholder': placeholder('Sunday Service'),
  'eventForm.description.label': placeholder('Description'),
  'eventForm.description.placeholder': placeholder('Details about the event...'),
  'eventForm.date.label': placeholder('Event Date'),
  'eventForm.date.pick': placeholder('Pick a date'),
  'eventForm.time.label': placeholder('Event Time (HH:MM)'),
  'eventForm.time.error': placeholder('Please enter a valid time in HH:MM format.'),
  'eventForm.location.label': placeholder('Location (Optional)'),
  'eventForm.location.placeholder': placeholder('Church Main Hall'),
  'eventForm.imageUrl.label': placeholder('Image URL (Optional)'),
  'eventForm.imageUrl.placeholder': placeholder('https://example.com/event-image.jpg'),
  'eventForm.imageUrl.description': placeholder('Link to an image for the event.'),
  'eventForm.toast.updated.title': placeholder('Event Updated'),
  'eventForm.toast.updated.description': placeholder('has been successfully updated.'), // Event title prepended
  'eventForm.toast.added.title': placeholder('Event Added'),
  'eventForm.toast.added.description': placeholder('has been successfully added.'), // Event title prepended
  'eventForm.toast.failed.title': placeholder('Failed to Save Event'),
  'eventForm.toast.failed.description': placeholder('Could not save the event. Please try again.'),
  'eventForm.button.add': placeholder('Add Event'),
  'eventForm.button.save': placeholder('Save Changes'),

  // Admin Videos Page
  'admin.videos.pageTitle': placeholder('Manage Videos'),
  'admin.videos.pageSubtitle': placeholder('Add, edit, or remove videos from the gallery.'),
  'admin.videos.addNew': placeholder('Add New Video'),
  'admin.videos.form.editTitle': placeholder('Edit Video'),
  'admin.videos.form.addTitle': placeholder('Add a New Video'),
  'admin.videos.empty.title': placeholder('No Videos in Gallery'),
  'admin.videos.empty.description': placeholder('Click "Add New Video" to get started.'),
  'admin.videos.delete.confirm.description': placeholder('This action cannot be undone. This will permanently delete the video'), // Video title appended
  'admin.videos.toast.deleted.title': placeholder('Video Deleted'),
  'admin.videos.toast.deleted.description': placeholder('has been removed.'), // Video title prepended
  'admin.videos.toast.error.fetch': placeholder('Could not fetch videos.'),
  'admin.videos.toast.error.delete': placeholder('Could not delete video.'),
  'admin.videos.card.url': placeholder('URL:'),
  'admin.videos.card.category': placeholder('Category:'),


  // VideoForm Component
  'videoForm.title.label': placeholder('Video Title'),
  'videoForm.title.placeholder': placeholder('Sermon on Faith'),
  'videoForm.description.label': placeholder('Description (Optional)'),
  'videoForm.description.placeholder': placeholder('A brief summary of the video...'),
  'videoForm.videoUrl.label': placeholder('Video URL'),
  'videoForm.videoUrl.placeholder': placeholder('https://youtube.com/watch?v=...'),
  'videoForm.videoUrl.description': placeholder('Link to YouTube, Vimeo, or a direct video file (.mp4, .webm).'),
  'videoForm.thumbnailUrl.label': placeholder('Thumbnail URL (Optional)'),
  'videoForm.thumbnailUrl.placeholder': placeholder('https://example.com/thumbnail.jpg'),
  'videoForm.thumbnailUrl.description': placeholder('Direct link to an image for the video thumbnail.'),
  'videoForm.category.label': placeholder('Category (Optional)'),
  'videoForm.category.placeholder': placeholder('e.g., Sermon, Event Highlight, Music'),
  'videoForm.toast.updated.title': placeholder('Video Updated'),
  'videoForm.toast.updated.description': placeholder('has been successfully updated.'), // Video title prepended
  'videoForm.toast.added.title': placeholder('Video Added'),
  'videoForm.toast.added.description': placeholder('has been successfully added.'), // Video title prepended
  'videoForm.toast.failed.title': placeholder('Failed to Save Video'),
  'videoForm.toast.failed.description': placeholder('Could not save the video. Please try again.'),
  'videoForm.button.add': placeholder('Add Video'),
  'videoForm.button.save': placeholder('Save Changes'),

  // Admin Ceremonies Page
  'admin.ceremonies.pageTitle': placeholder('Manage Ceremonies'),
  'admin.ceremonies.pageSubtitle': placeholder('Record and manage details of church ceremonies.'),
  'admin.ceremonies.addNew': placeholder('Add New Ceremony'),
  'admin.ceremonies.form.editTitle': placeholder('Edit Ceremony'),
  'admin.ceremonies.form.addTitle': placeholder('Add New Ceremony'),
  'admin.ceremonies.empty.title': placeholder('No Ceremonies Recorded'),
  'admin.ceremonies.empty.description': placeholder('Click "Add New Ceremony" to get started.'),
  'admin.ceremonies.delete.confirm.description': placeholder('This action cannot be undone. This will permanently delete'), // Ceremony title appended
  'admin.ceremonies.toast.deleted.title': placeholder('Ceremony Deleted'),
  'admin.ceremonies.toast.deleted.description': placeholder('has been removed.'), // Ceremony title prepended
  'admin.ceremonies.toast.error.fetch': placeholder('Could not fetch ceremonies.'),
  'admin.ceremonies.toast.error.delete': placeholder('Could not delete ceremony.'),
  'admin.ceremonies.card.videosCount': placeholder('video(s)'),

  // CeremonyForm Component
  'ceremonyForm.title.label': placeholder('Ceremony Title'),
  'ceremonyForm.title.placeholder': placeholder("e.g., John & Jane's Wedding"),
  'ceremonyForm.type.label': placeholder('Ceremony Type'),
  'ceremonyForm.type.placeholder': placeholder('e.g., Wedding, Baptism, Confirmation'),
  'ceremonyForm.type.error': placeholder('Type must be at least 3 characters.'),
  'ceremonyForm.description.label': placeholder('Description'),
  'ceremonyForm.description.placeholder': placeholder('Details about the ceremony...'),
  'ceremonyForm.date.label': placeholder('Ceremony Date'),
  'ceremonyForm.date.pick': placeholder('Pick a date'),
  'ceremonyForm.date.error': placeholder('A valid date is required.'),
  'ceremonyForm.imageUrls.label': placeholder('Image URLs (Optional)'),
  'ceremonyForm.imageUrls.placeholder': placeholder('https://example.com/image.jpg'),
  'ceremonyForm.imageUrls.add': placeholder('Add Image URL'),
  'ceremonyForm.videoUrls.label': placeholder('Video URLs (Optional)'),
  'ceremonyForm.videoUrls.placeholder': placeholder('https://youtube.com/watch?v='),
  'ceremonyForm.videoUrls.add': placeholder('Add Video URL'),
  'ceremonyForm.toast.updated.title': placeholder('Ceremony Updated'),
  'ceremonyForm.toast.updated.description': placeholder('has been successfully updated.'), // Ceremony title prepended
  'ceremonyForm.toast.added.title': placeholder('Ceremony Added'),
  'ceremonyForm.toast.added.description': placeholder('has been successfully added.'), // Ceremony title prepended
  'ceremonyForm.toast.failed.title': placeholder('Failed to Save Ceremony'),
  'ceremonyForm.toast.failed.description': placeholder('Could not save the ceremony. Please try again.'),
  'ceremonyForm.button.add': placeholder('Add Ceremony'),
  'ceremonyForm.button.save': placeholder('Save Changes'),

  // Admin Choirs Page
  'admin.choirs.pageTitle': placeholder('Manage Choirs'),
  'admin.choirs.pageSubtitle': placeholder('Update general information about church choirs.'),
  'admin.choirs.addNew': placeholder('Add New Choir'),
  'admin.choirs.form.editTitle': placeholder('Edit Choir'),
  'admin.choirs.form.addTitle': placeholder('Add New Choir'),
  'admin.choirs.empty.title': placeholder('No Choirs Found'),
  'admin.choirs.empty.description': placeholder('Click "Add New Choir" to get started.'),
  'admin.choirs.delete.confirm.description': placeholder('This action cannot be undone. This will permanently delete the choir'), // Choir name appended
  'admin.choirs.toast.deleted.title': placeholder('Choir Deleted'),
  'admin.choirs.toast.deleted.description': placeholder('has been removed.'), // Choir name prepended
  'admin.choirs.toast.error.fetch': placeholder('Could not fetch choirs.'),
  'admin.choirs.toast.error.delete': placeholder('Could not delete choir.'),
  'admin.choirs.card.adminUids': placeholder('Admin UIDs:'),
  'admin.choirs.card.adminUidsNone': placeholder('None'),

  // ChoirInfoForm Component
  'choirInfoForm.name.label': placeholder('Choir Name'),
  'choirInfoForm.name.placeholder': placeholder('Glorious Singers'),
  'choirInfoForm.name.error': placeholder('Choir name must be at least 3 characters.'),
  'choirInfoForm.chamber.label': placeholder('Chamber'),
  'choirInfoForm.chamber.placeholder': placeholder('Main Church / Youth / Sunday School'),
  'choirInfoForm.chamber.error': placeholder('Chamber name must be at least 2 characters.'),
  'choirInfoForm.description.label': placeholder('Description (Optional)'),
  'choirInfoForm.description.placeholder': placeholder('About the choir...'),
  'choirInfoForm.adminUids.label': placeholder('Choir Admin User IDs (Optional)'),
  'choirInfoForm.adminUids.placeholder': placeholder('uid1, uid2, uid3'),
  'choirInfoForm.adminUids.description': placeholder('Comma-separated list of User IDs for choir administrators.'),
  'choirInfoForm.toast.updated.title': placeholder('Choir Info Updated'),
  'choirInfoForm.toast.updated.description': placeholder('has been successfully updated.'), // Choir name prepended
  'choirInfoForm.toast.added.title': placeholder('Choir Info Added'),
  'choirInfoForm.toast.added.description': placeholder('has been successfully added.'), // Choir name prepended
  'choirInfoForm.toast.failed.title': placeholder('Failed to Save Choir Info'),
  'choirInfoForm.toast.failed.description': placeholder('Could not save choir information. Please try again.'),
  'choirInfoForm.button.add': placeholder('Add Choir'),
  'choirInfoForm.button.save': placeholder('Save Changes'),

  // Admin Unions Page
  'admin.unions.pageTitle': placeholder('Manage Unions'),
  'admin.unions.pageSubtitle': placeholder('Update general information about church unions.'),
  'admin.unions.addNew': placeholder('Add New Union'),
  'admin.unions.form.editTitle': placeholder('Edit Union'),
  'admin.unions.form.addTitle': placeholder('Add New Union'),
  'admin.unions.empty.title': placeholder('No Unions Found'),
  'admin.unions.empty.description': placeholder('Click "Add New Union" to get started.'),
  'admin.unions.delete.confirm.description': placeholder('This action cannot be undone. This will permanently delete the union'), // Union name appended
  'admin.unions.toast.deleted.title': placeholder('Union Deleted'),
  'admin.unions.toast.deleted.description': placeholder('has been removed.'), // Union name prepended
  'admin.unions.toast.error.fetch': placeholder('Could not fetch unions.'),
  'admin.unions.toast.error.delete': placeholder('Could not delete union.'),

  // UnionInfoForm Component
  'unionInfoForm.name.label': placeholder('Union Name/Type'),
  'unionInfoForm.name.selectPlaceholder': placeholder('Select a union type'),
  'unionInfoForm.name.error': placeholder('Please select a union type.'),
  'unionInfoForm.description.label': placeholder('Description (Optional)'),
  'unionInfoForm.description.placeholder': placeholder('About the union...'),
  'unionInfoForm.adminUids.label': placeholder('Union Admin User IDs (Optional)'),
  'unionInfoForm.adminUids.placeholder': placeholder('uid1, uid2, uid3'),
  'unionInfoForm.adminUids.description': placeholder('Comma-separated list of User IDs for union administrators.'),
  'unionInfoForm.toast.updated.title': placeholder('Union Info Updated'),
  'unionInfoForm.toast.updated.description': placeholder('has been successfully updated.'), // Union name prepended
  'unionInfoForm.toast.added.title': placeholder('Union Info Added'),
  'unionInfoForm.toast.added.description': placeholder('has been successfully added.'), // Union name prepended
  'unionInfoForm.toast.failed.title': placeholder('Failed to Save Union Info'),
  'unionInfoForm.toast.failed.description': placeholder('Could not save union information. Please try again.'),
  'unionInfoForm.button.add': placeholder('Add Union'),
  'unionInfoForm.button.save': placeholder('Save Changes'),

  // Dashboard Sub Pages (Placeholders for now)
  'dashboard.activities.pageTitle': placeholder('Manage Activities'),
  'dashboard.activities.pageSubtitle': placeholder('Oversee and manage church-related activities.'),
  'dashboard.activities.cardTitle': placeholder('Activity Management'),
  'dashboard.activities.description': placeholder('This section is for Pastors and Diacons to manage specific church activities they are responsible for. This might include smaller group meetings, pastoral care coordination, or specific ministry tasks. This could be integrated with the main events system or be a separate module.'),

  'dashboard.choirAdmin.manage.pageTitle': placeholder('Manage My Choir'),
  'dashboard.choirAdmin.manage.pageSubtitle': placeholder('Administer your choir members, events, and announcements.'),
  'dashboard.choirAdmin.manage.cardTitle': placeholder('Choir Administration'),
  'dashboard.choirAdmin.manage.description': placeholder("As a Choir Admin, you can manage your choir's members (approve requests, view list), schedule practices or choir-specific events, and post announcements for your choir."),

  'dashboard.members.pageTitle': placeholder('View Members'),
  'dashboard.members.pageSubtitle': placeholder('Access and view the list of church members.'),
  'dashboard.members.cardTitle': placeholder('Church Member Directory'),
  'dashboard.members.description': placeholder('This section will display a list of all church members. Functionality for searching, filtering, and viewing member details will be available.'),

  'dashboard.settings.pageTitle': placeholder('Application Settings'),
  'dashboard.settings.pageSubtitle': placeholder('Manage global settings for Rubavu Anglican Connect.'),
  'dashboard.settings.cardTitle': placeholder('Global Configuration'),
  'dashboard.settings.description': placeholder('This area is for Super Admins to manage application-wide settings. This could include:'),
  'dashboard.settings.listItem1': placeholder('Site branding and appearance.'),
  'dashboard.settings.listItem2': placeholder('Integration settings (e.g., email services).'),
  'dashboard.settings.listItem3': placeholder('Default role assignments or secret code management.'),
  'dashboard.settings.listItem4': placeholder('Feature flags or advanced configurations.'),

  'dashboard.unionAdmin.manage.pageTitle': placeholder('Manage My Union'),
  'dashboard.unionAdmin.manage.pageSubtitle': placeholder('Administer your union members, events, and communications.'),
  'dashboard.unionAdmin.manage.cardTitle': placeholder('Union Administration'),
  'dashboard.unionAdmin.manage.description': placeholder("As a Union Admin, you can manage your union's members (approve requests, view list), schedule meetings or union-specific events, and post announcements for your union."),

  // Sidebar
  'sidebar.menuTitle': placeholder('Dashboard Menu'),
  'sidebar.overview': placeholder('Overview'),
  'sidebar.myProfile': placeholder('My Profile'),
  'sidebar.manageUsers': placeholder('Manage Users'),
  'sidebar.manageEvents': placeholder('Manage Events'),
  'sidebar.manageBooks': placeholder('Manage Books'),
  'sidebar.manageVideos': placeholder('Manage Videos'),
  'sidebar.manageCeremonies': placeholder('Manage Ceremonies'),
  'sidebar.manageChoirsInfo': placeholder('Manage Choirs Info'),
  'sidebar.manageUnionsInfo': placeholder('Manage Unions Info'),
  'sidebar.viewMembers': placeholder('View Members'),
  'sidebar.manageActivities': placeholder('Manage Activities'),
  'sidebar.manageMyChoir': placeholder('Manage My Choir'),
  'sidebar.manageMyUnion': placeholder('Manage My Union'),
  'sidebar.appSettings': placeholder('App Settings'),

  // Chat Page
  'chat.title': placeholder('Live Chat'),
  'chat.subtitle': placeholder('Connect and discuss with other members in real-time.'),
  'chat.sendMessagePlaceholder': placeholder('Type your message...'),
  'chat.sendButton': placeholder('Send'),
  'chat.loadingMessages': placeholder('Loading messages...'),
  'chat.notAuthenticated': placeholder('You must be logged in to access the chat.'),
  'chat.noMessages': placeholder('No messages yet. Be the first to say something!'),


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
