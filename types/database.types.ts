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
      ai_analyses: {
        Row: {
          created_at: string | null
          id: string
          image_hash: string
          image_url: string
          model: string
          result: Json
          tokens_input: number | null
          tokens_output: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_hash: string
          image_url: string
          model: string
          result: Json
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_hash?: string
          image_url?: string
          model?: string
          result?: Json
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event: string
          id: number
          properties: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event: string
          id?: never
          properties?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event?: string
          id?: never
          properties?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          code: string
          description: string | null
          icon: string | null
          name_vi: string
          points_required: number | null
        }
        Insert: {
          code: string
          description?: string | null
          icon?: string | null
          name_vi: string
          points_required?: number | null
        }
        Update: {
          code?: string
          description?: string | null
          icon?: string | null
          name_vi?: string
          points_required?: number | null
        }
        Relationships: []
      }
      collection_point_votes: {
        Row: {
          created_at: string | null
          kind: Database["public"]["Enums"]["vote_kind"]
          point_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          kind: Database["public"]["Enums"]["vote_kind"]
          point_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          kind?: Database["public"]["Enums"]["vote_kind"]
          point_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_point_votes_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "collection_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_point_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_points: {
        Row: {
          accepts: Database["public"]["Enums"]["material_code"][]
          address: string | null
          contributed_by: string | null
          created_at: string | null
          downvotes: number
          hours: string | null
          id: string
          lat: number
          lng: number
          name: string
          notes: string | null
          phone: string | null
          type: Database["public"]["Enums"]["point_type"]
          upvotes: number
          verified: boolean
        }
        Insert: {
          accepts?: Database["public"]["Enums"]["material_code"][]
          address?: string | null
          contributed_by?: string | null
          created_at?: string | null
          downvotes?: number
          hours?: string | null
          id?: string
          lat: number
          lng: number
          name: string
          notes?: string | null
          phone?: string | null
          type: Database["public"]["Enums"]["point_type"]
          upvotes?: number
          verified?: boolean
        }
        Update: {
          accepts?: Database["public"]["Enums"]["material_code"][]
          address?: string | null
          contributed_by?: string | null
          created_at?: string | null
          downvotes?: number
          hours?: string | null
          id?: string
          lat?: number
          lng?: number
          name?: string
          notes?: string | null
          phone?: string | null
          type?: Database["public"]["Enums"]["point_type"]
          upvotes?: number
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "collection_points_contributed_by_fkey"
            columns: ["contributed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      eco_actions: {
        Row: {
          created_at: string | null
          id: number
          kind: string
          points_delta: number
          ref_id: string | null
          ref_table: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          kind: string
          points_delta: number
          ref_id?: string | null
          ref_table?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          kind?: string
          points_delta?: number
          ref_id?: string | null
          ref_table?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eco_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exchanges: {
        Row: {
          completed_at: string | null
          created_at: string | null
          giver_id: string
          id: string
          listing_id: string
          meeting_note: string | null
          rated_by_giver: number | null
          rated_by_receiver: number | null
          receiver_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          giver_id: string
          id?: string
          listing_id: string
          meeting_note?: string | null
          rated_by_giver?: number | null
          rated_by_receiver?: number | null
          receiver_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          giver_id?: string
          id?: string
          listing_id?: string
          meeting_note?: string | null
          rated_by_giver?: number | null
          rated_by_receiver?: number | null
          receiver_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "exchanges_giver_id_fkey"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exchanges_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exchanges_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          ai_analysis_id: string | null
          city: string | null
          condition: number | null
          created_at: string | null
          description: string | null
          id: string
          intent: Database["public"]["Enums"]["listing_intent"]
          lat: number | null
          lng: number | null
          material_code: Database["public"]["Enums"]["material_code"]
          moderated_at: string | null
          moderation_passed: boolean | null
          moderation_reason: string | null
          owner_id: string
          photos: string[]
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          ai_analysis_id?: string | null
          city?: string | null
          condition?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          intent?: Database["public"]["Enums"]["listing_intent"]
          lat?: number | null
          lng?: number | null
          material_code: Database["public"]["Enums"]["material_code"]
          moderated_at?: string | null
          moderation_passed?: boolean | null
          moderation_reason?: string | null
          owner_id: string
          photos?: string[]
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          ai_analysis_id?: string | null
          city?: string | null
          condition?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          intent?: Database["public"]["Enums"]["listing_intent"]
          lat?: number | null
          lng?: number | null
          material_code?: Database["public"]["Enums"]["material_code"]
          moderated_at?: string | null
          moderation_passed?: boolean | null
          moderation_reason?: string | null
          owner_id?: string
          photos?: string[]
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      material_categories: {
        Row: {
          code: Database["public"]["Enums"]["material_code"]
          color: string | null
          icon: string | null
          name_en: string
          name_vi: string
        }
        Insert: {
          code: Database["public"]["Enums"]["material_code"]
          color?: string | null
          icon?: string | null
          name_en: string
          name_vi: string
        }
        Update: {
          code?: Database["public"]["Enums"]["material_code"]
          color?: string | null
          icon?: string | null
          name_en?: string
          name_vi?: string
        }
        Relationships: []
      }
      material_info: {
        Row: {
          code: Database["public"]["Enums"]["material_code"]
          decomposition_years_max: number | null
          decomposition_years_min: number
          diy_ideas: Json
          impact_score: number
          recyclable: boolean
          recycle_methods: Json
          source_url: string | null
        }
        Insert: {
          code: Database["public"]["Enums"]["material_code"]
          decomposition_years_max?: number | null
          decomposition_years_min: number
          diy_ideas?: Json
          impact_score: number
          recyclable: boolean
          recycle_methods?: Json
          source_url?: string | null
        }
        Update: {
          code?: Database["public"]["Enums"]["material_code"]
          decomposition_years_max?: number | null
          decomposition_years_min?: number
          diy_ideas?: Json
          impact_score?: number
          recyclable?: boolean
          recycle_methods?: Json
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_info_code_fkey"
            columns: ["code"]
            isOneToOne: true
            referencedRelation: "material_categories"
            referencedColumns: ["code"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string | null
          exchange_id: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          exchange_id: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          exchange_id?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "exchanges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banned_at: string | null
          banned_reason: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          display_name: string
          eco_points: number
          id: string
          level: number
          role: Database["public"]["Enums"]["user_role"]
          school: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          banned_at?: string | null
          banned_reason?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          display_name: string
          eco_points?: number
          id: string
          level?: number
          role?: Database["public"]["Enums"]["user_role"]
          school?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          banned_at?: string | null
          banned_reason?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string
          eco_points?: number
          id?: string
          level?: number
          role?: Database["public"]["Enums"]["user_role"]
          school?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          city: string
          code: string
          created_at: string | null
          name_vi: string
        }
        Insert: {
          city: string
          code: string
          created_at?: string | null
          name_vi: string
        }
        Update: {
          city?: string
          code?: string
          created_at?: string | null
          name_vi?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_at: string | null
          badge_code: string
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          badge_code: string
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          badge_code?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_code_fkey"
            columns: ["badge_code"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_award_badge: {
        Args: { badge_code: string; uid: string }
        Returns: boolean
      }
      increment_points: {
        Args: { delta: number; uid: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      listing_intent: "give" | "exchange" | "sell_scrap" | "seek"
      listing_status: "available" | "reserved" | "completed" | "removed"
      material_code:
        | "PET"
        | "HDPE"
        | "PP"
        | "PS"
        | "PVC"
        | "OTHER_PLASTIC"
        | "PAPER"
        | "CARDBOARD"
        | "GLASS"
        | "METAL_AL"
        | "METAL_FE"
        | "TEXTILE"
        | "ELECTRONIC"
        | "ORGANIC"
        | "BATTERY"
        | "MIXED"
      point_type:
        | "scrap_dealer"
        | "recycle_bin"
        | "ngo_dropoff"
        | "ewaste"
        | "other"
      user_role: "user" | "admin"
      vote_kind: "up" | "down"
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
      listing_intent: ["give", "exchange", "sell_scrap", "seek"],
      listing_status: ["available", "reserved", "completed", "removed"],
      material_code: [
        "PET",
        "HDPE",
        "PP",
        "PS",
        "PVC",
        "OTHER_PLASTIC",
        "PAPER",
        "CARDBOARD",
        "GLASS",
        "METAL_AL",
        "METAL_FE",
        "TEXTILE",
        "ELECTRONIC",
        "ORGANIC",
        "BATTERY",
        "MIXED",
      ],
      point_type: [
        "scrap_dealer",
        "recycle_bin",
        "ngo_dropoff",
        "ewaste",
        "other",
      ],
      user_role: ["user", "admin"],
      vote_kind: ["up", "down"],
    },
  },
} as const
