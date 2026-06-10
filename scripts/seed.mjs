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
    location: "Buenos Aires, Argentina",
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
    location: "Córdoba, Argentina",
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
    location: "Santiago, Chile",
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
    location: "Mexico City, Mexico",
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
    location: "Madrid, Spain",
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
    location: "Nashville, TN",
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
    location: "São Paulo, Brazil",
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
    location: "New York, NY",
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
    location: "Cairo, Egypt / London, UK",
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
    location: "Bogotá, Colombia",
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
    location: "Mumbai, India / Toronto, Canada",
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
    location: "Copenhagen, Denmark",
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
    location: "Mumbai, India",
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
    location: "Stockholm, Sweden",
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
    location: "Rome, Italy",
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
    location: "Lagos, Nigeria / London, UK",
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
    location: "Berlin, Germany",
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
    location: "Milan, Italy",
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
    location: "Tokyo, Japan",
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
    location: "Seville, Spain",
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
    location: "Dublin, Ireland",
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
    location: "Kyoto, Japan",
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
    location: "Lima, Peru",
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
    location: "Dakar, Senegal / Paris, France",
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
    location: "Osaka, Japan",
    bio: "Electric violinist and vocalist blending classical technique with pop and electronic production. Looking for producers and bandmates to create genre-bending music.",
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
