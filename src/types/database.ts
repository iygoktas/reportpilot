export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          stripe_customer_id: string | null;
          plan: 'free' | 'pro';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          stripe_customer_id?: string | null;
          plan?: 'free' | 'pro';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          stripe_customer_id?: string | null;
          plan?: 'free' | 'pro';
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          website_url: string | null;
          ga4_property_id: string | null;
          start_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          website_url?: string | null;
          ga4_property_id?: string | null;
          start_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          website_url?: string | null;
          ga4_property_id?: string | null;
          start_date?: string | null;
          created_at?: string;
        };
      };
      integrations: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          access_token: string;
          refresh_token: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          access_token: string;
          refresh_token: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          access_token?: string;
          refresh_token?: string;
          expires_at?: string;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          client_id: string;
          period_start: string;
          period_end: string;
          data_snapshot: Json;
          previous_data_snapshot: Json | null;
          ai_narrative: string | null;
          pdf_url: string | null;
          status: 'draft' | 'final';
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          period_start: string;
          period_end: string;
          data_snapshot: Json;
          previous_data_snapshot?: Json | null;
          ai_narrative?: string | null;
          pdf_url?: string | null;
          status?: 'draft' | 'final';
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          period_start?: string;
          period_end?: string;
          data_snapshot?: Json;
          previous_data_snapshot?: Json | null;
          ai_narrative?: string | null;
          pdf_url?: string | null;
          status?: 'draft' | 'final';
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// Convenience row types for use throughout the app
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type Integration = Database['public']['Tables']['integrations']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
