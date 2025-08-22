export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
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
          cct_processed: boolean | null
          created_at: string | null
          cs_documents_in_process: number | null
          cs_documents_inbox: number | null
          cs_documents_other: number | null
          cs_last_update: string | null
          customer_name: string | null
          id: string
          is_active: boolean | null
          last_updated_by: string | null
          source: string | null
          source_root: string | null
        }
        Insert: {
          administration_mail?: string | null
          administration_name?: string | null
          cct_processed?: boolean | null
          created_at?: string | null
          cs_documents_in_process?: number | null
          cs_documents_inbox?: number | null
          cs_documents_other?: number | null
          cs_last_update?: string | null
          customer_name?: string | null
          id: string
          is_active?: boolean | null
          last_updated_by?: string | null
          source?: string | null
          source_root?: string | null
        }
        Update: {
          administration_mail?: string | null
          administration_name?: string | null
          cct_processed?: boolean | null
          created_at?: string | null
          cs_documents_in_process?: number | null
          cs_documents_inbox?: number | null
          cs_documents_other?: number | null
          cs_last_update?: string | null
          customer_name?: string | null
          id?: string
          is_active?: boolean | null
          last_updated_by?: string | null
          source?: string | null
          source_root?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          badge_color: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          badge_color?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          badge_color?: string | null
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
          topx: number | null
        }
        Insert: {
          history_limit?: number | null
          id?: number
          last_update_run?: string
          target_all?: number | null
          target_invoice?: number | null
          target_top?: number | null
          topx?: number | null
        }
        Update: {
          history_limit?: number | null
          id?: number
          last_update_run?: string
          target_all?: number | null
          target_invoice?: number | null
          target_top?: number | null
          topx?: number | null
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
          cct_processed: boolean | null
          created_at: string | null
          cs_documents_in_process: number | null
          cs_documents_other: number | null
          cs_documents_total: number | null
          cs_last_update: string | null
          customer_name: string | null
          id: string | null
          is_active: boolean | null
          source: string | null
          source_root: string | null
          str_cs_documents_total: string | null
        }
        Insert: {
          administration_mail?: string | null
          administration_name?: string | null
          cct_processed?: boolean | null
          created_at?: string | null
          cs_documents_in_process?: number | null
          cs_documents_other?: number | null
          cs_documents_total?: never
          cs_last_update?: string | null
          customer_name?: string | null
          id?: string | null
          is_active?: boolean | null
          source?: string | null
          source_root?: string | null
          str_cs_documents_total?: never
        }
        Update: {
          administration_mail?: string | null
          administration_name?: string | null
          cct_processed?: boolean | null
          created_at?: string | null
          cs_documents_in_process?: number | null
          cs_documents_other?: number | null
          cs_documents_total?: never
          cs_last_update?: string | null
          customer_name?: string | null
          id?: string | null
          is_active?: boolean | null
          source?: string | null
          source_root?: string | null
          str_cs_documents_total?: never
        }
        Relationships: []
      }
      cct_stats: {
        Row: {
          id: number | null
          total: number | null
          total_15: number | null
          total_in_proces: number | null
          total_in_process_15: number | null
          total_other: number | null
          total_other_15: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_cct_customers: {
        Args: Record<PropertyKey, never>
        Returns: {
          administration_mail: string
          administration_name: string
          cct_processed: boolean
          created_at: string
          cs_documents_in_process: number
          cs_documents_inbox: number
          cs_documents_other: number
          cs_last_update: string
          customer_name: string
          id: string
          is_active: boolean
          last_updated_by: string
          source: string
          source_root: string
        }[]
      }
      get_cct_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          total: number
          total_15: number
          total_in_proces: number
          total_in_proces_15: number
          total_other: number
          total_other_15: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
