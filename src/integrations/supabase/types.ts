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
      cart_items: {
        Row: {
          colorway_id: string | null
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          size: string
          user_id: string | null
        }
        Insert: {
          colorway_id?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          size: string
          user_id?: string | null
        }
        Update: {
          colorway_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          size?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_colorway_id_fkey"
            columns: ["colorway_id"]
            isOneToOne: false
            referencedRelation: "product_colorways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          birthdate: string | null
          created_at: string | null
          default_shipping_address: Json | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          birthdate?: string | null
          created_at?: string | null
          default_shipping_address?: Json | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          birthdate?: string | null
          created_at?: string | null
          default_shipping_address?: Json | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_accounts: {
        Row: {
          created_at: string
          current_tier: string
          lifetime_points: number
          points_balance: number
          referral_code: string
          referred_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_tier?: string
          lifetime_points?: number
          points_balance?: number
          referral_code: string
          referred_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_tier?: string
          lifetime_points?: number
          points_balance?: number
          referral_code?: string
          referred_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_partners: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          location_text: string | null
          logo_url: string | null
          name: string
          sort_order: number
          updated_at: string
          website: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          location_text?: string | null
          logo_url?: string | null
          name: string
          sort_order?: number
          updated_at?: string
          website?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          location_text?: string | null
          logo_url?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      loyalty_referrals: {
        Row: {
          created_at: string
          id: string
          referred_user_id: string
          referrer_user_id: string
          rewarded_at: string | null
          status: Database["public"]["Enums"]["referral_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          referred_user_id: string
          referrer_user_id: string
          rewarded_at?: string | null
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Update: {
          created_at?: string
          id?: string
          referred_user_id?: string
          referrer_user_id?: string
          rewarded_at?: string | null
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Relationships: []
      }
      loyalty_settings: {
        Row: {
          birthday_bonus_points: number
          created_at: string
          id: string
          points_per_order: number
          points_per_qar: number
          redemption_enabled: boolean
          referral_bonus: number
          signup_bonus: number
          singleton: boolean
          updated_at: string
          welcome_bonus_points: number
        }
        Insert: {
          birthday_bonus_points?: number
          created_at?: string
          id?: string
          points_per_order?: number
          points_per_qar?: number
          redemption_enabled?: boolean
          referral_bonus?: number
          signup_bonus?: number
          singleton?: boolean
          updated_at?: string
          welcome_bonus_points?: number
        }
        Update: {
          birthday_bonus_points?: number
          created_at?: string
          id?: string
          points_per_order?: number
          points_per_qar?: number
          redemption_enabled?: boolean
          referral_bonus?: number
          signup_bonus?: number
          singleton?: boolean
          updated_at?: string
          welcome_bonus_points?: number
        }
        Relationships: []
      }
      loyalty_tiers: {
        Row: {
          color_hex: string | null
          created_at: string
          id: string
          min_points: number
          multiplier: number
          name: string
          perks: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          color_hex?: string | null
          created_at?: string
          id?: string
          min_points: number
          multiplier?: number
          name: string
          perks?: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color_hex?: string | null
          created_at?: string
          id?: string
          min_points?: number
          multiplier?: number
          name?: string
          perks?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          delta: number
          description: string | null
          id: string
          reference_id: string | null
          type: Database["public"]["Enums"]["loyalty_txn_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          description?: string | null
          id?: string
          reference_id?: string | null
          type: Database["public"]["Enums"]["loyalty_txn_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: Database["public"]["Enums"]["loyalty_txn_type"]
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          actual_price: number
          balance_due: number | null
          colorway_id: string | null
          colorway_name: string | null
          created_at: string | null
          discount_amount: number | null
          downpayment_amount: number | null
          id: string
          is_preorder: boolean | null
          order_id: string
          original_price: number
          price: number
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          size: string
          subtotal: number
        }
        Insert: {
          actual_price?: number
          balance_due?: number | null
          colorway_id?: string | null
          colorway_name?: string | null
          created_at?: string | null
          discount_amount?: number | null
          downpayment_amount?: number | null
          id?: string
          is_preorder?: boolean | null
          order_id: string
          original_price?: number
          price: number
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity: number
          size: string
          subtotal: number
        }
        Update: {
          actual_price?: number
          balance_due?: number | null
          colorway_id?: string | null
          colorway_name?: string | null
          created_at?: string | null
          discount_amount?: number | null
          downpayment_amount?: number | null
          id?: string
          is_preorder?: boolean | null
          order_id?: string
          original_price?: number
          price?: number
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          size?: string
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_rate_limits: {
        Row: {
          attempt_count: number
          created_at: string
          id: string
          identifier: string
          window_start: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          id?: string
          identifier: string
          window_start?: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          id?: string
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          balance_total: number | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          discount_total: number
          downpayment_total: number | null
          has_preorder_items: boolean | null
          id: string
          notes: string | null
          order_number: string
          order_status: string | null
          payment_method: string
          payment_status: string | null
          preorder_status: string | null
          shipping_address: Json
          subtotal: number
          total: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance_total?: number | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          discount_total?: number
          downpayment_total?: number | null
          has_preorder_items?: boolean | null
          id?: string
          notes?: string | null
          order_number: string
          order_status?: string | null
          payment_method: string
          payment_status?: string | null
          preorder_status?: string | null
          shipping_address: Json
          subtotal: number
          total: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance_total?: number | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          discount_total?: number
          downpayment_total?: number | null
          has_preorder_items?: boolean | null
          id?: string
          notes?: string | null
          order_number?: string
          order_status?: string | null
          payment_method?: string
          payment_status?: string | null
          preorder_status?: string | null
          shipping_address?: Json
          subtotal?: number
          total?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_confirmations: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          notes: string | null
          order_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          notes?: string | null
          order_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          notes?: string | null
          order_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_confirmations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_colorways: {
        Row: {
          created_at: string
          id: string
          images: string[]
          is_default: boolean
          is_limited_edition: boolean
          is_preorder: boolean
          name: string
          price_override: number | null
          product_id: string
          sizes: Json
          sku: string | null
          slug: string
          sort_order: number
          stock_total: number
          swatch_hex: string | null
          swatch_image: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          images?: string[]
          is_default?: boolean
          is_limited_edition?: boolean
          is_preorder?: boolean
          name: string
          price_override?: number | null
          product_id: string
          sizes?: Json
          sku?: string | null
          slug: string
          sort_order?: number
          stock_total?: number
          swatch_hex?: string | null
          swatch_image?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          images?: string[]
          is_default?: boolean
          is_limited_edition?: boolean
          is_preorder?: boolean
          name?: string
          price_override?: number | null
          product_id?: string
          sizes?: Json
          sku?: string | null
          slug?: string
          sort_order?: number
          stock_total?: number
          swatch_hex?: string | null
          swatch_image?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_colorways_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string
          category: string
          colors: string[] | null
          created_at: string | null
          description: string | null
          gender: string
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_limited_edition: boolean | null
          is_preorder: boolean | null
          name: string
          price: number
          sizes: Json | null
          stock_total: number | null
          style: string | null
          updated_at: string | null
        }
        Insert: {
          brand: string
          category: string
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          gender?: string
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_limited_edition?: boolean | null
          is_preorder?: boolean | null
          name: string
          price: number
          sizes?: Json | null
          stock_total?: number | null
          style?: string | null
          updated_at?: string | null
        }
        Update: {
          brand?: string
          category?: string
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          gender?: string
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_limited_edition?: boolean | null
          is_preorder?: boolean | null
          name?: string
          price?: number
          sizes?: Json | null
          stock_total?: number | null
          style?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          code: string | null
          code_expires_at: string | null
          created_at: string
          fulfilled_at: string | null
          id: string
          notes: string | null
          points_spent: number
          reward_id: string
          status: Database["public"]["Enums"]["redemption_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          code?: string | null
          code_expires_at?: string | null
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          notes?: string | null
          points_spent: number
          reward_id: string
          status?: Database["public"]["Enums"]["redemption_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string | null
          code_expires_at?: string | null
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          notes?: string | null
          points_spent?: number
          reward_id?: string
          status?: Database["public"]["Enums"]["redemption_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_catalog: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          kind: Database["public"]["Enums"]["reward_kind"]
          partner_id: string | null
          points_cost: number
          qar_value: number | null
          sort_order: number
          stock: number | null
          terms: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          kind: Database["public"]["Enums"]["reward_kind"]
          partner_id?: string | null
          points_cost: number
          qar_value?: number | null
          sort_order?: number
          stock?: number | null
          terms?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          kind?: Database["public"]["Enums"]["reward_kind"]
          partner_id?: string | null
          points_cost?: number
          qar_value?: number | null
          sort_order?: number
          stock?: number | null
          terms?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_catalog_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "loyalty_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_loyalty_delta: {
        Args: {
          p_delta: number
          p_description?: string
          p_reference?: string
          p_type: Database["public"]["Enums"]["loyalty_txn_type"]
          p_user_id: string
        }
        Returns: undefined
      }
      check_order_rate_limit: {
        Args: { user_identifier: string }
        Returns: boolean
      }
      generate_order_number: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      place_order: {
        Args: {
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_items: Json
          p_payment_method: string
          p_shipping: Json
        }
        Returns: string
      }
      recalculate_tier: { Args: { p_user_id: string }; Returns: undefined }
      redeem_reward: {
        Args: { p_reward_id: string }
        Returns: {
          code: string | null
          code_expires_at: string | null
          created_at: string
          fulfilled_at: string | null
          id: string
          notes: string | null
          points_spent: number
          reward_id: string
          status: Database["public"]["Enums"]["redemption_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "reward_redemptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      run_birthday_bonus: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      loyalty_txn_type:
        | "earn_signup"
        | "earn_order"
        | "earn_referral"
        | "earn_bonus"
        | "redeem_store"
        | "redeem_gift"
        | "redeem_partner"
        | "admin_adjustment"
        | "expiry"
        | "refund"
        | "earn_welcome"
        | "earn_birthday"
      redemption_status: "pending" | "fulfilled" | "expired" | "cancelled"
      referral_status: "pending" | "completed" | "cancelled"
      reward_kind: "store_discount" | "physical_gift" | "partner_voucher"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      loyalty_txn_type: [
        "earn_signup",
        "earn_order",
        "earn_referral",
        "earn_bonus",
        "redeem_store",
        "redeem_gift",
        "redeem_partner",
        "admin_adjustment",
        "expiry",
        "refund",
        "earn_welcome",
        "earn_birthday",
      ],
      redemption_status: ["pending", "fulfilled", "expired", "cancelled"],
      referral_status: ["pending", "completed", "cancelled"],
      reward_kind: ["store_discount", "physical_gift", "partner_voucher"],
    },
  },
} as const
