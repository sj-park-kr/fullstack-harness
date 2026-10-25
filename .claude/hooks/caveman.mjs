// SessionStart·SubagentStart 훅: caveman 스킬 본문을 컨텍스트에 넣어 메인 세션과 서브에이전트 모두 항상 caveman으로 답하게 한다.
// CLAUDE.md의 "caveman을 불러와라"만으로는 모델이 건너뛰거나 서브에이전트에 전달되지 않았다.
import { readFileSync } from "node:fs";
import { join } from "node:path";

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    const event = JSON.parse(raw || "{}").hook_event_name || "SessionStart";
    const skill = readFileSync(join(process.env.CLAUDE_PROJECT_DIR || ".", ".claude/skills/caveman/SKILL.md"), "utf8");
    const body = skill.replace(/^---[\s\S]*?---\s*/, "");
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: event, additionalContext: "CAVEMAN MODE ACTIVE\n\n" + body },
    }));
  } catch {
    // 훅 실패로 세션·서브에이전트 시작을 막지 않는다.
  }
  process.exit(0);
});
