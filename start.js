import { execSync } from 'child_process';

console.log('🚀 Starting Chillers POS on Render...');

try {
  // Generate Prisma client first
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Initialize database
  console.log('📋 Initializing database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  // Seed data
  console.log('🌱 Seeding data...');
  execSync('node prisma/seed.js', { stdio: 'inherit' });
  
  // Seed packaging
  console.log('📦 Seeding packaging...');
  execSync('node prisma/seed-packaging.js', { stdio: 'inherit' });
  
  console.log('✅ Database ready!');
} catch (error) {
  console.log('⚠️ Database setup failed:', error.message);
  console.log('⚠️ Starting server anyway...');
}

console.log('🌐 Starting server...');
execSync('node server/index.js', { stdio: 'inherit' });
