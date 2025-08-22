
export type Customer = {
  id: string
  customer_name: string
  cs_documents_total?: number // Make it optional
  cs_documents_in_process: number
  cs_documents_other: number
  cs_documents_inbox?: number
  cs_last_update: string
  administration_name?: string | null
  administration_mail?: string | null
  source?: string | null
  source_root?: string | null
  is_active?: boolean | null
  cct_processed?: boolean | null
  created_at?: string | null
  last_updated_by?: string | null
}

export type CustomerDocument = {
  id: number
  customer_id: string | number  // Allow both string and number types
  document_name: string
  document_path: string
  document_type: string
  created_at: string
  uuid?: string
}

export type Stats = {
  id: number
  total: number
  total_15: number
  total_in_proces: number
}

export type StatsHistory = {
  id: number
  total: number
  total_15: number
  total_in_proces: number
  created_at: string
}

export type UserProfile = {
  id: string
  email: string
  full_name: string
  badge_color?: string
  created_at: string
  updated_at: string
}

export type UserRole = {
  id: string
  user_id: string
  role: 'admin' | 'user'
  created_at: string
}

export type AppSettings = {
  id: number
  target_all: number | null
  target_invoice: number | null
  target_top: number | null
  history_limit: number | null
  topx: number | null
  last_update_run: string
}
