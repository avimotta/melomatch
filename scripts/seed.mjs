// ============================================
// MeloMatch Database Seed Script
// ============================================
// Creates fictional musician users, profiles,
// connections, and messages for development.
//
// Usage:
//   1. Copy your service_role key from Supabase Dashboard
//      Project Settings → API → service_role key
//   2. Run:
//      SUPABASE_SERVICE_ROLE_KEY="<your-key>" node scripts/seed.mjs
//
// The script reads NEXT_PUBLIC_SUPABASE_URL from .env.local
// ============================================

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ──────────────────────────────────────────────

function loadEnvLocal() {
  const envPath = resolve(__dirname, "..", ".env.local");
  if (!existsSync(envPath)) {
    console.error("❌ .env.local not found. Are you in the project root?");
    process.exit(1);
  }
  const content = readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
  }
  return env;
}

const env = loadEnvLocal();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local");
  process.exit(1);
}
if (!serviceRoleKey) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY env var required.");
  console.error("   Get it from Supabase Dashboard → Project Settings → API → service_role key");
  console.error("   Then run: SUPABASE_SERVICE_ROLE_KEY=\"<key>\" node scripts/seed.mjs");
  process.exit(1);
}

// ── Client with service_role (bypasses RLS) ──────────────────────

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Fake Users Data ──────────────────────────────────────────────

