export type DesignTokenGroup = 'color' | 'space' | 'radius' | 'shadow' | 'motion' | 'type';

export type DesignToken = {
  name: string;
  group: DesignTokenGroup;
  value: string;
  usage: string;
};

export const designTokens: DesignToken[] = [
  { name: 'bg/base', group: 'color', value: '#06070a', usage: 'application background and shell base' },
  { name: 'surface/default', group: 'color', value: 'rgba(255,255,255,.072)', usage: 'primary cards, panels, and studio surfaces' },
  { name: 'surface/soft', group: 'color', value: 'rgba(255,255,255,.045)', usage: 'nested blocks, template rows, and preview sections' },
  { name: 'line/default', group: 'color', value: 'rgba(255,255,255,.14)', usage: 'panel borders and table dividers' },
  { name: 'accent/gold', group: 'color', value: '#d7b46d', usage: 'primary action, maturity markers, and brand glow' },
  { name: 'accent/blue', group: 'color', value: '#8fd5ff', usage: 'preview, integration, and deployment status' },
  { name: 'accent/green', group: 'color', value: '#76d7a6', usage: 'ready states, success evidence, and verified gates' },
  { name: 'space/panel', group: 'space', value: '16px', usage: 'standard panel padding' },
  { name: 'space/shell', group: 'space', value: '24px', usage: 'main workbench padding' },
  { name: 'radius/panel', group: 'radius', value: '24px', usage: 'primary studio panel corners' },
  { name: 'radius/hero', group: 'radius', value: '32px', usage: 'hero and highest-emphasis cards' },
  { name: 'shadow/elevated', group: 'shadow', value: '0 30px 100px rgba(0,0,0,.24)', usage: 'active work surfaces and hero cards' },
  { name: 'motion/fast', group: 'motion', value: '180ms ease', usage: 'hover elevation and border changes' },
  { name: 'type/hero', group: 'type', value: 'clamp(2.35rem, 5vw, 6.2rem)', usage: 'front-door platform promise' }
];

export const surfaceBlueprints = [
  {
    id: 'workspace-ide',
    title: 'Workspace IDE',
    layout: ['rail', 'file tree', 'editor', 'preview', 'terminal', 'deploy panel'],
    purpose: 'The default shipping cockpit for building real structures.'
  },
  {
    id: 'demo-gallery',
    title: 'Demo Gallery',
    layout: ['template selector', 'standalone preview', 'proof checklist', 'launch path'],
    purpose: 'Render the value before the backend is visible.'
  },
  {
    id: 'connector-gallery',
    title: 'Connector Gallery',
    layout: ['connector card', 'auth boundary', 'webhook direction', 'action preview'],
    purpose: 'Connect the tools users already work inside.'
  },
  {
    id: 'deployment-command',
    title: 'Deployment Command',
    layout: ['target picker', 'build log', 'secret checklist', 'public URL evidence'],
    purpose: 'Move a capsule from local preview to public deploy.'
  }
];
