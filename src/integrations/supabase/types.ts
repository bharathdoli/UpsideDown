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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alumni: {
        Row: {
          bio: string | null
          college: string
          company: string | null
          created_at: string
          email: string | null
          graduation_year: number
          id: string
          linkedin_url: string | null
          name: string
          role: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          college: string
          company?: string | null
          created_at?: string
          email?: string | null
          graduation_year: number
          id?: string
          linkedin_url?: string | null
          name: string
          role?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          college?: string
          company?: string | null
          created_at?: string
          email?: string | null
          graduation_year?: number
          id?: string
          linkedin_url?: string | null
          name?: string
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          college: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          event_date: string
          id: string
          image_url: string | null
          location: string | null
          registration_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          college: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          location?: string | null
          registration_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          college?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          location?: string | null
          registration_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      issues: {
        Row: {
          category: string
          college: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          category: string
          college: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          category?: string
          college?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          category: string
          college: string
          condition: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_sold: boolean | null
          price: number
          title: string
          user_id: string
        }
        Insert: {
          category: string
          college: string
          condition: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_sold?: boolean | null
          price: number
          title: string
          user_id: string
        }
        Update: {
          category?: string
          college?: string
          condition?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_sold?: boolean | null
          price?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          college: string
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          semester: number | null
          subject: string
          title: string
          user_id: string
        }
        Insert: {
          college: string
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          semester?: number | null
          subject: string
          title: string
          user_id: string
        }
        Update: {
          college?: string
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          semester?: number | null
          subject?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      note_ratings: {
        Row: {
          id: string
          note_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          note_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          note_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      note_comments: {
        Row: {
          id: string
          note_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          note_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          note_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      saved_items: {
        Row: {
          id: string
          user_id: string
          item_type: string
          item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_type: string
          item_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_type?: string
          item_id?: string
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          college: string | null
          branch: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          college?: string | null
          branch?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          college?: string | null
          branch?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_buddy_requests: {
        Row: {
          college: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          request_type: string | null
          subject: string
          user_id: string
        }
        Insert: {
          college: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          request_type?: string | null
          subject: string
          user_id: string
        }
        Update: {
          college?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          request_type?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      chats: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          listing_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          seller_id: string
          listing_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          seller_id?: string
          listing_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      study_groups: {
        Row: {
          id: string
          subject: string
          college: string
          description: string | null
          created_by: string
          max_members: number
          created_at: string
        }
        Insert: {
          id?: string
          subject: string
          college: string
          description?: string | null
          created_by: string
          max_members?: number
          created_at?: string
        }
        Update: {
          id?: string
          subject?: string
          college?: string
          description?: string | null
          created_by?: string
          max_members?: number
          created_at?: string
        }
        Relationships: []
      }
      study_group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
        Relationships: []
      }
      mentorship_requests: {
        Row: {
          id: string
          alumni_id: string
          student_id: string
          message: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          alumni_id: string
          student_id: string
          message?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          alumni_id?: string
          student_id?: string
          message?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          user_id: string
          points_total: number
          updated_at: string
        }
        Insert: {
          user_id: string
          points_total?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          points_total?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_key: string
          awarded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_key: string
          awarded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_key?: string
          awarded_at?: string
        }
        Relationships: []
      }
      group_chat_messages: {
        Row: {
          id: string
          group_id: string
          sender_id: string
          content: string | null
          file_url: string | null
          file_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          sender_id: string
          content?: string | null
          file_url?: string | null
          file_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          sender_id?: string
          content?: string | null
          file_url?: string | null
          file_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      lost_and_found: {
        Row: {
          id: string
          user_id: string
          college: string
          item_type: string
          title: string
          description: string | null
          category: string | null
          location: string | null
          contact_info: string | null
          image_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          college: string
          item_type: string
          title: string
          description?: string | null
          category?: string | null
          location?: string | null
          contact_info?: string | null
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          college?: string
          item_type?: string
          title?: string
          description?: string | null
          category?: string | null
          location?: string | null
          contact_info?: string | null
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      youtube_tutorials: {
        Row: {
          id: string
          user_id: string
          college: string
          title: string
          description: string | null
          youtube_url: string
          subject: string
          branch: string | null
          difficulty: string | null
          duration_minutes: number | null
          thumbnail_url: string | null
          view_count: number
          like_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          college: string
          title: string
          description?: string | null
          youtube_url: string
          subject: string
          branch?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          thumbnail_url?: string | null
          view_count?: number
          like_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          college?: string
          title?: string
          description?: string | null
          youtube_url?: string
          subject?: string
          branch?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          thumbnail_url?: string | null
          view_count?: number
          like_count?: number
          created_at?: string
        }
        Relationships: []
      }
      tutorial_likes: {
        Row: {
          id: string
          tutorial_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          tutorial_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          tutorial_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
