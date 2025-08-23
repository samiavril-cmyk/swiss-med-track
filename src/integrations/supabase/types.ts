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
      annotations: {
        Row: {
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          like_count: number
          parent_id: string | null
          segment_id: string | null
          timestamp: number
          updated_at: string
          user_id: string
          video_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          like_count?: number
          parent_id?: string | null
          segment_id?: string | null
          timestamp: number
          updated_at?: string
          user_id: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          like_count?: number
          parent_id?: string | null
          segment_id?: string | null
          timestamp?: number
          updated_at?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "annotations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "annotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "video_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      awards: {
        Row: {
          awarded_date: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          organization: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          awarded_date?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          organization?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          awarded_date?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          organization?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          certificate_url: string | null
          completion_date: string | null
          course_id: string | null
          created_at: string
          id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          completion_date?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          completion_date?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          capacity: number | null
          city: string | null
          cme_points: number | null
          country: string | null
          cover_image_url: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_mandatory: boolean | null
          language: string | null
          modality: string | null
          points: number | null
          price: number | null
          provider_id: string
          requirements: string | null
          specialty: string | null
          status: string | null
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          capacity?: number | null
          city?: string | null
          cme_points?: number | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          language?: string | null
          modality?: string | null
          points?: number | null
          price?: number | null
          provider_id: string
          requirements?: string | null
          specialty?: string | null
          status?: string | null
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          capacity?: number | null
          city?: string | null
          cme_points?: number | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          language?: string | null
          modality?: string | null
          points?: number | null
          price?: number | null
          provider_id?: string
          requirements?: string | null
          specialty?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          id: string
          is_private: boolean
          member_count: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          is_private?: boolean
          member_count?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          is_private?: boolean
          member_count?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      procedure_categories: {
        Row: {
          created_at: string
          id: string
          key: string
          sort_index: number | null
          title_de: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          sort_index?: number | null
          title_de: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          sort_index?: number | null
          title_de?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      procedure_logs: {
        Row: {
          case_id: string | null
          created_at: string
          hospital: string | null
          id: string
          notes: string | null
          performed_date: string
          procedure_id: string | null
          role_in_surgery: string | null
          supervisor: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          hospital?: string | null
          id?: string
          notes?: string | null
          performed_date: string
          procedure_id?: string | null
          role_in_surgery?: string | null
          supervisor?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          hospital?: string | null
          id?: string
          notes?: string | null
          performed_date?: string
          procedure_id?: string | null
          role_in_surgery?: string | null
          supervisor?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "procedure_logs_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          active: boolean | null
          category_id: string | null
          code: string
          created_at: string
          fmh_ref: string | null
          id: string
          min_required_by_pgy: Json | null
          notes: string | null
          pgy_recommended: number[] | null
          tags: string[] | null
          title_de: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          category_id?: string | null
          code: string
          created_at?: string
          fmh_ref?: string | null
          id?: string
          min_required_by_pgy?: Json | null
          notes?: string | null
          pgy_recommended?: number[] | null
          tags?: string[] | null
          title_de: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          category_id?: string | null
          code?: string
          created_at?: string
          fmh_ref?: string | null
          id?: string
          min_required_by_pgy?: Json | null
          notes?: string | null
          pgy_recommended?: number[] | null
          tags?: string[] | null
          title_de?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "procedures_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "procedure_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          handle: string | null
          id: string
          institution: string | null
          is_public: boolean | null
          linkedin_url: string | null
          pgy_level: number | null
          public_fields: Json | null
          role: string | null
          specialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          handle?: string | null
          id?: string
          institution?: string | null
          is_public?: boolean | null
          linkedin_url?: string | null
          pgy_level?: number | null
          public_fields?: Json | null
          role?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          handle?: string | null
          id?: string
          institution?: string | null
          is_public?: boolean | null
          linkedin_url?: string | null
          pgy_level?: number | null
          public_fields?: Json | null
          role?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      publications: {
        Row: {
          created_at: string
          doi: string | null
          id: string
          journal: string | null
          link: string | null
          notes: string | null
          publication_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doi?: string | null
          id?: string
          journal?: string | null
          link?: string | null
          notes?: string | null
          publication_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doi?: string | null
          id?: string
          journal?: string | null
          link?: string | null
          notes?: string | null
          publication_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_categories: {
        Row: {
          color: string | null
          created_at: string
          creator_id: string
          description: string | null
          group_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          group_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          group_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      video_segments: {
        Row: {
          created_at: string
          description: string | null
          end_time: number
          id: string
          order_index: number
          start_time: number
          title: string
          updated_at: string
          video_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: number
          id?: string
          order_index: number
          start_time: number
          title: string
          updated_at?: string
          video_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: number
          id?: string
          order_index?: number
          start_time?: number
          title?: string
          updated_at?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_segments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_text_overlays: {
        Row: {
          background_color: string | null
          created_at: string
          creator_id: string
          end_time: number
          font_size: number | null
          id: string
          opacity: number | null
          position_x: number | null
          position_y: number | null
          segment_id: string | null
          start_time: number
          text_color: string | null
          text_content: string
          updated_at: string
          video_id: string
        }
        Insert: {
          background_color?: string | null
          created_at?: string
          creator_id: string
          end_time: number
          font_size?: number | null
          id?: string
          opacity?: number | null
          position_x?: number | null
          position_y?: number | null
          segment_id?: string | null
          start_time: number
          text_color?: string | null
          text_content: string
          updated_at?: string
          video_id: string
        }
        Update: {
          background_color?: string | null
          created_at?: string
          creator_id?: string
          end_time?: number
          font_size?: number | null
          id?: string
          opacity?: number | null
          position_x?: number | null
          position_y?: number | null
          segment_id?: string | null
          start_time?: number
          text_color?: string | null
          text_content?: string
          updated_at?: string
          video_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          duration: number
          group_ids: string[] | null
          id: string
          is_public: boolean
          thumbnail_url: string | null
          title: string
          updated_at: string
          uploader_id: string
          video_url: string
          view_count: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration?: number
          group_ids?: string[] | null
          id?: string
          is_public?: boolean
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          uploader_id: string
          video_url: string
          view_count?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration?: number
          group_ids?: string[] | null
          id?: string
          is_public?: boolean
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          uploader_id?: string
          video_url?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "videos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "video_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_public_profile: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          full_name: string
          id: string
          institution: string
          role: string
          updated_at: string
          user_id: string
        }[]
      }
      is_group_member: {
        Args: { check_group_id: string; check_user_id: string }
        Returns: boolean
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
    Enums: {},
  },
} as const
