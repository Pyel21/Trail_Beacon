import { supabase, User, Message, ChatGroup, ChatGroupMember, EmergencyAlert } from '../config/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface MessageSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

class MessagingService {
  private subscriptions: Map<string, MessageSubscription> = new Map();

  // User Management
  async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  // Message Management
  async sendMessage(messageData: {
    sender_id: string;
    receiver_id?: string;
    group_id?: string;
    content: string;
    message_type?: 'text' | 'emergency' | 'location' | 'image';
    is_emergency?: boolean;
    location?: { latitude: number; longitude: number };
  }): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          ...messageData,
          message_type: messageData.message_type || 'text',
          is_emergency: messageData.is_emergency || false,
        }])
        .select(`
          *,
          sender:users!messages_sender_id_fkey(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  async getMessages(
    userId: string,
    otherUserId?: string,
    groupId?: string,
    limit: number = 50
  ): Promise<Message[]> {
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (groupId) {
        query = query.eq('group_id', groupId);
      } else if (otherUserId) {
        query = query.or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`);
      } else {
        query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data?.reverse() || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  // Real-time Message Subscriptions
  subscribeToMessages(
    userId: string,
    onMessage: (message: Message) => void,
    otherUserId?: string,
    groupId?: string
  ): MessageSubscription | null {
    try {
      let channelName: string;
      let filter: string;

      if (groupId) {
        channelName = `messages:group:${groupId}`;
        filter = `group_id=eq.${groupId}`;
      } else if (otherUserId) {
        channelName = `messages:direct:${userId}:${otherUserId}`;
        filter = `or(and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId}))`;
      } else {
        channelName = `messages:user:${userId}`;
        filter = `or(sender_id.eq.${userId},receiver_id.eq.${userId})`;
      }

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: filter,
          },
          async (payload) => {
            const message = payload.new as Message;
            // Fetch the sender information
            const sender = await this.getUser(message.sender_id);
            onMessage({ ...message, sender: sender ?? undefined });
          }
        )
        .subscribe();

      const subscription: MessageSubscription = {
        channel,
        unsubscribe: () => {
          supabase.removeChannel(channel);
          this.subscriptions.delete(channelName);
        }
      };

      this.subscriptions.set(channelName, subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      return null;
    }
  }

  unsubscribeFromMessages(subscription: MessageSubscription): void {
    subscription.unsubscribe();
  }

  // Chat Groups
  async createGroup(groupData: {
    name: string;
    description?: string;
    is_emergency_group?: boolean;
    created_by: string;
  }): Promise<ChatGroup | null> {
    try {
      const { data, error } = await supabase
        .from('chat_groups')
        .insert([groupData])
        .select(`
          *,
          members:chat_group_members(
            *,
            user:users(*)
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      return null;
    }
  }

  async getGroups(userId: string): Promise<ChatGroup[]> {
    try {
      const { data, error } = await supabase
        .from('chat_groups')
        .select(`
          *,
          members:chat_group_members(
            *,
            user:users(*)
          )
        `)
        .eq('members.user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  }

  async addUserToGroup(groupId: string, userId: string, role: 'admin' | 'member' = 'member'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_group_members')
        .insert([{
          group_id: groupId,
          user_id: userId,
          role: role,
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding user to group:', error);
      return false;
    }
  }

  // Emergency Alerts
  async createEmergencyAlert(alertData: {
    user_id: string;
    message: string;
    location?: { latitude: number; longitude: number };
  }): Promise<EmergencyAlert | null> {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .insert([{
          ...alertData,
          status: 'active',
        }])
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      return null;
    }
  }

  async getEmergencyAlerts(userId: string): Promise<EmergencyAlert[]> {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select(`
          *,
          user:users(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching emergency alerts:', error);
      return [];
    }
  }

  async resolveEmergencyAlert(alertId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .update({ 
          status: 'resolved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error resolving emergency alert:', error);
      return false;
    }
  }

  // Subscribe to emergency alerts
  subscribeToEmergencyAlerts(
    userId: string,
    onAlert: (alert: EmergencyAlert) => void
  ): MessageSubscription | null {
    try {
      const channelName = `emergency_alerts:user:${userId}`;
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'emergency_alerts',
            filter: `user_id=eq.${userId}`,
          },
          async (payload) => {
            const alert = payload.new as EmergencyAlert;
            const user = await this.getUser(alert.user_id);
            onAlert({ ...alert, user: user ?? undefined });
          }
        )
        .subscribe();

      const subscription: MessageSubscription = {
        channel,
        unsubscribe: () => {
          supabase.removeChannel(channel);
          this.subscriptions.delete(channelName);
        }
      };

      this.subscriptions.set(channelName, subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to emergency alerts:', error);
      return null;
    }
  }

  // Cleanup all subscriptions
  cleanup(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }
}

export default new MessagingService();
