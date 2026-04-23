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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      listing_boosts: {
        Row: {
          amount_inr: number
          boost_type: Database["public"]["Enums"]["boost_type"]
          created_at: string
          duration_days: number
          ends_at: string
          id: string
          listing_id: string
          razorpay_payment_id: string | null
          seller_id: string
          starts_at: string
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount_inr: number
          boost_type: Database["public"]["Enums"]["boost_type"]
          created_at?: string
          duration_days: number
          ends_at: string
          id?: string
          listing_id: string
          razorpay_payment_id?: string | null
          seller_id: string
          starts_at?: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount_inr?: number
          boost_type?: Database["public"]["Enums"]["boost_type"]
          created_at?: string
          duration_days?: number
          ends_at?: string
          id?: string
          listing_id?: string
          razorpay_payment_id?: string | null
          seller_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: []
      }
      listings: {
        Row: {
          approved_at: string | null
          attributes: Json
          category_id: string
          cover_image_url: string | null
          created_at: string
          delivery_time_hours: number
          description: string
          expires_at: string | null
          featured_until: string | null
          id: string
          images: Json
          is_featured: boolean
          is_spotlighted: boolean
          order_count: number
          price_inr: number
          rating_avg: number
          rating_count: number
          rejection_reason: string | null
          seller_id: string
          slug: string
          spotlight_until: string | null
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          approved_at?: string | null
          attributes?: Json
          category_id: string
          cover_image_url?: string | null
          created_at?: string
          delivery_time_hours?: number
          description: string
          expires_at?: string | null
          featured_until?: string | null
          id?: string
          images?: Json
          is_featured?: boolean
          is_spotlighted?: boolean
          order_count?: number
          price_inr: number
          rating_avg?: number
          rating_count?: number
          rejection_reason?: string | null
          seller_id: string
          slug: string
          spotlight_until?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          approved_at?: string | null
          attributes?: Json
          category_id?: string
          cover_image_url?: string | null
          created_at?: string
          delivery_time_hours?: number
          description?: string
          expires_at?: string | null
          featured_until?: string | null
          id?: string
          images?: Json
          is_featured?: boolean
          is_spotlighted?: boolean
          order_count?: number
          price_inr?: number
          rating_avg?: number
          rating_count?: number
          rejection_reason?: string | null
          seller_id?: string
          slug?: string
          spotlight_until?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_inr: number
          buyer_id: string
          buyer_notes: string | null
          commission_inr: number
          completed_at: string | null
          created_at: string
          delivered_at: string | null
          id: string
          listing_id: string
          listing_title: string
          order_number: string
          payment_method: string | null
          payment_ref: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          payout_id: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          seller_id: string
          seller_payout_inr: number
          settled_at: string | null
          settlement_status: Database["public"]["Enums"]["settlement_status"]
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
        }
        Insert: {
          amount_inr: number
          buyer_id: string
          buyer_notes?: string | null
          commission_inr?: number
          completed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          listing_id: string
          listing_title: string
          order_number?: string
          payment_method?: string | null
          payment_ref?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          payout_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          seller_id: string
          seller_payout_inr?: number
          settled_at?: string | null
          settlement_status?: Database["public"]["Enums"]["settlement_status"]
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Update: {
          amount_inr?: number
          buyer_id?: string
          buyer_notes?: string | null
          commission_inr?: number
          completed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          listing_id?: string
          listing_title?: string
          order_number?: string
          payment_method?: string | null
          payment_ref?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          payout_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          seller_id?: string
          seller_payout_inr?: number
          settled_at?: string | null
          settlement_status?: Database["public"]["Enums"]["settlement_status"]
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "seller_payouts"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
          id: string
          order_id: string | null
          payload: Json
          processed: boolean
          processing_error: string | null
          provider: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          signature_verified: boolean
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          order_id?: string | null
          payload: Json
          processed?: boolean
          processing_error?: string | null
          provider?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          signature_verified?: boolean
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          order_id?: string | null
          payload?: Json
          processed?: boolean
          processing_error?: string | null
          provider?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          signature_verified?: boolean
        }
        Relationships: []
      }
      payout_methods: {
        Row: {
          bank_account_holder: string | null
          bank_account_number: string | null
          bank_ifsc: string | null
          bank_name: string | null
          created_at: string
          id: string
          is_default: boolean
          is_verified: boolean
          method_type: Database["public"]["Enums"]["payout_method_type"]
          seller_id: string
          updated_at: string
          upi_id: string | null
        }
        Insert: {
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          is_verified?: boolean
          method_type: Database["public"]["Enums"]["payout_method_type"]
          seller_id: string
          updated_at?: string
          upi_id?: string | null
        }
        Update: {
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          is_verified?: boolean
          method_type?: Database["public"]["Enums"]["payout_method_type"]
          seller_id?: string
          updated_at?: string
          upi_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email_verified: boolean
          id: string
          phone: string | null
          phone_verified: boolean
          rating_avg: number
          rating_count: number
          seller_agreement_accepted_at: string | null
          seller_status: Database["public"]["Enums"]["seller_status"]
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email_verified?: boolean
          id: string
          phone?: string | null
          phone_verified?: boolean
          rating_avg?: number
          rating_count?: number
          seller_agreement_accepted_at?: string | null
          seller_status?: Database["public"]["Enums"]["seller_status"]
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email_verified?: boolean
          id?: string
          phone?: string | null
          phone_verified?: boolean
          rating_avg?: number
          rating_count?: number
          seller_agreement_accepted_at?: string | null
          seller_status?: Database["public"]["Enums"]["seller_status"]
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      seller_kyc: {
        Row: {
          address_line: string | null
          city: string | null
          created_at: string
          id: string
          id_document_url: string | null
          id_number: string
          id_type: string
          legal_name: string
          phone: string
          pincode: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          seller_id: string
          state: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          submitted_at: string
          updated_at: string
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          created_at?: string
          id?: string
          id_document_url?: string | null
          id_number: string
          id_type: string
          legal_name: string
          phone: string
          pincode?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seller_id: string
          state?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          address_line?: string | null
          city?: string | null
          created_at?: string
          id?: string
          id_document_url?: string | null
          id_number?: string
          id_type?: string
          legal_name?: string
          phone?: string
          pincode?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seller_id?: string
          state?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          submitted_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      seller_payouts: {
        Row: {
          amount_inr: number
          completed_at: string | null
          created_at: string
          id: string
          initiated_at: string | null
          notes: string | null
          order_count: number
          payout_method_id: string | null
          payout_number: string
          period_end: string
          period_start: string
          reference: string | null
          seller_id: string
          status: Database["public"]["Enums"]["payout_status"]
          updated_at: string
        }
        Insert: {
          amount_inr: number
          completed_at?: string | null
          created_at?: string
          id?: string
          initiated_at?: string | null
          notes?: string | null
          order_count?: number
          payout_method_id?: string | null
          payout_number?: string
          period_end: string
          period_start: string
          reference?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Update: {
          amount_inr?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          initiated_at?: string | null
          notes?: string | null
          order_count?: number
          payout_method_id?: string | null
          payout_number?: string
          period_end?: string
          period_start?: string
          reference?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_payouts_payout_method_id_fkey"
            columns: ["payout_method_id"]
            isOneToOne: false
            referencedRelation: "payout_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_plans: {
        Row: {
          commission_pct: number
          created_at: string
          featured_slots: number
          features: Json
          id: string
          includes_spotlight: boolean
          includes_verified_badge: boolean
          is_active: boolean
          listing_limit: number
          name: string
          price_inr_monthly: number
          price_inr_yearly: number
          sort_order: number
          tagline: string | null
          tier: Database["public"]["Enums"]["plan_tier"]
          updated_at: string
        }
        Insert: {
          commission_pct?: number
          created_at?: string
          featured_slots?: number
          features?: Json
          id?: string
          includes_spotlight?: boolean
          includes_verified_badge?: boolean
          is_active?: boolean
          listing_limit?: number
          name: string
          price_inr_monthly?: number
          price_inr_yearly?: number
          sort_order?: number
          tagline?: string | null
          tier: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
        }
        Update: {
          commission_pct?: number
          created_at?: string
          featured_slots?: number
          features?: Json
          id?: string
          includes_spotlight?: boolean
          includes_verified_badge?: boolean
          is_active?: boolean
          listing_limit?: number
          name?: string
          price_inr_monthly?: number
          price_inr_yearly?: number
          sort_order?: number
          tagline?: string | null
          tier?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      seller_subscriptions: {
        Row: {
          billing_period: string
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string
          id: string
          plan_id: string
          razorpay_subscription_id: string | null
          seller_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          billing_period?: string
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          plan_id: string
          razorpay_subscription_id?: string | null
          seller_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          billing_period?: string
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          plan_id?: string
          razorpay_subscription_id?: string | null
          seller_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "seller_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "seller" | "buyer"
      boost_type: "featured" | "spotlight"
      kyc_status: "not_submitted" | "pending" | "approved" | "rejected"
      listing_status:
        | "draft"
        | "pending"
        | "active"
        | "rejected"
        | "suspended"
        | "expired"
        | "sold"
      order_status:
        | "pending_payment"
        | "paid"
        | "in_progress"
        | "delivered"
        | "completed"
        | "cancelled"
        | "disputed"
        | "refunded"
      payment_status: "created" | "attempted" | "paid" | "failed" | "refunded"
      payout_method_type: "upi" | "bank"
      payout_status: "pending" | "processing" | "paid" | "failed" | "on_hold"
      plan_tier: "free" | "basic" | "pro" | "advanced"
      seller_status: "none" | "pending" | "approved" | "suspended" | "rejected"
      settlement_status: "pending" | "eligible" | "settled" | "on_hold"
      subscription_status: "active" | "past_due" | "cancelled" | "expired"
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
      app_role: ["admin", "seller", "buyer"],
      boost_type: ["featured", "spotlight"],
      kyc_status: ["not_submitted", "pending", "approved", "rejected"],
      listing_status: [
        "draft",
        "pending",
        "active",
        "rejected",
        "suspended",
        "expired",
        "sold",
      ],
      order_status: [
        "pending_payment",
        "paid",
        "in_progress",
        "delivered",
        "completed",
        "cancelled",
        "disputed",
        "refunded",
      ],
      payment_status: ["created", "attempted", "paid", "failed", "refunded"],
      payout_method_type: ["upi", "bank"],
      payout_status: ["pending", "processing", "paid", "failed", "on_hold"],
      plan_tier: ["free", "basic", "pro", "advanced"],
      seller_status: ["none", "pending", "approved", "suspended", "rejected"],
      settlement_status: ["pending", "eligible", "settled", "on_hold"],
      subscription_status: ["active", "past_due", "cancelled", "expired"],
    },
  },
} as const
