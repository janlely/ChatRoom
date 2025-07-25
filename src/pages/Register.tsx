import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { NavigationProps } from '../Types';
import EntypoIcons from '@react-native-vector-icons/entypo';
import { getWebSocketClient } from '../WebSocketCli';
import { WS_URL } from '@env';


type RegisterProps = NavigationProps<'Register'>
export default function RegisterScreen({ navigation }: RegisterProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');

  const handleSubmit = () => {
    console.log('Connecting to WebSocket:', WS_URL);
    getWebSocketClient().connect(WS_URL)
      .then((client) => {
        client.sendMessage({ type: 'register', payload: { username, password, inviteCode: invitationCode } }, (response) => {
          console.log('Register response:', response);
          if (response.payload?.success) {
            navigation.replace('RoomList')
          } else {
            Alert.alert('Error', response.payload?.message || 'Unknown error');
          }
        });
      })
      .catch((error) => {
        console.error('Error connecting to WebSocket:', error);
      });
      
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <EntypoIcons name="chat" size={40} color="#6B9AE8" />
            <Text style={styles.logoText}>Chatify</Text>
          </View>
          
          <Text style={styles.title}>Register</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="Invitation Code"
              value={invitationCode}
              onChangeText={setInvitationCode}
            />
            
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={() => navigation.replace('Login')}
            >
              <Text style={styles.loginButtonText}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#6B9AE8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#6B9AE8',
    fontSize: 16,
  },
});