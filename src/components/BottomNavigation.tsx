import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import EntypoIcons from '@react-native-vector-icons/entypo';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../Types';

type BottomNavigationProps = {
  navigation: NavigationProp<RootStackParamList>;
  currentRoute: 'RoomList' | 'UserInfo';
};

export default function BottomNavigation({ navigation, currentRoute }: BottomNavigationProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, currentRoute === 'RoomList' && styles.activeTab]}
        onPress={() => navigation.navigate('RoomList')}
      >
        <EntypoIcons 
          name="chat" 
          size={24} 
          color={currentRoute === 'RoomList' ? '#6B9AE8' : '#666'} 
        />
        <Text style={[
          styles.tabText, 
          currentRoute === 'RoomList' && styles.activeTabText
        ]}>
          Rooms
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentRoute === 'UserInfo' && styles.activeTab]}
        onPress={() => navigation.navigate('UserInfo')}
      >
        <EntypoIcons 
          name="user" 
          size={24} 
          color={currentRoute === 'UserInfo' ? '#6B9AE8' : '#666'} 
        />
        <Text style={[
          styles.tabText, 
          currentRoute === 'UserInfo' && styles.activeTabText
        ]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 20,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTabText: {
    color: '#6B9AE8',
    fontWeight: 'bold',
  },
}); 