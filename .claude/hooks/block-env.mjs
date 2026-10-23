// PreToolUse 훅: Claude가 .env 계열 파일(API 키)에 접근하지 못하게 막는다.
// .env.example 은 키 이름만 담는 템플릿이라 허용한다.
// exit 2 = 도구 호출 차단(stderr 메시지가 Claude에게 전달됨), exit 0 = 통과.

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const t = input.tool_input ?? {};
  const targets = [t.file_path, t.path, t.pattern, t.glob, t.command, t.notebook_path]
    .filter((v) => typeof v === "string");

  // ".env" 또는 ".env.<무엇>" 이 경로/단어 경계에 있으면 차단. ".env.example", "process.env" 등은 통과.
  const envFile = /(^|[\s"'`=:(\\/])\.env(?!\.example\b)(\.[\w.-]+)?(?=$|[\s"'`;|&)<>*\\/])/;

  if (targets.some((s) => envFile.test(s))) {
    process.stderr.write(
      ".env 파일 접근이 차단되었습니다(API 키 보호). 필요한 환경 변수는 .env.example 에서 이름만 확인하세요."
    );
    process.exit(2);
  }
  process.exit(0);
});
