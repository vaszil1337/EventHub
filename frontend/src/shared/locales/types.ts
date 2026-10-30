export type Locale = 'en' | 'hu';

export interface TranslationDictionary {
  common: {
    save: string;
    cancel: string;
    close: string;
    confirm: string;
    back: string;
    loading: string;
    error: string;
    success: string;
    details: string;
    language: string;
  };
  nav: {
    brandTitle: string;
    brandSubtitle: string;
    events: string;
    myTickets: string;
    reservations: string;
    manageEvents: string;
    signIn: string;
    signOut: string;
  };
  auth: {
    signIn: string;
    register: string;
    signInDescription: string;
    registerDescription: string;
    email: string;
    password: string;
    fullName: string;
    role: string;
    participant: string;
    organizer: string;
    noAccount: string;
    haveAccount: string;
    quickDemoLogin: string;
    participantDemo: string;
    organizerDemo: string;
    welcomeBack: string;
    registrationSuccess: string;
  };
  events: {
    exploreTitle: string;
    exploreSubtitle: string;
    allCategories: string;
    searchPlaceholder: string;
    seatsLeft: string;
    soldOut: string;
    bookTicket: string;
    editEvent: string;
    viewDetails: string;
    capacity: string;
    price: string;
    venue: string;
    date: string;
  };
  booking: {
    title: string;
    participantName: string;
    participantEmail: string;
    selectTier: string;
    confirmButton: string;
    bookingSuccessTitle: string;
    bookingSuccessSubtitle: string;
    yourPasscode: string;
    copyCode: string;
    codeCopied: string;
  };
  backend_messages: {
    capacity_exceeded: string;
    invalid_credentials: string;
    user_already_exists: string;
    unauthorized: string;
    forbidden: string;
    event_not_found: string;
    already_cancelled: string;
    generic_error: string;
  };
}
