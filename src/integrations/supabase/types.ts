export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cct_stats_hist: {
        Row: {
          created_at: string | null
          id: number
          total: number | null
          total_15: number | null
          total_in_proces: number | null
          total_in_proces_15: number | null
          total_other: number | null
          total_other_15: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          total?: number | null
          total_15?: number | null
          total_in_proces?: number | null
          total_in_proces_15?: number | null
          total_other?: number | null
          total_other_15?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          total?: number | null
          total_15?: number | null
          total_in_proces?: number | null
          total_in_proces_15?: number | null
          total_other?: number | null
          total_other_15?: number | null
        }
        Relationships: []
      }
      customer_documents: {
        Row: {
          created_at: string | null
          customer_id: string | null
          document_name: string | null
          document_path: string | null
          document_type: string | null
          id: number
          uuid: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          document_name?: string | null
          document_path?: string | null
          document_type?: string | null
          id?: number
          uuid?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          document_name?: string | null
          document_path?: string | null
          document_type?: string | null
          id?: number
          uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "cct_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          administration_mail: string | null
          administration_name: string | null
          created_at: string | null
          cs_documents_in_process: number | null
          cs_documents_other: number | null
          cs_last_update: string | null
          customer_name: string | null
          id: string
          is_active: boolean | null
          source: string | null
          source_root: string | null
        }
        Insert: {
          administration_mail?: string | null
          administration_name?: string | null
          created_at?: string | null
          cs_documents_in_process?: number | null
          cs_documents_other?: number | null
          cs_last_update?: string | null
          customer_name?: string | null
          id: string
          is_active?: boolean | null
          source?: string | null
          source_root?: string | null
        }
        Update: {
          administration_mail?: string | null
          administration_name?: string | null
          created_at?: string | null
          cs_documents_in_process?: number | null
          cs_documents_other?: number | null
          cs_last_update?: string | null
          customer_name?: string | null
          id?: string
          is_active?: boolean | null
          source?: string | null
          source_root?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          history_limit: number | null
          id: number
          last_update_run: string
          target_all: number | null
          target_invoice: number | null
          target_top: number | null
        }
        Insert: {
          history_limit?: number | null
          id?: number
          last_update_run?: string
          target_all?: number | null
          target_invoice?: number | null
          target_top?: number | null
        }
        Update: {
          history_limit?: number | null
          id?: number
          last_update_run?: string
          target_all?: number | null
          target_invoice?: number | null
          target_top?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      cct_customers: {
        Row: {
          administration_mail: string | null
          administration_name: string | null
          created_at: string | null
          cs_documents_in_process: number | null
          cs_documents_other: number | null
          cs_last_update: string | null
          customer_name: string | null
          id: string | null
          is_active: boolean | null
          source: string | null
          source_root: string | null
        }
        Insert: {
          administration_mail?: string | null
          administration_name?: string | null
          created_at?: string | null
          cs_documents_in_process?: number | null
          cs_documents_other?: number | null
          cs_last_update?: string | null
          customer_name?: string | null
          id?: string | null
          is_active?: boolean | null
          source?: string | null
          source_root?: string | null
        }
        Update: {
          administration_mail?: string | null
          administration_name?: string | null
          created_at?: string | null
          cs_documents_in_process?: number | null
          cs_documents_other?: number | null
          cs_last_update?: string | null
          customer_name?: string | null
          id?: string | null
          is_active?: boolean | null
          source?: string | null
          source_root?: string | null
        }
        Relationships: []
      }
      cct_stats: {
        Row: {
          id: number | null
          total: number | null
          total_15: number | null
          total_in_proces: number | null
          total_in_proces_15: number | null
          total_other: number | null
          total_other_15: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
