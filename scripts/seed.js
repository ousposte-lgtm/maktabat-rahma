// scripts/seed.js
// ─────────────────────────────────────────────────────────────────────
//  Supabase data seeder — inserts sample books into PostgreSQL.
//  Replaces the old Firebase Admin SDK seed script.
//
//  Usage:
//    1. Copy .env.example → .env and fill in your Supabase credentials
//    2. npm install
//    3. node scripts/seed.js
// ─────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load .env variables
config();

const SUPABASE_URL      = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌  Missing env vars. Copy .env.example → .env and fill in the values.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Sample books ────────────────────────────────────────────────────
// Note: Supabase uses snake_case column names (image_url, created_at)
const sampleBooks = [
  {
    title:       'The Alchemist',
    author:      'Paulo Coelho',
    price:       89.00,
    category:    'Fiction',
    description: 'A philosophical novel about a young Andalusian shepherd who dreams of finding a worldly treasure as great as any that has ever been found.',
    image_url:   'https://covers.openlibrary.org/b/id/8739161-L.jpg',
  },
  {
    title:       'Riyad as-Salihin',
    author:      'Imam al-Nawawi',
    price:       120.00,
    category:    'Islamic',
    description: 'A compilation of Quranic verses and hadiths compiled by Imam al-Nawawi. One of the most widely read books of hadith.',
    image_url:   'https://covers.openlibrary.org/b/id/8091016-L.jpg',
  },
  {
    title:       'Sapiens',
    author:      'Yuval Noah Harari',
    price:       145.00,
    category:    'History',
    description: 'A brief history of humankind, exploring how biology and history have defined us.',
    image_url:   'https://covers.openlibrary.org/b/id/8739165-L.jpg',
  },
  {
    title:       'Le Petit Prince',
    author:      'Antoine de Saint-Exupéry',
    price:       65.00,
    category:    'Children',
    description: 'A poetic tale about a young prince who visits various planets in space and learns about love and life.',
    image_url:   'https://covers.openlibrary.org/b/id/8739181-L.jpg',
  },
  {
    title:       'Thinking, Fast and Slow',
    author:      'Daniel Kahneman',
    price:       130.00,
    category:    'Science',
    description: 'A groundbreaking tour of the mind explaining the two systems that drive the way we think.',
    image_url:   'https://covers.openlibrary.org/b/id/7984916-L.jpg',
  },
  {
    title:       'ديوان حافظ',
    author:      'حافظ شيرازي',
    price:       95.00,
    category:    'Poetry',
    description: 'The collected poems of Hafez, one of the most celebrated Persian poets of the 14th century.',
    image_url:   'https://covers.openlibrary.org/b/id/8739200-L.jpg',
  },
  {
    title:       '1984',
    author:      'George Orwell',
    price:       75.00,
    category:    'Fiction',
    description: 'A dystopian novel set in a totalitarian society ruled by Big Brother, exploring surveillance and the suppression of individuality.',
    image_url:   'https://covers.openlibrary.org/b/id/8575708-L.jpg',
  },
  {
    title:       'مقدمة ابن خلدون',
    author:      'ابن خلدون',
    price:       200.00,
    category:    'History',
    description: 'A 14th century Islamic philosophy work considered a precursor to sociology, economics, and political science.',
    image_url:   'https://covers.openlibrary.org/b/id/8739220-L.jpg',
  },
  {
    title:       'الإمام الشافعي',
    author:      'عبد الحليم الجندي',
    price:       110.00,
    category:    'Islamic',
    description: 'سيرة الإمام الشافعي مؤسس المذهب الشافعي وأحد أئمة الفقه الإسلامي.',
    image_url:   null,
  },
  {
    title:       'The Republic',
    author:      'Plato',
    price:       80.00,
    category:    'Philosophy',
    description: 'A Socratic dialogue concerning justice, the order and character of the just city-state, and the just man.',
    image_url:   'https://covers.openlibrary.org/b/id/8739195-L.jpg',
  },
];

// ── Insert all books ─────────────────────────────────────────────────
async function seed() {
  console.log('🌱  Seeding Supabase with sample books…\n');

  // Insert all books in a single batch request
  // created_at is set automatically by PostgreSQL DEFAULT now()
  const { data, error } = await supabase
    .from('books')
    .insert(sampleBooks)
    .select('id, title');

  if (error) {
    console.error('❌  Seed failed:', error.message);
    console.error('\nMake sure:');
    console.error('  1. You ran supabase-schema.sql in your Supabase SQL Editor');
    console.error('  2. Your .env has the correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    console.error('  3. You are signed in as admin (RLS requires auth for INSERT)');
    console.error('\nAlternatively, disable RLS temporarily to seed:\n');
    console.error('  ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;\n');
    process.exit(1);
  }

  console.log(`✅  Successfully seeded ${data.length} books:\n`);
  data.forEach((b, i) => console.log(`  ${i + 1}. ${b.title}  (id: ${b.id})`));
  console.log('\n🚀  Your bookstore is ready!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌  Unexpected error:', err);
  process.exit(1);
});
