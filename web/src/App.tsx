import { useMemo, useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Cpu,
  FileCode2,
  Globe2,
  KeyRound,
  Layers3,
  MonitorSmartphone,
  Network,
  Play,
  Rocket,
  ScrollText,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TerminalSquare,
  Users,
  Workflow,
  Zap
} from 'lucide-react';

type RuntimeStatus = 'ready' | 'toolchain' | 'planned';
type View = 'overview' | 'builder' | 'runtimes' | 'bots' | 'protocols' | 'workflows' | 'mobile' | 'funding' | 'users' | 'deploy';

type Runtime = {
  key: string;
  label: string;
  description: string;
  preview: string;
  targets: string[];
  command: string;
  status: RuntimeStatus;
};

type BotCard = {
  name: string;
  group: string;
  mode: string;
  mission: string;
};

type ProtocolCard = {
  id: string;
  name: string;
  layer: string;
  owner: string;
};

const runtimes: Runtime[] = [
  { key: 'python', label: 'Python Agent', description: 'Orchestrate local scripts, AI tools, reports, and backend capsule actions.', preview: 'terminal', targets: ['wasi', 'native', 'github'], command: 'python -m capsula.cli create python --name agent-demo', status: 'ready' },
  { key: 'react', label: 'React App', description: 'Build full front-end apps with live preview, web worker capsules, and deploy metadata.', preview: 'web', targets: ['browser', 'web-worker', 'github'], command: 'python -m capsula.cli create react --name web-demo', status: 'ready' },
  { key: 'node', label: 'Node Service', description: 'Create API services, MCP bridges, GitHub publishers, and queue-style workers.', preview: 'api', targets: ['node', 'github'], command: 'python -m capsula.cli create node --name api-demo', status: 'ready' },
  { key: 'cpp', label: 'C++ WASM', description: 'Compile performance kernels into WebAssembly when Emscripten or WASI SDK exists.', preview: 'terminal', targets: ['wasm', 'web-worker'], command: 'python -m capsula.cli wasm-plan native/specforge_core.cpp --kind cpp', status: 'toolchain' },
  { key: 'java', label: 'Java Agent', description: 'Package JVM-based services and future Java-to-web agent runtimes.', preview: 'terminal', targets: ['native', 'wasm'], command: 'python -m capsula.cli create java --name java-agent', status: 'toolchain' },
  { key: 'expo', label: 'Expo Go Mobile', description: 'Generate mobile app capsules users can scan and preview on real devices.', preview: 'mobile', targets: ['expo-go', 'github'], command: 'python -m capsula.cli expo --name CAPSULA --slug capsula', status: 'ready' },
  { key: 'julia', label: 'Julia Scientific', description: 'Run scientific modeling capsules and package notebook/report artifacts.', preview: 'notebook', targets: ['native', 'artifact'], command: 'python -m capsula.cli create julia --name sci-demo', status: 'planned' },
  { key: 'matlab', label: 'MATLAB/Octave', description: 'Support scientific and engineering capsule sessions with artifact outputs.', preview: 'artifact', targets: ['native', 'artifact'], command: 'python -m capsula.cli create matlab --name math-demo', status: 'planned' }
];

