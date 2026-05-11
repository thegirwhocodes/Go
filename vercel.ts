import { type VercelConfig } from '@vercel/config/v1';

// Vercel Hobby plan only allows daily crons. The frequent-polling jobs
// (calendar-sync, departure-tick, penalty-charges) are triggered by GitHub
// Actions on the schedule defined in `.github/workflows/cron.yml` — that's
// free and unlimited. The two daily jobs below are cheap enough for Hobby.
//
// Upgrade to Pro ($20/mo) and we can move all crons back into Vercel for
// simpler ops, but no reason to do it before there's revenue.
export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'npm --workspace apps/server run build',
  installCommand: 'npm install',
  outputDirectory: 'apps/server/.next',
  crons: [
    { path: '/api/cron/morning-rollcall', schedule: '0 11 * * *' },
    { path: '/api/cron/lockup-sweep', schedule: '0 3 * * *' },
  ],
};
