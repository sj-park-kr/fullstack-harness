"""Install/update Matt Pocock skills as mp-<name>.

Usage: python .claude/scripts/update-mp-skills.py [local-clone-path]
Without a path, shallow-clones https://github.com/mattpocock/skills.
"""
import json, re, shutil, subprocess, sys, tempfile
from pathlib import Path

REPO = "https://github.com/mattpocock/skills"
EXCLUDE = set()          # upstream names to skip, e.g. {"claude-handoff"}
MODEL_INVOCABLE = {"grilling"}  # everything else is user-invocable-only
P = "mp-"

root = Path(__file__).resolve().parents[2]
skills_dir = root / ".claude" / "skills"
settings_path = root / ".claude" / "settings.json"

tmp = None
if len(sys.argv) > 1:
    src = Path(sys.argv[1])
else:
    tmp = tempfile.mkdtemp()
    subprocess.run(["git", "clone", "--depth", "1", "-q", REPO, tmp], check=True)
    src = Path(tmp)

found = {d.parent.name: d.parent for d in (src / "skills").glob("*/*/SKILL.md")
         if d.parent.parent.name != "deprecated" and d.parent.name not in EXCLUDE}
names = sorted(found)
alt = "|".join(map(re.escape, sorted(names, key=len, reverse=True)))
rules = [
    (re.compile(rf"(?m)^name:\s*({alt})\s*$"), rf"name: {P}\1"),
    (re.compile(rf"(?<![\w./-])/({alt})(?![\w/-])"), rf"/{P}\1"),
    (re.compile(rf"\"({alt})\""), rf'"{P}\1"'),  # Skill tool calls
    # `name` but not labels like `research`/`prototype`, and not plain words
    (re.compile(rf"(?<![/\w])`(?!(?:pr|prototype)`)({alt})`(?!/)"), rf"`{P}\1`"),
]

for d in skills_dir.glob(f"{P}*"):
    shutil.rmtree(d)
for n in names:
    dst = skills_dir / (P + n)
    shutil.copytree(found[n], dst)
    for f in dst.rglob("*"):
        if f.suffix in {".md", ".sh", ".yaml", ".yml", ".txt"}:
            t = f.read_text(encoding="utf-8")
            for rx, rep in rules[:2]:
                t = rx.sub(rep, t)
            # wayfinder ticket labels (`research`, ...) are data, not skills
            t = "\n".join(l if "wayfinder:" in l else rules[2][0].sub(rules[2][1], l)
                          for l in t.split("\n"))
            f.write_text(t, encoding="utf-8", newline="\n")
shutil.copy(src / "LICENSE", skills_dir / "LICENSE-mattpocock.txt")
rev = subprocess.run(["git", "-C", str(src), "rev-parse", "--short", "HEAD"],
                     capture_output=True, text=True).stdout.strip()

s = json.loads(settings_path.read_text(encoding="utf-8"))
# drop old mp-* and unprefixed upstream keys (code-review is also a built-in)
ov = {k: v for k, v in s.get("skillOverrides", {}).items()
      if not k.startswith(P) and (k not in names or k == "code-review")}
for n in names:
    head = (found[n] / "SKILL.md").read_text(encoding="utf-8").split("---")[1]
    if n not in MODEL_INVOCABLE and "disable-model-invocation: true" not in head:
        ov[P + n] = "user-invocable-only"
s["skillOverrides"] = ov
settings_path.write_text(json.dumps(s, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

if tmp:
    shutil.rmtree(tmp, ignore_errors=True)
print(f"{len(names)} skills -> {P}* (upstream {rev})")