const USERS = [
  // ── 1-12: Original set ──────────────────────────────────────────
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567801",
    email: "sofia.vega@example.com",
    name: "Sofia Vega",
    instruments: ["Guitar", "Vocals"],
    genres: ["Rock", "Indie"],
    experience_level: "Intermediate",
    looking_for: ["Bandmates", "Songwriting partner"],
    influences: "Spinetta, Natalia Lafourcade, Arctic Monkeys",
    location: "Palermo, CABA",
    bio: "Buscando formar una banda de rock alternativo con influencias del indie argentino. Tengo algunas canciones propias y ganas de tocar en vivo.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567802",
    email: "mateo.rivas@example.com",
    name: "Mateo Rivas",
    instruments: ["Drums", "Percussion"],
    genres: ["Funk", "Jazz", "Latin"],
    experience_level: "Advanced",
    looking_for: ["Band", "Session work"],
    influences: "Tony Allen, Jamiroquai, Herbie Hancock",
    location: "Recoleta, CABA",
    bio: "Baterista de sesión con 10 años de experiencia. Toqué en varias bandas de funk y jazz en Córdoba. Busco proyectos originales para colaborar.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567803",
    email: "lucia.kim@example.com",
    name: "Lucía Kim",
    instruments: ["Violin", "Viola"],
    genres: ["Classical", "Folk"],
    experience_level: "Advanced",
    looking_for: ["Ensemble", "Collaboration"],
    influences: "Yo-Yo Ma, Björk, contemporary classical",
    location: "Belgrano, CABA",
    bio: "Violinist with a passion for fusion — classically trained but love exploring folk traditions from around the world.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567804",
    email: "javier.cruz@example.com",
    name: "Javier Cruz",
    instruments: ["Bass", "Synth"],
    genres: ["Electronic", "Hip Hop"],
    experience_level: "Intermediate",
    looking_for: ["Producer collab", "Vocalist"],
    influences: "Daft Punk, Mac Miller, Helado Negro",
    location: "Nuñez, CABA",
    bio: "Producer y bajista del sur de la CDMX. Me gusta el beat-making y las líneas de bajo funk. Busco vocalistas y productores para armar tracks.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567805",
    email: "emma.torres@example.com",
    name: "Emma Torres",
    instruments: ["Vocals", "Keys"],
    genres: ["Pop", "R&B"],
    experience_level: "Beginner",
    looking_for: ["Mentor", "Band", "Production help"],
    influences: "Rosalía, SZA, Billie Eilish",
    location: "Caballito, CABA",
    bio: "Empezando mi viaje musical después de años de cantar en mi cuarto. Busco gente paciente y talentosa para aprender y crear algo bonito juntos.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567806",
    email: "diego.herrera@example.com",
    name: "Diego Herrera",
    instruments: ["Guitar", "Harmonica"],
    genres: ["Blues", "Rock", "Country"],
    experience_level: "Advanced",
    looking_for: ["Bandmates"],
    influences: "Stevie Ray Vaughan, Jimi Hendrix, ZZ Top",
    location: "Almagro, CABA",
    bio: "Guitarrista y compositor. Mitad uruguayo, mitad Nashvillian. Busco músicos para formar un power trio de blues-rock con actitud.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567807",
    email: "camila.oliveira@example.com",
    name: "Camila Oliveira",
    instruments: ["Flute", "Saxophone"],
    genres: ["Jazz", "Bossa Nova"],
    experience_level: "Advanced",
    looking_for: ["Ensemble", "Touring musician"],
    influences: "Pixinguinha, Hermeto Pascoal, Wayne Shorter",
    location: "San Telmo, CABA",
    bio: "Flautista e saxofonista brasileira. Tocou em diversos conjuntos de choro e bossa nova. Busco projetos de world music e jazz fusion.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567808",
    email: "ben.chen@example.com",
    name: "Ben Chen",
    instruments: ["Piano", "Accordion"],
    genres: ["Classical", "Folk", "Film Score"],
    experience_level: "Advanced",
    looking_for: ["Composer collab", "Film scoring"],
    influences: "Philip Glass, Ryuichi Sakamoto, Jonny Greenwood",
    location: "Villa Crespo, CABA",
    bio: "Composer and multi-instrumentalist. Scored several indie films and short documentaries. Looking to collaborate on film/game scoring or experimental folk.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567809",
    email: "zara.hassan@example.com",
    name: "Zara Hassan",
    instruments: ["Vocals", "Oud"],
    genres: ["World", "Folk", "Electronic"],
    experience_level: "Intermediate",
    looking_for: ["Producer", "Live band", "Vocalist collab"],
    influences: "Fairouz, Nina Simone, Four Tet",
    location: "Colegiales, CABA",
    bio: "Singer blending traditional Arabic vocals with electronic production. Based between Cairo and London. Looking for producers and beat-makers.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567810",
    email: "leo.martinez@example.com",
    name: "Leo Martínez",
    instruments: ["Guitar", "Vocals"],
    genres: ["Latin", "Rock", "Reggae"],
    experience_level: "Intermediate",
    looking_for: ["Band", "Rhythm section"],
    influences: "Manu Chao, Los Fabulosos Cadillacs, Bob Marley",
    location: "Boedo, CABA",
    bio: "Cantautor colombiano con influencias de rock latino y reggae. Busco banda para tocar en vivo y grabar un EP este año.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567811",
    email: "aria.patel@example.com",
    name: "Aria Patel",
    instruments: ["Tabla", "Percussion", "Vocals"],
    genres: ["Indian Classical", "Fusion", "Electronic"],
    experience_level: "Advanced",
    looking_for: ["Fusion projects", "Experimentation"],
    influences: "Ravi Shankar, AR Rahman, Flying Lotus",
    location: "Flores, CABA",
    bio: "Tabla player and vocalist, classically trained in Hindustani music. Now exploring electronic fusion and cross-cultural collaborations.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567812",
    email: "nina.olsen@example.com",
    name: "Nina Olsen",
    instruments: ["Cello", "Piano"],
    genres: ["Classical", "Ambient", "Folk"],
    experience_level: "Intermediate",
    looking_for: ["Collaboration", "Live performance"],
    influences: "Hildur Guðnadóttir, Max Richter, Olafur Arnalds",
    location: "La Boca, CABA",
    bio: "Cellist creating ambient and neoclassical soundscapes. Looking for collaborators for live performances and recordings.",
  },

  // ── 13-25: New additions ─────────────────────────────────────────
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567813",
    email: "ravi.kapoor@example.com",
    name: "Ravi Kapoor",
    instruments: ["Sitar", "Electronics"],
    genres: ["Indian Classical", "Ambient", "Electronic"],
    experience_level: "Advanced",
    looking_for: ["Fusion collaboration", "Live performance"],
    influences: "Ravi Shankar, Brian Eno, Kaitlyn Aurelia Smith",
    location: "Chacarita, CABA",
    bio: "Sitarist pushing the boundaries of classical tradition into ambient and electronic territory. Looking for collaborators who want to explore the space between acoustic and digital.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567814",
    email: "clara.johansson@example.com",
    name: "Clara Johansson",
    instruments: ["Vocals", "Guitar"],
    genres: ["Indie", "Folk", "Dream Pop"],
    experience_level: "Intermediate",
    looking_for: ["Band", "Recording"],
    influences: "The Smiths, Alvvays, The Cranberries",
    location: "Saavedra, CABA",
    bio: "Swedish songwriter with a love for jangly guitars and bittersweet lyrics. Looking to form a dream pop band or join an existing project.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567815",
    email: "tomas.gallo@example.com",
    name: "Tomas Gallo",
    instruments: ["Electric Guitar", "Looper"],
    genres: ["Rock", "Progressive", "Experimental"],
    experience_level: "Advanced",
    looking_for: ["Experimental project", "Band"],
    influences: "King Crimson, Radiohead, Steve Vai",
    location: "Villa Urquiza, CABA",
    bio: "Chitarrista ossessionato dal suono. Live looping, odd time signatures, and textural exploration. Looking for musicians who want to push beyond verse-chorus-verse.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567816",
    email: "maya.okonkwo@example.com",
    name: "Maya Okonkwo",
    instruments: ["Vocals", "Dance"],
    genres: ["Afrobeats", "Afrofusion", "R&B"],
    experience_level: "Intermediate",
    looking_for: ["Producer", "Live band"],
    influences: "Tems, Burna Boy, Sade",
    location: "Devoto, CABA",
    bio: "Singer and performer blending Afrobeats with soulful R&B. Split between Lagos and London. Looking for producers and live musicians for a debut EP.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567817",
    email: "felix.wagner@example.com",
    name: "Felix Wagner",
    instruments: ["Double Bass", "Bass"],
    genres: ["Jazz", "Classical", "Avant-garde"],
    experience_level: "Advanced",
    looking_for: ["Ensemble", "Composition project"],
    influences: "Charles Mingus, Esperanza Spalding, J.S. Bach",
    location: "Puerto Madero, CABA",
    bio: "Kontrabassist with a foot in both jazz and classical worlds. Played with the Berliner Philharmoniker's education program and several avant-garde jazz ensembles.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567818",
    email: "valentina.rossi@example.com",
    name: "Valentina Rossi",
    instruments: ["Piano", "Vocals"],
    genres: ["Pop", "Jazz", "Soul"],
    experience_level: "Intermediate",
    looking_for: ["Duo", "Band", "Live gigs"],
    influences: "Norah Jones, Amy Winehouse, Paolo Conte",
    location: "Monserrat, CABA",
    bio: "Pianist and vocalist with a warm, smoky voice. Repertoire spans jazz standards, bossa nova, and original pop. Looking for a duo partner or band for live dates.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567819",
    email: "kaito.nakamura@example.com",
    name: "Kaito Nakamura",
    instruments: ["Turntables", "MPC", "Synth"],
    genres: ["Hip Hop", "Electronic", "Lo-fi"],
    experience_level: "Advanced",
    looking_for: ["Producer collab", "Emcee"],
    influences: "J Dilla, Nujabes, Flying Lotus",
    location: "Barracas, CABA",
    bio: "Beatmaker and producer from Shibuya. Sampled-based hip hop meets electronic sound design. Looking for emcees and vocalists to finish tracks.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567820",
    email: "alejandra.ruiz@example.com",
    name: "Alejandra Ruiz",
    instruments: ["Flamenco Guitar", "Vocals"],
    genres: ["Flamenco", "Latin", "World"],
    experience_level: "Advanced",
    looking_for: ["Ensemble", "Touring"],
    influences: "Paco de Lucía, Camarón, Vicente Amigo",
    location: "Parque Patricios, CABA",
    bio: "Guitarrista flamenca con 15 años de estudio. Domino palos como soleá, bulerías y alegrías. Busco proyecto de fusión o ensemble para giras.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567821",
    email: "sam.obrien@example.com",
    name: "Sam O'Brien",
    instruments: ["Fiddle", "Mandolin"],
    genres: ["Folk", "Bluegrass", "Celtic"],
    experience_level: "Intermediate",
    looking_for: ["Band", "Session playing"],
    influences: "The Chieftains, Punch Brothers, Martin Hayes",
    location: "Vicente López, Buenos Aires",
    bio: "Traditional Irish fiddler branching into bluegrass and folk. Fast fingers, open ears. Looking for a band or session gig — studio or live.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567822",
    email: "yuki.tanaka@example.com",
    name: "Yuki Tanaka",
    instruments: ["Shamisen", "Koto", "Electronics"],
    genres: ["Traditional Japanese", "Ambient", "Experimental"],
    experience_level: "Advanced",
    looking_for: ["Cross-cultural collaboration", "Experimental"],
    influences: "Traditional Gagaku, Ryuichi Sakamoto, Arca",
    location: "Olivos, Buenos Aires",
    bio: "Traditional Japanese instrumentalist exploring the intersection of ancient forms and electronic music. Classically trained in shamisen and koto, self-taught in production.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567823",
    email: "isabel.morales@example.com",
    name: "Isabel Morales",
    instruments: ["Vocals", "Cajón", "Guitar"],
    genres: ["Latin", "Folk", "Singer-Songwriter"],
    experience_level: "Beginner",
    looking_for: ["Band", "Mentor"],
    influences: "Susana Baca, Natalia Lafourcade, Silvana Estrada",
    location: "San Isidro, Buenos Aires",
    bio: "Cantautora peruana empezando su camino. Escribo canciones que mezclan la música andina con el pop latino. Busco músicos con experiencia para armar proyecto.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567824",
    email: "omar.diallo@example.com",
    name: "Omar Diallo",
    instruments: ["Kora", "Djembe", "Vocals"],
    genres: ["World", "Folk", "Jazz"],
    experience_level: "Advanced",
    looking_for: ["World music ensemble", "Festival"],
    influences: "Toumani Diabaté, Salif Keita, Ali Farka Touré",
    location: "Martínez, Buenos Aires",
    bio: "Kora player and vocalist from a long line of griots. Brings the tradition of West African storytelling to contemporary world music. Based between Dakar and Paris.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567825",
    email: "hana.yoshida@example.com",
    name: "Hana Yoshida",
    instruments: ["Electric Violin", "Vocals"],
    genres: ["Pop", "Electronic", "J-Pop"],
    experience_level: "Intermediate",
    looking_for: ["Band", "Production"],
    influences: "Lindsey Stirling, Yoko Kanno, Imogen Heap",
    location: "Adrogué, Buenos Aires",
    bio: "Electric violinist and vocalist blending classical technique with pop and electronic production. Looking for producers and bandmates to create genre-bending music.",
  },

  // ── 26-50: Second wave ────────────────────────────────────────────
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567826",
    email: "elena.petrova@example.com",
    name: "Elena Petrova",
    instruments: ["Piano", "Harpsichord"],
    genres: ["Classical", "Contemporary"],
    experience_level: "Advanced",
    looking_for: ["Chamber ensemble", "Collaboration"],
    influences: "Rachmaninoff, Arvo Pärt, Nils Frahm",
    location: "Lanús, Buenos Aires",
    bio: "Concert pianist with a love for both the romantic repertoire and contemporary minimalism. Looking to form a chamber group or collaborate with electronic musicians.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567827",
    email: "marcus.williams@example.com",
    name: "Marcus Williams",
    instruments: ["Saxophone", "Flute"],
    genres: ["Jazz", "Soul", "Funk"],
    experience_level: "Advanced",
    looking_for: ["Band", "Session work"],
    influences: "John Coltrane, Cannonball Adderley, Maceo Parker",
    location: "Avellaneda, Buenos Aires",
    bio: "Saxophonist born and raised in NOLA. Played with the Rebirth Brass Band and various funk outfits. Looking for a tight band or session gigs — studio or live.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567828",
    email: "aiko.sato@example.com",
    name: "Aiko Sato",
    instruments: ["Vocals", "Piano"],
    genres: ["J-Pop", "Electronic", "Indie"],
    experience_level: "Intermediate",
    looking_for: ["Producer", "Songwriting partner"],
    influences: "Utada Hikaru, Imogen Heap, Grimes",
    location: "Banfield, Buenos Aires",
    bio: "Singer-songwriter crafting dreamy pop with electronic textures. Bilingual (JP/EN). Looking for a producer to help bring my demos to life.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567829",
    email: "thiago.silva@example.com",
    name: "Thiago Silva",
    instruments: ["Acoustic Guitar", "Cavaquinho", "Vocals"],
    genres: ["Samba", "MPB", "Pop"],
    experience_level: "Intermediate",
    looking_for: ["Band", "Live gigs"],
    influences: "João Gilberto, Caetano Veloso, Seu Jorge",
    location: "Ramos Mejía, Buenos Aires",
    bio: "Carioca com o violão na alma. Toco samba e MPB desde moleque. Busco músicos pra formar um grupo e tocar nos bares da Lapa.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567830",
    email: "priya.sharma@example.com",
    name: "Priya Sharma",
    instruments: ["Violin", "Vocals"],
    genres: ["Indian Classical", "Fusion", "World"],
    experience_level: "Advanced",
    looking_for: ["Fusion project", "Tour"],
    influences: "M.S. Subbulakshmi, L. Subramaniam, Bobby McFerrin",
    location: "Morón, Buenos Aires",
    bio: "Carnatic violinist and vocalist with 18 years of training. Now exploring cross-genre collaborations. Looking for serious fusion projects with global reach.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567831",
    email: "finn.omalley@example.com",
    name: "Finn O'Malley",
    instruments: ["Bouzouki", "Guitar", "Vocals"],
    genres: ["Folk", "Celtic", "Indie"],
    experience_level: "Intermediate",
    looking_for: ["Band", "Pub gigs"],
    influences: "The Dubliners, The Gloaming, Iron & Wine",
    location: "Tigre, Buenos Aires",
    bio: "Irish folk musician with a love for trad sessions and indie songwriting. Bouzouki is my main squeeze. Looking for a band or session group.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567832",
    email: "nina.petrovic@example.com",
    name: "Nina Petrović",
    instruments: ["Accordion", "Vocals"],
    genres: ["Balkan Folk", "World", "Punk"],
    experience_level: "Advanced",
    looking_for: ["World fusion band", "Festival"],
    influences: "Goran Bregović, Beirut, Gogol Bordello",
    location: "La Plata, Buenos Aires",
    bio: "Harmonikašica iz Beograda. Spajam balkanski folk sa punk i world zvukom. Nastupala na EXIT i Guča festivalima. Tražim bend za turneju.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567833",
    email: "hugo.lefevre@example.com",
    name: "Hugo Lefevre",
    instruments: ["Cello", "Electronics"],
    genres: ["Classical", "Ambient", "Electronic"],
    experience_level: "Advanced",
    looking_for: ["Collaboration", "Film scoring"],
    influences: "Hildur Guðnadóttir, Johann Johannsson, Aphex Twin",
    location: "Palermo, CABA",
    bio: "Violoncelliste classique transformé en producteur électroacoustique. Je cherche des cinéastes et des musiciens pour des projets hybrides entre acoustique et numérique.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567834",
    email: "selena.kwon@example.com",
    name: "Selena Kwon",
    instruments: ["Vocals", "Dance"],
    genres: ["K-Pop", "R&B", "Pop"],
    experience_level: "Beginner",
    looking_for: ["Mentor", "Producer", "Group"],
    influences: "NewJeans, Ariana Grande, Tinashe",
    location: "Recoleta, CABA",
    bio: "Aspiring K-pop vocalist with years of dance training. Just starting my music journey after being a backup dancer. Looking for mentors and producers to help me grow.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567835",
    email: "pedro.castillo@example.com",
    name: "Pedro Castillo",
    instruments: ["Charango", "Zampoñas", "Guitar"],
    genres: ["Andean Folk", "World", "Folk"],
    experience_level: "Intermediate",
    looking_for: ["Ensemble", "Cultural project"],
    influences: "Los Kjarkas, Inti Illimani, Gustavo Santaolalla",
    location: "Belgrano, CABA",
    bio: "Músico andino boliviano. Toco charango, quena y zampoñas. Busco proyecto de fusión que quiera incorporar sonidos de los Andes a la música contemporánea.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567836",
    email: "leah.cohen@example.com",
    name: "Leah Cohen",
    instruments: ["Clarinet", "Bass Clarinet"],
    genres: ["Klezmer", "Jazz", "World"],
    experience_level: "Advanced",
    looking_for: ["Ensemble", "Touring"],
    influences: "Giora Feidman, Don Byron, John Zorn",
    location: "Nuñez, CABA",
    bio: "Clarinetist specializing in klezmer and avant-garde jazz. Graduate of Berklee, toured with the Jerusalem Roots Ensemble. Looking for adventurous projects.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567837",
    email: "kenji.mori@example.com",
    name: "Kenji Mori",
    instruments: ["Taiko Drums", "Wadaiko", "Percussion"],
    genres: ["Traditional Japanese", "World", "Fusion"],
    experience_level: "Advanced",
    looking_for: ["Fusion ensemble", "Live performance"],
    influences: "Kodo, Eitetsu Hayashi, Stomp",
    location: "Caballito, CABA",
    bio: "Taiko performer with 15 years of training in wadaiko. Performed at venues across Japan and abroad. Looking for fusion projects that blend taiko with other genres.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567838",
    email: "amara.osei@example.com",
    name: "Amara Osei",
    instruments: ["Vocals", "Piano"],
    genres: ["Gospel", "Soul", "Afrobeat"],
    experience_level: "Intermediate",
    looking_for: ["Choir", "Band", "Production"],
    influences: "Kirk Franklin, Aretha Franklin, Tems",
    location: "Almagro, CABA",
    bio: "Singer with a background in gospel choirs and a deep love for soul. Looking to expand into afrobeat and contemporary soul. Seeking bandmates and producers.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567839",
    email: "diego.rivera@example.com",
    name: "Diego Rivera",
    instruments: ["Trumpet", "Flugelhorn"],
    genres: ["Latin Jazz", "Salsa", "Timba"],
    experience_level: "Advanced",
    looking_for: ["Orchestra", "Session work"],
    influences: "Arturo Sandoval, Chucho Valdés, Irakere",
    location: "San Telmo, CABA",
    bio: "Trompetista cubano con sangre de salsa y jazz. 12 años tocando en orquestas de La Habana. Busco proyectos de latin jazz o sesiones de grabación.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567840",
    email: "ingrid.larsen@example.com",
    name: "Ingrid Larsen",
    instruments: ["Nyckelharpa", "Hardanger Fiddle", "Vocals"],
    genres: ["Nordic Folk", "Folk", "Ambient"],
    experience_level: "Intermediate",
    looking_for: ["Folk ensemble", "Collaboration"],
    influences: "Hedningarna, Aurora, Annbjørg Lien",
    location: "Villa Crespo, CABA",
    bio: "Nyckelharpa player keeping Nordic folk traditions alive while exploring ambient and ethereal soundscapes. Looking for collaborators for a folk-ambient project.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567841",
    email: "rohan.mehta@example.com",
    name: "Rohan Mehta",
    instruments: ["Tabla", "Percussion", "Electronics"],
    genres: ["Fusion", "Electronic", "World"],
    experience_level: "Advanced",
    looking_for: ["Producer collab", "Live band"],
    influences: "Talvin Singh, Zakir Hussain, Bonobo",
    location: "Colegiales, CABA",
    bio: "Tabla player and electronic producer based in London. Merging classical Indian percussion with UK electronic and jazz. Looking for collaborators for live shows and studio work.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567842",
    email: "celeste.moreau@example.com",
    name: "Celeste Moreau",
    instruments: ["Harp", "Piano"],
    genres: ["Classical", "Ambient", "Cinematic"],
    experience_level: "Advanced",
    looking_for: ["Collaboration", "Film scoring"],
    influences: "Lavinia Meijer, Ólafur Arnalds, Alexandre Desplat",
    location: "Boedo, CABA",
    bio: "Harpsichord turned contemporary harpist. Classically trained but my heart beats for cinematic and ambient music. Looking to collaborate on film or game scores.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567843",
    email: "yara.nascimento@example.com",
    name: "Yara Nascimento",
    instruments: ["Vocals", "Guitar", "Percussion"],
    genres: ["MPB", "Samba", "Afro-Brazilian"],
    experience_level: "Intermediate",
    looking_for: ["Band", "Live performance"],
    influences: "Elza Soares, Gal Costa, Liniker",
    location: "Flores, CABA",
    bio: "Cantora e compositora baiana com a axé e a força do samba reggae. Minhas letras falam de resistência e amor. Busco banda pra turnê e gravação.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567844",
    email: "viktor.andersson@example.com",
    name: "Viktor Andersson",
    instruments: ["Electric Guitar", "Bass"],
    genres: ["Metal", "Progressive", "Stoner Rock"],
    experience_level: "Advanced",
    looking_for: ["Band", "Recording"],
    influences: "Meshuggah, Opeth, Tool",
    location: "La Boca, CABA",
    bio: "Riff machine from the Swedish metal scene. 7-string guitar, odd time signatures, and heavy tones. Looking to join or form a progressive metal/stoner rock band.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567845",
    email: "lila.cohen@example.com",
    name: "Lila Cohen",
    instruments: ["Theremin", "Synth", "Field Recordings"],
    genres: ["Experimental", "Ambient", "Drone"],
    experience_level: "Intermediate",
    looking_for: ["Experimental project", "Installation"],
    influences: "Lydia Kavina, Laurie Anderson, Tim Hecker",
    location: "Chacarita, CABA",
    bio: "Thereminist and sound artist creating immersive sonic landscapes. Working with field recordings, analog synths, and the weirdest instrument of all — the theremin.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567846",
    email: "santiago.mendez@example.com",
    name: "Santiago Méndez",
    instruments: ["Bandoneón", "Piano"],
    genres: ["Tango", "Contemporary", "World"],
    experience_level: "Advanced",
    looking_for: ["Ensemble", "Touring"],
    influences: "Astor Piazzolla, Dino Saluzzi, Gustavo Beytelmann",
    location: "Saavedra, CABA",
    bio: "Bandoneonista argentino especializado en tango contemporáneo. Formé parte de varias orquestas de la escena porteña. Busco proyecto innovador que fusione tango con otros géneros.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567847",
    email: "noor.hassan@example.com",
    name: "Noor Hassan",
    instruments: ["Ney", "Flute", "Vocals"],
    genres: ["Arabic", "World", "Sufi"],
    experience_level: "Intermediate",
    looking_for: ["World music project", "Collaboration"],
    influences: "Niyazi Sayın, Omar Souleyman, Natacha Atlas",
    location: "Villa Urquiza, CABA",
    bio: "Ney player and vocalist from Jordan. My music draws from Arabic classical, Sufi poetry, and electronic textures. Looking for cross-cultural collaborations.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567848",
    email: "jasper.dewit@example.com",
    name: "Jasper de Wit",
    instruments: ["Hammond Organ", "Piano", "Synth"],
    genres: ["Jazz", "Gospel", "Soul"],
    experience_level: "Advanced",
    looking_for: ["Band", "Session work"],
    influences: "Jimmy Smith, Cory Henry, Herbie Hancock",
    location: "Devoto, CABA",
    bio: "Hammond B3 specialist with a deep pocket. Played in jazz clubs, gospel churches, and soul revues across Europe. Looking for a band that needs that fat organ sound.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567849",
    email: "mika.suzuki@example.com",
    name: "Mika Suzuki",
    instruments: ["Shamisen", "Vocals", "Shinobue"],
    genres: ["Folk", "Experimental", "Indie"],
    experience_level: "Intermediate",
    looking_for: ["Experimental project", "Collaboration"],
    influences: "Hiromitsu Agatsuma, Ichiko Aoba, Joanna Newsom",
    location: "Puerto Madero, CABA",
    bio: "Shamisen player and folk singer from Kyoto. I blend traditional Japanese folk with indie and experimental sounds. Looking for collaborators who love the strange and beautiful.",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567850",
    email: "imani.okafor@example.com",
    name: "Imani Okafor",
    instruments: ["Vocals", "Djembe", "Percussion"],
    genres: ["Afrobeat", "Jazz", "Soul"],
    experience_level: "Beginner",
    looking_for: ["Mentor", "Band", "Live experience"],
    influences: "Angelique Kidjo, Erykah Badu, Fela Kuti",
    location: "Monserrat, CABA",
    bio: "Young vocalist and percussionist finding my voice in the vibrant Lagos music scene. I grew up singing in church and dancing to Fela. Looking to learn from experienced musicians.",
  },
];

