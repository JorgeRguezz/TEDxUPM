#!/bin/sh
# Bloquea commits o PR con líneas de coautoría (Co-Authored-By / Claude-Session).
# Regla absoluta del proyecto: ver CLAUDE.md y docs/workflows/GIT_WORKFLOW.md.
input=$(cat)
if printf '%s' "$input" | grep -qE 'git[^"]* commit|gh[^"]* pr (create|edit)'; then
  if printf '%s' "$input" | grep -qiE 'co-authored-by|claude-session'; then
    echo "Bloqueado: este proyecto prohíbe 'Co-Authored-By' y 'Claude-Session' en commits y PR. Quita esas líneas y repite." >&2
    exit 2
  fi
fi
exit 0
