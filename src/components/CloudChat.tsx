import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import MessagingService, { Message, User } from '../services/MessagingService';
import { MessageSubscription } from '../services/MessagingService';

interface CloudChatProps {
  visible: boolean;
  onClose: () => void;
  currentUserId: string;
  otherUserId?: string;
  groupId?: string;
  chatTitle?: string;
}

export default function CloudChat({ 
  visible, 
  onClose, 
  currentUserId, 
  otherUserId, 
  groupId, 
  chatTitle = 'Chat' 
}: CloudChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [subscription, setSubscription] = useState<MessageSubscription | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      loadMessages();
      subscribeToMessages();
    } else {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [visible, otherUserId, groupId]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const loadedMessages = await MessagingService.getMessages(
        currentUserId,
        otherUserId,
        groupId,
        50
      );
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const sub = MessagingService.subscribeToMessages(
      currentUserId,
      otherUserId,
      groupId,
      (message) => {
        setMessages(prev => [...prev, message]);
        // Auto-scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    setSubscription(sub);
  };

  const cleanup = () => {
    if (subscription) {
      MessagingService.unsubscribeFromMessages(subscription);
      setSubscription(null);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const messageData = {
        sender_id: currentUserId,
        content: messageContent,
        message_type: 'text' as const,
        is_emergency: false,
      };

      if (otherUserId) {
        messageData.receiver_id = otherUserId;
      } else if (groupId) {
        messageData.group_id = groupId;
      }

      const sentMessage = await MessagingService.sendMessage(messageData);
      
      if (sentMessage) {
        // Message will be added via subscription
        scrollViewRef.current?.scrollToEnd({ animated: true });
      } else {
        Alert.alert('Error', 'Failed to send message');
        setNewMessage(messageContent); // Restore message
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setNewMessage(messageContent); // Restore message
    } finally {
      setIsSending(false);
    }
  };

  const sendEmergencyMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageContent = `🚨 EMERGENCY: ${newMessage.trim()}`;
    setNewMessage('');
    setIsSending(true);

    try {
      const messageData = {
        sender_id: currentUserId,
        content: messageContent,
        message_type: 'emergency' as const,
        is_emergency: true,
      };

      if (otherUserId) {
        messageData.receiver_id = otherUserId;
      } else if (groupId) {
        messageData.group_id = groupId;
      }

      const sentMessage = await MessagingService.sendMessage(messageData);
      
      if (sentMessage) {
        Alert.alert('Emergency Sent', 'Your emergency message has been sent to all contacts.');
      } else {
        Alert.alert('Error', 'Failed to send emergency message');
        setNewMessage(newMessage); // Restore message
      }
    } catch (error) {
      console.error('Error sending emergency message:', error);
      Alert.alert('Error', 'Failed to send emergency message');
      setNewMessage(newMessage); // Restore message
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (message: Message) => {
    return message.sender_id === currentUserId;
  };

  const renderMessage = (message: Message, index: number) => {
    const isMine = isMyMessage(message);
    const isEmergency = message.is_emergency;
    const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;

    return (
      <View key={message.id} className={`flex-row mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
        {!isMine && showAvatar && (
          <View className="w-8 h-8 bg-sky-500 rounded-full items-center justify-center mr-2">
            <Text className="text-white text-xs font-bold">
              {message.sender?.name?.charAt(0) || 'U'}
            </Text>
          </View>
        )}
        
        <View className={`max-w-xs ${!isMine && !showAvatar ? 'ml-10' : ''}`}>
          {!isMine && showAvatar && (
            <Text className="text-muted text-xs mb-1">
              {message.sender?.name || 'Unknown User'}
            </Text>
          )}
          
          <View className={`rounded-2xl px-4 py-3 ${
            isMine 
              ? 'bg-sky-500 rounded-br-sm' 
              : 'bg-charcoal-700 rounded-bl-sm'
          } ${isEmergency ? 'border-2 border-rust-500' : ''}`}>
            <Text className={`text-sm ${
              isMine ? 'text-white' : 'text-sand-500'
            } ${isEmergency ? 'font-bold' : ''}`}>
              {message.content}
            </Text>
            
            {isEmergency && (
              <Text className="text-rust-500 text-xs font-bold mt-1">
                🚨 EMERGENCY
              </Text>
            )}
          </View>
          
          <Text className={`text-muted text-xs mt-1 ${
            isMine ? 'text-right' : 'text-left'
          }`}>
            {formatTime(message.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        className="flex-1 bg-black/50"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 bg-charcoal-900">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-charcoal-700">
            <View className="flex-row items-center space-x-3">
              <TouchableOpacity onPress={onClose}>
                <Text className="text-sky-500 text-lg">← Back</Text>
              </TouchableOpacity>
              <View>
                <Text className="text-sand-500 text-lg font-semibold">{chatTitle}</Text>
                <Text className="text-muted text-sm">
                  {messages.length} message{messages.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            
            <View className="flex-row space-x-2">
              <TouchableOpacity className="bg-moss-500 rounded-full w-8 h-8 items-center justify-center">
                <Text className="text-white text-sm">📞</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-moss-500 rounded-full w-8 h-8 items-center justify-center">
                <Text className="text-white text-sm">⤢</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages */}
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1 p-4"
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View className="flex-1 items-center justify-center py-8">
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text className="text-muted mt-2">Loading messages...</Text>
              </View>
            ) : messages.length === 0 ? (
              <View className="flex-1 items-center justify-center py-8">
                <Text className="text-4xl mb-4">💬</Text>
                <Text className="text-sand-500 text-lg font-semibold mb-2">
                  No messages yet
                </Text>
                <Text className="text-muted text-center">
                  Start a conversation by sending a message
                </Text>
              </View>
            ) : (
              messages.map((message, index) => renderMessage(message, index))
            )}
          </ScrollView>

          {/* Message Input */}
          <View className="p-4 border-t border-charcoal-700">
            <View className="flex-row items-end space-x-3">
              <View className="flex-1">
                <TextInput
                  className="bg-charcoal-700 rounded-2xl px-4 py-3 text-sand-500 text-base max-h-20"
                  placeholder="Type a message..."
                  placeholderTextColor="#6B6B6B"
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                  editable={!isSending}
                />
              </View>
              
              <TouchableOpacity
                className="bg-rust-500 rounded-full w-10 h-10 items-center justify-center"
                onPress={sendEmergencyMessage}
                disabled={!newMessage.trim() || isSending}
              >
                <Text className="text-white text-lg">🚨</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-sky-500 rounded-full w-10 h-10 items-center justify-center"
                onPress={sendMessage}
                disabled={!newMessage.trim() || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-lg">✈️</Text>
                )}
              </TouchableOpacity>
            </View>
            
            <Text className="text-muted text-xs mt-2 text-center">
              Tap 🚨 for emergency message
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
