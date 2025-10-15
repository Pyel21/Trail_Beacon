import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Switch,
  Alert,
  Modal
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SOSSettings'>;

export default function SOSSettingsScreen({ navigation }: Props) {
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [medicalInfo, setMedicalInfo] = useState({
    conditions: 'None',
    medications: 'None',
    allergies: 'None',
    bloodType: 'O+',
    emergencyInstructions: 'Contact emergency contact immediately'
  });

  // Emergency contacts
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: 'Sarah Johnson', phone: '+63 987 654 3210', relationship: 'Spouse', isPrimary: true },
    { id: 2, name: 'Mike Rodriguez', phone: '+63 912 345 6789', relationship: 'Friend', isPrimary: false },
    { id: 3, name: 'Dr. Maria Santos', phone: '+63 955 123 4567', relationship: 'Doctor', isPrimary: false }
  ]);

  // SOS Settings
  const [sosSettings, setSosSettings] = useState({
    autoSendLocation: true,
    sendToAllContacts: true,
    includeMedicalInfo: true,
    soundAlert: true,
    vibrationAlert: true,
    countdownTimer: 5,
    autoActivate: false
  });

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      const contact = {
        id: Date.now(),
        ...newContact,
        isPrimary: false
      };
      setEmergencyContacts(prev => [...prev, contact]);
      setNewContact({ name: '', phone: '', relationship: '' });
      setShowAddContactModal(false);
    }
  };

  const handleRemoveContact = (id: number) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => setEmergencyContacts(prev => prev.filter(c => c.id !== id))
        }
      ]
    );
  };

  const handleSetPrimary = (id: number) => {
    setEmergencyContacts(prev => 
      prev.map(contact => ({
        ...contact,
        isPrimary: contact.id === id
      }))
    );
  };

  const handleTestSOS = () => {
    Alert.alert(
      'Test SOS Alert',
      'This will send a test alert to your emergency contacts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Test', 
          onPress: () => {
            Alert.alert('Test Sent', 'Test SOS alert has been sent to your emergency contacts.');
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-charcoal-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-charcoal-800">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-sky-500 text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-sand-500 text-xl font-bold">SOS Settings</Text>
        <TouchableOpacity>
          <Text className="text-sky-500 text-lg">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Emergency Contacts */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sand-500 text-lg font-semibold">Emergency Contacts</Text>
            <TouchableOpacity 
              className="bg-sky-500 rounded-full w-8 h-8 items-center justify-center"
              onPress={() => setShowAddContactModal(true)}
            >
              <Text className="text-white text-lg">+</Text>
            </TouchableOpacity>
          </View>
          
          {emergencyContacts.map((contact) => (
            <View key={contact.id} className="bg-charcoal-800 rounded-xl p-4 mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center space-x-2">
                    <Text className="text-sand-500 text-base font-semibold">{contact.name}</Text>
                    {contact.isPrimary && (
                      <View className="bg-sky-500 rounded-full px-2 py-1">
                        <Text className="text-white text-xs font-semibold">PRIMARY</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-muted text-sm">{contact.phone}</Text>
                  <Text className="text-muted text-sm">{contact.relationship}</Text>
                </View>
                <View className="flex-row space-x-2">
                  {!contact.isPrimary && (
                    <TouchableOpacity 
                      className="bg-moss-500 rounded-full px-3 py-1"
                      onPress={() => handleSetPrimary(contact.id)}
                    >
                      <Text className="text-white text-xs">Set Primary</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    className="bg-rust-500 rounded-full px-3 py-1"
                    onPress={() => handleRemoveContact(contact.id)}
                  >
                    <Text className="text-white text-xs">Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Medical Information */}
        <View className="mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sand-500 text-lg font-semibold">Medical Information</Text>
            <TouchableOpacity 
              className="bg-moss-500 rounded-full px-4 py-2"
              onPress={() => setShowMedicalModal(true)}
            >
              <Text className="text-white text-sm font-semibold">Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View className="bg-charcoal-800 rounded-xl p-4">
            <View className="space-y-3">
              <View>
                <Text className="text-muted text-sm">Medical Conditions</Text>
                <Text className="text-sand-500 text-base">{medicalInfo.conditions}</Text>
              </View>
              <View>
                <Text className="text-muted text-sm">Current Medications</Text>
                <Text className="text-sand-500 text-base">{medicalInfo.medications}</Text>
              </View>
              <View>
                <Text className="text-muted text-sm">Allergies</Text>
                <Text className="text-sand-500 text-base">{medicalInfo.allergies}</Text>
              </View>
              <View>
                <Text className="text-muted text-sm">Blood Type</Text>
                <Text className="text-sand-500 text-base">{medicalInfo.bloodType}</Text>
              </View>
              <View>
                <Text className="text-muted text-sm">Emergency Instructions</Text>
                <Text className="text-sand-500 text-base">{medicalInfo.emergencyInstructions}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SOS Alert Settings */}
        <View className="mt-6">
          <Text className="text-sand-500 text-lg font-semibold mb-4">SOS Alert Settings</Text>
          
          <View className="bg-charcoal-800 rounded-xl p-4 space-y-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sand-500 text-base">Auto Send Location</Text>
                <Text className="text-muted text-sm">Include GPS coordinates in SOS alerts</Text>
              </View>
              <Switch
                value={sosSettings.autoSendLocation}
                onValueChange={(value) => setSosSettings(prev => ({ ...prev, autoSendLocation: value }))}
                trackColor={{ false: '#6B6B6B', true: '#4A90E2' }}
                thumbColor={sosSettings.autoSendLocation ? '#FFFFFF' : '#F5E6C8'}
              />
            </View>
            
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sand-500 text-base">Send to All Contacts</Text>
                <Text className="text-muted text-sm">Alert all emergency contacts</Text>
              </View>
              <Switch
                value={sosSettings.sendToAllContacts}
                onValueChange={(value) => setSosSettings(prev => ({ ...prev, sendToAllContacts: value }))}
                trackColor={{ false: '#6B6B6B', true: '#4A90E2' }}
                thumbColor={sosSettings.sendToAllContacts ? '#FFFFFF' : '#F5E6C8'}
              />
            </View>
            
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sand-500 text-base">Include Medical Info</Text>
                <Text className="text-muted text-sm">Send medical information with alerts</Text>
              </View>
              <Switch
                value={sosSettings.includeMedicalInfo}
                onValueChange={(value) => setSosSettings(prev => ({ ...prev, includeMedicalInfo: value }))}
                trackColor={{ false: '#6B6B6B', true: '#4A90E2' }}
                thumbColor={sosSettings.includeMedicalInfo ? '#FFFFFF' : '#F5E6C8'}
              />
            </View>
            
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sand-500 text-base">Sound Alert</Text>
                <Text className="text-muted text-sm">Play sound when SOS is activated</Text>
              </View>
              <Switch
                value={sosSettings.soundAlert}
                onValueChange={(value) => setSosSettings(prev => ({ ...prev, soundAlert: value }))}
                trackColor={{ false: '#6B6B6B', true: '#4A90E2' }}
                thumbColor={sosSettings.soundAlert ? '#FFFFFF' : '#F5E6C8'}
              />
            </View>
            
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sand-500 text-base">Vibration Alert</Text>
                <Text className="text-muted text-sm">Vibrate when SOS is activated</Text>
              </View>
              <Switch
                value={sosSettings.vibrationAlert}
                onValueChange={(value) => setSosSettings(prev => ({ ...prev, vibrationAlert: value }))}
                trackColor={{ false: '#6B6B6B', true: '#4A90E2' }}
                thumbColor={sosSettings.vibrationAlert ? '#FFFFFF' : '#F5E6C8'}
              />
            </View>
          </View>
        </View>

        {/* Countdown Timer */}
        <View className="mt-6">
          <Text className="text-sand-500 text-lg font-semibold mb-4">Countdown Timer</Text>
          
          <View className="bg-charcoal-800 rounded-xl p-4">
            <Text className="text-sand-500 text-base mb-2">SOS Activation Delay: {sosSettings.countdownTimer} seconds</Text>
            <View className="flex-row space-x-2">
              {[3, 5, 10, 15].map((seconds) => (
                <TouchableOpacity
                  key={seconds}
                  className={`rounded-xl px-4 py-2 ${
                    sosSettings.countdownTimer === seconds ? 'bg-sky-500' : 'bg-charcoal-700'
                  }`}
                  onPress={() => setSosSettings(prev => ({ ...prev, countdownTimer: seconds }))}
                >
                  <Text className={`text-sm font-semibold ${
                    sosSettings.countdownTimer === seconds ? 'text-white' : 'text-sand-500'
                  }`}>
                    {seconds}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-muted text-sm mt-2">
              Time to cancel SOS before it's sent to emergency contacts
            </Text>
          </View>
        </View>

        {/* Test SOS */}
        <View className="mt-6 mb-8">
          <Text className="text-sand-500 text-lg font-semibold mb-4">Test SOS System</Text>
          
          <TouchableOpacity 
            className="bg-action rounded-xl p-4 items-center"
            onPress={handleTestSOS}
          >
            <Text className="text-white font-bold text-lg">Send Test SOS Alert</Text>
            <Text className="text-white/80 text-sm mt-1">
              Test your emergency alert system
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Contact Modal */}
      <Modal
        visible={showAddContactModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddContactModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-charcoal-800 rounded-2xl p-6 w-full max-w-sm">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sand-500 text-lg font-semibold">Add Emergency Contact</Text>
              <TouchableOpacity onPress={() => setShowAddContactModal(false)}>
                <Text className="text-muted text-2xl">✕</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              className="bg-charcoal-700 rounded-xl px-4 py-3 text-sand-500 text-base mb-3"
              value={newContact.name}
              onChangeText={(text) => setNewContact(prev => ({ ...prev, name: text }))}
              placeholder="Full Name"
              placeholderTextColor="#6B6B6B"
            />
            
            <TextInput
              className="bg-charcoal-700 rounded-xl px-4 py-3 text-sand-500 text-base mb-3"
              value={newContact.phone}
              onChangeText={(text) => setNewContact(prev => ({ ...prev, phone: text }))}
              placeholder="Phone Number"
              placeholderTextColor="#6B6B6B"
              keyboardType="phone-pad"
            />
            
            <TextInput
              className="bg-charcoal-700 rounded-xl px-4 py-3 text-sand-500 text-base mb-4"
              value={newContact.relationship}
              onChangeText={(text) => setNewContact(prev => ({ ...prev, relationship: text }))}
              placeholder="Relationship (e.g., Spouse, Friend, Doctor)"
              placeholderTextColor="#6B6B6B"
            />
            
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="bg-charcoal-700 rounded-xl py-3 flex-1 items-center"
                onPress={() => setShowAddContactModal(false)}
              >
                <Text className="text-sand-500 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-sky-500 rounded-xl py-3 flex-1 items-center"
                onPress={handleAddContact}
              >
                <Text className="text-white font-semibold">Add Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Medical Info Modal */}
      <Modal
        visible={showMedicalModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMedicalModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-charcoal-800 rounded-2xl p-6 w-full max-w-sm max-h-96">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sand-500 text-lg font-semibold">Medical Information</Text>
              <TouchableOpacity onPress={() => setShowMedicalModal(false)}>
                <Text className="text-muted text-2xl">✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView className="space-y-3">
              <View>
                <Text className="text-sand-500 text-sm mb-1">Medical Conditions</Text>
                <TextInput
                  className="bg-charcoal-700 rounded-xl px-4 py-3 text-sand-500 text-base"
                  value={medicalInfo.conditions}
                  onChangeText={(text) => setMedicalInfo(prev => ({ ...prev, conditions: text }))}
                  placeholder="List any medical conditions"
                  placeholderTextColor="#6B6B6B"
                  multiline
                />
              </View>
              
              <View>
                <Text className="text-sand-500 text-sm mb-1">Current Medications</Text>
                <TextInput
                  className="bg-charcoal-700 rounded-xl px-4 py-3 text-sand-500 text-base"
                  value={medicalInfo.medications}
                  onChangeText={(text) => setMedicalInfo(prev => ({ ...prev, medications: text }))}
                  placeholder="List current medications"
                  placeholderTextColor="#6B6B6B"
                  multiline
                />
              </View>
              
              <View>
                <Text className="text-sand-500 text-sm mb-1">Allergies</Text>
                <TextInput
                  className="bg-charcoal-700 rounded-xl px-4 py-3 text-sand-500 text-base"
                  value={medicalInfo.allergies}
                  onChangeText={(text) => setMedicalInfo(prev => ({ ...prev, allergies: text }))}
                  placeholder="List any allergies"
                  placeholderTextColor="#6B6B6B"
                  multiline
                />
              </View>
              
              <View>
                <Text className="text-sand-500 text-sm mb-1">Blood Type</Text>
                <TextInput
                  className="bg-charcoal-700 rounded-xl px-4 py-3 text-sand-500 text-base"
                  value={medicalInfo.bloodType}
                  onChangeText={(text) => setMedicalInfo(prev => ({ ...prev, bloodType: text }))}
                  placeholder="Blood type"
                  placeholderTextColor="#6B6B6B"
                />
              </View>
            </ScrollView>
            
            <View className="flex-row space-x-3 mt-4">
              <TouchableOpacity 
                className="bg-charcoal-700 rounded-xl py-3 flex-1 items-center"
                onPress={() => setShowMedicalModal(false)}
              >
                <Text className="text-sand-500 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-sky-500 rounded-xl py-3 flex-1 items-center"
                onPress={() => setShowMedicalModal(false)}
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}