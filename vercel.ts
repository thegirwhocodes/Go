import { type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'npm --workspace apps/server run build',
  installCommand: 'npm install',
  outputDirectory: 'apps/server/.next',
  crons: [
    { path: '/api/cron/calendar-sync', schedule: '*/5 * * * *' },
    { path: '/api/cron/departure-tick', schedule: '* * * * *' },
    { path: '/api/cron/morning-rollcall', schedule: '0 11 * * *' },
    { path: '/api/cron/lockup-sweep', schedule: '0 3 * * *' },
    { path: '/api/cron/penalty-charges', schedule: '*/2 * * * *' },
  ],
};
