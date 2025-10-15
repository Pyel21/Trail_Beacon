import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project details
const supabaseUrl = 'https://worxitvnytvtspdwnbiw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcnhpdHZueXR2dHNwZHduYml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTQ4MDcsImV4cCI6MjA3NTQ3MDgwN30.-bbOcFNNo2iId1S4qrwLVBYdv2roLs2vNhW7BgW_hRs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key: string) => {
        // You can implement secure storage here
        return null;
      },
      setItem: (key: string, value: string) => {
        // You can implement secure storage here
      },
      removeItem: (key: string) => {
        // You can implement secure storage here
      },
    },
  },
});

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  password: string;
  age: number;
  sex: string;
  address: string;
  phone?: string;
  emergency_contact?: string;
  medical_info?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string;
  group_id?: string;
  content: string;
  message_type: 'text' | 'emergency' | 'location' | 'image';
  is_emergency: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
  updated_at: string;
  sender?: User;
}

export interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  is_emergency_group: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: ChatGroupMember[];
}

export interface ChatGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user?: User;
}

export interface EmergencyAlert {
  id: string;
  user_id: string;
  message: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: 'active' | 'resolved' | 'cancelled';
  created_at: string;
  resolved_at?: string;
  user?: User;
}
