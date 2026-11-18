// Reads the created case from the emulator to confirm source + photo path were stored.
const fs = 'http://127.0.0.1:8080/v1/projects/demo-water/databases/(default)/documents'
const r = await (await fetch(`${fs}/cases`, { headers: { Authorization: 'Bearer owner' } })).json()
const d = r.documents?.[0]?.fields
const paths = d?.problemReport?.mapValue?.fields?.photoPaths?.arrayValue?.values?.map((v) => v.stringValue) ?? []
const ok = (c, m) => { console.log(c ? 'PASS' : 'FAIL', m); if (!c) process.exitCode = 1 }
ok(d?.source?.stringValue === 'ig', `source stored as ig`)
ok(paths.length === 1 && /^case-uploads\/.+\/1\.webp$/.test(paths[0]), `photo stored as ${paths[0]}`)
const meta = await (await fetch(`http://127.0.0.1:9199/v0/b/demo-water.appspot.com/o/${encodeURIComponent(paths[0])}`, { headers: { Authorization: 'Bearer owner' } })).json()
ok(meta.contentType === 'image/webp' && Number(meta.size) < 250000, `uploaded file is webp, ${meta.size} bytes`)
