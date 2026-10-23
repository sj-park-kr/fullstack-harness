// 상태 표시줄: 모델 · 컨텍스트 사용률 · 비용 · 브랜치 · 사용량 한도
// Orca가 설치된 PC면 원래 Orca 상태 표시줄 스크립트에도 같은 입력을 넘긴다(전역 설정을 덮어써도 Orca 기능 유지).
import { spawnSync, execSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  const orca = join(homedir(), ".orca", "agent-hooks", "claude-statusline.cmd");
  if (existsSync(orca)) spawnSync("cmd.exe", ["/c", orca], { input: raw, timeout: 3000 });
  try { writeFileSync(join(tmpdir(), "claude-statusline-last.json"), raw); } catch {}

  let d = {};
  try { d = JSON.parse(raw); } catch {}

  const parts = [];
  const model = d.model?.display_name ?? d.model?.id;
  if (model) parts.push(`\x1b[36m${model}\x1b[0m`);

  const cw = d.context_window ?? {};
  let pct = cw.used_percentage;
  if (pct == null && cw.current_usage && cw.context_window_size) {
    const u = cw.current_usage;
    const used = (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0);
    pct = (used / cw.context_window_size) * 100;
  }
  if (pct != null) {
    const color = pct >= 80 ? 31 : pct >= 50 ? 33 : 32;
    const n = cw.context_window_size;
    const size = n ? `/${n >= 1e6 ? n / 1e6 + "M" : Math.round(n / 1000) + "k"}` : "";
    parts.push(`ctx \x1b[${color}m${Math.round(pct)}%\x1b[0m${size}`);
  }

  const cost = d.cost?.total_cost_usd;
  if (cost != null) parts.push(`$${cost.toFixed(2)}`);

  try {
    const branch = execSync("git branch --show-current", { cwd: d.workspace?.current_dir ?? process.cwd(), stdio: ["ignore", "pipe", "ignore"] })
      .toString().trim();
    if (branch) parts.push(`⎇ ${branch}`);
  } catch {}

  const five = d.rate_limits?.five_hour?.used_percentage;
  if (five != null) parts.push(`5h ${Math.round(five)}%`);

  process.stdout.write(parts.join(" · "));
});
