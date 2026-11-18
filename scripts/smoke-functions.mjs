const base = 'http://127.0.0.1:5001/demo-water/asia-east1'
const fs = 'http://127.0.0.1:8080/v1/projects/demo-water/databases/(default)/documents'
const call = async (fn, data) => (await fetch(`${base}/${fn}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data }) })).json()
const ok = (c, m) => { console.log(c ? 'PASS' : 'FAIL', m); if (!c) process.exitCode = 1 }

// set maxWeeklyCases = 2 (emulator admin bypass)
await fetch(`${fs}/system_settings/global`, { method: 'PATCH', headers: { Authorization: 'Bearer owner', 'content-type': 'application/json' }, body: JSON.stringify({ fields: { maxWeeklyCases: { integerValue: 2 } } }) })

const input = { source: 'line', clientInfo: { name: '林先生', phone: '0912345678', district: '基隆市七堵區', address: 'X 路 1 號', buildingType: 'townhouse' },
  problemReport: { category: 'electrical', description: '開冷氣就跳電', photoUrls: [], preferredTime: '平日下午' } }

const r1 = await call('createCase', input); ok(/^WE-\d{8}-01$/.test(r1.result?.caseId), `create #1 → ${r1.result?.caseId}`)
const r2 = await call('createCase', input); ok(/-02$/.test(r2.result?.caseId ?? ''), `create #2 → ${r2.result?.caseId}`)
const r3 = await call('createCase', input); ok(r3.error?.status === 'RESOURCE_EXHAUSTED', `create #3 blocked by cap → ${r3.error?.message}`)
const bad = await call('createCase', { ...input, clientInfo: { ...input.clientInfo, buildingType: 'castle' } }); ok(bad.error?.status === 'INVALID_ARGUMENT', 'invalid buildingType rejected')

const s1 = await call('getCaseStatus', { caseId: r1.result.caseId, phoneLast3: '678' }); ok(s1.result?.status === 'arranging' && !('clientInfo' in s1.result), `lookup ok → ${JSON.stringify(s1.result)}`)
const s2 = await call('getCaseStatus', { caseId: r1.result.caseId, phoneLast3: '000' }); ok(s2.error?.status === 'NOT_FOUND', 'wrong last3 rejected')
