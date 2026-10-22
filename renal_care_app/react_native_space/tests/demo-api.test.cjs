const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const Module = require('node:module');
const { resolve } = require('node:path');
const compiled = buildSync({ entryPoints: [resolve('src/demo/api.ts')], bundle: true, platform: 'node', format: 'cjs', write: false }).outputFiles[0].text;
const mod = new Module(resolve('src/demo/api.compiled.cjs'), module);
mod.filename = resolve('src/demo/api.compiled.cjs');
mod.paths = module.paths;
mod._compile(compiled, mod.filename);
const { createDemoApi, DEMO_TOKEN_KEY } = mod.exports;
function setup() {
  const values = new Map();
  const storage = { getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); } };
  const api = createDemoApi(storage, () => new Date('2026-10-22T12:00:00Z'));
  const login = async name => {
    const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: `${name}@demo.com`, password: 'demo123' }) });
    await storage.setItem(DEMO_TOKEN_KEY, result.token);
    return result;
  };
  return { api, login, values };
}

test('tres perfiles y todas las pantallas funcionan sin fetch', async () => {
  const { api, login } = setup();
  for (const [name, modality] of [['herman','Hemodiálisis'], ['maria','Diálisis Peritoneal'], ['carlos','Trasplante Renal']]) {
    await login(name);
    const p = await api('/api/patients/me');
    assert.equal(p.modality, modality);
    assert.match(p.medicalRecordNumber, /^DEMO-/);
    assert.equal((await api('/api/auth/me')).user.id, p.userId);
    const history = await api('/api/patients/me/clinical-history');
    assert.equal(history.labEvolution.creatinine.length, 6);
    assert.equal(history.latestLabs.potassium.status, 'demo');
    assert.equal(history.appointments.length, 2);
    assert.equal((await api('/api/patients/me/treatment')).modality, modality);
    const diet = await api('/api/patients/me/diet');
    assert.ok(diet.recommendedFoods.length > 0);
    assert.ok(Array.isArray(diet.minerals.potassium.tips));
    assert.equal((await api('/api/patients/me/ambulance')).available, name === 'herman');
  }
});
test('sesión inválida y credenciales incorrectas se rechazan', async () => {
  const { api, values } = setup();
  await assert.rejects(api('/api/patients/me'), e => e.status === 401);
  await assert.rejects(api('/api/auth/login', {method:'POST', body:JSON.stringify({email:'herman@demo.com',password:'incorrecta'})}), e => e.status === 401);
  values.set(DEMO_TOKEN_KEY, 'un-token-real-no-es-una-sesion-demo');
  await assert.rejects(api('/api/auth/me'), e => e.status === 401);
});
test('consultas simuladas persistentes y separadas por paciente', async () => {
  const { api, login } = setup();
  await login('herman');
  const item = await api('/api/contact-messages', {method:'POST',body:JSON.stringify({subject:'Prueba ficticia',message:'Consulta ficticia de prueba'})});
  assert.match(item.status, /No enviado/);
  assert.equal((await api('/api/contact-messages')).items.length, 1);
  await login('maria');
  assert.equal((await api('/api/contact-messages')).items.length, 0);
  await login('herman');
  assert.equal((await api('/api/contact-messages')).items[0].id, item.id);
});
test('no se permite salida a rutas externas o funciones desconocidas', async () => {
  const { api, login } = setup();
  await login('herman');
  await assert.rejects(api('https://example.com/api/auth/me'), e => e.status === 404);
  await assert.rejects(api('/api/unknown'), e => e.status === 404);
  await assert.rejects(api('/api/contact-messages', {method:'POST',body:JSON.stringify({subject:'',message:'x'})}), e => e.status === 400);
});
