import type { BuildingType, Category, Source } from '../types/models'

export const MAX_PHOTOS = 5

export interface CaseInput {
  source: Source
  clientInfo: { name: string; phone: string; lineId: string; district: string; address: string; buildingType: BuildingType }
  problemReport: { category: Category; description: string; preferredTime: string }
}

function randomId(len = 22): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len))
  const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  return Array.from(bytes, (b) => abc[b & 63]).join('')
}

/** Compress to WebP (≤1600px, ~200KB) in the browser (Manual §3.1). */
export async function compressPhoto(file: File): Promise<File> {
  const { default: imageCompression } = await import('browser-image-compression')
  return imageCompression(file, { maxWidthOrHeight: 1600, maxSizeMB: 0.2, fileType: 'image/webp', useWebWorker: true, initialQuality: 0.8 })
}

export async function submitCase(input: CaseInput, photos: File[], onProgress?: (msg: string) => void): Promise<string> {
  const { uploadFile, callFn } = await import('./firebaseExtras')
  const uploadId = randomId()
  const photoPaths: string[] = []
  for (const [i, f] of photos.slice(0, MAX_PHOTOS).entries()) {
    onProgress?.(`上傳照片 ${i + 1}／${photos.length}…`)
    const path = `case-uploads/${uploadId}/${i + 1}.webp`
    await uploadFile(path, f, f.type || 'image/webp')
    photoPaths.push(path)
  }
  onProgress?.('送出資料中…')
  const res = await callFn<unknown, { caseId: string }>('createCase', { ...input, problemReport: { ...input.problemReport, photoPaths } })
  return res.caseId
}
