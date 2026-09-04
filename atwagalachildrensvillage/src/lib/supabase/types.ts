// Supabase types for southern organization platform
export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          password_hash: string;
          phone_number: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          password_hash: string;
          phone_number?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          password_hash?: string;
          phone_number?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      staff_applications: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          nationality: string;
          sex: string;
          dob: string;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone: string;
          nationality: string;
          sex: string;
          dob: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          nationality?: string;
          sex?: string;
          dob?: string;
          is_approved?: boolean;
          created_at?: string;
        };
      };
      volunteer_applications: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          address: string;
          skills: string;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone: string;
          address: string;
          skills: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          address?: string;
          skills?: string;
          is_approved?: boolean;
          created_at?: string;
        };
      };
      partner_applications: {
        Row: {
          id: string;
          full_name: string;
          organization_name: string;
          offer: string;
          email: string;
          nationality: string;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          organization_name: string;
          offer: string;
          email: string;
          nationality: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          organization_name?: string;
          offer?: string;
          email?: string;
          nationality?: string;
          is_approved?: boolean;
          created_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          setting_key: string;
          setting_value?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          setting_key?: string;
          setting_value?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
      theme_settings: {
        Row: {
          id: string;
          background_color: string;
          text_color: string;
          primary_color: string;
          font_family: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          background_color?: string;
          text_color?: string;
          primary_color?: string;
          font_family?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          background_color?: string;
          text_color?: string;
          primary_color?: string;
          font_family?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
      footer_info: {
        Row: {
          id: string;
          organization_name: string | null;
          location: string | null;
          director: string | null;
          email: string | null;
          phone: string | null;
          organization_type: string | null;
          primary_focus: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_name?: string | null;
          location?: string | null;
          director?: string | null;
          email?: string | null;
          phone?: string | null;
          organization_type?: string | null;
          primary_focus?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_name?: string | null;
          location?: string | null;
          director?: string | null;
          email?: string | null;
          phone?: string | null;
          organization_type?: string | null;
          primary_focus?: string | null;
          updated_at?: string;
        };
      };
      hello_slides: {
        Row: {
          id: string;
          image_url: string;
          description: string | null;
          order_index: number;
          direction: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          description?: string | null;
          order_index?: number;
          direction?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          description?: string | null;
          order_index?: number;
          direction?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      about_us: {
        Row: {
          id: string;
          image_url: string | null;
          description: string;
          order_index: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url?: string | null;
          description: string;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string | null;
          description?: string;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      vision: {
        Row: {
          id: string;
          image_url: string | null;
          statement: string;
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url?: string | null;
          statement: string;
          is_active?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string | null;
          statement?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      mission: {
        Row: {
          id: string;
          image_url: string | null;
          statement: string;
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url?: string | null;
          statement: string;
          is_active?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string | null;
          statement?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      objectives: {
        Row: {
          id: string;
          image_url: string | null;
          statement: string;
          order_index: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url?: string | null;
          statement: string;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string | null;
          statement?: string;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      programs: {
        Row: {
          id: string;
          image_url: string;
          title: string;
          description: string;
          order_index: number;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          title: string;
          description: string;
          order_index?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          title?: string;
          description?: string;
          order_index?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          image_url: string;
          title: string;
          description: string;
          achievement_date: string;
          order_index: number;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          title: string;
          description: string;
          achievement_date: string;
          order_index?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          title?: string;
          description?: string;
          achievement_date?: string;
          order_index?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      core_values: {
        Row: {
          id: string;
          image_url: string;
          title: string;
          description: string;
          order_index: number;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          title: string;
          description: string;
          order_index?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          title?: string;
          description?: string;
          order_index?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      gallery: {
        Row: {
          id: string;
          media_url: string;
          media_type: 'image' | 'video';
          description: string | null;
          category: string | null;
          order_index: number;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          media_url: string;
          media_type?: 'image' | 'video';
          description?: string | null;
          category?: string | null;
          order_index?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          media_url?: string;
          media_type?: 'image' | 'video';
          description?: string | null;
          category?: string | null;
          order_index?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      news: {
        Row: {
          id: string;
          image_url: string;
          title: string;
          description: string;
          published_date: string;
          order_index: number;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          title: string;
          description: string;
          published_date: string;
          order_index?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          title?: string;
          description?: string;
          published_date?: string;
          order_index?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      leadership: {
        Row: {
          id: string;
          image_url: string;
          full_name: string;
          title: string;
          achievement: string | null;
          order_index: number;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          full_name: string;
          title: string;
          achievement?: string | null;
          order_index?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          full_name?: string;
          title?: string;
          achievement?: string | null;
          order_index?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      contact_submissions: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone_number: string | null;
          gender: string | null;
          residence: string | null;
          message: string | null;
          is_contacted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone_number?: string | null;
          gender?: string | null;
          residence?: string | null;
          message?: string | null;
          is_contacted?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone_number?: string | null;
          gender?: string | null;
          residence?: string | null;
          message?: string | null;
          is_contacted?: boolean;
          created_at?: string;
        };
      };
      donations: {
        Row: {
          id: string;
          donor_name: string;
          donor_email: string | null;
          donor_phone: string | null;
          amount: number;
          payment_method: string;
          payment_reference: string | null;
          receipt_number: string | null;
          receipt_generated: boolean;
          receipt_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          donor_name: string;
          donor_email?: string | null;
          donor_phone?: string | null;
          amount: number;
          payment_method: string;
          payment_reference?: string | null;
          receipt_number?: string | null;
          receipt_generated?: boolean;
          receipt_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          donor_name?: string;
          donor_email?: string | null;
          donor_phone?: string | null;
          amount?: number;
          payment_method?: string;
          payment_reference?: string | null;
          receipt_number?: string | null;
          receipt_generated?: boolean;
          receipt_url?: string | null;
          created_at?: string;
        };
      };
      payment_settings: {
        Row: {
          id: string;
          mtn_number: string | null;
          mtn_name: string | null;
          airtel_number: string | null;
          airtel_name: string | null;
          manual_payment_instructions: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mtn_number?: string | null;
          mtn_name?: string | null;
          airtel_number?: string | null;
          airtel_name?: string | null;
          manual_payment_instructions?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mtn_number?: string | null;
          mtn_name?: string | null;
          airtel_number?: string | null;
          airtel_name?: string | null;
          manual_payment_instructions?: string | null;
          updated_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          page_path: string | null;
          visitor_id: string | null;
          session_id: string | null;
          action_type: string | null;
          visitor_ip: string | null;
          device_type: string | null;
          country: string | null;
          user_agent: string | null;
          referrer: string | null;
          visited_at: string;
        };
        Insert: {
          id?: string;
          page_path?: string | null;
          visitor_id?: string | null;
          session_id?: string | null;
          action_type?: string | null;
          visitor_ip?: string | null;
          device_type?: string | null;
          country?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          visited_at?: string;
        };
        Update: {
          id?: string;
          page_path?: string | null;
          visitor_id?: string | null;
          session_id?: string | null;
          action_type?: string | null;
          visitor_ip?: string | null;
          device_type?: string | null;
          country?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          visited_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}