const bots: BotCard[] = [
  { name: 'Repo Sentinel', group: 'GitHub', mode: 'watch', mission: 'Watches repo structure, missing docs, and release drift.' },
  { name: 'Issue Triage Bot', group: 'GitHub', mode: 'approval-gated', mission: 'Classifies issues by lane, severity, owner, and evidence.' },
  { name: 'PR Reviewer Bot', group: 'GitHub', mode: 'approval-gated', mission: 'Reviews diffs for risk, security, build, and copy problems.' },
  { name: 'Release Captain Bot', group: 'Release', mode: 'approval-gated', mission: 'Runs release gates and version handoff.' },
  { name: 'Commercial QA Gatekeeper', group: 'Platform', mode: 'approval-gated', mission: 'Verifies commercial readiness and user clarity.' },
  { name: 'Security Steward Bot', group: 'Security', mode: 'approval-gated', mission: 'Protects filesystem, subprocess, secrets, AI, and GitHub boundaries.' },
  { name: 'Runtime Smith Bot', group: 'Runtime', mode: 'automated', mission: 'Maintains runtime specs, starters, and toolchain truth.' },
  { name: 'WASM Cartographer Bot', group: 'Runtime', mode: 'automated', mission: 'Maps languages to honest WASM/WASI paths.' },
  { name: 'MCP Conductor Bot', group: 'Platform', mode: 'approval-gated', mission: 'Coordinates AI tool contracts and MCP bridge boundaries.' },
  { name: 'GitHub Publisher Bot', group: 'GitHub', mode: 'approval-gated', mission: 'Prepares branches, PRs, releases, and direct-write packets.' },
  { name: 'Docs Architect Bot', group: 'Research', mode: 'automated', mission: 'Keeps papers, protocols, docs, and implementation aligned.' },
  { name: 'Research Fellow Bot', group: 'Research', mode: 'advisory', mission: 'Separates claim, evidence, hypothesis, and benchmark.' },
  { name: 'Evaluation Bench Bot', group: 'Platform', mode: 'automated', mission: 'Tracks activation, latency, tests, and release confidence.' },
  { name: 'User Activation Bot', group: 'Growth', mode: 'watch', mission: 'Moves users to first capsule, preview, manifest, and deploy plan.' },
  { name: 'Customer Success Bot', group: 'Support', mode: 'advisory', mission: 'Turns support into docs, fixes, or roadmap signal.' },
  { name: 'Growth Operator Bot', group: 'Growth', mode: 'advisory', mission: 'Creates launch copy, ICP notes, and outreach packets.' },
  { name: 'Design Steward Bot', group: 'Platform', mode: 'advisory', mission: 'Keeps the UI polished, accessible, and enterprise calm.' },
  { name: 'Frontend Builder Bot', group: 'Platform', mode: 'automated', mission: 'Builds navigable React surfaces for real product workflows.' },
  { name: 'Funding Data Room Curator', group: 'Research', mode: 'advisory', mission: 'Maintains investor evidence, risks, demo, and roadmap.' },
  { name: 'First Light', group: 'Easter Egg', mode: 'delight', mission: 'Adds harmless hidden details without faking capability.' }
];

const protocols: ProtocolCard[] = [
  ['P01', 'Workspace Genesis', 'Product', 'User Activation'], ['P02', 'Capsule Birth', 'Runtime', 'Runtime Smith'], ['P03', 'Preview First', 'Product', 'QA Gatekeeper'], ['P04', 'Manifest Truth', 'Release', 'Release Captain'], ['P05', 'Toolchain Honesty', 'Runtime', 'WASM Cartographer'], ['P06', 'MCP Tool Boundary', 'Security', 'MCP Conductor'], ['P07', 'GitHub Direct Write', 'GitHub', 'GitHub Publisher'], ['P08', 'Branch and PR Handoff', 'GitHub', 'PR Reviewer'], ['P09', 'Issue Intake', 'GitHub', 'Issue Triage'], ['P10', 'Issue Bot Swarm', 'GitHub', 'Repo Sentinel'], ['P11', 'Security Review Gate', 'Security', 'Security Steward'], ['P12', 'Secret Silence', 'Security', 'Security Steward'], ['P13', 'Local-First Telemetry', 'Product', 'Evaluation Bench'], ['P14', 'Activation Ladder', 'Growth', 'User Activation'], ['P15', 'Commercial QA', 'Release', 'QA Gatekeeper'], ['P16', 'Release Gate', 'Release', 'Release Captain'], ['P17', 'Research Claim Discipline', 'Research', 'Research Fellow'], ['P18', 'Funding Room Evidence', 'Research', 'Data Room Curator'], ['P19', 'Design Calm', 'Product', 'Design Steward'], ['P20', 'Frontend Production Surface', 'Product', 'Frontend Builder'], ['P21', 'Runtime Lane Expansion', 'Runtime', 'Runtime Smith'], ['P22', 'WASM/WASI Map', 'Runtime', 'WASM Cartographer'], ['P23', 'Docs Sync', 'Research', 'Docs Architect'], ['P24', 'User Support Loop', 'Support', 'Customer Success'], ['P25', 'Launch Motion', 'Growth', 'Growth Operator'], ['P26', 'Pricing Integrity', 'Growth', 'Growth Operator'], ['P27', 'Audit Trail', 'Security', 'Repo Sentinel'], ['P28', 'Template Marketplace', 'Product', 'Template Curator'], ['P29', 'Easter Egg Protocol', 'Product', 'Design Steward'], ['P30', 'Sovereign Exit', 'Governance', 'Release Captain']
].map(([id, name, layer, owner]) => ({ id, name, layer, owner }));

const nav: Array<{ id: View; label: string; icon: typeof Layers3 }> = [
  { id: 'overview', label: 'Overview', icon: Layers3 },
  { id: 'builder', label: 'Builder', icon: Code2 },
  { id: 'runtimes', label: 'Runtimes', icon: Cpu },
  { id: 'bots', label: 'Bot OS', icon: Bot },
  { id: 'protocols', label: 'Protocols', icon: ScrollText },
  { id: 'workflows', label: 'Workflows', icon: Workflow },
  { id: 'mobile', label: 'Expo Go', icon: Smartphone },
  { id: 'funding', label: 'Funding', icon: Sparkles },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'deploy', label: 'Deploy', icon: Rocket }
];

