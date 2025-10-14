#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Task Management System...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/taskmanagement"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created. Please update the DATABASE_URL with your PostgreSQL connection string.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated.\n');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error.message);
  process.exit(1);
}

// Push database schema
console.log('🗄️  Pushing database schema...');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema pushed.\n');
} catch (error) {
  console.error('❌ Error pushing database schema:', error.message);
  console.log('Please make sure your PostgreSQL database is running and the DATABASE_URL is correct.\n');
  process.exit(1);
}

console.log('🎉 Setup complete! You can now run:');
console.log('  npm run dev');
console.log('\n📚 Next steps:');
console.log('1. Update your .env file with the correct DATABASE_URL');
console.log('2. Create your first admin user by signing up');
console.log('3. Start using the task management system!');
