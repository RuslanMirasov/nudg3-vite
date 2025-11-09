const REQUIRED_ENV_VARS = [
  {
    key: 'VITE_API_URL',
    description: 'Backend API URL (JWT-based)',
  },
];

export function validateEnv(env: Record<string, string>): void {
  const missing: string[] = [];

  REQUIRED_ENV_VARS.forEach(({ key, description }) => {
    if (!env[key]) {
      missing.push(`${key} → ${description}`);
    }
  });

  if (missing.length > 0) {
    const errorMessage = [
      '\n❌ Missing required environment variables:\n',
      missing.join('\n'),
      '\n📝 Setup instructions:',
      '   1. Copy .env.example to .env.local',
      '   2. Fill in the required values',
      '   3. Restart the dev server\n',
    ].join('\n');

    console.error(errorMessage);
    process.exit(1);
  }

  console.log('✅ All required environment variables are set\n');
}