const workflows = ['Issue -> Bot owner -> Work packet', 'Prompt -> Capsule session -> Starter files', 'Code -> Run -> Preview', 'Preview -> Manifest -> Release gate', 'Release gate -> GitHub publish', 'Feedback -> Docs/Product fix'];
const pipeline = ['Prompt', 'Session', 'Code', 'Run', 'Preview', 'Manifest', 'Gate', 'Deploy'];
const fundingAssets = ['Whitepaper', 'Technical paper', 'Runtime thesis', 'Commercial research memo', 'Funding data room', 'Founder demo script', 'Security model', 'Release plan'];
const userLadder = ['Visitor', 'Workspace', 'First capsule', 'Preview opened', 'Manifest generated', 'Deploy plan reviewed', 'Team invited', 'Paid workspace'];

function statusScore(status: RuntimeStatus) {
  if (status === 'ready') return 96;
  if (status === 'toolchain') return 74;
  return 52;
}

export function App() {
  const [view, setView] = useState<View>('overview');
  const [active, setActive] = useState(runtimes[0]);
  const score = useMemo(() => statusScore(active.status), [active]);
  const targetText = active.targets.join(' · ');
  const filteredProtocols = protocols.slice(0, view === 'protocols' ? protocols.length : 8);

  return (
    <main className="shell">
      <aside className="rail">
        <a className="brand" href="#overview" onClick={() => setView('overview')}>
          <span>CA</span>
          <strong>CAPSULA</strong>
          <small>Enterprise Studio</small>
        </a>
        <nav>
          {nav.map(({ id, label, icon: Icon }) => (
            <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
        <section className="rail-card">
          <span>Active capsule</span>
          <strong>{active.label}</strong>
          <small>{targetText}</small>
          <div className="meter"><i style={{ width: `${score}%` }} /></div>
          <small>{score}% readiness · first-light armed</small>
        </section>
      </aside>

      <section className="workbench">
        <header className="hero">
          <div>
            <p>CAPSULA STUDIO · ENTERPRISE PRODUCTION SURFACE</p>
            <h1>Build, govern, preview, release, and fund capsule-native software from one command center.</h1>
            <span>CAPSULA combines runtime lanes, bot operators, 30 protocols, issue workflows, release gates, user activation, funding evidence, and polished previews into a single commercial platform.</span>
          </div>
          <div className="hero-actions">
            <button><Server size={16} /> API 8784</button>
            <button><MonitorSmartphone size={16} /> Preview 8785</button>
            <button><Rocket size={16} /> Release gate</button>
          </div>
        </header>

        <section className="metrics">
          <article><span>Bot operators</span><strong>{bots.length}</strong><small>GitHub + platform swarm</small></article>
          <article><span>Protocols</span><strong>30</strong><small>operating law map</small></article>
          <article><span>Active lane</span><strong>{active.label}</strong><small>{active.preview} preview</small></article>
          <article><span>Enterprise posture</span><strong>{score}%</strong><small>{active.status}</small></article>
        </section>

        {view === 'overview' && (
          <section className="grid overview-grid">
            <section className="panel command-panel">
              <PanelTitle eyebrow="command center" title="CAPSULA operating loop" action={<Sparkles size={18} />} />
              <div className="pipeline">
                {pipeline.map((item, index) => <article key={item}><span>{index + 1}</span><strong>{item}</strong></article>)}
              </div>
              <div className="terminal large">
                <code>python -m capsula.cli api</code>
                <code>python -m capsula.cli preview</code>
                <code>{active.command}</code>
                <code>python -m capsula.cli manifest demo-{active.key}</code>
              </div>
            </section>
            <section className="panel preview-panel">
              <PanelTitle eyebrow="live preview" title={`${active.preview.toUpperCase()} surface`} />
              <div className="preview-window">
                <Globe2 size={38} />
                <strong>{active.label}</strong>
                <span>{active.description}</span>
                <button><Play size={16} /> Run capsule</button>
              </div>
            </section>
          </section>
        )}

        {view === 'builder' && (
          <section className="builder-layout">
            <section className="panel wide-panel">
              <PanelTitle eyebrow="build studio" title="Create production-grade capsules" action={<FileCode2 size={18} />} />
              <div className="builder-cards">
                {['Full web app', 'Python agent', 'MCP tool server', 'Expo Go app', 'C++ WASM worker', 'GitHub deploy package', 'Funding demo', 'Customer support workflow', 'Protocol governed release'].map((item) => (
                  <article key={item}><CheckCircle2 size={18} /><strong>{item}</strong><small>Generate source, manifest, preview route, protocol owner, and deploy notes.</small></article>
                ))}
              </div>
            </section>
          </section>
        )}

        {view === 'runtimes' && (
          <section className="runtime-layout">
            <section className="panel lanes">
              <PanelTitle eyebrow="runtimes" title="Language lanes" />
              {runtimes.map((runtime) => (
                <button key={runtime.key} className={runtime.key === active.key ? 'selected lane' : 'lane'} onClick={() => setActive(runtime)}>
                  <strong>{runtime.label}</strong><span>{runtime.preview}</span><small>{runtime.targets.join(' · ')}</small>
                </button>
              ))}
            </section>
            <section className="panel runtime-detail">
              <PanelTitle eyebrow="selected lane" title={active.label} action={<Activity size={18} />} />
              <p>{active.description}</p>
              <div className="target-list">{active.targets.map((target) => <span key={target}>{target}</span>)}</div>
              <div className="terminal"><code>{active.command}</code><code>python -m capsula.cli run demo-{active.key}</code><code>python -m capsula.cli deploy-plan demo-{active.key}</code></div>
            </section>
          </section>
        )}

        {view === 'bots' && (
          <section className="worker-layout">
            <section className="panel wide-panel">
              <PanelTitle eyebrow="bot operating system" title="GitHub and CAPSULA platform operators" action={<Bot size={18} />} />
              <div className="bot-grid enterprise-grid">{bots.map((bot) => <article key={bot.name}><Bot size={18} /><strong>{bot.name}</strong><span>{bot.group} · {bot.mode}</span><small>{bot.mission}</small></article>)}</div>
            </section>
          </section>
        )}

        {view === 'protocols' && (
          <section className="protocol-layout">
            <section className="panel wide-panel">
              <PanelTitle eyebrow="protocol atlas" title="30 operating protocols" action={<ScrollText size={18} />} />
              <div className="protocol-grid">{filteredProtocols.map((protocol) => <article key={protocol.id}><span>{protocol.id}</span><strong>{protocol.name}</strong><small>{protocol.layer}</small><em>{protocol.owner}</em></article>)}</div>
            </section>
          </section>
        )}

        {view === 'workflows' && (
          <section className="workflow-layout">
            <section className="panel wide-panel">
              <PanelTitle eyebrow="flows and handoffs" title="Enterprise work motion" action={<Network size={18} />} />
              <div className="flow-list">{workflows.map((flow, index) => <article key={flow}><span>0{index + 1}</span><strong>{flow}</strong><ArrowRight size={16} /></article>)}</div>
            </section>
          </section>
        )}

        {view === 'mobile' && (
          <section className="mobile-layout"><section className="panel mobile-hero"><PanelTitle eyebrow="expo go" title="Mobile capsule previews" action={<Smartphone size={20} />} /><p>Generate an Expo app capsule, run it locally, and scan the QR code with Expo Go so users can preview the app on real devices.</p><div className="terminal"><code>python -m capsula.cli expo --name "CAPSULA Mobile" --slug capsula-mobile --out .capsula/expo/capsula-mobile</code><code>cd .capsula/expo/capsula-mobile</code><code>npm install && npm run start</code></div></section></section>
        )}

        {view === 'funding' && (
          <section className="funding-layout"><section className="panel wide-panel"><PanelTitle eyebrow="funding room" title="Investor-ready evidence stack" action={<KeyRound size={18} />} /><div className="builder-cards">{fundingAssets.map((asset) => <article key={asset}><Sparkles size={18} /><strong>{asset}</strong><small>Mapped to product claim, repo artifact, demo proof, or risk note.</small></article>)}</div></section></section>
        )}

        {view === 'users' && (
          <section className="users-layout"><section className="panel wide-panel"><PanelTitle eyebrow="activation" title="User journey from first visit to paid workspace" action={<Users size={18} />} /><div className="pipeline user-pipeline">{userLadder.map((item, index) => <article key={item}><span>{index + 1}</span><strong>{item}</strong></article>)}</div></section></section>
        )}

        {view === 'deploy' && (
          <section className="deploy-layout"><section className="panel wide-panel"><PanelTitle eyebrow="deploy graph" title="Commercial release path" action={<ShieldCheck size={18} />} /><div className="graph">{['Source tree', 'Runtime', 'Preview', 'Manifest', 'Issue bot', 'Tests', 'GitHub', 'Release'].map((item) => <article key={item}><Workflow size={18} /><strong>{item}</strong><ArrowRight size={14} /></article>)}</div></section></section>
        )}
      </section>
    </main>
  );
}

function PanelTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return <div className="heading"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action}</div>;
}
