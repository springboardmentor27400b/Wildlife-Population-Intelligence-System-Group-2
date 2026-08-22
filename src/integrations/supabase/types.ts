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
      audio_detections: {
        Row: {
          audio_id: string
          confidence: number
          detected_at: string
          end_seconds: number | null
          id: string
          species_id: string | null
          species_label: string
          start_seconds: number | null
        }
        Insert: {
          audio_id: string
          confidence: number
          detected_at?: string
          end_seconds?: number | null
          id?: string
          species_id?: string | null
          species_label: string
          start_seconds?: number | null
        }
        Update: {
          audio_id?: string
          confidence?: number
          detected_at?: string
          end_seconds?: number | null
          id?: string
          species_id?: string | null
          species_label?: string
          start_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_detections_audio_id_fkey"
            columns: ["audio_id"]
            isOneToOne: false
            referencedRelation: "survey_audio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_detections_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "species"
            referencedColumns: ["id"]
          },
        ]
      }
      habitat_health: {
        Row: {
          conservation_score: number
          id: string
          notes: string | null
          protected_area_id: string
          rainfall_mm: number | null
          recorded_at: string
          status: Database["public"]["Enums"]["habitat_status"]
          temperature_c: number | null
          vegetation_index: number
        }
        Insert: {
          conservation_score?: number
          id?: string
          notes?: string | null
          protected_area_id: string
          rainfall_mm?: number | null
          recorded_at?: string
          status?: Database["public"]["Enums"]["habitat_status"]
          temperature_c?: number | null
          vegetation_index?: number
        }
        Update: {
          conservation_score?: number
          id?: string
          notes?: string | null
          protected_area_id?: string
          rainfall_mm?: number | null
          recorded_at?: string
          status?: Database["public"]["Enums"]["habitat_status"]
          temperature_c?: number | null
          vegetation_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "habitat_health_protected_area_id_fkey"
            columns: ["protected_area_id"]
            isOneToOne: false
            referencedRelation: "protected_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      image_detections: {
        Row: {
          bbox_h: number | null
          bbox_w: number | null
          bbox_x: number | null
          bbox_y: number | null
          confidence: number
          detected_at: string
          id: string
          image_id: string
          species_id: string | null
          species_label: string
        }
        Insert: {
          bbox_h?: number | null
          bbox_w?: number | null
          bbox_x?: number | null
          bbox_y?: number | null
          confidence: number
          detected_at?: string
          id?: string
          image_id: string
          species_id?: string | null
          species_label: string
        }
        Update: {
          bbox_h?: number | null
          bbox_w?: number | null
          bbox_x?: number | null
          bbox_y?: number | null
          confidence?: number
          detected_at?: string
          id?: string
          image_id?: string
          species_id?: string | null
          species_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_detections_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "survey_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_detections_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "species"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      population_statistics: {
        Row: {
          created_at: string
          estimated_count: number
          id: string
          notes: string | null
          observation_month: number
          observation_year: number
          observed_count: number
          protected_area_id: string | null
          species_id: string
        }
        Insert: {
          created_at?: string
          estimated_count?: number
          id?: string
          notes?: string | null
          observation_month?: number
          observation_year: number
          observed_count?: number
          protected_area_id?: string | null
          species_id: string
        }
        Update: {
          created_at?: string
          estimated_count?: number
          id?: string
          notes?: string | null
          observation_month?: number
          observation_year?: number
          observed_count?: number
          protected_area_id?: string | null
          species_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "population_statistics_protected_area_id_fkey"
            columns: ["protected_area_id"]
            isOneToOne: false
            referencedRelation: "protected_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "population_statistics_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "species"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string
          id: string
          organization: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string
          id: string
          organization?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          organization?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      protected_areas: {
        Row: {
          area_hectares: number
          code: string | null
          conservation_status: string | null
          country: string
          created_at: string
          description: string | null
          designation: string | null
          district: string | null
          established_year: number | null
          forest_type: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          number_of_rangers: number | null
          region: string
          state: string | null
          total_area_sqkm: number | null
          updated_at: string
        }
        Insert: {
          area_hectares?: number
          code?: string | null
          conservation_status?: string | null
          country?: string
          created_at?: string
          description?: string | null
          designation?: string | null
          district?: string | null
          established_year?: number | null
          forest_type?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          number_of_rangers?: number | null
          region: string
          state?: string | null
          total_area_sqkm?: number | null
          updated_at?: string
        }
        Update: {
          area_hectares?: number
          code?: string | null
          conservation_status?: string | null
          country?: string
          created_at?: string
          description?: string | null
          designation?: string | null
          district?: string | null
          established_year?: number | null
          forest_type?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          number_of_rangers?: number | null
          region?: string
          state?: string | null
          total_area_sqkm?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          created_by: string
          id: string
          payload: Json
          report_type: string
          summary: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          payload?: Json
          report_type: string
          summary?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          payload?: Json
          report_type?: string
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      species: {
        Row: {
          average_lifespan: number | null
          category: Database["public"]["Enums"]["species_category"] | null
          common_name: string
          conservation_status: Database["public"]["Enums"]["conservation_status"]
          created_at: string
          description: string | null
          family: string | null
          food_type: string | null
          habitat: string | null
          id: string
          image_url: string | null
          population: number | null
          scientific_name: string
          updated_at: string
        }
        Insert: {
          average_lifespan?: number | null
          category?: Database["public"]["Enums"]["species_category"] | null
          common_name: string
          conservation_status?: Database["public"]["Enums"]["conservation_status"]
          created_at?: string
          description?: string | null
          family?: string | null
          food_type?: string | null
          habitat?: string | null
          id?: string
          image_url?: string | null
          population?: number | null
          scientific_name: string
          updated_at?: string
        }
        Update: {
          average_lifespan?: number | null
          category?: Database["public"]["Enums"]["species_category"] | null
          common_name?: string
          conservation_status?: Database["public"]["Enums"]["conservation_status"]
          created_at?: string
          description?: string | null
          family?: string | null
          food_type?: string | null
          habitat?: string | null
          id?: string
          image_url?: string | null
          population?: number | null
          scientific_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      survey_audio: {
        Row: {
          caption: string | null
          captured_at: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          storage_path: string
          survey_id: string
        }
        Insert: {
          caption?: string | null
          captured_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          storage_path: string
          survey_id: string
        }
        Update: {
          caption?: string | null
          captured_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          storage_path?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_audio_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_images: {
        Row: {
          caption: string | null
          captured_at: string | null
          created_at: string
          id: string
          storage_path: string
          survey_id: string
        }
        Insert: {
          caption?: string | null
          captured_at?: string | null
          created_at?: string
          id?: string
          storage_path: string
          survey_id: string
        }
        Update: {
          caption?: string | null
          captured_at?: string | null
          created_at?: string
          id?: string
          storage_path?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_images_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          animal_count: number | null
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          protected_area_id: string | null
          researcher_id: string
          species_observed: string | null
          status: Database["public"]["Enums"]["survey_status"]
          survey_date: string
          survey_time: string | null
          team_size: number | null
          temperature: number | null
          title: string
          updated_at: string
          weather: string | null
        }
        Insert: {
          animal_count?: number | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          protected_area_id?: string | null
          researcher_id: string
          species_observed?: string | null
          status?: Database["public"]["Enums"]["survey_status"]
          survey_date?: string
          survey_time?: string | null
          team_size?: number | null
          temperature?: number | null
          title: string
          updated_at?: string
          weather?: string | null
        }
        Update: {
          animal_count?: number | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          protected_area_id?: string | null
          researcher_id?: string
          species_observed?: string | null
          status?: Database["public"]["Enums"]["survey_status"]
          survey_date?: string
          survey_time?: string | null
          team_size?: number | null
          temperature?: number | null
          title?: string
          updated_at?: string
          weather?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surveys_protected_area_id_fkey"
            columns: ["protected_area_id"]
            isOneToOne: false
            referencedRelation: "protected_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      app_role: "administrator" | "researcher" | "officer"
      conservation_status: "LC" | "NT" | "VU" | "EN" | "CR" | "EW" | "EX" | "DD"
      habitat_status: "optimal" | "stable" | "caution" | "degraded" | "critical"
      species_category:
        | "mammal"
        | "bird"
        | "reptile"
        | "amphibian"
        | "fish"
        | "insect"
      survey_status:
        | "planned"
        | "in_progress"
        | "completed"
        | "archived"
        | "pending"
        | "active"
        | "cancelled"
      threat_level: "low" | "moderate" | "elevated" | "critical"
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
      app_role: ["administrator", "researcher", "officer"],
      conservation_status: ["LC", "NT", "VU", "EN", "CR", "EW", "EX", "DD"],
      habitat_status: ["optimal", "stable", "caution", "degraded", "critical"],
      species_category: [
        "mammal",
        "bird",
        "reptile",
        "amphibian",
        "fish",
        "insect",
      ],
      survey_status: [
        "planned",
        "in_progress",
        "completed",
        "archived",
        "pending",
        "active",
        "cancelled",
      ],
      threat_level: ["low", "moderate", "elevated", "critical"],
    },
  },
} as const
