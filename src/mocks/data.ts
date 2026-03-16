export const mockUser = {
  id: "user-1",
  email: "jan@example.com",
};

export interface Todo {
  id: string;
  text: string;
}

export interface Recording {
  id: string;
  createdAt: string;
  durationSeconds: number;
  audioUrl: string;
  transcript: string;
  summary: string;
  todos: Todo[];
}

export interface Digest {
  id: string;
  date: string;
  dayName: string;
  recordingIds: string[];
  summary: string;
  todos: Todo[];
}

export const mockRecordings: Recording[] = [
  {
    id: "rec-1",
    createdAt: "2025-01-15T09:23:00",
    durationSeconds: 187,
    audioUrl: "/mock-audio.webm",
    transcript: "Dneska ráno mě napadlo, že bychom mohli změnit přístup k onboardingu nových klientů. Místo toho dlouhého emailu by bylo lepší udělat krátké video, kde jim vysvětlíme základy. Taky musím zavolat Petrovi ohledně faktury za leden, ta ještě nebyla zaplacená. A ještě — nezapomenout koupit lístky na vlak do Brna na příští pátek.",
    summary: "Nápad na změnu onboardingu nových klientů — místo dlouhého emailu natočit krátké vysvětlující video. Nevyřízená faktura za leden — kontaktovat Petra. Cestování do Brna příští pátek.",
    todos: [
      { id: "todo-1", text: "Natočit onboardingové video pro nové klienty" },
      { id: "todo-2", text: "Zavolat Petrovi ohledně faktury za leden" },
      { id: "todo-3", text: "Koupit lístky na vlak do Brna na pátek" },
    ],
  },
  {
    id: "rec-2",
    createdAt: "2025-01-15T14:05:00",
    durationSeconds: 62,
    audioUrl: "/mock-audio.webm",
    transcript: "Poznámka k projektu Dayvoice — přidat možnost tagování nahrávek by bylo fajn, ale to až po MVP. Teď se soustředit na základní flow: nahrát, přepsat, shrnout. Nic víc.",
    summary: "Poznámka k projektu Dayvoice — tagování nahrávek odložit na po MVP. Priorita je základní flow: nahrávání → přepis → shrnutí.",
    todos: [
      { id: "todo-4", text: "Dokončit základní flow Dayvoice (nahrát → přepsat → shrnout)" },
    ],
  },
  {
    id: "rec-3",
    createdAt: "2025-01-14T18:30:00",
    durationSeconds: 245,
    audioUrl: "/mock-audio.webm",
    transcript: "Dneska jsem měl schůzku s designérem ohledně nového loga. Líbí se mi varianta s gradientem, ale potřebuje ještě doladit písmo. Domluvili jsme se, že pošle finální verzi do pátku. Večer chci ještě projít ten článek o PWA optimalizaci, co mi poslal Tomáš.",
    summary: "Schůzka s designérem — vybraná varianta loga s gradientem, finální verze do pátku. Doladit písmo. Přečíst článek o PWA optimalizaci od Tomáše.",
    todos: [
      { id: "todo-5", text: "Počkat na finální verzi loga od designéra (pátek)" },
      { id: "todo-6", text: "Projít článek o PWA optimalizaci od Tomáše" },
    ],
  },
  {
    id: "rec-4",
    createdAt: "2025-01-13T08:15:00",
    durationSeconds: 34,
    audioUrl: "/mock-audio.webm",
    transcript: "Koupit mléko a chleba.",
    summary: "Nákup — mléko a chleba.",
    todos: [
      { id: "todo-7", text: "Koupit mléko a chleba" },
    ],
  },
];

export const mockDigests: Digest[] = [
  {
    id: "digest-1",
    date: "2025-01-15",
    dayName: "Středa",
    recordingIds: ["rec-1", "rec-2"],
    summary: "Produktivní den s dvěma nahrávkami. Hlavní téma: projekt Dayvoice a klientský onboarding.\n\nKlíčové body:\n• Nápad na zlepšení onboardingu — nahradit dlouhý email krátkým videem\n• Nevyřízená faktura za leden — nutné kontaktovat Petra\n• Plánování cesty do Brna na příští pátek\n• Dayvoice: soustředit se na základní MVP flow, tagování odložit",
    todos: [
      { id: "dtodo-1", text: "Natočit onboardingové video pro nové klienty" },
      { id: "dtodo-2", text: "Zavolat Petrovi ohledně faktury za leden" },
      { id: "dtodo-3", text: "Koupit lístky na vlak do Brna na pátek" },
      { id: "dtodo-4", text: "Dokončit základní flow Dayvoice" },
    ],
  },
  {
    id: "digest-2",
    date: "2025-01-14",
    dayName: "Úterý",
    recordingIds: ["rec-3"],
    summary: "Jeden záznam — schůzka s designérem.\n\nKlíčové body:\n• Vybraná varianta loga s gradientem, potřeba doladit písmo\n• Finální verze loga očekávána do pátku\n• Plán přečíst článek o PWA optimalizaci",
    todos: [
      { id: "dtodo-5", text: "Počkat na finální verzi loga (pátek)" },
      { id: "dtodo-6", text: "Projít článek o PWA optimalizaci" },
    ],
  },
  {
    id: "digest-3",
    date: "2025-01-13",
    dayName: "Pondělí",
    recordingIds: ["rec-4"],
    summary: "Krátký den — jedna rychlá poznámka k nákupu.",
    todos: [
      { id: "dtodo-7", text: "Koupit mléko a chleba" },
    ],
  },
];
