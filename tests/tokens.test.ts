import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

// docs/diseno.md §2: los tamaños de letra salen solo de los tokens --letra-* de Layout.astro.
const raiz = new URL('../src/', import.meta.url);
const astro = (readdirSync(raiz, { recursive: true }) as string[]).filter((f) => f.endsWith('.astro'));
const layout = readFileSync(new URL('layouts/Layout.astro', raiz), 'utf8');
const definidos = new Set([...layout.matchAll(/(--letra-[a-z-]+):/g)].map((m) => m[1]));

test('ningún componente escribe un tamaño de letra a mano', () => {
  const sueltos = astro.flatMap((f) =>
    [...readFileSync(new URL(f, raiz), 'utf8').matchAll(/font-size:\s*([^;}]+)/g)]
      .map((m) => m[1].trim())
      .filter((v) => !/^var\(--letra-[a-z-]+\)$/.test(v))
      .map((v) => `${f}: font-size: ${v}`));
  assert.deepEqual(sueltos, [], 'Usa un token --letra-* (docs/diseno.md §2) en lugar de un valor fijo.');
});

test('cada token de letra usado existe en Layout.astro', () => {
  const usados = astro.flatMap((f) => [...readFileSync(new URL(f, raiz), 'utf8').matchAll(/var\((--letra-[a-z-]+)\)/g)].map((m) => `${f}: ${m[1]}`));
  assert.ok(usados.length > 0);
  assert.deepEqual(usados.filter((u) => !definidos.has(u.split(': ')[1])), []);
});
