import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { NavigationProps, RoomMember } from '../Types';
import Fuse from 'fuse.js';
import { useTranslation } from 'react-i18next';
import Ionicons from '@react-native-vector-icons/ionicons';


type RoomMemberProps = NavigationProps<'RoomMembers'>

export default function RoomMembersScreen({ navigation, route }: RoomMemberProps) {
  const { roomName } = route.params;
  const { t } = useTranslation();
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<RoomMember[]>([]);

  // 模拟获取成员列表数据
  useEffect(() => {
    // TODO: 从服务器获取实际的成员列表
    const mockMembers: RoomMember[] = [
      {
        userId: '1',
        username: 'John Doe',
        isOnline: true,
        avatar: 'https://via.placeholder.com/50',
      },
      {
        userId: '2',
        username: 'Jane Smith',
        isOnline: false,
        lastSeen: Date.now() - 3600000,
        avatar: 'https://via.placeholder.com/50',
      },
      // 添加更多模拟数据...
    ];
    setMembers(mockMembers);
  }, []);

  // 使用 Fuse.js 进行模糊搜索
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members);
      return;
    }

    const fuse = new Fuse(members, {
      keys: ['username'],
      threshold: 0.3,
    });

    const results = fuse.search(searchQuery);
    setFilteredMembers(results.map(result => result.item));
  }, [searchQuery, members]);

  const renderMemberItem = ({ item }: { item: RoomMember }) => (
    <View style={styles.memberItem}>
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
        style={styles.avatar}
      />
      <View style={styles.memberInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={[styles.status, item.isOnline ? styles.online : styles.offline]}>
          {item.isOnline ? t('online') : t('offline')}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={24} color="#6B9AE8" />
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchMembers')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredMembers}
        renderItem={renderMemberItem}
        keyExtractor={item => item.userId}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  list: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  memberInfo: {
    marginLeft: 15,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  status: {
    fontSize: 14,
    marginTop: 4,
  },
  online: {
    color: '#4CAF50',
  },
  offline: {
    color: '#9E9E9E',
  },
});
