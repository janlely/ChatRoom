import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import { NavigationProps } from '../Types';
import EntypoIcons from '@react-native-vector-icons/entypo';
import { getCurrentUser, getAvailableUsers, clearCurrentUser, User } from '../Storage';
import BottomNavigation from '../components/BottomNavigation';

type UserInfoProps = NavigationProps<'UserInfo'>;

export default function UserInfoScreen({ navigation }: UserInfoProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showUserList, setShowUserList] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      
      const users = await getAvailableUsers();
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const handleLogout = async () => {
    try {
      await clearCurrentUser();
      navigation.replace('Login');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleChangeUser = async (user: User) => {
    try {
      setCurrentUser(user);
      setShowUserList(false);
    } catch (error) {
      console.error('Error changing user:', error);
      Alert.alert('Error', 'Failed to change user');
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleChangeUser(item)}
    >
      <View style={styles.userItemContent}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.username}>{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>User Information</Text>
        </View>

        <View style={styles.mainContent}>
          {currentUser && (
            <View style={styles.userInfo}>
              {currentUser.avatar ? (
                <Image source={{ uri: currentUser.avatar }} style={styles.largeAvatar} />
              ) : (
                <View style={styles.largeAvatarPlaceholder}>
                  <Text style={styles.largeAvatarText}>
                    {currentUser.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.userName}>{currentUser.username}</Text>
              <Text style={styles.userId}>ID: {currentUser.id}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.changeUserButton]}
              onPress={() => setShowUserList(true)}
            >
              <EntypoIcons name="user" size={20} color="white" />
              <Text style={styles.buttonText}>Change User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={handleLogout}
            >
              <EntypoIcons name="log-out" size={20} color="white" />
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={showUserList}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowUserList(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select User</Text>
                <TouchableOpacity
                  onPress={() => setShowUserList(false)}
                  style={styles.closeButton}
                >
                  <EntypoIcons name="cross" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={availableUsers}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                style={styles.userList}
              />
            </View>
          </View>
        </Modal>
      </View>
      
      <BottomNavigation navigation={navigation} currentRoute="UserInfo" />
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  largeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  largeAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6B9AE8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  largeAvatarText: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userId: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  changeUserButton: {
    backgroundColor: '#6B9AE8',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  userList: {
    flex: 1,
  },
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B9AE8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
  },
}); 