// ── Connections (some pending, some matched) ─────────────────────
//
// Match IDs are the inverse direction: if sender A → receiver B exists
// AND sender B → receiver A exists, they're "matched" in the app.
//
// Connections with only one direction = "Pending".

const CONNECTIONS = [
  // ── Matched pairs (both directions) ────────────────────────────
  // Original
  { sender_id: USERS[0].id, receiver_id: USERS[1].id }, // Sofia ↔ Mateo
  { sender_id: USERS[1].id, receiver_id: USERS[0].id }, // Mateo ↔ Sofia
  { sender_id: USERS[6].id, receiver_id: USERS[7].id }, // Camila ↔ Ben
  { sender_id: USERS[7].id, receiver_id: USERS[6].id }, // Ben ↔ Camila

  // New pairs
  { sender_id: USERS[8].id, receiver_id: USERS[18].id }, // Zara ↔ Kaito (world vocals + electronic producer)
  { sender_id: USERS[18].id, receiver_id: USERS[8].id }, // Kaito ↔ Zara
  { sender_id: USERS[2].id, receiver_id: USERS[16].id }, // Lucia ↔ Felix (strings + double bass)
  { sender_id: USERS[16].id, receiver_id: USERS[2].id }, // Felix ↔ Lucia
  { sender_id: USERS[13].id, receiver_id: USERS[11].id }, // Clara ↔ Nina (indie vocals + ambient cello)
  { sender_id: USERS[11].id, receiver_id: USERS[13].id }, // Nina ↔ Clara
  { sender_id: USERS[14].id, receiver_id: USERS[5].id }, // Tomas ↔ Diego (experimental + blues guitar)
  { sender_id: USERS[5].id, receiver_id: USERS[14].id }, // Diego ↔ Tomas
  { sender_id: USERS[15].id, receiver_id: USERS[23].id }, // Maya ↔ Omar (afrobeats + world percussion)
  { sender_id: USERS[23].id, receiver_id: USERS[15].id }, // Omar ↔ Maya

  // ── Pending (one direction only) ───────────────────────────────
  // Original
  { sender_id: USERS[3].id, receiver_id: USERS[4].id }, // Javier → Emma
  { sender_id: USERS[9].id, receiver_id: USERS[10].id }, // Leo → Aria
  { sender_id: USERS[0].id, receiver_id: USERS[3].id }, // Sofia → Javier
  { sender_id: USERS[5].id, receiver_id: USERS[9].id }, // Diego → Leo

  // New
  { sender_id: USERS[17].id, receiver_id: USERS[14].id }, // Valentina → Tomas
  { sender_id: USERS[21].id, receiver_id: USERS[24].id }, // Yuki → Hana
  { sender_id: USERS[22].id, receiver_id: USERS[9].id },  // Isabel → Leo
  { sender_id: USERS[20].id, receiver_id: USERS[13].id }, // Sam → Clara
  { sender_id: USERS[12].id, receiver_id: USERS[10].id }, // Ravi → Aria (sitar + tabla fusion)
  { sender_id: USERS[19].id, receiver_id: USERS[17].id }, // Alejandra → Valentina
  { sender_id: USERS[23].id, receiver_id: USERS[8].id },  // Omar → Zara
  { sender_id: USERS[18].id, receiver_id: USERS[15].id }, // Kaito → Maya

  // ── Second wave matched pairs ────────────────────────────────
  { sender_id: USERS[25].id, receiver_id: USERS[43].id }, // Elena ↔ Viktor (classical + metal)
  { sender_id: USERS[43].id, receiver_id: USERS[25].id }, // Viktor ↔ Elena
  { sender_id: USERS[26].id, receiver_id: USERS[47].id }, // Marcus ↔ Jasper (sax + hammond)
  { sender_id: USERS[47].id, receiver_id: USERS[26].id }, // Jasper ↔ Marcus
  { sender_id: USERS[28].id, receiver_id: USERS[6].id },  // Thiago ↔ Camila (brazilian guitar + flute)
  { sender_id: USERS[6].id, receiver_id: USERS[28].id },  // Camila ↔ Thiago
  { sender_id: USERS[29].id, receiver_id: USERS[40].id }, // Priya ↔ Rohan (carnatic violin + tabla)
  { sender_id: USERS[40].id, receiver_id: USERS[29].id }, // Rohan ↔ Priya
  { sender_id: USERS[30].id, receiver_id: USERS[20].id }, // Finn ↔ Sam (bouzouki + fiddle)
  { sender_id: USERS[20].id, receiver_id: USERS[30].id }, // Sam ↔ Finn
  { sender_id: USERS[31].id, receiver_id: USERS[44].id }, // NinaP ↔ Lila (accordion + theremin)
  { sender_id: USERS[44].id, receiver_id: USERS[31].id }, // Lila ↔ NinaP
  { sender_id: USERS[32].id, receiver_id: USERS[41].id }, // Hugo ↔ Celeste (cello + harp)
  { sender_id: USERS[41].id, receiver_id: USERS[32].id }, // Celeste ↔ Hugo
  { sender_id: USERS[35].id, receiver_id: USERS[16].id }, // Leah ↔ Felix (clarinet + double bass)
  { sender_id: USERS[16].id, receiver_id: USERS[35].id }, // Felix ↔ Leah
  { sender_id: USERS[36].id, receiver_id: USERS[21].id }, // Kenji ↔ Yuki (taiko + shamisen)
  { sender_id: USERS[21].id, receiver_id: USERS[36].id }, // Yuki ↔ Kenji
  { sender_id: USERS[37].id, receiver_id: USERS[49].id }, // Amara ↔ Imani (gospel + afrobeat)
  { sender_id: USERS[49].id, receiver_id: USERS[37].id }, // Imani ↔ Amara
  { sender_id: USERS[38].id, receiver_id: USERS[19].id }, // DiegoR ↔ Alejandra (latin jazz + flamenco)
  { sender_id: USERS[19].id, receiver_id: USERS[38].id }, // Alejandra ↔ DiegoR
  { sender_id: USERS[39].id, receiver_id: USERS[30].id }, // Ingrid ↔ Finn (nyckelharpa + bouzouki)
  { sender_id: USERS[30].id, receiver_id: USERS[39].id }, // Finn ↔ Ingrid
  { sender_id: USERS[42].id, receiver_id: USERS[28].id }, // Yara ↔ Thiago (mpb + samba)
  { sender_id: USERS[28].id, receiver_id: USERS[42].id }, // Thiago ↔ Yara
  { sender_id: USERS[45].id, receiver_id: USERS[3].id },  // Santiago ↔ Javier (bandoneón + bass)
  { sender_id: USERS[3].id, receiver_id: USERS[45].id },  // Javier ↔ Santiago
  { sender_id: USERS[46].id, receiver_id: USERS[8].id },  // Noor ↔ Zara (ney + arabic vocals)
  { sender_id: USERS[8].id, receiver_id: USERS[46].id },  // Zara ↔ Noor
  { sender_id: USERS[48].id, receiver_id: USERS[36].id }, // Mika ↔ Kenji (shamisen + taiko)
  { sender_id: USERS[36].id, receiver_id: USERS[48].id }, // Kenji ↔ Mika

  // ── Second wave pending ──────────────────────────────────────
  { sender_id: USERS[27].id, receiver_id: USERS[25].id }, // Aiko → Elena (j-pop seeking classical pianist)
  { sender_id: USERS[33].id, receiver_id: USERS[27].id }, // Selena → Aiko (k-pop beginner looking up)
  { sender_id: USERS[34].id, receiver_id: USERS[42].id }, // Pedro → Yara (andean + brazilian)
  { sender_id: USERS[46].id, receiver_id: USERS[32].id }, // Noor → Hugo (ney + cello)
  { sender_id: USERS[45].id, receiver_id: USERS[14].id }, // Santiago → Tomas (tango + experimental guitar)
];

