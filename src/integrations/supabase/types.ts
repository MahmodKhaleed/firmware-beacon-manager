export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      burn_requests: {
        Row: {
          completed_by: string | null
          created_at: string
          error_message: string | null
          firmware_id: string
          firmware_version: string
          id: string
          initiated_by: string
          status: Database["public"]["Enums"]["burn_request_status"]
          updated_at: string
        }
        Insert: {
          completed_by?: string | null
          created_at?: string
          error_message?: string | null
          firmware_id: string
          firmware_version: string
          id?: string
          initiated_by: string
          status?: Database["public"]["Enums"]["burn_request_status"]
          updated_at?: string
        }
        Update: {
          completed_by?: string | null
          created_at?: string
          error_message?: string | null
          firmware_id?: string
          firmware_version?: string
          id?: string
          initiated_by?: string
          status?: Database["public"]["Enums"]["burn_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "burn_requests_firmware_id_fkey"
            columns: ["firmware_id"]
            isOneToOne: false
            referencedRelation: "firmware"
            referencedColumns: ["id"]
          },
        ]
      }
      firmware: {
        Row: {
          burn_count: number | null
          date_uploaded: string | null
          description: string | null
          file_url: string | null
          id: string
          name: string
          size: number
          status: Database["public"]["Enums"]["firmware_status"]
          tags: string[] | null
          version: string
        }
        Insert: {
          burn_count?: number | null
          date_uploaded?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          name: string
          size: number
          status?: Database["public"]["Enums"]["firmware_status"]
          tags?: string[] | null
          version: string
        }
        Update: {
          burn_count?: number | null
          date_uploaded?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          name?: string
          size?: number
          status?: Database["public"]["Enums"]["firmware_status"]
          tags?: string[] | null
          version?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_burn_task: {
        Args: { burner_id: string }
        Returns: {
          completed_by: string | null
          created_at: string
          error_message: string | null
          firmware_id: string
          firmware_version: string
          id: string
          initiated_by: string
          status: Database["public"]["Enums"]["burn_request_status"]
          updated_at: string
        }[]
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      increment_firmware_burn_count: {
        Args: { firmware_id: string }
        Returns: undefined
      }
      request_firmware_burn: {
        Args: { fw_id: string; fw_version: string; initiator: string }
        Returns: string
      }
      update_burn_status: {
        Args: {
          request_id: string
          new_status: Database["public"]["Enums"]["burn_request_status"]
          burner_id: string
          error_msg?: string
        }
        Returns: {
          completed_by: string | null
          created_at: string
          error_message: string | null
          firmware_id: string
          firmware_version: string
          id: string
          initiated_by: string
          status: Database["public"]["Enums"]["burn_request_status"]
          updated_at: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      burn_request_status: "pending" | "processing" | "completed" | "failed"
      firmware_status: "stable" | "beta" | "draft"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      burn_request_status: ["pending", "processing", "completed", "failed"],
      firmware_status: ["stable", "beta", "draft"],
    },
  },
} as const
