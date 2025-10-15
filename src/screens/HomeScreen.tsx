import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import WiFiDirectDemo from '../components/WiFiDirectDemo';
import CloudChat from '../components/CloudChat';
import ContactsList from '../components/ContactsList';
import MessagingService, { User, ChatGroup } from '../services/MessagingService';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<'contacts' | 'calendar' | 'profile'>('contacts');
  const [showSOSAlert, setShowSOSAlert] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showWiFiDemo, setShowWiFiDemo] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showCloudChat, setShowCloudChat] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [currentUserId] = useState('demo-user-123'); // In real app, get from auth

  const handleSOSAlert = () => {
    setShowSOSAlert(true);
  };

  const handleEmergencySOS = async () => {
    try {
      const alert = await MessagingService.createEmergencyAlert({
        user_id: currentUserId,
        message: 'Emergency SOS activated - immediate assistance needed',
        location: {
          latitude: 7.0707,
          longitude: 125.6127
        }
      });

      if (alert) {
        Alert.alert(
          'Emergency SOS Activated',
          'Your emergency alert has been sent to all contacts in your hiking circle.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert('Error', 'Failed to send emergency alert');
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      Alert.alert('Error', 'Failed to send emergency alert');
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    setShowContacts(false);
    setShowCloudChat(true);
  };

  const handleGroupSelect = (group: ChatGroup) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    setShowContacts(false);
    setShowCloudChat(true);
  };

  const handleCloseCloudChat = () => {
    setShowCloudChat(false);
    setSelectedUser(null);
    setSelectedGroup(null);
  };

  const contacts = [
    { id: 1, name: 'Mount Pulag (Charity Cause)', initial: 'P', role: 'Member', status: 'Upcoming', date: '09/27/24' },
    { id: 2, name: 'Mount Pinatubo - Group', initial: 'P', role: 'Member', status: 'Past', date: '10/14/23' },
    { id: 3, name: 'Mount Sirae Peak Trail - Personal', initial: 'S', role: 'Admin', status: 'Past', date: '12/03/23' },
  ];

  const calendarDates = [
    { date: 26, highlighted: false },
    { date: 27, highlighted: true },
    { date: 28, highlighted: true },
    { date: 29, highlighted: true },
    { date: 30, highlighted: true },
  ];

	return (
    <View className="flex-1 bg-charcoal-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-charcoal-800">
        <Text className="text-sky-500 text-2xl font-bold">BEACON</Text>
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={() => setShowContacts(true)}>
            <View className="w-6 h-6 bg-sky-500 rounded-full items-center justify-center">
              <Text className="text-white text-xs">💬</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowChat(true)}>
            <View className="w-6 h-6 bg-moss-500 rounded-full items-center justify-center">
              <Text className="text-white text-xs">📱</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AccountSettings')}>
            <Text className="text-white text-xl">⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Activity Section */}
      <View className="mx-6 mt-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-sand-500 text-lg font-semibold">Activity</Text>
          <View className="flex-row items-center space-x-2">
            <Text className="text-sky-500 text-sm font-medium">Upcoming</Text>
            <Text className="text-muted text-sm">- 09/27/24</Text>
          </View>
        </View>
        
        {/* Map Area */}
        <View className="bg-map h-32 rounded-xl mb-4 relative">
          <View className="absolute inset-0 items-center justify-center">
            <View className="w-8 h-8 bg-rust-500 rounded-full items-center justify-center">
              <Text className="text-white text-xs">📍</Text>
            </View>
          </View>
        </View>

        {/* Activity Card */}
        <View className="bg-charcoal-800 rounded-xl p-4 mb-6">
          <Text className="text-sand-500 text-base font-medium mb-3">
            Climbing Mt. Pulag (For Charity Cause)
          </Text>
          <View className="flex-row space-x-4">
            <View className="bg-charcoal-700 rounded-full px-3 py-1">
              <Text className="text-sand-500 text-sm">12 hrs</Text>
            </View>
            <View className="bg-charcoal-700 rounded-full px-3 py-1">
              <Text className="text-sand-500 text-sm">18</Text>
            </View>
            <View className="bg-charcoal-700 rounded-full px-3 py-1">
              <Text className="text-sand-500 text-sm">4-6 km</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Main Content based on active tab */}
      <ScrollView className="flex-1 px-6">
        {activeTab === 'contacts' && (
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sand-500 text-lg font-semibold">Group Contacts</Text>
              <TouchableOpacity className="bg-moss-500 rounded-full w-8 h-8 items-center justify-center">
                <Text className="text-white text-lg">+</Text>
              </TouchableOpacity>
            </View>
            
            {contacts.map((contact) => (
              <View key={contact.id} className="bg-charcoal-800 rounded-xl p-4 mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center space-x-3">
                  <View className="w-10 h-10 bg-charcoal-700 rounded-full items-center justify-center">
                    <Text className="text-sand-500 font-semibold">{contact.initial}</Text>
                  </View>
                  <View>
                    <Text className="text-sand-500 font-medium">{contact.name}</Text>
                    <Text className="text-muted text-sm">{contact.role}</Text>
                    {contact.status === 'Upcoming' ? (
                      <Text className="text-sky-500 text-sm font-medium">{contact.status}</Text>
                    ) : (
                      <Text className="text-muted text-sm">{contact.date}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity>
                  <Text className="text-muted">✏️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'calendar' && (
          <View>
            <Text className="text-sand-500 text-lg font-semibold mb-4">Activity Calendar</Text>
            
            {/* Calendar Header */}
            <View className="bg-charcoal-800 rounded-xl p-4 mb-4">
              <Text className="text-sand-500 text-center font-semibold mb-4">September 26</Text>
              
              {/* Calendar Grid */}
              <View className="flex-row justify-between mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} className="text-muted text-sm text-center w-8">{day}</Text>
                ))}
              </View>
              
              <View className="flex-row flex-wrap">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((date) => (
                  <View key={date} className="w-8 h-8 items-center justify-center mb-1">
                    <View className={`w-6 h-6 rounded-full items-center justify-center ${
                      calendarDates.some(d => d.date === date && d.highlighted) 
                        ? 'bg-sky-500' 
                        : 'bg-transparent'
                    }`}>
                      <Text className={`text-sm ${
                        calendarDates.some(d => d.date === date && d.highlighted)
                          ? 'text-white'
                          : 'text-sand-500'
                      }`}>
                        {date}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity className="bg-sky-500 rounded-xl px-4 py-3 flex-1">
                <Text className="text-white text-center font-medium">Upcoming 27-30 Mount Pulag</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-charcoal-700 rounded-xl px-4 py-3 flex-1">
                <Text className="text-sand-500 text-center">No Upcoming Activities</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'profile' && (
          <View>
            <Text className="text-sand-500 text-lg font-semibold mb-4">Mini Profile</Text>
            
            <View className="bg-charcoal-800 rounded-xl p-6 items-center">
              <View className="w-20 h-20 bg-sky-500 rounded-full items-center justify-center mb-4">
                <Text className="text-white text-2xl">👤</Text>
              </View>
              <Text className="text-sand-500 text-xl font-semibold mb-4">Aleckzz Palero</Text>
              
              <View className="space-y-3 w-full">
                <TouchableOpacity className="bg-charcoal-700 rounded-xl p-3 flex-row items-center justify-between">
                  <Text className="text-sand-500">+63 912 345 6789</Text>
                  <Text className="text-muted">📞</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="bg-charcoal-700 rounded-xl p-3 flex-row items-center justify-between"
                  onPress={() => navigation.navigate('SOSSettings')}
                >
                  <Text className="text-sand-500">Medical Info</Text>
                  <Text className="text-muted">+</Text>
                </TouchableOpacity>
              </View>
              
              <View className="mt-6 w-full">
                <Text className="text-sand-500 font-semibold mb-2">About Me:</Text>
                <Text className="text-muted text-sm leading-5">
                  Find a way or find a trail when it comes to mountain climbing/trekking. 
                  It gives me the feeling of freedom.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Preparations Section */}
        <View className="mt-6">
          <Text className="text-sand-500 text-lg font-semibold mb-4">Preparations</Text>
          
          <View className="space-y-3">
            <TouchableOpacity className="bg-charcoal-800 rounded-xl p-4 flex-row items-center space-x-4">
              <Text className="text-2xl">🎒</Text>
              <Text className="text-sand-500 flex-1">Pack Things</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-charcoal-800 rounded-xl p-4 flex-row items-center space-x-4">
              <Text className="text-2xl">🥾</Text>
              <Text className="text-sand-500 flex-1">Hiking Exercise - Today</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-charcoal-800 rounded-xl p-4 flex-row items-center space-x-4"
              onPress={() => navigation.navigate('SOSSettings')}
            >
              <Text className="text-2xl">❤️</Text>
              <Text className="text-sand-500 flex-1">Add - Medical Info</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-sky-500 rounded-xl p-4 flex-row items-center space-x-4"
              onPress={() => setShowWiFiDemo(true)}
            >
              <Text className="text-2xl">📡</Text>
              <Text className="text-white flex-1 font-semibold">WiFi Direct Demo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Emergency SOS Button */}
      <View className="px-6 py-4">
        <TouchableOpacity 
          className="bg-action rounded-3xl py-4 items-center"
          onPress={handleEmergencySOS}
        >
          <Text className="text-white font-bold text-lg">Emergency SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View className="bg-charcoal-800 flex-row justify-around py-4">
        <TouchableOpacity 
          className={`items-center ${activeTab === 'contacts' ? 'opacity-100' : 'opacity-50'}`}
          onPress={() => setActiveTab('contacts')}
        >
          <Text className="text-2xl mb-1">👥</Text>
          <Text className={`text-sm ${activeTab === 'contacts' ? 'text-sky-500' : 'text-sand-500'}`}>
            Contacts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`items-center ${activeTab === 'calendar' ? 'opacity-100' : 'opacity-50'}`}
          onPress={() => setActiveTab('calendar')}
        >
          <Text className="text-2xl mb-1">📅</Text>
          <Text className={`text-sm ${activeTab === 'calendar' ? 'text-sky-500' : 'text-sand-500'}`}>
            Calendar
          </Text>
			</TouchableOpacity>

        <TouchableOpacity 
          className={`items-center ${activeTab === 'profile' ? 'opacity-100' : 'opacity-50'}`}
          onPress={() => setActiveTab('profile')}
        >
          <Text className="text-2xl mb-1">👤</Text>
          <Text className={`text-sm ${activeTab === 'profile' ? 'text-sky-500' : 'text-sand-500'}`}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* SOS Alert Modal */}
      <Modal
        visible={showSOSAlert}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSOSAlert(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl">🚨</Text>
              <TouchableOpacity onPress={() => setShowSOSAlert(false)}>
                <Text className="text-2xl">✕</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-charcoal-900 text-lg font-semibold mb-4 text-center">
              Someone in your current hiking circle has activated an Emergency SOS!
            </Text>
            <TouchableOpacity 
              className="bg-sky-500 rounded-xl py-3 items-center"
              onPress={() => {
                setShowSOSAlert(false);
                setShowChat(true);
              }}
            >
              <Text className="text-white font-semibold">Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Chat Modal */}
      <Modal
        visible={showChat}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowChat(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-end">
          <View className="bg-white rounded-t-3xl p-6 w-full max-h-96">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-charcoal-900 font-semibold text-lg">Doug</Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity>
                  <Text className="text-2xl">⤢</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowChat(false)}>
                  <Text className="text-2xl">✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View className="mb-4">
              <Text className="text-muted text-sm mb-2">11:36 AM</Text>
              <View className="bg-sky-500 rounded-2xl rounded-tl-sm p-3 self-start max-w-xs">
                <Text className="text-white">Hey, what happened? Are you ok?</Text>
              </View>
              <Text className="text-muted text-xs mt-1">Delivered</Text>
            </View>
            
            <View className="flex-row items-center space-x-3">
              <TextInput
                className="flex-1 bg-charcoal-100 rounded-2xl px-4 py-3 text-charcoal-900"
                placeholder="Send a message..."
                placeholderTextColor="#6B6B6B"
                value={chatMessage}
                onChangeText={setChatMessage}
              />
              <TouchableOpacity className="bg-sky-500 rounded-full w-10 h-10 items-center justify-center">
                <Text className="text-white">✈️</Text>
				</TouchableOpacity>
			</View>
          </View>
        </View>
      </Modal>

      {/* WiFi Direct Demo Modal */}
      <Modal
        visible={showWiFiDemo}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWiFiDemo(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 bg-charcoal-900">
            <View className="flex-row items-center justify-between p-6 border-b border-charcoal-700">
              <Text className="text-sand-500 text-xl font-bold">WiFi Direct Demo</Text>
              <TouchableOpacity onPress={() => setShowWiFiDemo(false)}>
                <Text className="text-muted text-2xl">✕</Text>
              </TouchableOpacity>
            </View>
            <WiFiDirectDemo />
          </View>
        </View>
      </Modal>

      {/* Contacts List Modal */}
      <ContactsList
        visible={showContacts}
        onClose={() => setShowContacts(false)}
        currentUserId={currentUserId}
        onUserSelect={handleUserSelect}
        onGroupSelect={handleGroupSelect}
      />

      {/* Cloud Chat Modal */}
      <CloudChat
        visible={showCloudChat}
        onClose={handleCloseCloudChat}
        currentUserId={currentUserId}
        otherUserId={selectedUser?.id}
        groupId={selectedGroup?.id}
        chatTitle={selectedUser?.name || selectedGroup?.name || 'Chat'}
      />
    </View>
  );
}