// ── Messages (between matched pairs only) ────────────────────────
//
// The app RLS only allows messaging between matched pairs, so we
// only create messages for the bidirectional connections.

const MESSAGES = [
  // ── Mateo ↔ Sofia chat ──────────────────────────────────────────
  {
    sender_id: USERS[1].id,
    receiver_id: USERS[0].id,
    content: "Hola Sofia! Me re copa tu proyecto, tengo unas bases de funk que podrían ir bien con tu sonido. Querés juntarnos a probar?",
    created_at: "2026-06-05T14:30:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[0].id,
    receiver_id: USERS[1].id,
    content: "Dale! Justo estaba buscando un batero con onda funk. Te paso mi número por privado y coordinamos.",
    created_at: "2026-06-05T15:10:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[1].id,
    receiver_id: USERS[0].id,
    content: "Perfecto, tengo estudio en Nueva Córdoba. Cuando quieras mandame un WhatsApp al 351-555-0123.",
    created_at: "2026-06-05T15:45:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[0].id,
    receiver_id: USERS[1].id,
    content: "Genial! Te escribo estos días. Estoy terminando de arreglar un tema nuevo, te lo paso así escuchás!",
    created_at: "2026-06-06T10:20:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[1].id,
    receiver_id: USERS[0].id,
    content: "Dale dale, mandá! Tengo ganas de escuchar algo fresco",
    created_at: "2026-06-06T11:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[0].id,
    receiver_id: USERS[1].id,
    content: "Ahí te lo mandé al mail! Cualquier cosa me decís y nos juntamos este finde.",
    created_at: "2026-06-07T09:15:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[1].id,
    receiver_id: USERS[0].id,
    content: "Re va el finde. El sábado a la tarde me copo, te parece?",
    created_at: "2026-06-07T14:00:00Z",
    is_read: false,
  },

  // ── Ben ↔ Camila chat ──────────────────────────────────────────
  {
    sender_id: USERS[7].id,
    receiver_id: USERS[6].id,
    content: "Hey Camila! I heard your track with the São Paulo Jazz Collective — beautiful flute work. I'm working on a film score that needs a woodwind section. Interested?",
    created_at: "2026-06-08T11:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[6].id,
    receiver_id: USERS[7].id,
    content: "Ben! Thank you so much! I'd love to hear more about the project. What kind of sound are you going for?",
    created_at: "2026-06-08T13:30:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[7].id,
    receiver_id: USERS[6].id,
    content: "It's a documentary about the Amazon — think ambient meets Brazilian folk. Your style would be perfect. Want to hop on a call this week?",
    created_at: "2026-06-08T15:00:00Z",
    is_read: false,
  },

  // ── Zara ↔ Kaito chat ──────────────────────────────────────────
  {
    sender_id: USERS[8].id,
    receiver_id: USERS[18].id,
    content: "Hey Kaito! Love your beat tape 'Shibuya Rain'. I've been working on some vocal melodies that might fit your style — want to collab?",
    created_at: "2026-06-07T18:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[18].id,
    receiver_id: USERS[8].id,
    content: "Zara! Your voice is exactly what my tracks need. I have a beat I've been sitting on for months that needs a Middle Eastern vocal. You in?",
    created_at: "2026-06-07T20:30:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[8].id,
    receiver_id: USERS[18].id,
    content: "100% in! Send me the beat and I'll lay down some ideas this week.",
    created_at: "2026-06-08T09:00:00Z",
    is_read: false,
  },

  // ── Lucia ↔ Felix chat ──────────────────────────────────────────
  {
    sender_id: USERS[2].id,
    receiver_id: USERS[16].id,
    content: "Felix! I heard you're working on a string quintet arrangement. I'd love to join if you're still looking for a violinist.",
    created_at: "2026-06-06T16:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[16].id,
    receiver_id: USERS[2].id,
    content: "Lucía, that would be wonderful! We're doing a mix of Villa-Lobos and original compositions. Rehearsal is Thursday in Kreuzberg. Can you make it?",
    created_at: "2026-06-06T17:15:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[2].id,
    receiver_id: USERS[16].id,
    content: "Thursday works. Send me the address! I'll bring my viola too in case you need a darker tone for the slower movements.",
    created_at: "2026-06-06T18:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[16].id,
    receiver_id: USERS[2].id,
    content: "Perfect! Address is Köpenicker Str. 18a, 3rd floor. See you at 19:00!",
    created_at: "2026-06-06T18:30:00Z",
    is_read: false,
  },

  // ── Clara ↔ Nina chat ──────────────────────────────────────────
  {
    sender_id: USERS[13].id,
    receiver_id: USERS[11].id,
    content: "Hi Nina! I heard your ambient cello pieces on SoundCloud and I'm obsessed. I have some dream pop demos that need string arrangements. Want to experiment?",
    created_at: "2026-06-08T12:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[11].id,
    receiver_id: USERS[13].id,
    content: "Clara, your voice is gorgeous! I'd love to work on this. I've been wanting to collaborate with a vocalist. Do you have stems I could play along to?",
    created_at: "2026-06-08T13:00:00Z",
    is_read: false,
  },

  // ── Tomas ↔ Diego chat ─────────────────────────────────────────
  {
    sender_id: USERS[14].id,
    receiver_id: USERS[5].id,
    content: "Diego man, your guitar tone is killer. I've been working on a progressive blues piece that needs a second guitarist. Feeling like trading solos?",
    created_at: "2026-06-09T10:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[5].id,
    receiver_id: USERS[14].id,
    content: "Gracias brother! Just heard your looping stuff — you're doing some wild things with time signatures. Let's jam! I got a studio here in Nashville with a killer drum room.",
    created_at: "2026-06-09T12:30:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[14].id,
    receiver_id: USERS[5].id,
    content: "No way! I've been wanting to record in Nashville for years. I'll send you some of my riffs and we can start building remotely. Then I'll fly over.",
    created_at: "2026-06-09T14:00:00Z",
    is_read: false,
  },

  // ── Maya ↔ Omar chat ────────────────────────────────────────────
  {
    sender_id: USERS[15].id,
    receiver_id: USERS[23].id,
    content: "Omar! A friend told me about your kora playing and I can already hear it on my track. Are you based in London at the moment?",
    created_at: "2026-06-09T15:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[23].id,
    receiver_id: USERS[15].id,
    content: "Maya, your voice is incredible! Yes, I'm in London until August. Would love to sit down and explore how the kora fits with afrobeats. I think it could be something special.",
    created_at: "2026-06-09T17:00:00Z",
    is_read: false,
  },

  // ── Elena ↔ Viktor chat ──────────────────────────────────────────
  {
    sender_id: USERS[25].id,
    receiver_id: USERS[43].id,
    content: "Viktor! I heard your demo track with the 7-string — the production is massive. I've been working on a neoclassical piece that needs that kind of weight. Interested in collaborating?",
    created_at: "2026-06-08T10:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[43].id,
    receiver_id: USERS[25].id,
    content: "Elena! Classical/metal fusion is exactly what I've been wanting to explore. Your Rachmaninoff-inspired runs would sit perfectly over some heavy riffing. Send me the sheet music!",
    created_at: "2026-06-08T12:30:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[25].id,
    receiver_id: USERS[43].id,
    content: "Let's do it! I'll send you the MIDI and we can start arranging. I'm thinking strings + distorted guitars in the climax. This is gonna be epic.",
    created_at: "2026-06-08T14:00:00Z",
    is_read: false,
  },

  // ── Marcus ↔ Jasper chat ─────────────────────────────────────────
  {
    sender_id: USERS[26].id,
    receiver_id: USERS[47].id,
    content: "Jasper! I caught your set at the Bimhuis last month — that B3 sound was filthy. I've got a soul-jazz project in the works and you'd be perfect on keys. You in?",
    created_at: "2026-06-07T16:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[47].id,
    receiver_id: USERS[26].id,
    content: "Marcus! I remember your solo that night — you burned the place down. Absolutely in. I've been wanting to do a proper soul-jazz record. Let's grab a beer and talk it through.",
    created_at: "2026-06-07T18:00:00Z",
    is_read: false,
  },

  // ── Thiago ↔ Camila chat ─────────────────────────────────────────
  {
    sender_id: USERS[28].id,
    receiver_id: USERS[6].id,
    content: "Camila! Ouvi seu trabalho com o São Paulo Jazz Collective — sua flauta é pura poesia. Tô montando um projeto de samba jazz e acho que seu som encaixaria perfeitamente.",
    created_at: "2026-06-08T15:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[6].id,
    receiver_id: USERS[28].id,
    content: "Thiago, que delícia! Adoro samba jazz. Seu violão é exatamente o que meu som precisa. Vamos marcar um ensaio? Tô no Rio semana que vem!",
    created_at: "2026-06-08T17:30:00Z",
    is_read: false,
  },

  // ── Priya ↔ Rohan chat ───────────────────────────────────────────
  {
    sender_id: USERS[29].id,
    receiver_id: USERS[40].id,
    content: "Rohan! I heard your fusion project with the London collective. Your tabla work is next level. I'd love to bring some Carnatic violin into your sound. Want to experiment?",
    created_at: "2026-06-09T11:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[40].id,
    receiver_id: USERS[29].id,
    content: "Priya, your Carnatic phrasing would add such a beautiful dimension! I've got a studio session next Thursday in East London. Come through and let's see what happens.",
    created_at: "2026-06-09T13:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[29].id,
    receiver_id: USERS[40].id,
    content: "Perfect! I'll bring my violin and some ideas I've been working on. Can't wait to jam!",
    created_at: "2026-06-09T14:30:00Z",
    is_read: false,
  },

  // ── Hugo ↔ Celeste chat ──────────────────────────────────────────
  {
    sender_id: USERS[32].id,
    receiver_id: USERS[41].id,
    content: "Celeste! J'ai écouté ton album de harpe ambient — c'est d'une beauté. Je travaille sur une pièce pour violoncelle et électronique qui aurait besoin de la texture de ta harpe. Ça te dit?",
    created_at: "2026-06-07T14:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[41].id,
    receiver_id: USERS[32].id,
    content: "Hugo, avec grand plaisir! Ta musique électroacoustique est fascinante. Je suis libre ce weekend si tu veux qu'on se trouve à Lyon pour travailler ensemble.",
    created_at: "2026-06-07T16:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[32].id,
    receiver_id: USERS[41].id,
    content: "Parfait! Je prends le train samedi matin. Apporte ta harpe — j'ai hâte d'entendre ce que ça donne avec mes nappes électroniques.",
    created_at: "2026-06-07T18:00:00Z",
    is_read: false,
  },

  // ── Amara ↔ Imani chat ───────────────────────────────────────────
  {
    sender_id: USERS[37].id,
    receiver_id: USERS[49].id,
    content: "Imani! I heard you singing at the Freedom Park open mic. You've got such raw talent — that blend of afrobeat and soul is special. I'd love to mentor you if you're interested.",
    created_at: "2026-06-09T19:00:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[49].id,
    receiver_id: USERS[37].id,
    content: "Amara! Thank you so much! I've been following your work with the gospel choir and I'm honestly starstruck. Yes please, I'd love any guidance you can offer. When can we start?",
    created_at: "2026-06-09T20:30:00Z",
    is_read: true,
  },
  {
    sender_id: USERS[37].id,
    receiver_id: USERS[49].id,
    content: "Let's meet at my studio in Labadi this Saturday. Bring your djembe and any lyrics you've written. I'll show you some vocal techniques that'll help with your range. So proud of you already!",
    created_at: "2026-06-09T21:00:00Z",
    is_read: false,
  },
];

