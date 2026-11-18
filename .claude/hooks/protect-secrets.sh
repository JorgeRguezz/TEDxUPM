#!/bin/sh
# Impide que un agente lea, edite o use en comandos los archivos de entorno con secretos
# (dotenv y variantes como .local o .production; se permiten los *.example).
# Solo mira la ruta (Read/Edit/Write) o el comando (Bash), no el contenido que se escribe.
exec python3 -c '
import json, re, sys
t = json.load(sys.stdin).get("tool_input", {})
target = " ".join(str(t.get(k, "")) for k in ("file_path", "command"))
hits = [m for m in re.findall(r"(?<![\w.-])\.(?:env)(?:\.[\w-]+)*(?![\w-])", target) if not m.endswith(".example")]
if hits:
    sys.stderr.write("Bloqueado: los archivos de entorno contienen secretos y los agentes no pueden tocarlos. Usa vercel env o pide a una persona que lo haga.\n")
    sys.exit(2)
'
