#!/bin/sh
# Impide que un agente lea, edite o suba archivos .env (se permite .env.example).
input=$(cat)
if printf '%s' "$input" | grep -qE '(^|[^A-Za-z0-9_.-])\.env(\.[A-Za-z]+)?([^A-Za-z0-9_.-]|$)' \
  && ! printf '%s' "$input" | grep -qE '\.env\.example'; then
  echo "Bloqueado: los archivos .env contienen secretos y los agentes no pueden tocarlos. Usa 'vercel env' o pide a una persona que lo haga." >&2
  exit 2
fi
exit 0
