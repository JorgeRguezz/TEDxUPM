#!/bin/sh
# Bloquea commits o PR con líneas de coautoría (Co-Authored-By / Claude-Session).
# Regla absoluta del proyecto: ver CLAUDE.md y docs/workflows/GIT_WORKFLOW.md.
# Límite conocido: no ve el contenido de -F <archivo> ni --body-file.
input=$(cat)
if printf '%s' "$input" | grep -qE '\bcommit\b|\bpr (create|edit)\b' \
  && printf '%s' "$input" | grep -qiE 'co-authored-by|claude-session'; then
  echo "Bloqueado: este proyecto prohíbe 'Co-Authored-By' y 'Claude-Session' en commits y PR. Quita esas líneas y repite." >&2
  exit 2
fi
exit 0
