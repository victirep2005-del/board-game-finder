export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.15" }
  public: {
    Tables: {
      board_games: {
        Row: { created_at: string; difficulty: string; duration_minutes: number | null; id: string; max_players: number | null; min_age: number | null; min_players: number | null; name: string; category: string | null; notes: string | null; image_url: string | null; shelf_id: string; updated_at: string }
        Insert: { created_at?: string; difficulty?: string; duration_minutes?: number | null; id?: string; max_players?: number | null; min_age?: number | null; min_players?: number | null; name: string; category?: string | null; notes?: string | null; image_url?: string | null; shelf_id: string; updated_at?: string }
        Update: { created_at?: string; difficulty?: string; duration_minutes?: number | null; id?: string; max_players?: number | null; min_age?: number | null; min_players?: number | null; name?: string; category?: string | null; notes?: string | null; image_url?: string | null; shelf_id?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "board_games_shelf_id_fkey"; columns: ["shelf_id"]; isOneToOne: false; referencedRelation: "shelves"; referencedColumns: ["id"] }]
      }
      rooms: {
        Row: { created_at: string; id: string; name: string; sort_order: number }
        Insert: { created_at?: string; id?: string; name: string; sort_order?: number }
        Update: { created_at?: string; id?: string; name?: string; sort_order?: number }
        Relationships: []
      }
      shelves: {
        Row: { created_at: string; id: string; name: string; room_id: string; sort_order: number }
        Insert: { created_at?: string; id?: string; name: string; room_id: string; sort_order?: number }
        Update: { created_at?: string; id?: string; name?: string; room_id?: string; sort_order?: number }
        Relationships: [{ foreignKeyName: "shelves_room_id_fkey"; columns: ["room_id"]; isOneToOne: false; referencedRelation: "rooms"; referencedColumns: ["id"] }]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]
export type Tables<T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])> = DefaultSchema["Tables"][T] extends { Row: infer R } ? R : never
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never
export type Enums<T extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][T]
export type CompositeTypes<T extends keyof DefaultSchema["CompositeTypes"]> = DefaultSchema["CompositeTypes"][T]
export const Constants = { public: { Enums: {} } } as const
