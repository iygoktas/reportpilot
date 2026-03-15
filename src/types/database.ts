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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'clients_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'integrations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'reports_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
  };
};

// Convenience row types for use throughout the app
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type Integration = Database['public']['Tables']['integrations']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
