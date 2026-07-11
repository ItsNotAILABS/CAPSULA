from __future__ import annotations

import argparse
from pathlib import Path

from .demo_apps import get_demo_app

HTML_TEMPLATE = """<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>{name}</title>
  <style>
    :root {{ color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; background: #060814; color: #eef2ff; }}
    * {{ box-sizing: border-box; }}
    body {{ margin: 0; min-height: 100vh; background: radial-gradient(circle at top left, rgba(76, 111, 255, .28), transparent 34%), #060814; }}
    main {{ max-width: 1180px; margin: 0 auto; padding: 56px 24px; }}
    .hero {{ display: grid; grid-template-columns: 1.5fr .9fr; gap: 24px; align-items: stretch; }}
    .card {{ border: 1px solid rgba(148, 163, 184, .24); background: rgba(15, 23, 42, .74); border-radius: 28px; padding: 28px; box-shadow: 0 24px 90px rgba(0, 0, 0, .38); backdrop-filter: blur(18px); }}
    .eyebrow {{ color: #93c5fd; letter-spacing: .18em; text-transform: uppercase; font-size: 12px; font-weight: 800; }}
    h1 {{ font-size: clamp(38px, 6vw, 72px); line-height: .94; margin: 14px 0 18px; }}
    h2 {{ margin-top: 0; }}
    p {{ color: #cbd5e1; font-size: 16px; line-height: 1.7; }}
    .grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 18px; }}
    .list {{ display: grid; gap: 12px; }}
    .pill {{ display: inline-flex; border: 1px solid rgba(147, 197, 253, .35); color: #bfdbfe; border-radius: 999px; padding: 8px 12px; margin: 4px 6px 4px 0; background: rgba(30, 64, 175, .16); }}
    .step {{ padding: 14px 16px; border-radius: 18px; background: rgba(15, 23, 42, .9); border: 1px solid rgba(148, 163, 184, .18); }}
    .step strong {{ display: block; color: white; }}
    code {{ display: block; white-space: pre-wrap; background: #020617; color: #bbf7d0; padding: 16px; border-radius: 16px; border: 1px solid rgba(34, 197, 94, .22); }}
    @media (max-width: 880px) {{ .hero, .grid {{ grid-template-columns: 1fr; }} }}
  </style>
</head>
<body>
  <main>
    <section class=\"hero\">
      <article class=\"card\">
        <span class=\"eyebrow\">CAPSULA DEMO APP · {stage}</span>
        <h1>{name}</h1>
        <p>{purpose}</p>
        <div>{deploy_targets}</div>
      </article>
      <aside class=\"card\">
        <span class=\"eyebrow\">Structure target</span>
        <p>{structure_target}</p>
        <code>{build_command}\n{preview_command}</code>
      </aside>
    </section>
    <section class=\"grid\">
      <article class=\"card\"><h2>Workflow</h2><div class=\"list\">{workflow}</div></article>
      <article class=\"card\"><h2>Protocols</h2><div>{protocol_ids}</div></article>
      <article class=\"card\"><h2>Acceptance checks</h2><div class=\"list\">{checks}</div></article>
    </section>
  </main>
</body>
</html>
"""


def _pills(values: list[str]) -> str:
    return "".join(f'<span class="pill">{value}</span>' for value in values)


def _steps(values: list[str]) -> str:
    return "".join(f'<div class="step"><strong>{index + 1:02d}</strong>{value}</div>' for index, value in enumerate(values))


def render_demo(template_id: str, out: Path) -> Path:
    demo = get_demo_app(template_id)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        HTML_TEMPLATE.format(
            name=demo.name,
            stage=demo.stage,
            purpose=demo.purpose,
            structure_target=demo.structure_target,
            build_command=demo.build_command,
            preview_command=demo.preview_command,
            deploy_targets=_pills(demo.deploy_targets),
            workflow=_steps(demo.workflow),
            protocol_ids=_pills(demo.protocol_ids),
            checks=_steps(demo.acceptance_checks),
        ),
        encoding="utf-8",
    )
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description="Render a standalone CAPSULA demo HTML app.")
    parser.add_argument("template_id")
    parser.add_argument("--out", default=".capsula/demo/capsula_studio.html")
    args = parser.parse_args()
    print(render_demo(args.template_id, Path(args.out)))


if __name__ == "__main__":
    main()