// ── Helpers ──────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function log(emoji, msg) {
  console.log(`${emoji}  ${msg}`);
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log("");
  log("🎵", "MeloMatch Seed — Starting\n");

  // ── Step 1: Create auth users ──────────────────────────────────
  log("👤", "Step 1/4 — Creating auth users...");

  const createdUserIds = [];
  for (const u of USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      id: u.id,
      email: u.email,
      password: "password123",
      email_confirm: true,
      user_metadata: { name: u.name },
    });

    if (error) {
      if (error.code === "user_already_exists") {
        log("⚠️", `  ${u.name} (${u.email}) already exists — skipping`);
        createdUserIds.push(u.id);
        continue;
      }
      console.error(`❌  Failed to create ${u.email}:`, error.message);
      continue;
    }

    log("✅", `  Created: ${u.name} (${u.email})`);
    createdUserIds.push(data.user.id);
    // Small delay to avoid rate limiting
    await sleep(200);
  }

  if (createdUserIds.length === 0) {
    console.error("\n❌ No users created. Aborting.");
    process.exit(1);
  }

  log("", `  → ${createdUserIds.length} auth users ready\n`);

  // ── Step 2: Insert profiles ────────────────────────────────────
  log("📝", "Step 2/4 — Inserting profiles...");

  for (const u of USERS) {
    const { error } = await supabase.from("profiles").upsert(
      {
        id: u.id,
        email: u.email,
        name: u.name,
        instruments: u.instruments,
        genres: u.genres,
        experience_level: u.experience_level,
        looking_for: u.looking_for,
        influences: u.influences,
        location: u.location,
        bio: u.bio,
      },
      { onConflict: "id" },
    );

    if (error) {
      console.error(`❌  Failed to insert profile for ${u.name}:`, error.message);
      continue;
    }

    log("✅", `  Profile: ${u.name}`);
  }

  log("", "");

  // ── Step 3: Insert connections ─────────────────────────────────
  log("🔗", "Step 3/4 — Inserting connections...");

  for (const c of CONNECTIONS) {
    const { error } = await supabase.from("connections").upsert(
      {
        sender_id: c.sender_id,
        receiver_id: c.receiver_id,
      },
      { onConflict: "sender_id, receiver_id" },
    );

    if (error) {
      console.error(`❌  Failed to create connection ${c.sender_id.slice(0, 8)} → ${c.receiver_id.slice(0, 8)}:`, error.message);
      continue;
    }
  }

  // Count matched pairs: connections that have a reverse direction
  const sentSet = new Set(CONNECTIONS.map((c) => c.sender_id + ":" + c.receiver_id));
  const matchedPairs = CONNECTIONS.filter(
    (c) => sentSet.has(c.receiver_id + ":" + c.sender_id),
  ).length / 2;
  const pending = CONNECTIONS.length - matchedPairs * 2;

  log("✅", `  ${CONNECTIONS.length} connections created (${matchedPairs} matched pairs + ${pending} pending)\n`);

  // ── Step 4: Insert messages ────────────────────────────────────
  log("💬", "Step 4/4 — Inserting messages...");

  for (const m of MESSAGES) {
    const { error } = await supabase.from("messages").insert({
      sender_id: m.sender_id,
      receiver_id: m.receiver_id,
      content: m.content,
      created_at: m.created_at,
      is_read: m.is_read,
    });

    if (error) {
      console.error(`❌  Failed to create message:`, error.message);
      continue;
    }
  }

  log("✅", `  ${MESSAGES.length} messages created\n`);

  // ── Summary ────────────────────────────────────────────────────
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  log("✨", "Seed complete!\n");
  log("👤", `${USERS.length} users created`);
  log("🔗", `${CONNECTIONS.length} connections (${matchedPairs} matched pairs + ${pending} pending)`);
  log("💬", `${MESSAGES.length} messages`);
  console.log("");
  log("🔑", "All test users have password: password123");
  log("🌐", `Sign in at ${supabaseUrl.replace("https://", "https://")}/login`);
  console.log("");
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});
