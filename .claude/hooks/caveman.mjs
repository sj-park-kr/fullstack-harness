// SessionStart·SubagentStart 훅: caveman 스킬 본문을 컨텍스트에 넣어 메인 세션과 서브에이전트 모두 항상 caveman으로 답하게 한다.
// CLAUDE.md의 "caveman을 불러와라"만으로는 모델이 건너뛰거나 서브에이전트에 전달되지 않았다.
// UserPromptSubmit 훅: 매 턴 짧은 리마인더를 넣는다. 훅 추가 전에 시작된 세션이나 긴 세션에서 말투가 풀리는 것을 막는다.
import { readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const REMINDER = "CAVEMAN MODE ACTIVE: 이번 답도 caveman 말투(결론 먼저, 군더더기 없이 짧게, 기술 내용은 모두 유지). 문서·커밋은 보통 문체.";

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(raw || "{}");
    const event = input.hook_event_name || "SessionStart";
    // 세션별 끄기 플래그: "normal mode"/"stop caveman"이면 끄고, "/caveman"/"caveman mode"면 다시 켠다.
    const flag = join(tmpdir(), `caveman-off-${input.session_id || "default"}`);

    if (event === "UserPromptSubmit") {
      const prompt = (input.prompt || "").toLowerCase();
      if (/normal mode|stop caveman/.test(prompt)) writeFileSync(flag, "");
      else if (/\/caveman|caveman mode/.test(prompt)) rmSync(flag, { force: true });
    }
    if (existsSync(flag)) return process.exit(0);
    if (event === "UserPromptSubmit") {
      process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: REMINDER } }));
      return process.exit(0);
    }

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
