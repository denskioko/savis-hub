// Simple English / Swahili translations for the prototype

export type Lang = "en" | "sw";

const translations = {
  // Common
  "welcome.back": { en: "Welcome back,", sw: "Karibu tena," },
  "log.out": { en: "Log out", sw: "Toka" },
  "search": { en: "Search", sw: "Tafuta" },
  "home": { en: "Home", sw: "Nyumbani" },
  "bookings": { en: "Bookings", sw: "Oda" },
  "profile": { en: "Profile", sw: "Wasifu" },
  "contact": { en: "Contact", sw: "Wasiliana" },
  "clear": { en: "Clear", sw: "Futa" },
  "back": { en: "Back", sw: "Rudi" },
  "loading": { en: "Loading…", sw: "Inapakia…" },

  // Consumer
  "find.help": { en: "Find trusted local help near you", sw: "Pata msaada wa karibu unaoaminika" },
  "search.placeholder": { en: "Try: plumber, tailor, mason…", sw: "Jaribu: fundi maji, mshonaji…" },
  "near.you": { en: "Near You", sw: "Karibu Nawe" },
  "results": { en: "Results", sw: "Matokeo" },
  "nothing.found": { en: "Nothing found. Try another word or category.", sw: "Hakuna kilichopatikana. Jaribu neno lingine." },
  "sample.note": { en: "Sample listings for the prototype · Real providers come next", sw: "Orodha za mfano · Watoa huduma halisi wanakuja" },
  "from.ksh": { en: "From KSh", sw: "Kuanzia KSh" },
  "available.today": { en: "Available today", sw: "Leo" },
  "available.now": { en: "Available now", sw: "Sasa hivi" },
  "this.week": { en: "This week", sw: "Wiki hii" },
  "nairobi.sample": { en: "Nairobi · Using sample listings", sw: "Nairobi · Orodha za mfano" },

  // Categories
  "cat.all": { en: "All", sw: "Zote" },
  "cat.plumbing": { en: "Plumbing", sw: "Maji" },
  "cat.mason": { en: "Mason", sw: "Uashi" },
  "cat.electrical": { en: "Electrical", sw: "Umeme" },
  "cat.tailor": { en: "Tailor", sw: "Ushonaji" },
  "cat.cleaning": { en: "Cleaning", sw: "Usafi" },
  "cat.carpentry": { en: "Carpentry", sw: "Useremala" },
  "cat.painting": { en: "Painting", sw: "Rangi" },
  "cat.photo": { en: "Photo", sw: "Picha" },

  // Provider
  "manage.jobs": { en: "Manage your jobs and earnings", sw: "Simamia kazi na mapato yako" },
  "available.jobs": { en: "I'm available for jobs", sw: "Nipo tayari kwa kazi" },
  "not.available": { en: "Not available right now", sw: "Sipatikani sasa" },
  "new.requests": { en: "New job requests", sw: "Maombi mapya ya kazi" },
  "no.requests": { en: "No new requests right now. Customers near you will appear here.", sw: "Hakuna maombi mapya. Wateja wa karibu wataonekana hapa." },
  "accept": { en: "Accept", sw: "Kubali" },
  "decline": { en: "Decline", sw: "Kataa" },
  "active.jobs": { en: "Active jobs", sw: "Kazi zinazoendelea" },
  "in.progress": { en: "In progress", sw: "Inaendelea" },
  "mark.complete": { en: "Mark complete", sw: "Maliza kazi" },
  "message": { en: "Message", sw: "Ujumbe" },
  "payouts": { en: "Payouts", sw: "Malipo" },
  "available.withdraw": { en: "Available to withdraw", sw: "Inapatikana kutoa" },
  "held.escrow": { en: "Held in escrow until job completion", sw: "Imehifadhiwa hadi kazi ikamilike" },
  "ksh.week": { en: "KSh this week", sw: "KSh wiki hii" },
  "jobs.accepted": { en: "Jobs accepted", sw: "Kazi zilizokubaliwa" },
  "rating": { en: "Rating", sw: "Rating" },

  // Bookings
  "my.bookings": { en: "My bookings", sw: "Oda zangu" },
  "jobs.requested": { en: "Jobs you have requested or booked", sw: "Kazi ulizoomba au kuweka book" },
  "no.bookings": { en: "No bookings yet", sw: "Hakuna oda bado" },
  "no.bookings.hint": { en: "When you request a quote or book a provider, it will appear here.", sw: "Ukiaomba bei au kuweka book, itaonekana hapa." },
  "find.provider": { en: "Find a provider", sw: "Tafuta mtoa huduma" },
  "requested": { en: "Requested", sw: "Imeombwa" },
  "accepted": { en: "Accepted", sw: "Imekubaliwa" },

  // Profile
  "go.home": { en: "Go to my home", sw: "Nenda nyumbani" },
  "switch.role": { en: "Switch role", sw: "Badili jukumu" },
  "prototype.note": { en: "SAVIS prototype · No real payments yet", sw: "Prototype ya SAVIS · Hakuna malipo halisi bado" },

  // Provider detail
  "about": { en: "About", sw: "Kuhusu" },
  "cancellation": { en: "Cancellation", sw: "Kughairi" },
  "free.until": { en: "Free until the provider is on the way.", sw: "Bure hadi mtoa huduma aanze safari." },
  "request.quote": { en: "Request a quote", sw: "Omba bei" },
  "book.now": { en: "Book now", sw: "Book sasa" },
  "describe.job": { en: "Describe your job", sw: "Eleza kazi yako" },
  "sending.to": { en: "Sending request to", sw: "Inatumwa kwa" },
  "what.problem": { en: "What is the problem?", sw: "Tatizo ni nini?" },
  "where.job": { en: "Where is the job?", sw: "Kazi iko wapi?" },
  "how.soon": { en: "How soon?", sw: "Kwa haraka gani?" },
  "right.now": { en: "Right now", sw: "Sasa hivi" },
  "today": { en: "Today", sw: "Leo" },
  "send.request": { en: "Send request", sw: "Tuma ombi" },
  "cancel": { en: "Cancel", sw: "Ghairi" },
  "request.sent": { en: "Request sent", sw: "Ombi limetumwa" },
  "view.bookings": { en: "View my bookings", sw: "Tazama oda zangu" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key]?.[lang] ?? translations[key]?.en ?? key;
}

export function getLang(): Lang {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem("savis_lang") as Lang) || "en";
}

export function setLang(lang: Lang) {
  if (typeof window !== "undefined") {
    localStorage.setItem("savis_lang", lang);
  }
}
