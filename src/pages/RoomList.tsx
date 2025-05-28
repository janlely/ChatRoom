import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { NavigationProps } from '../Types';
import EntypoIcons from '@react-native-vector-icons/entypo';
import BottomNavigation from '../components/BottomNavigation';

const ChatifyLogo = () => (
  <View style={styles.logoContainer}>
    <EntypoIcons name="chat" size={40} color="#6B9AE8" />
    <Text style={styles.logoText}>Chatify</Text>
  </View>
);

// Sample data for chat rooms
const chatRooms = [
  {
    id: '1',
    name: 'General Chat',
    description: 'Discuss anything and everything.',
    activeUsers: 120,
    color: '#f0f0f0',
  },
  {
    id: '2',
    name: 'Tech Talk',
    description: 'Latest trends in technology.',
    activeUsers: 95,
    color: '#e6eef7',
  },
  {
    id: '3',
    name: 'Music Lovers',
    description: 'Share and discover new music.',
    activeUsers: 50,
    color: '#6B9AE8',
  },
  {
    id: '4',
    name: 'Fitness Enthusiasts',
    description: 'Tips and motivation for a healthy lifestyle.',
    activeUsers: 75,
    color: '#f0f0f0',
  },
  {
    id: '5',
    name: 'Travel Buddies',
    description: 'Share your travel experiences.',
    activeUsers: 45,
    color: '#e6eef7',
  },
];


type RoomListProps = NavigationProps<'RoomList'>;

type ChatRoom = {
  id: string;
  name: string;
  description: string;
  activeUsers: number;
  color: string;
};

export default function ChatRoomsScreen({ navigation }: RoomListProps) {
  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={[styles.chatRoomItem, { backgroundColor: item.color }]}
      onPress={() => navigation.navigate('ChatRoom', { roomName: item.name })}
    >
      <Text style={styles.chatRoomName}>{item.name}</Text>
      <Text style={styles.chatRoomDescription}>{item.description} {item.activeUsers} active users.</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ChatifyLogo />
        </View>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search chat rooms..."
          />
        </View>
        
        <FlatList
          data={chatRooms}
          renderItem={renderChatRoom}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatRoomsList}
        />
      </View>
      
      <BottomNavigation navigation={navigation} currentRoute="RoomList" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    position: 'relative',
    width: 40,
    height: 40,
    marginRight: 10,
  },
  bubble1: {
    position: 'absolute',
    top: 10,
    left: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6B9AE8',
  },
  bubble2: {
    position: 'absolute',
    top: 0,
    left: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6B9AE8',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  chatRoomsList: {
    padding: 16,
  },
  chatRoomItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  chatRoomName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chatRoomDescription: {
    fontSize: 14,
    color: '#333',
  },
});