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
      ai_usage_log: {
        Row: {
          charged_paise: number | null
          created_at: string
          error_message: string | null
          estimated_cost_paise: number | null
          function_name: string
          id: string
          input_tokens: number | null
          metadata: Json | null
          model: string | null
          output_tokens: number | null
          status: string | null
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          charged_paise?: number | null
          created_at?: string
          error_message?: string | null
          estimated_cost_paise?: number | null
          function_name: string
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model?: string | null
          output_tokens?: number | null
          status?: string | null
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          charged_paise?: number | null
          created_at?: string
          error_message?: string | null
          estimated_cost_paise?: number | null
          function_name?: string
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model?: string | null
          output_tokens?: number | null
          status?: string | null
          total_tokens?: number | null
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount_paise: number
          balance_after_paise: number
          created_at: string
          credits_paise: number | null
          description: string | null
          id: string
          kind: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          amount_paise: number
          balance_after_paise: number
          created_at?: string
          credits_paise?: number | null
          description?: string | null
          id?: string
          kind: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          amount_paise?: number
          balance_after_paise?: number
          created_at?: string
          credits_paise?: number | null
          description?: string | null
          id?: string
          kind?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_themes: {
        Row: {
          affirmation: string | null
          created_at: string
          description: string | null
          focus_areas: Json
          id: string
          max_depth: number
          metadata: Json
          sequence_no: number
          theme_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affirmation?: string | null
          created_at?: string
          description?: string | null
          focus_areas?: Json
          id?: string
          max_depth?: number
          metadata?: Json
          sequence_no?: number
          theme_date?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affirmation?: string | null
          created_at?: string
          description?: string | null
          focus_areas?: Json
          id?: string
          max_depth?: number
          metadata?: Json
          sequence_no?: number
          theme_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      guide_commitments: {
        Row: {
          chain_parent_id: string | null
          check_back_at: string
          created_at: string
          id: string
          master_id: string | null
          mode: string | null
          outcome_note: string | null
          session_id: string | null
          source_message: string | null
          status: string
          summary: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chain_parent_id?: string | null
          check_back_at?: string
          created_at?: string
          id?: string
          master_id?: string | null
          mode?: string | null
          outcome_note?: string | null
          session_id?: string | null
          source_message?: string | null
          status?: string
          summary: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chain_parent_id?: string | null
          check_back_at?: string
          created_at?: string
          id?: string
          master_id?: string | null
          mode?: string | null
          outcome_note?: string | null
          session_id?: string | null
          source_message?: string | null
          status?: string
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_commitments_chain_parent_id_fkey"
            columns: ["chain_parent_id"]
            isOneToOne: false
            referencedRelation: "guide_commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_commitments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          mood: string | null
          session_id: string | null
          tags: string[]
          thread_id: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood?: string | null
          session_id?: string | null
          tags?: string[]
          thread_id?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood?: string | null
          session_id?: string | null
          tags?: string[]
          thread_id?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "journal_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_threads: {
        Row: {
          created_at: string
          entry_count: number
          id: string
          intention: string | null
          last_entry_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_count?: number
          id?: string
          intention?: string | null
          last_entry_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_count?: number
          id?: string
          intention?: string | null
          last_entry_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mirror_readings: {
        Row: {
          band: string
          confidence: number
          created_at: string
          day_zero: boolean
          evidence: string | null
          id: string
          mirror_number: number
          mirror_slug: string
          module: string
          reading_note: string | null
          score: number
          source: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          band?: string
          confidence?: number
          created_at?: string
          day_zero?: boolean
          evidence?: string | null
          id?: string
          mirror_number: number
          mirror_slug: string
          module: string
          reading_note?: string | null
          score?: number
          source?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          band?: string
          confidence?: number
          created_at?: string
          day_zero?: boolean
          evidence?: string | null
          id?: string
          mirror_number?: number
          mirror_slug?: string
          module?: string
          reading_note?: string | null
          score?: number
          source?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      personal_practice_schedule: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string
          day_date: string
          description: string | null
          duration_min: number | null
          id: string
          location: string | null
          notify: boolean | null
          payload: Json | null
          scheduled_at: string
          source: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          day_date: string
          description?: string | null
          duration_min?: number | null
          id?: string
          location?: string | null
          notify?: boolean | null
          payload?: Json | null
          scheduled_at: string
          source?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string
          day_date?: string
          description?: string | null
          duration_min?: number | null
          id?: string
          location?: string | null
          notify?: boolean | null
          payload?: Json | null
          scheduled_at?: string
          source?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          onboarded: boolean
          onboarding_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          onboarded?: boolean
          onboarding_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          onboarded?: boolean
          onboarding_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_step_events: {
        Row: {
          atom_ref: string | null
          completed: boolean
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          kind: string
          payload: Json
          quality_score: number | null
          rating: number | null
          session_id: string
          skipped: boolean
          started_at: string | null
          step_index: number
          title: string | null
          user_id: string
        }
        Insert: {
          atom_ref?: string | null
          completed?: boolean
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          kind: string
          payload?: Json
          quality_score?: number | null
          rating?: number | null
          session_id: string
          skipped?: boolean
          started_at?: string | null
          step_index: number
          title?: string | null
          user_id: string
        }
        Update: {
          atom_ref?: string | null
          completed?: boolean
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          kind?: string
          payload?: Json
          quality_score?: number | null
          rating?: number | null
          session_id?: string
          skipped?: boolean
          started_at?: string | null
          step_index?: number
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_step_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          intent: string | null
          karma_earned: number
          master_id: string | null
          metadata: Json
          plan: Json
          quality_score: number | null
          session_date: string
          started_at: string | null
          status: string
          summary: string | null
          theme_id: string | null
          time_slot: string | null
          type: string | null
          updated_at: string
          user_chosen_topic: string | null
          user_id: string
          v_level_delta: number | null
          v_level_start: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          intent?: string | null
          karma_earned?: number
          master_id?: string | null
          metadata?: Json
          plan?: Json
          quality_score?: number | null
          session_date?: string
          started_at?: string | null
          status?: string
          summary?: string | null
          theme_id?: string | null
          time_slot?: string | null
          type?: string | null
          updated_at?: string
          user_chosen_topic?: string | null
          user_id: string
          v_level_delta?: number | null
          v_level_start?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          intent?: string | null
          karma_earned?: number
          master_id?: string | null
          metadata?: Json
          plan?: Json
          quality_score?: number | null
          session_date?: string
          started_at?: string | null
          status?: string
          summary?: string | null
          theme_id?: string | null
          time_slot?: string | null
          type?: string | null
          updated_at?: string
          user_chosen_topic?: string | null
          user_id?: string
          v_level_delta?: number | null
          v_level_start?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "daily_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      today_practice_packs: {
        Row: {
          arc_id: string | null
          arc_phase: string | null
          band_level: number | null
          bypassing_check: Json | null
          created_at: string
          cross_pollination: Json | null
          formula: string | null
          id: string
          pack_date: string
          practices: Json
          rationale: string | null
          theme_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          arc_id?: string | null
          arc_phase?: string | null
          band_level?: number | null
          bypassing_check?: Json | null
          created_at?: string
          cross_pollination?: Json | null
          formula?: string | null
          id?: string
          pack_date: string
          practices?: Json
          rationale?: string | null
          theme_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          arc_id?: string | null
          arc_phase?: string | null
          band_level?: number | null
          bypassing_check?: Json | null
          created_at?: string
          cross_pollination?: Json | null
          formula?: string | null
          id?: string
          pack_date?: string
          practices?: Json
          rationale?: string | null
          theme_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_consciousness_profile: {
        Row: {
          active_loops: Json | null
          created_at: string
          dimension_bands: Json
          journey_day: number | null
          journey_phase: string | null
          metadata: Json | null
          samskaras: Json | null
          updated_at: string
          user_id: string
          v_level: number | null
          witness_depth: number | null
          witness_gap: number | null
          witness_stability: number | null
        }
        Insert: {
          active_loops?: Json | null
          created_at?: string
          dimension_bands?: Json
          journey_day?: number | null
          journey_phase?: string | null
          metadata?: Json | null
          samskaras?: Json | null
          updated_at?: string
          user_id: string
          v_level?: number | null
          witness_depth?: number | null
          witness_gap?: number | null
          witness_stability?: number | null
        }
        Update: {
          active_loops?: Json | null
          created_at?: string
          dimension_bands?: Json
          journey_day?: number | null
          journey_phase?: string | null
          metadata?: Json | null
          samskaras?: Json | null
          updated_at?: string
          user_id?: string
          v_level?: number | null
          witness_depth?: number | null
          witness_gap?: number | null
          witness_stability?: number | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance_paise: number
          created_at: string
          lifetime_paise: number
          total_purchased_paise: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_paise?: number
          created_at?: string
          lifetime_paise?: number
          total_purchased_paise?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_paise?: number
          created_at?: string
          lifetime_paise?: number
          total_purchased_paise?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_journey_log: {
        Row: {
          created_at: string
          day_number: number
          engine_plan: Json | null
          id: string
          log_date: string
          phase: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          day_number: number
          engine_plan?: Json | null
          id?: string
          log_date?: string
          phase?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          day_number?: number
          engine_plan?: Json | null
          id?: string
          log_date?: string
          phase?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_deduct_credits: {
        Args: { p_amount: number; p_description: string; p_user_id: string }
        Returns: Json
      }
      check_credit_balance: {
        Args: { p_min_balance: number; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
