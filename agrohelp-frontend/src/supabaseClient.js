import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cvniojvwcjayoawveujk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bmlvanZ3Y2pheW9hd3ZldWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3OTQ4MDUsImV4cCI6MjA2MzM3MDgwNX0.xivl7udED9-JPMhlQ66ee9KCAx5ik5wUsbWLqd7VyY0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
