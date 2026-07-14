export type EcosystemLane = {
  id: string;
  name: string;
  userValue: string;
  surfaces: string[];
  workflows: string[];
  deployTargets: string[];
};

export const ecosystemLanes: EcosystemLane[] = [
  {
    id: 'build',
    name: 'Build Lane',
    userValue: 'Turn an idea or structure into files, templates, and runnable previews.',
    surfaces: ['Workspace IDE', 'Template Marketplace', 'Demo Gallery'],
    workflows: ['prompt to capsule', 'template to demo', 'file tree to preview'],
    deployTargets: ['local file', 'local HTTP', 'GitHub']
  },
  {
    id: 'connect',
    name: 'Connect Lane',
    userValue: 'Bring external tools into CAPSULA or let those tools trigger CAPSULA work.',
    surfaces: ['Connector Gallery', 'Webhook Console', 'Auth Boundary'],
    workflows: ['GitHub import', 'Slack feedback intake', 'Notion docs sync', 'Figma design handoff'],
    deployTargets: ['webhook', 'OAuth app', 'API token']
  },
  {
    id: 'govern',
    name: 'Govern Lane',
    userValue: 'Apply protocols, gates, evidence, and release boundaries to every build.',
    surfaces: ['Protocol Console', 'Release Gate', 'Proof Packet'],
    workflows: ['render before backend', 'static demo gate', 'connector boundary', 'live launch gate'],
    deployTargets: ['GitHub PR', 'release notes', 'audit trail']
  },
  {
    id: 'ship',
    name: 'Ship Lane',
    userValue: 'Publish a public URL, mobile QR preview, or backend service from the same workspace.',
    surfaces: ['Deployment Command', 'Cloudflare Panel', 'Expo Go Panel'],
    workflows: ['preview to public URL', 'Cloudflare deploy', 'Vercel/Netlify static deploy', 'Render/Fly API deploy'],
    deployTargets: ['Cloudflare Pages', 'Vercel', 'Netlify', 'Render', 'Fly.io', 'Expo Go']
  },
  {
    id: 'learn',
    name: 'Learn Lane',
    userValue: 'Capture user feedback, support issues, activation metrics, and next product moves.',
    surfaces: ['User Activation Board', 'Support Loop', 'Roadmap Console'],
    workflows: ['feedback to issue', 'support to docs', 'usage to template upgrade'],
    deployTargets: ['GitHub Issues', 'Linear/Jira', 'Notion docs', 'Sentry']
  }
];
