// ============================================
// Supabase Database Types (manual definitions)
// ============================================

/** Postgrest-js GenericSchema requires:
 *  - Tables with Row/Insert/Update/Relationships
 *  - Views with Row/Relationships
 *  - Functions with Args/Returns
 *  If any piece is missing, Schema defaults to `never`
 *  and ALL table queries become `never`.
 */

export type Profile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  instruments: string[] | null;
  genres: string[] | null;
  experience_level: string | null;
  looking_for: string[] | null;
  influences: string | null;
  location: string | null;
  bio: string | null;
  email: string | null;
  audio_url: string | null;
};

export type ProfileInsert = {
  id: string;
  email: string | null;
  name?: string | null;
  avatar_url?: string | null;
  instruments?: string[] | null;
  genres?: string[] | null;
  experience_level?: string | null;
  looking_for?: string[] | null;
  influences?: string | null;
  location?: string | null;
  bio?: string | null;
  audio_url?: string | null;
};

export type ProfileUpdate = {
  name?: string | null;
  avatar_url?: string | null;
  instruments?: string[] | null;
  genres?: string[] | null;
  experience_level?: string | null;
  looking_for?: string[] | null;
  influences?: string | null;
  location?: string | null;
  bio?: string | null;
  audio_url?: string | null;
};

export type Connection = {
  id: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
};

export type ConnectionInsert = {
  sender_id: string;
  receiver_id: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
};

export type MessageInsert = {
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read?: boolean;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      connections: {
        Row: Connection;
        Insert: ConnectionInsert;
        Update: Partial<ConnectionInsert>;
        Relationships: [];
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: Partial<MessageInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
