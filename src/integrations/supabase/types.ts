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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      budget_limits: {
        Row: {
          category: string
          household_id: string
          id: string
          limit_amount: number
        }
        Insert: {
          category: string
          household_id: string
          id?: string
          limit_amount?: number
        }
        Update: {
          category?: string
          household_id?: string
          id?: string
          limit_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_limits_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          color: string
          created_at: string
          household_id: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          household_id: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          household_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      groceries: {
        Row: {
          category: string
          created_at: string
          expiration_date: string | null
          household_id: string
          id: string
          name: string
          purchase_date: string
          quantity: number
          status: string
          storage_location: string
          unit: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          expiration_date?: string | null
          household_id: string
          id?: string
          name: string
          purchase_date?: string
          quantity?: number
          status?: string
          storage_location?: string
          unit?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          expiration_date?: string | null
          household_id?: string
          id?: string
          name?: string
          purchase_date?: string
          quantity?: number
          status?: string
          storage_location?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groceries_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_invites: {
        Row: {
          code: string
          created_at: string
          created_by: string
          expires_at: string
          household_id: string
          id: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          expires_at?: string
          household_id: string
          id?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          household_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_invites_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          household_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          household_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          household_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      maintenance_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          frequency_days: number
          household_id: string
          id: string
          last_completed: string | null
          next_due: string
          notes: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          frequency_days?: number
          household_id: string
          id?: string
          last_completed?: string | null
          next_due?: string
          notes?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          frequency_days?: number
          household_id?: string
          id?: string
          last_completed?: string | null
          next_due?: string
          notes?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          custom_meal_name: string | null
          date: string
          household_id: string
          id: string
          meal_type: string
          recipe_id: string | null
        }
        Insert: {
          created_at?: string
          custom_meal_name?: string | null
          date: string
          household_id: string
          id?: string
          meal_type?: string
          recipe_id?: string | null
        }
        Update: {
          created_at?: string
          custom_meal_name?: string | null
          date?: string
          household_id?: string
          id?: string
          meal_type?: string
          recipe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          body: string | null
          color: string
          created_at: string
          household_id: string
          id: string
          is_pinned: boolean
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          color?: string
          created_at?: string
          household_id: string
          id?: string
          is_pinned?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          color?: string
          created_at?: string
          household_id?: string
          id?: string
          is_pinned?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          groceries_enabled: boolean
          id: string
          reminders_enabled: boolean
          tasks_enabled: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          groceries_enabled?: boolean
          id?: string
          reminders_enabled?: boolean
          tasks_enabled?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          groceries_enabled?: boolean
          id?: string
          reminders_enabled?: boolean
          tasks_enabled?: boolean
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_color: string
          created_at: string
          display_name: string
          id: string
          phone: string | null
          user_id: string
        }
        Insert: {
          avatar_color?: string
          created_at?: string
          display_name?: string
          id?: string
          phone?: string | null
          user_id: string
        }
        Update: {
          avatar_color?: string
          created_at?: string
          display_name?: string
          id?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          id: string
          name: string
          quantity: string
          recipe_id: string
          unit: string | null
        }
        Insert: {
          id?: string
          name: string
          quantity?: string
          recipe_id: string
          unit?: string | null
        }
        Update: {
          id?: string
          name?: string
          quantity?: string
          recipe_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cook_time: number
          created_at: string
          household_id: string
          id: string
          instructions: string
          name: string
          prep_time: number
          servings: number
          tags: string[]
        }
        Insert: {
          cook_time?: number
          created_at?: string
          household_id: string
          id?: string
          instructions?: string
          name: string
          prep_time?: number
          servings?: number
          tags?: string[]
        }
        Update: {
          cook_time?: number
          created_at?: string
          household_id?: string
          id?: string
          instructions?: string
          name?: string
          prep_time?: number
          servings?: number
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "recipes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          category: string
          created_at: string
          description: string | null
          due_date: string
          household_id: string
          id: string
          is_checked: boolean
          lead_days: number
          repeat: string
          snoozed_until: string | null
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          due_date: string
          household_id: string
          id?: string
          is_checked?: boolean
          lead_days?: number
          repeat?: string
          snoozed_until?: string | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          due_date?: string
          household_id?: string
          id?: string
          is_checked?: boolean
          lead_days?: number
          repeat?: string
          snoozed_until?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_list: {
        Row: {
          category: string
          created_at: string
          estimated_price: number | null
          household_id: string
          id: string
          is_purchased: boolean
          name: string
          note: string | null
          quantity: number
        }
        Insert: {
          category?: string
          created_at?: string
          estimated_price?: number | null
          household_id: string
          id?: string
          is_purchased?: boolean
          name: string
          note?: string | null
          quantity?: number
        }
        Update: {
          category?: string
          created_at?: string
          estimated_price?: number | null
          household_id?: string
          id?: string
          is_purchased?: boolean
          name?: string
          note?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_tasks: {
        Row: {
          id: string
          is_completed: boolean
          task_id: string
          title: string
        }
        Insert: {
          id?: string
          is_completed?: boolean
          task_id: string
          title: string
        }
        Update: {
          id?: string
          is_completed?: boolean
          task_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          category: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          household_id: string
          id: string
          is_completed: boolean
          is_recurring: boolean
          priority: string
          recurrence_rule: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          household_id: string
          id?: string
          is_completed?: boolean
          is_recurring?: boolean
          priority?: string
          recurrence_rule?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          household_id?: string
          id?: string
          is_completed?: boolean
          is_recurring?: boolean
          priority?: string
          recurrence_rule?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          household_id: string
          id: string
          type: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description: string
          household_id: string
          id?: string
          type?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          household_id?: string
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_packing_items: {
        Row: {
          id: string
          is_packed: boolean
          name: string
          trip_id: string
        }
        Insert: {
          id?: string
          is_packed?: boolean
          name: string
          trip_id: string
        }
        Update: {
          id?: string
          is_packed?: boolean
          name?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_packing_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          category: string
          created_at: string
          description: string | null
          destination: string
          end_date: string
          household_id: string
          id: string
          itinerary: Json
          start_date: string
          status: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          destination?: string
          end_date: string
          household_id: string
          id?: string
          itinerary?: Json
          start_date: string
          status?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          destination?: string
          end_date?: string
          household_id?: string
          id?: string
          itinerary?: Json
          start_date?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_household_member: { Args: { _household_id: string }; Returns: boolean }
      join_household_by_code: { Args: { _code: string }; Returns: string }
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
