const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require(process.env.DREAMLOG_TYPESCRIPT_PATH || 'typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
const values = new Map();
let generationCalls = 0;
const storage = {
  async getItem(key) { await Promise.resolve(); return values.get(key) ?? null; },
  async setItem(key, value) { await Promise.resolve(); values.set(key, value); },
  async removeItem(key) { values.delete(key); },
  async multiGet(keys) { return Promise.all(keys.map(async k => [k, await this.getItem(k)])); },
  async multiSet(entries) { for (const [k, v] of entries) await this.setItem(k, v); },
  async multiRemove(keys) { keys.forEach(k => values.delete(k)); },
};
const native = {
  async status() { return { available: true, message: 'ready' }; },
  async generate() {
    generationCalls++;
    return '1. 주요 테마: 변화, 자유\n2. 한 줄 요약: 새로운 시작\n3. 심리적 해석: 첫 문단\n이어지는 문단\n4. 조언:\n- 일기를 써보세요\n- 쉬어보세요\n5. 신뢰도: 72%';
  },
  cancel() {},
};

function load(file) {
  file = path.resolve(file);
  if (!path.extname(file)) file += '.ts';
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const source = fs.readFileSync(file, 'utf8');
  const output = ts.transpileModule(source, { fileName: file, compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  }, reportDiagnostics: true });
  const errors = (output.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
  assert.equal(errors.length, 0, file + ': ' + errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')));
  const localRequire = name => {
    if (name === '@react-native-async-storage/async-storage') return storage;
    if (name === 'react-native') return { Platform: { OS: 'ios' }, NativeModules: { DreamOnDeviceAI: native } };
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name));
    return require(name);
  };
  vm.runInThisContext('(function(require,module,exports,__DEV__){' + output.outputText + '\n})', { filename: file })(localRequire, module, module.exports, false);
  return module.exports;
}

