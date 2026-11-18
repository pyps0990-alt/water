import type { Timestamp } from 'firebase/firestore'

export const CASE_STATUSES = ['arranging', 'pending_survey', 'quoting', 'in_progress', 'unpaid', 'final_paid'] as const
export type CaseStatus = (typeof CASE_STATUSES)[number]

export const STATUS_LABELS: Record<CaseStatus, string> = {
  arranging: '安排中',
  pending_survey: '待場勘',
  quoting: '估價中',
  in_progress: '工程進行中',
  unpaid: '尚未繳款',
  final_paid: '交付尾款',
}

export const SOURCES = ['google_business', 'line', 'ig', 'fb', 'threads', 'direct'] as const
export type Source = (typeof SOURCES)[number]

export const CATEGORIES = ['electrical', 'plumbing', 'fixtures', 'weak_current'] as const
export type Category = (typeof CATEGORIES)[number]
export const CATEGORY_LABELS: Record<Category, string> = {
  electrical: '電力配電工程',
  plumbing: '給排水管路工程',
  fixtures: '衛浴／燈具／設備安裝',
  weak_current: '弱電與全室翻修統包',
}

export const BUILDING_TYPES = ['townhouse', 'apartment', 'storefront', 'office_factory'] as const
export type BuildingType = (typeof BUILDING_TYPES)[number]

export type DayStatus = 'available' | 'busy' | 'closed'

export interface QuoteItem {
  name: string
  spec: string
  unit: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Quotation {
  quoteNumber: string
  issuedDate: string
  validDays: 7 | 14
  items: QuoteItem[]
  subtotal: number
  taxIncluded: boolean
  taxAmount: number
  discount: number
  totalAmount: number
  paymentTerms: string
  warrantyMonths: number
  customNotes: string
}

export interface CaseDoc {
  caseId: string
  status: CaseStatus
  source: Source
  clientInfo: {
    name: string
    phone: string
    lineId?: string
    lineUserId?: string
    district: string
    address: string
    buildingType: BuildingType
  }
  problemReport: {
    category: Category
    description: string
    /** Storage paths: case-uploads/{uploadId}/{n}.webp (admin-readable only). */
    photoPaths: string[]
    preferredTime: string
  }
  surveyNotes?: string
  quotation: Quotation | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ScheduleDoc {
  date: string
  dayStatus: DayStatus
  bookedCount: number
  note?: string
}

export interface PortfolioDoc {
  title: string
  category: Category
  district: string
  beforeImageUrl: string
  afterImageUrl: string
  summary: string
  isFeatured: boolean
  publishToThreads?: boolean
  createdAt: Timestamp
}

export interface SystemSettings {
  maxWeeklyCases: number
  companyInfo: {
    name: string
    taxId: string
    phone: string
    address: string
    bankAccount: string
    lineOfficialUrl: string
  }
  watermarkUrl: string
  unacceptedServices: string[]
  licenses: { name: string; certId: string }[]
  /** Optional banner on the schedule board, e.g. 本週已滿，接受下週場勘。 */
  publicNotice?: string
  googleReviewUrl?: string
}

export interface ReviewItem {
  author: string
  rating: number
  text: string
  relativeTime?: string
}

/** system_settings/reviews — written weekly by syncGoogleReviews. */
export interface ReviewsCache {
  rating: number
  total: number
  items: ReviewItem[]
  url?: string
}

export const DAY_STATUS_LABELS: Record<DayStatus, string> = {
  available: '可預約',
  busy: '繁忙',
  closed: '休息',
}

export const BUILDING_LABELS: Record<BuildingType, string> = {
  townhouse: '透天厝',
  apartment: '公寓／大樓',
  storefront: '店面',
  office_factory: '辦公室／廠房',
}
