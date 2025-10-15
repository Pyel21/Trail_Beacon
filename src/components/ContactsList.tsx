import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import MessagingService, { User, ChatGroup } from '../services/MessagingService';

interface ContactsListProps {
  visible: boolean;
  onClose: () => void;
  currentUserId: string;
  onUserSelect: (user: User) => void;
  onGroupSelect: (group: ChatGroup) => void;
}

export default function ContactsList({ 
  visible, 
  onClose, 
  currentUserId, 
  onUserSelect, 
  onGroupSelect 
}: ContactsListProps) {
  const [contacts, setContacts] = useState<User[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'contacts' | 'groups'>('contacts');

  useEffect(() => {
    if (visible) {
      loadContacts();
      loadGroups();
    }
  }, [visible]);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would have a contacts/friends system
      // For now, we'll simulate with some demo users
      const demoContacts: User[] = [
        {
          id: '1',
          email: 'sarah@example.com',
          name: 'Sarah Johnson',
          username: 'sarah_j',
          password: 'password123',
          age: 28,
          sex: 'Female',
          address: 'Manila, Philippines',
          phone: '+63 987 654 3210',
          emergency_contact: '+63 912 345 6789',
          medical_info: 'No known allergies',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'mike@example.com',
          name: 'Mike Rodriguez',
          username: 'mike_r',
          password: 'password123',
          age: 32,
          sex: 'Male',
          address: 'Cebu, Philippines',
          phone: '+63 912 345 6789',
          emergency_contact: '+63 987 654 3210',
          medical_info: 'Asthma',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          email: 'dr.maria@example.com',
          name: 'Dr. Maria Santos',
          username: 'dr_maria',
          password: 'password123',
          age: 45,
          sex: 'Female',
          address: 'Davao, Philippines',
          phone: '+63 955 123 4567',
          emergency_contact: '+63 912 345 6789',
          medical_info: 'Emergency Medicine Specialist',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      setContacts(demoContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const loadedGroups = await MessagingService.getGroups(currentUserId);
      setGroups(loadedGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const createGroup = async () => {
    Alert.prompt(
      'Create Group',
      'Enter group name:',
      async (groupName) => {
        if (groupName && groupName.trim()) {
          try {
            const group = await MessagingService.createGroup({
              name: groupName.trim(),
              description: 'Hiking group',
              is_emergency_group: false,
              created_by: currentUserId,
            });
            
            if (group) {
              setGroups(prev => [group, ...prev]);
              Alert.alert('Success', 'Group created successfully');
            } else {
              Alert.alert('Error', 'Failed to create group');
            }
          } catch (error) {
            console.error('Error creating group:', error);
            Alert.alert('Error', 'Failed to create group');
          }
        }
      }
    );
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContact = (contact: User) => (
    <TouchableOpacity
      key={contact.id}
      className="bg-charcoal-800 rounded-xl p-4 mb-3 flex-row items-center space-x-3"
      onPress={() => onUserSelect(contact)}
    >
      <View className="w-12 h-12 bg-sky-500 rounded-full items-center justify-center">
        <Text className="text-white text-lg font-bold">
          {contact.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View className="flex-1">
        <Text className="text-sand-500 text-lg font-semibold">
          {contact.name}
        </Text>
        <Text className="text-muted text-sm">
          {contact.email}
        </Text>
        {contact.phone && (
          <Text className="text-muted text-sm">
            📞 {contact.phone}
          </Text>
        )}
      </View>
      
      <TouchableOpacity className="bg-sky-500 rounded-full w-8 h-8 items-center justify-center">
        <Text className="text-white text-sm">💬</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderGroup = (group: ChatGroup) => (
    <TouchableOpacity
      key={group.id}
      className="bg-charcoal-800 rounded-xl p-4 mb-3 flex-row items-center space-x-3"
      onPress={() => onGroupSelect(group)}
    >
      <View className="w-12 h-12 bg-moss-500 rounded-full items-center justify-center">
        <Text className="text-white text-lg font-bold">
          {group.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View className="flex-1">
        <Text className="text-sand-500 text-lg font-semibold">
          {group.name}
        </Text>
        {group.description && (
          <Text className="text-muted text-sm">
            {group.description}
          </Text>
        )}
        <Text className="text-muted text-sm">
          {group.members?.length || 0} member{(group.members?.length || 0) !== 1 ? 's' : ''}
        </Text>
      </View>
      
      <View className="items-end">
        {group.is_emergency_group && (
          <View className="bg-rust-500 rounded-full px-2 py-1 mb-1">
            <Text className="text-white text-xs font-bold">EMERGENCY</Text>
          </View>
        )}
        <TouchableOpacity className="bg-moss-500 rounded-full w-8 h-8 items-center justify-center">
          <Text className="text-white text-sm">💬</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-end">
        <View className="bg-charcoal-800 rounded-t-3xl w-full max-h-96">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-charcoal-700">
            <Text className="text-sand-500 text-xl font-bold">Contacts</Text>
            <View className="flex-row space-x-2">
              <TouchableOpacity
                className="bg-moss-500 rounded-full w-8 h-8 items-center justify-center"
                onPress={createGroup}
              >
                <Text className="text-white text-lg">+</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Text className="text-muted text-2xl">✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search */}
          <View className="p-4 border-b border-charcoal-700">
            <TextInput
              className="bg-charcoal-700 rounded-xl px-4 py-3 text-sand-500 text-base"
              placeholder="Search contacts or groups..."
              placeholderTextColor="#6B6B6B"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Tabs */}
          <View className="flex-row border-b border-charcoal-700">
            <TouchableOpacity
              className={`flex-1 py-4 items-center ${
                activeTab === 'contacts' ? 'border-b-2 border-sky-500' : ''
              }`}
              onPress={() => setActiveTab('contacts')}
            >
              <Text className={`font-semibold ${
                activeTab === 'contacts' ? 'text-sky-500' : 'text-muted'
              }`}>
                Contacts ({filteredContacts.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 items-center ${
                activeTab === 'groups' ? 'border-b-2 border-sky-500' : ''
              }`}
              onPress={() => setActiveTab('groups')}
            >
              <Text className={`font-semibold ${
                activeTab === 'groups' ? 'text-sky-500' : 'text-muted'
              }`}>
                Groups ({filteredGroups.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 p-4">
            {isLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text className="text-muted mt-2">Loading contacts...</Text>
              </View>
            ) : activeTab === 'contacts' ? (
              filteredContacts.length === 0 ? (
                <View className="items-center py-8">
                  <Text className="text-4xl mb-4">👥</Text>
                  <Text className="text-sand-500 text-lg font-semibold mb-2">
                    No contacts found
                  </Text>
                  <Text className="text-muted text-center">
                    {searchQuery ? 'Try a different search term' : 'Add contacts to start messaging'}
                  </Text>
                </View>
              ) : (
                filteredContacts.map(renderContact)
              )
            ) : (
              filteredGroups.length === 0 ? (
                <View className="items-center py-8">
                  <Text className="text-4xl mb-4">👥</Text>
                  <Text className="text-sand-500 text-lg font-semibold mb-2">
                    No groups found
                  </Text>
                  <Text className="text-muted text-center">
                    {searchQuery ? 'Try a different search term' : 'Create a group to start group messaging'}
                  </Text>
                </View>
              ) : (
                filteredGroups.map(renderGroup)
              )
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
