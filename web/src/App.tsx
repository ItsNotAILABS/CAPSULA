import { useMemo, useState } from 'react';
import { BrainCircuit, Boxes, Code2, Cpu, Github, MonitorSmartphone, Play, Rocket, Server, Smartphone, TerminalSquare, Workflow } from 'lucide-react';

type Runtime = {
  key: string;
  label: string;
  preview: string;
  targets: string[];
  status: 'ready' | 'toolchain' | 'planned';
};

const runtimes: Runtime[] = [
  { key: 'python', label: 'Python Agent', preview: 'terminal', targets: ['wasi', 'native', 'github'], status: 'ready' },
  { key: 'react', label: 'React App', preview: 'web', targets: ['browser', 'web-worker', 'github'], status: 'ready' },
  { key: 'node', label: 'Node Service', preview: 'api', targets: ['node', 'github'], status: 'ready' },
  { key: 'cpp', label: 'C++ WASM', preview: 'terminal', targets: ['wasm', 'web-worker'], status: 'toolchain' },
  { key: 'java', label: 'Java Agent', preview: 'terminal', targets: ['native', 'wasm'], status: 'toolchain' },
  { key: 'expo', label: 'Expo Go Mobile', preview: 'mobile', targets: ['expo-go', 'github'], status: 'ready' },
  { key: 'julia', label: 'Julia Scientific', preview: 'notebook', targets: ['native', 'artifact'], status: 'planned' },
  { key: 'matlab', label: 'MATLAB/Octave', preview: 'artifact', targets: ['native', 'artifact'], status: 'planned' },
];

const workers = [
  ['Session Worker', 'Creates coding sessions and manifests', 'online'],
  ['Preview Worker', 'Routes web, API, terminal, mobile, and artifacts', 'online'],
  ['MCP AI Worker', 'Lets AI clients call CAPSULA tools', 'online'],
  ['WASM Worker', 'Plans C/C++ WebAssembly capsules honestly', 'standby'],
  ['GitHub Worker', 'Prepares push, PR, and merge handoffs', 'online'],
];

export function App() {
  const [active, setActive] = useState(runtimes[0]);
  const score = useMemo(() => active.status === 'ready' ? 94 : active.status === 'toolchain' ? 72 : 48, [active]);

  return (
    <main className="shell">
      <aside className="rail">
        <div className="brand"><span>CA</span><strong>CAPSULA</strong><small>Studio Runtime</small></div>
        <button className="active"><Boxes size={16}/> Capsule Studio</button>
        <button><TerminalSquare size={16}/> Runtime Lanes</button>
        <button><BrainCircuit size={16}/> MCP AI Bridge</button>
        <button><Smartphone size={16}/> Expo Go</button>
        <button><Github size={16}/> GitHub Deploy</button>
      </aside>
      <section className="workbench">
        <header className="hero">
          <div>
            <p>CAPSULA STUDIO REMIXED BUILD</p>
            <h1>Code sessions become capsules. Capsules become workers, apps, mobile previews, WASM kernels, and GitHub deploys.</h1>
            <span>Parallel build surface for the CAPSULA repository and the Capsule Studio architecture.</span>
          </div>
          <div className="hero-actions">
            <button><Server size={16}/> API 8784</button>
            <button><MonitorSmartphone size={16}/> Preview 8785</button>
            <button><Rocket size={16}/> Deploy</button>
          </div>
        </header>

        <section className="metrics">
          <article><span>Active lane</span><strong>{active.label}</strong><small>{active.preview} preview</small></article>
          <article><span>Readiness</span><strong>{score}%</strong><small>{active.status}</small></article>
          <article><span>Targets</span><strong>{active.targets.length}</strong><small>{active.targets.join(' · ')}</small></article>
          <article><span>Flow</span><strong>code → preview → capsule → deploy</strong><small>GitHub first</small></article>
        </section>

        <section className="grid">
          <section className="panel lanes">
            <div className="heading"><span>runtime lanes</span><h2>Build in parallel</h2></div>
            {runtimes.map((runtime) => (
              <button key={runtime.key} className={runtime.key === active.key ? 'selected lane' : 'lane'} onClick={() => setActive(runtime)}>
                <strong>{runtime.label}</strong><span>{runtime.preview}</span><small>{runtime.targets.join(' · ')}</small>
              </button>
            ))}
          </section>

          <section className="panel command">
            <div className="heading"><span>selected capsule</span><h2>{active.label}</h2></div>
            <div className="terminal">
              <code>python -m capsula.cli create {active.key} --name demo-{active.key}</code>
              <code>python -m capsula.cli run demo-{active.key}</code>
              <code>python -m capsula.cli manifest demo-{active.key}</code>
              <code>python -m capsula.cli deploy-plan demo-{active.key}</code>
            </div>
            <div className="preview-card">
              <Code2 size={28}/>
              <strong>{active.preview.toUpperCase()} Preview</strong>
              <span>{active.preview === 'mobile' ? 'Generate an Expo Go app and scan the QR code.' : 'Open the local preview, API, terminal, notebook, or artifact output.'}</span>
              <button><Play size={16}/> Run capsule</button>
            </div>
          </section>

          <section className="panel workers">
            <div className="heading"><span>capsule workers</span><h2>Always-on execution model</h2></div>
            {workers.map(([name, role, status]) => <article key={name}><strong>{name}</strong><span>{status}</span><small>{role}</small></article>)}
          </section>

          <section className="panel wide">
            <div className="heading"><span>deploy graph</span><h2>One platform, multiple outputs</h2></div>
            <div className="graph">
              {['Source Tree', 'Runtime Server', 'Preview Router', 'MCP AI Tools', 'WASM Plan', 'Expo Go', 'GitHub Deploy'].map((item) => <article key={item}><Workflow size={18}/><strong>{item}</strong></article>)}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