async function main() {
  const { createDialoguePlayer, dialogueDelay } = load(root + '/src/utils/dialoguePlayer.ts');
  const pending = new Map(); let timerId = 0; let completions = 0; const typed = [];
  const schedule = callback => { const id = ++timerId; pending.set(id, callback); return id; };
  const cancel = id => pending.delete(id);
  const tick = () => { const [id, callback] = pending.entries().next().value; pending.delete(id); callback(); };
  const player = createDialoguePlayer('몽이🌙!', value => typed.push(value), () => completions++, schedule, cancel);
  player.start(); player.start(); assert.equal(pending.size, 1);
  tick(); assert.equal(typed.at(-1), '몽');
  tick(); assert.equal(typed.at(-1), '몽이');
  tick(); assert.equal(typed.at(-1), '몽이🌙', 'surrogate pair stays intact');
  assert.equal(player.reveal(), true); assert.equal(typed.at(-1), '몽이🌙!');
  assert.equal(completions, 1); assert.equal(pending.size, 0);
  assert.equal(player.reveal(), false); assert.equal(completions, 1);
  player.start(); assert.equal(pending.size, 0);
  const stopped = createDialoguePlayer('중단', () => {}, () => {}, schedule, cancel);
  stopped.start(); stopped.stop(); assert.equal(pending.size, 0);
  const natural = createDialoguePlayer('안녕', value => typed.push(value), () => completions++, schedule, cancel);
  natural.start(); tick(); tick(); assert.equal(completions, 2); assert.equal(pending.size, 0);
  const empty = createDialoguePlayer('', () => {}, () => completions++, schedule, cancel);
  empty.start(); empty.start(); assert.equal(completions, 3);
  assert.ok(dialogueDelay('.') > dialogueDelay('몽'));
  assert.ok(dialogueDelay(',') > dialogueDelay('몽'));
  const { OnboardingService } = load(root + '/src/services/OnboardingService.ts');
  assert.equal(await OnboardingService.hasCompletedOnboarding(), false);
  values.set('has_completed_onboarding', 'true');
  assert.equal(await OnboardingService.hasCompletedOnboarding(), false, 'existing users see Mongi tutorial once');
  await OnboardingService.completeOnboarding();
  assert.equal(await OnboardingService.hasCompletedOnboarding(), true);
  assert.equal(await OnboardingService.hasAcceptedPrivacy(), false, 'tutorial does not silently record privacy consent');
  values.set('mongi_tutorial_version', 'old');
  assert.equal(await OnboardingService.hasCompletedOnboarding(), false);
  await OnboardingService.reset();
  assert.equal(values.has('mongi_tutorial_version'), false);
  const { MONGI_TUTORIAL } = load(root + '/src/data/mongiTutorial.ts');
  assert.equal(MONGI_TUTORIAL.length, 5);
  assert.equal(new Set(MONGI_TUTORIAL.map(step => step.id)).size, 5);
  for (const step of MONGI_TUTORIAL) assert.ok(step.title && step.speech && step.detail && step.mood);
  const { getCompanionReaction, getCompanionFrame, getCompanionSpriteLocation, canAnimateCompanion, COMPANION_FRAMES, TOUCH_MOODS } = load(root + '/src/utils/companionMood.ts');
  assert.equal(getCompanionReaction({}).mood, 'idle');
  assert.equal(getCompanionReaction({ emotion: 'joy' }).mood, 'happy');
  assert.equal(getCompanionReaction({ emotion: 'neutral' }).mood, 'calm');
  for (const [emotion, mood] of [['sadness', 'sad'], ['fear', 'worried'], ['anger', 'determined']]) assert.equal(getCompanionReaction({ emotion }).mood, mood);
  assert.equal(getCompanionReaction({ emotion: 'surprise' }).mood, 'surprised');
  assert.equal(getCompanionReaction({ emotion: 'unknown' }).mood, 'idle');
  assert.equal(getCompanionReaction({ emotion: 'joy', interaction: 'calm' }).mood, 'calm');
  assert.equal(getCompanionReaction({ celebrating: true, interaction: 'calm' }).mood, 'celebrate');
  assert.equal(getCompanionReaction({ busy: true, celebrating: true, interaction: 'happy' }).mood, 'thinking');
  assert.equal(getCompanionFrame('idle'), null);
  // Idle must never briefly switch the entire body to the closed-eye artwork.
  for (let i = 0; i < 100; i++) assert.equal(getCompanionFrame('idle'), null);
  assert.deepEqual(Object.values(COMPANION_FRAMES).sort((a,b) => a-b), Array.from({length:12},(_,i) => i));
  for (const mood of Object.keys(COMPANION_FRAMES)) assert.equal(getCompanionFrame(mood), COMPANION_FRAMES[mood]);
  assert.equal(getCompanionSpriteLocation('idle'), null);
  assert.deepEqual(getCompanionSpriteLocation('shy'), {sheet:1,column:0,row:0});
  assert.deepEqual(getCompanionSpriteLocation('determined'), {sheet:1,column:2,row:1});
  for (const mood of Object.keys(COMPANION_FRAMES)) {
    const position = getCompanionSpriteLocation(mood);
    assert.ok(position.sheet >= 0 && position.sheet < 2 && position.column < 3 && position.row < 2);
    assert.equal(getCompanionReaction({interaction:mood}).mood, mood);
    assert.ok(getCompanionReaction({interaction:mood}).label);
  }
  assert.equal(new Set(TOUCH_MOODS).size, 6);
  assert.ok(TOUCH_MOODS.includes('shy') && TOUCH_MOODS.includes('curious') && TOUCH_MOODS.includes('sleepy'));
  for (const name of ['mongi-emotions.png', 'mongi-emotions-extra.png']) {
    const png = fs.readFileSync(root + '/assets/dream-world/' + name);
    assert.equal(png.subarray(1,4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), 1536, 'three 512px sprite columns');
    assert.equal(png.readUInt32BE(20), 1024, 'two 512px sprite rows');
    assert.equal(png[25], 6, 'RGBA atlas with alpha');
  }
  assert.equal(canAnimateCompanion(false, true, true), true);
  for (const args of [[true,true,true], [false,false,true], [false,true,false], [true,false,false]]) assert.equal(canAnimateCompanion(...args), false);
  const { DREAM_SYMBOLS, searchSymbols } = load(root + '/src/data/dreamSymbols.ts');
  const { getSymbolVisual, getSymbolColumns } = load(root + '/src/utils/symbolVisuals.ts');
  const glyphs = require(root + '/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json');
  assert.equal(DREAM_SYMBOLS.length, 28);
  for (const symbol of DREAM_SYMBOLS) {
    assert.ok(Object.hasOwn(glyphs, getSymbolVisual(symbol.id, symbol.category).icon), 'valid symbol illustration: ' + symbol.id);
  }
  assert.equal(getSymbolVisual('water', '자연').landscape, 'lake');
  assert.equal(getSymbolVisual('house', '장소').landscape, 'garden');
  assert.ok(Object.hasOwn(glyphs, getSymbolVisual('future-symbol', '미분류').icon));
  assert.equal(getSymbolColumns(390), 2);
  assert.equal(getSymbolColumns(320), 1);
  assert.equal(getSymbolColumns(820, 1.5), 1);
  assert.ok(searchSymbols('바다', '전체').some(s => s.id === 'ocean'));
  assert.ok(searchSymbols('', '동물').every(s => s.category === '동물'));
  assert.equal(searchSymbols('존재하지않는상징12345', '전체').length, 0);
  const { getDreamScene, getConstellationProgress } = load(root + '/src/utils/dreamWorld.ts');
  assert.equal(getDreamScene('바다에서 수영했다').id, 'sea');
  assert.equal(getDreamScene('나무가 많은 숲').id, 'forest');
  assert.equal(getDreamScene('', ['날개', '구름']).id, 'sky');
  assert.equal(getDreamScene('학교 가는 버스').id, 'city');
  assert.equal(getDreamScene('').id, 'night');
  assert.deepEqual(getConstellationProgress(0), { total: 0, chapter: 1, stars: 0, completed: 0 });
  assert.deepEqual(getConstellationProgress(6), { total: 6, chapter: 2, stars: 0, completed: 1 });
  assert.equal(getConstellationProgress(13).stars, 1);
  assert.equal(getConstellationProgress(-1).total, 0);
  assert.equal(getConstellationProgress(NaN).total, 0);
  const reactNativeVersion = require(root + '/node_modules/react-native/package.json').version;
  const podLock = fs.readFileSync(root + '/ios/Podfile.lock', 'utf8');
  assert.equal(podLock.match(/^  - hermes-engine \(([^)]+)\):/m)?.[1], reactNativeVersion,
    'Hermes Podfile.lock version must match React Native for clean EAS builds');
  const manifestPath = root + '/ios/Pods/Manifest.lock';
  if (fs.existsSync(manifestPath)) {
    assert.equal(fs.readFileSync(manifestPath, 'utf8'), podLock,
      'Installed Pods must match Podfile.lock; sync pods before native verification');
  }
  const { parseBackup, escapeHTML } = load(root + '/src/services/BackupValidation.ts');
  const { DreamStorage } = load(root + '/src/services/DreamStorage.ts');
  const { MemoryStorage } = load(root + '/src/services/MemoryStorage.ts');
  const { localDateKey } = load(root + '/src/utils/dreamHelpers.ts');
  const record = { id: 'one', content: '하늘을 나는 꿈', emotion: 'joy', interpretation: '해석', date: '2026-10-22', createdAt: '2026-10-22T00:00:00Z', confidence: 0.6, tags: ['여행'], dreamType: 'lucid', vividness: 8, sleepQuality: 6 };
  assert.equal(parseBackup(JSON.stringify({ dreams: [record] })).dreams[0].tags[0], '여행');
  for (const broken of [null, {}, { dreams: [null] }, { dreams: [{ ...record, confidence: 10 }] }, { dreams: [{ ...record, tags: 'bad' }] }, { dreams: [], memories: [{}] }]) {
    assert.throws(() => parseBackup(JSON.stringify(broken)));
  }
  assert.equal(escapeHTML('<script>"&'), '&lt;script&gt;&quot;&amp;');
  await Promise.all(Array.from({ length: 25 }, (_, n) => DreamStorage.saveDream({ ...record, id: String(n) })));
  assert.equal((await DreamStorage.getDreams()).length, 25, 'concurrent saves must not lose records');
  const memory = { id: 'memory', description: '기억', clues: ['단서'], questions: ['질문'], status: 'completed', date: record.date, createdAt: record.createdAt };
  await Promise.all(Array.from({ length: 10 }, (_, n) => MemoryStorage.saveMemory({ ...memory, id: String(n) })));
  assert.equal((await MemoryStorage.getMemories()).length, 10);
  values.set('dream_records', '{broken');
  await assert.rejects(() => DreamStorage.saveDream(record));
  assert.equal(values.get('dream_records'), '{broken', 'corrupt data must not be overwritten');
  values.delete('dream_records');
  assert.equal(localDateKey(new Date(2026, 9, 22, 0, 5)), '2026-10-22');
  const { dreamInterpreter } = load(root + '/src/services/DreamInterpreter.ts');
  const result = await dreamInterpreter.analyzeDream(record.content, 'joy');
  assert.equal(result.source, 'ai');
  assert.equal(result.confidence, 0.72, 'section number must not be parsed as confidence');
  assert.ok(result.interpretation.includes('이어지는 문단'));
  assert.equal(result.recommendations.length, 2);
  assert.equal(generationCalls, 1);
  native.status = async () => ({ available: false, message: 'not supported' });
  const fallback = await dreamInterpreter.analyzeDream(record.content, 'joy');
  assert.equal(fallback.source, 'offline');
  assert.equal(generationCalls, 1, 'unavailable AI must not generate');
  assert.ok(!fs.readFileSync(root + '/src/services/LocalAIService.ts', 'utf8').includes('fetch('));
  console.log('PASS: backup validation, HTML escaping, concurrent saves, corruption preservation, local date, AI parsing and offline fallback');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
