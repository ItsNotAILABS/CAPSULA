import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Cpu,
  FileCode2,
  Github,
  Globe2,
  Layers3,
  MonitorSmartphone,
  Play,
  Rocket,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TerminalSquare,
  Users,
  Workflow
} from 'lucide-react';

type RuntimeStatus = 'ready' | 'toolchain' | 'planned';
type View = 'overview' | 'builder' | 'runtimes' | 'workers' | 'mobile' | 'deploy' | 'funding' | 'growth';

type Runtime = {
  key: string;
  label: string;
  description: string;
  preview: string;
  targets: string[];
  command: string;
  status: RuntimeStatus;
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

const workers = [
  { name: 'Issue Bot', role: 'Turns issues into triaged runtime tasks, bug reports, and roadmap packets.', status: 'online', icon: Bot },
  { name: 'Session Worker', role: 'Creates coding sessions, starter files, logs, and manifests.', status: 'online', icon: TerminalSquare },
  { name: 'Preview Worker', role: 'Routes web, API, terminal, notebook, mobile, and artifact previews.', status: 'online', icon: MonitorSmartphone },
  { name: 'MCP AI Worker', role: 'Lets AI clients call CAPSULA tools and generate/review code safely.', status: 'online', icon: BrainCircuit },
  { name: 'WASM Worker', role: 'Plans honest C/C++ WebAssembly capsules based on installed toolchains.', status: 'standby', icon: Cpu },
  { name: 'GitHub Worker', role: 'Prepares issue, PR, branch, deploy, and release handoffs.', status: 'online', icon: Github }
];

const nav: Array<{ id: View; label: string; icon: typeof Layers3 }> = [
  { id: 'overview', label: 'Overview', icon: Layers3 },
  { id: 'builder', label: 'Builder', icon: Code2 },
  { id: 'runtimes', label: 'Runtimes', icon: Cpu },
  { id: 'workers', label: 'Bots + Workers', icon: Bot },
  { id: 'mobile', label: 'Expo Go', icon: Smartphone },
  { id: 'deploy', label: 'Deploy', icon: Rocket },
  { id: 'funding', label: 'Funding Room', icon: BarChart3 },
  { id: 'growth', label: 'Users', icon: Users }
];

const issueBots = [
  ['Runtime Triage Bot', 'Labels Python, C++, React, Node, Expo, MCP, WASM, and backend issues.'],
  ['Commercial QA Bot', 'Checks acceptance criteria, screenshots, mobile preview, and build readiness.'],
  ['Deploy Bot', 'Tracks GitHub push, branch, PR, merge, release, and deploy-plan handoff.'],
  ['Research Bot', 'Creates architecture notes, risks, and capsule manifest reviews.']
];

const pipeline = ['Prompt', 'Session', 'Code', 'Run', 'Preview', 'Manifest', 'Gate', 'Deploy'];
const templates = ['Customer Portal', 'Ops Agent', 'MCP Toolkit', 'Expo Mobile Preview', 'C++ WASM Kernel', 'Data Report'];
const fundingDocs = ['Investor Brief', 'Runtime Thesis', 'Commercial Research Memo', 'Funding Data Room', 'Founder Demo Script', 'Commercial Readiness'];
const growthFunnel = ['Workspace created', 'First capsule', 'Preview opened', 'Manifest generated', 'Deploy plan reviewed', 'Shared with user'];

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

  return (
    <main className="shell">
      <aside className="rail">
        <a className="brand" href="#overview" onClick={() => setView('overview')}>
          <span>CA</span>
          <strong>CAPSULA</strong>
          <small>Commercial Studio</small>
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
          <small>{score}% readiness</small>
        </section>
      </aside>

      <section className="workbench">
        <header className="hero">
          <div>
            <p>CAPSULA STUDIO · FUNDING AND USER READY BUILD</p>
            <h1>Build apps, agents, web workers, mobile previews, and WASM capsules from one commercial studio.</h1>
            <span>CAPSULA preserves the whole operating envelope: source, runtime, preview, manifest, release gate, issue bots, user docs, and deploy evidence.</span>
          </div>
          <div className="hero-actions">
            <button><Server size={16} /> API 8784</button>
            <button><MonitorSmartphone size={16} /> Preview 8785</button>
            <button><Rocket size={16} /> Ship capsule</button>
          </div>
        </header>

        <section className="metrics">
          <article><span>Active lane</span><strong>{active.label}</strong><small>{active.preview} preview</small></article>
          <article><span>Readiness</span><strong>{score}%</strong><small>{active.status}</small></article>
          <article><span>Deploy targets</span><strong>{active.targets.length}</strong><small>{targetText}</small></article>
          <article><span>Activation loop</span><strong>6 steps</strong><small>workspace to user share</small></article>
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
                {templates.map((item) => (
                  <article key={item}><CheckCircle2 size={18} /><strong>{item}</strong><small>Generate source, manifest, preview route, success criteria, and deploy notes.</small></article>
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

        {view === 'workers' && (
          <section className="worker-layout">
            <section className="panel wide-panel">
              <PanelTitle eyebrow="issue bots" title="Bots that turn issues into build motion" action={<Bot size={18} />} />
              <div className="bot-grid">{issueBots.map(([name, role]) => <article key={name}><Bot size={18} /><strong>{name}</strong><small>{role}</small></article>)}</div>
            </section>
            <section className="panel wide-panel workers-panel">
              <PanelTitle eyebrow="workers" title="Capsule execution workers" />
              <div className="worker-grid">{workers.map(({ name, role, status, icon: Icon }) => <article key={name}><Icon size={20} /><strong>{name}</strong><span>{status}</span><small>{role}</small></article>)}</div>
            </section>
          </section>
        )}

        {view === 'mobile' && (
          <section className="mobile-layout">
            <section className="panel mobile-hero">
              <PanelTitle eyebrow="expo go" title="Mobile capsule previews" action={<Smartphone size={20} />} />
              <p>Generate an Expo app capsule, run it locally, and scan the QR code with Expo Go so users can preview the app on real devices.</p>
              <div className="terminal"><code>python -m capsula.cli expo --name "CAPSULA Mobile" --slug capsula-mobile --out .capsula/expo/capsula-mobile</code><code>cd .capsula/expo/capsula-mobile</code><code>npm install && npm run start</code></div>
            </section>
          </section>
        )}

        {view === 'deploy' && (
          <section className="deploy-layout">
            <section className="panel wide-panel">
              <PanelTitle eyebrow="deploy graph" title="Commercial release path" action={<ShieldCheck size={18} />} />
              <div className="graph">{['Source tree', 'Runtime', 'Preview', 'Manifest', 'Issue bot', 'Tests', 'GitHub', 'Release'].map((item) => <article key={item}><Workflow size={18} /><strong>{item}</strong><ArrowRight size={14} /></article>)}</div>
            </section>
          </section>
        )}

        {view === 'funding' && (
          <section className="builder-layout">
            <section className="panel wide-panel">
              <PanelTitle eyebrow="data room" title="Funding-ready evidence pack" action={<BarChart3 size={18} />} />
              <div className="builder-cards">
                {fundingDocs.map((item) => <article key={item}><ShieldCheck size={18} /><strong>{item}</strong><small>Investor-facing proof that CAPSULA is a platform, not a loose prototype.</small></article>)}
              </div>
            </section>
          </section>
        )}

        {view === 'growth' && (
          <section className="builder-layout">
            <section className="panel wide-panel">
              <PanelTitle eyebrow="user activation" title="Track the first usable app moment" action={<Users size={18} />} />
              <div className="pipeline">
                {growthFunnel.map((item, index) => <article key={item}><span>{index + 1}</span><strong>{item}</strong></article>)}
              </div>
              <div className="terminal"><code>Activation = workspace + capsule + preview + manifest + deploy plan + user share</code><code>North Star: time to first running capsule</code></div>
            </section>
          </section>
        )}
      </section>
    </main>
  );
}

function PanelTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return <div className="heading"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action}</div>;
}
