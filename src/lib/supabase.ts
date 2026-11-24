"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Null when Supabase isn't configured: accounts are then hidden and lists stay on the device. */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
