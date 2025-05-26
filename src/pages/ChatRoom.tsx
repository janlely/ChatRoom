import React, { useState, Dispatch, SetStateAction } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import FeatherIcon from '@react-native-vector-icons/feather';
import { NavigationProps } from '../Types';
import { EmojiKeyboard, EmojiType } from 'rn-emoji-keyboard';
import { removeLastCharacter } from '../utils';


type Message = {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isUser: boolean;
};

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'Alex',
    text: 'Hey, how are you doing?',
    timestamp: '4:30 PM',
    isUser: false,
  },
  {
    id: '2',
    sender: 'You',
    text: "I'm good, thanks! What about you?",
    timestamp: '4:32 PM',
    isUser: true,
  },
  {
    id: '3',
    sender: 'Alex',
    text: 'Pretty good. Just working on some projects.',
    timestamp: '4:35 PM',
    isUser: false,
  },
];

type ChatRoomProps = NavigationProps<'ChatRoom'>
export default function ChatRoomScreen({ navigation, route }: ChatRoomProps) {
  const { roomName } = route.params;
  const [messages, setMessages]: [Message[], Dispatch<SetStateAction<Message[]>>] = useState(initialMessages);
  const [newMessage, setNewMessage]: [string, Dispatch<SetStateAction<string>>] = useState('');
  const [openEmojiPicker, setOpenEmojiPicker] = React.useState(false);



  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timestamp = `${formattedHours}:${formattedMinutes} ${ampm}`;
    
    const message = {
      id: Date.now().toString(),
      sender: 'You',
      text: newMessage,
      timestamp,
      isUser: true,
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessageContainer : styles.otherMessageContainer
    ]}>
      {!item.isUser && <Text style={styles.senderName}>{item.sender}</Text>}
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  const handleEmojiPick = (emoji: EmojiType) => {
    console.log(emoji);
    setNewMessage(pre => pre + emoji.emoji)
  };

  return (
    <TouchableWithoutFeedback onPress={() => setOpenEmojiPicker(false)}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{roomName}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RoomMembers', { roomName })}>
            <View style={styles.profileIcon}>
              <Ionicons name="people" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item: Message) => item.id}
          contentContainerStyle={styles.messagesList}
        />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message"
              value={newMessage}
              onChangeText={setNewMessage}
              autoCorrect={false}
              autoCapitalize="none"
              underlineColorAndroid="transparent"
              onFocus={() => {setOpenEmojiPicker(false)}}
            />
            <TouchableOpacity
              style={styles.emojiButton}
              onPress={() => {setOpenEmojiPicker(true);Keyboard.dismiss()}}
            >
              <Ionicons name="happy-outline" size={24} color="#6B9AE8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic-outline" size={24} color="#6B9AE8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Ionicons name="send" size={24} color="#6B9AE8" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        {openEmojiPicker &&
          <View style={{height: 300}}>
            <EmojiKeyboard
              onEmojiSelected={handleEmojiPick}
              allowMultipleSelections={true}
              categoryPosition="top"
              customButtons={[
                <TouchableOpacity
                  onPress={() => { setNewMessage(pre => removeLastCharacter(pre)) }}
                  activeOpacity={newMessage.length > 0 ? 0.5 : 1}
                >
                  <FeatherIcon name="delete" size={24} color={newMessage.length > 0 ? "#6B9AE8" : "lightgray"} />
                </TouchableOpacity>
              ]}
            />
          </View>
        }
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6B9AE8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#6B9AE8',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  emojiButton: {
    marginHorizontal: 4,
  },
  micButton: {
    marginHorizontal: 4,
  },
  sendButton: {
    marginLeft: 4,
  },
});