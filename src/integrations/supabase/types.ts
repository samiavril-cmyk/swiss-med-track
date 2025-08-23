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
      course_materials: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_preview: boolean
          title: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_preview?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_preview?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          comment: string | null
          course_id: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sessions: {
        Row: {
          course_id: string | null
          created_at: string
          current_participants: number
          end_date: string
          id: string
          instructor_notes: string | null
          location: string | null
          max_participants: number | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          current_participants?: number
          end_date: string
          id?: string
          instructor_notes?: string | null
          location?: string | null
          max_participants?: number | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          current_participants?: number
          end_date?: string
          id?: string
          instructor_notes?: string | null
          location?: string | null
          max_participants?: number | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_videos: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          is_preview: boolean
          order_index: number
          video_id: string | null
          video_type: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          is_preview?: boolean
          order_index?: number
          video_id?: string | null
          video_type?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          is_preview?: boolean
          order_index?: number
          video_id?: string | null
          video_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_videos_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          average_rating: number | null
          capacity: number | null
          certificate_template_url: string | null
          city: string | null
          cme_points: number | null
          country: string | null
          cover_image_url: string | null
          created_at: string
          currency: string | null
          description: string | null
          difficulty_level: string | null
          has_certificate: boolean | null
          id: string
          is_featured: boolean | null
          is_mandatory: boolean | null
          language: string | null
          modality: string | null
          points: number | null
          price: number | null
          provider_id: string
          requirements: string | null
          specialty: string | null
          status: string | null
          tags: string[] | null
          title: string
          total_reviews: number | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          average_rating?: number | null
          capacity?: number | null
          certificate_template_url?: string | null
          city?: string | null
          cme_points?: number | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          difficulty_level?: string | null
          has_certificate?: boolean | null
          id?: string
          is_featured?: boolean | null
          is_mandatory?: boolean | null
          language?: string | null
          modality?: string | null
          points?: number | null
          price?: number | null
          provider_id: string
          requirements?: string | null
          specialty?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          total_reviews?: number | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          average_rating?: number | null
          capacity?: number | null
          certificate_template_url?: string | null
          city?: string | null
          cme_points?: number | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          difficulty_level?: string | null
          has_certificate?: boolean | null
          id?: string
          is_featured?: boolean | null
          is_mandatory?: boolean | null
          language?: string | null
          modality?: string | null
          points?: number | null
          price?: number | null
          provider_id?: string
          requirements?: string | null
          specialty?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          total_reviews?: number | null
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
      invoices: {
        Row: {
          amount: number
          billing_address: Json | null
          created_at: string
          currency: string
          due_date: string | null
          id: string
          invoice_number: string
          paid_date: string | null
          payment_id: string | null
          pdf_url: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
          vat_amount: number | null
          vat_rate: number | null
        }
        Insert: {
          amount: number
          billing_address?: Json | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          paid_date?: string | null
          payment_id?: string | null
          pdf_url?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Update: {
          amount?: number
          billing_address?: Json | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          paid_date?: string | null
          payment_id?: string | null
          pdf_url?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          course_id: string | null
          created_at: string
          currency: string
          id: string
          payment_method: string | null
          session_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          course_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          session_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          course_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          session_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      procedure_categories: {
        Row: {
          created_at: string
          id: string
          key: string
          minimum_required: number | null
          module_type: string | null
          sort_index: number | null
          title_de: string
          title_en: string | null
          updated_at: string
          weighted_scoring: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          minimum_required?: number | null
          module_type?: string | null
          sort_index?: number | null
          title_de: string
          title_en?: string | null
          updated_at?: string
          weighted_scoring?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          minimum_required?: number | null
          module_type?: string | null
          sort_index?: number | null
          title_de?: string
          title_en?: string | null
          updated_at?: string
          weighted_scoring?: boolean | null
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
          weighted_score: number | null
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
          weighted_score?: number | null
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
          weighted_score?: number | null
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
      procedure_role_weights: {
        Row: {
          created_at: string
          id: string
          role_type: string
          updated_at: string
          weight_factor: number
        }
        Insert: {
          created_at?: string
          id?: string
          role_type: string
          updated_at?: string
          weight_factor?: number
        }
        Update: {
          created_at?: string
          id?: string
          role_type?: string
          updated_at?: string
          weight_factor?: number
        }
        Relationships: []
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
      calculate_weighted_score: {
        Args: { role_text: string }
        Returns: number
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_module_progress: {
        Args: { module_key: string; user_id_param: string }
        Returns: {
          assistant_count: number
          instructing_count: number
          module_name: string
          progress_percentage: number
          responsible_count: number
          total_minimum: number
          total_weighted_score: number
        }[]
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
