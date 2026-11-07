# Setup global de Claude Code

Orquestación main session + subagentes (Explore, researcher, implementer, reviewer, validator).

## Instalar en otro entorno

```bash
mkdir -p ~/.claude/agents
cp claude-setup/CLAUDE.md ~/.claude/CLAUDE.md
cp claude-setup/agents/*.md ~/.claude/agents/
```

Ojo: `cp` sobrescribe un `~/.claude/CLAUDE.md` existente; haz backup antes si ya tienes uno.

Opcional: el modo Ponytail que menciona el CLAUDE.md es un plugin aparte; instálalo desde `/plugin` si lo quieres.
