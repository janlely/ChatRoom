import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NavigationProps } from '../Types';
import EntypoIcons from '@react-native-vector-icons/entypo';
import { getWebSocketClient } from '../WebSocketCli';
import { WS_URL } from '@env';

type LoginProps = NavigationProps<'Login'>

export default function LoginScreen({ navigation }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');

  useEffect(() => {
    generateNewQuestion();
  }, []);

  const generateNewQuestion = () => {
    setNum1(Math.floor(Math.random() * 10));
    setNum2(Math.floor(Math.random() * 10));
    setUserAnswer('');
  };

  const handleSubmit = () => {
    // 首先验证数学题答案
    const correctAnswer = num1 + num2;
    if (parseInt(userAnswer) !== correctAnswer) {
      Alert.alert('Error', 'Incorrect answer. Please try again.');
      generateNewQuestion();
      return;
    }

    // 验证通过后进行登录
    console.log('Connecting to WebSocket:', WS_URL);
    getWebSocketClient().connect(WS_URL)
      .then((client) => {
        client.sendMessage({ type: 'login', payload: { username, password } }, (response) => {
          console.log('Login response:', response);
          if (response.payload?.success) {
            navigation.replace('RoomList')
          } else {
            Alert.alert('Error', response.payload?.message || 'Invalid username or password');
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
          
          <Text style={styles.title}>Login</Text>
          
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

            <View style={styles.verificationContainer}>
              <Text style={styles.verificationText}>
                Please solve: {num1} + {num2} = ?
              </Text>
              <TextInput
                style={styles.verificationInput}
                placeholder="Enter answer"
                value={userAnswer}
                onChangeText={setUserAnswer}
                keyboardType="numeric"
              />
            </View>
            
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={() => navigation.replace('Register')}
            >
              <Text style={styles.registerButtonText}>Don't have an account? Register</Text>
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
  verificationContainer: {
    width: '100%',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  verificationText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  verificationInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'white',
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
  registerButton: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonText: {
    color: '#6B9AE8',
    fontSize: 16,
  },
}); 