import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://litugojwlmlvmtrmflgg.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpdHVnb2p3bG1sdm10cm1mbGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyOTQyNTAsImV4cCI6MjA5OTg3MDI1MH0.8kf2Zpl3QN05CxnqHEXmiIGXUxk-mvOJpNExTATRs2Y";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
