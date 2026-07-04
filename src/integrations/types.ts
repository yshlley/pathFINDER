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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          meta: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      careers: {
        Row: {
          created_at: string
          description: string | null
          field: string
          id: string
          last_verified: string | null
          mid_salary_max: number | null
          mid_salary_min: number | null
          name: string
          requirements: string | null
          source_url: string | null
          starting_salary_max: number | null
          starting_salary_min: number | null
          typical_path: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          field: string
          id?: string
          last_verified?: string | null
          mid_salary_max?: number | null
          mid_salary_min?: number | null
          name: string
          requirements?: string | null
          source_url?: string | null
          starting_salary_max?: number | null
          starting_salary_min?: number | null
          typical_path?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          field?: string
          id?: string
          last_verified?: string | null
          mid_salary_max?: number | null
          mid_salary_min?: number | null
          name?: string
          requirements?: string | null
          source_url?: string | null
          starting_salary_max?: number | null
          starting_salary_min?: number | null
          typical_path?: string | null
        }
        Relationships: []
      }
      data_corrections: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          message: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["correction_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          message: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["correction_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          message?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["correction_status"]
          user_id?: string
        }
        Relationships: []
      }
      intake_responses: {
        Row: {
          budget: string
          created_at: string
          current_status: string
          hobbies: string[]
          hobbies_other: string | null
          id: string
          location_city: string | null
          location_other: string | null
          location_province: string | null
          location_region: string | null
          mode: string
          next_step: string
          skills: string[]
          skills_other: string | null
          target_field: string
          target_field_other: string | null
          user_id: string
        }
        Insert: {
          budget: string
          created_at?: string
          current_status: string
          hobbies?: string[]
          hobbies_other?: string | null
          id?: string
          location_city?: string | null
          location_other?: string | null
          location_province?: string | null
          location_region?: string | null
          mode: string
          next_step: string
          skills?: string[]
          skills_other?: string | null
          target_field: string
          target_field_other?: string | null
          user_id: string
        }
        Update: {
          budget?: string
          created_at?: string
          current_status?: string
          hobbies?: string[]
          hobbies_other?: string | null
          id?: string
          location_city?: string | null
          location_other?: string | null
          location_province?: string | null
          location_region?: string | null
          mode?: string
          next_step?: string
          skills?: string[]
          skills_other?: string | null
          target_field?: string
          target_field_other?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          current_status: string | null
          full_name: string
          id: string
          language: string
          location_city: string | null
          location_province: string | null
          location_region: string | null
          section: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_status?: string | null
          full_name: string
          id: string
          language?: string
          location_city?: string | null
          location_province?: string | null
          location_region?: string | null
          section?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_status?: string | null
          full_name?: string
          id?: string
          language?: string
          location_city?: string | null
          location_province?: string | null
          location_region?: string | null
          section?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      saved_plans: {
        Row: {
          created_at: string
          id: string
          intake_id: string | null
          result: Json
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          intake_id?: string | null
          result: Json
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          intake_id?: string | null
          result?: Json
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_plans_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intake_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          amount: string | null
          application_window: string | null
          created_at: string
          deadline: string | null
          eligibility: string | null
          fields: string[]
          id: string
          last_verified: string | null
          name: string
          provider: string
          regions: string[]
          source_url: string | null
          valid_until: string | null
        }
        Insert: {
          amount?: string | null
          application_window?: string | null
          created_at?: string
          deadline?: string | null
          eligibility?: string | null
          fields?: string[]
          id?: string
          last_verified?: string | null
          name: string
          provider: string
          regions?: string[]
          source_url?: string | null
          valid_until?: string | null
        }
        Update: {
          amount?: string | null
          application_window?: string | null
          created_at?: string
          deadline?: string | null
          eligibility?: string | null
          fields?: string[]
          id?: string
          last_verified?: string | null
          name?: string
          provider?: string
          regions?: string[]
          source_url?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          accreditation: string | null
          city: string | null
          cons: string | null
          created_at: string
          fields: string[]
          id: string
          last_verified: string | null
          name: string
          programs: string[]
          pros: string | null
          region: string | null
          scholarships_available: boolean
          source_url: string | null
          tuition_max: number | null
          tuition_min: number | null
          type: string
          valid_until: string | null
        }
        Insert: {
          accreditation?: string | null
          city?: string | null
          cons?: string | null
          created_at?: string
          fields?: string[]
          id?: string
          last_verified?: string | null
          name: string
          programs?: string[]
          pros?: string | null
          region?: string | null
          scholarships_available?: boolean
          source_url?: string | null
          tuition_max?: number | null
          tuition_min?: number | null
          type: string
          valid_until?: string | null
        }
        Update: {
          accreditation?: string | null
          city?: string | null
          cons?: string | null
          created_at?: string
          fields?: string[]
          id?: string
          last_verified?: string | null
          name?: string
          programs?: string[]
          pros?: string | null
          region?: string | null
          scholarships_available?: boolean
          source_url?: string | null
          tuition_max?: number | null
          tuition_min?: number | null
          type?: string
          valid_until?: string | null
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
          role: Database["public"]["Enums"]["app_role"]
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
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "counselor" | "admin"
      correction_status: "pending" | "approved" | "rejected"
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
      app_role: ["student", "counselor", "admin"],
      correction_status: ["pending", "approved", "rejected"],
    },
  },
} as const
