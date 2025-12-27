import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useGroups } from '@/src/contexts/GroupContext';

export default function Groups() {
  const router = useRouter();
  const { groups, createGroup, joinGroup, leaveGroup, deleteGroup, fetchGroups } = useGroups();
  const [mode, setMode] = useState<'list' | 'create' | 'join'>('list');
  const [groupName, setGroupName] = useState('');
  const [groupMode, setGroupMode] = useState<'split' | 'contribution'>('split');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setIsLoading(true);
    try {
      await createGroup(groupName.trim(), groupMode);
      setGroupName('');
      setGroupMode('split');
      setMode('list');
      Alert.alert('Success', 'Group created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    setIsLoading(true);
    try {
      await joinGroup(inviteCode.trim().toUpperCase());
      setInviteCode('');
      setMode('list');
      Alert.alert('Success', 'Joined group successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Invalid invite code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareInviteCode = async (code: string, name: string) => {
    try {
      await Share.share({
        message: `Join "${name}" on Family Expense Tracker app! Use invite code: ${code}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleLeaveGroup = (groupId: string, groupName: string) => {
    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave "${groupName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGroup(groupId);
              Alert.alert('Success', 'You have left the group');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to leave group');
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${groupName}"? All expenses in this group will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup(groupId);
              Alert.alert('Success', 'Group deleted');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete group');
            }
          },
        },
      ]
    );
  };

  if (mode === 'create' || mode === 'join') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMode('list')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.title}>{mode === 'create' ? 'Create Group' : 'Join Group'}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {mode === 'create' ? (
            <>
              <Text style={styles.label}>Group Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Office Friends, Roommates"
                  placeholderTextColor="#64748B"
                  value={groupName}
                  onChangeText={setGroupName}
                  autoCapitalize="words"
                />
              </View>

              <Text style={styles.label}>Group Mode</Text>
              <View style={styles.modeContainer}>
                <TouchableOpacity
                  style={[styles.modeOption, groupMode === 'split' && styles.modeOptionActive]}
                  onPress={() => setGroupMode('split')}
                >
                  <Ionicons name="git-branch" size={24} color={groupMode === 'split' ? '#22D3EE' : '#64748B'} />
                  <Text style={[styles.modeTitle, groupMode === 'split' && styles.modeTitleActive]}>Split Mode</Text>
                  <Text style={styles.modeDesc}>Track who owes whom. Good for friends, roommates.</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeOption, groupMode === 'contribution' && styles.modeOptionActive]}
                  onPress={() => setGroupMode('contribution')}
                >
                  <Ionicons name="heart" size={24} color={groupMode === 'contribution' ? '#22D3EE' : '#64748B'} />
                  <Text style={[styles.modeTitle, groupMode === 'contribution' && styles.modeTitleActive]}>Family Mode</Text>
                  <Text style={styles.modeDesc}>Track contributions only, no debt tracking. Good for family.</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleCreateGroup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Create Group</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Invite Code</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={20} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., ABC123"
                  placeholderTextColor="#64748B"
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  autoCapitalize="characters"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleJoinGroup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Join Group</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.title}>My Groups</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setMode('create')}>
            <Ionicons name="add-circle" size={24} color="#22D3EE" />
            <Text style={styles.actionButtonText}>Create Group</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setMode('join')}>
            <Ionicons name="enter" size={24} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Join Group</Text>
          </TouchableOpacity>
        </View>

        {/* Groups List */}
        {groups.map((group) => (
          <View key={group.id} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <View style={[styles.groupIcon, { backgroundColor: group.color + '20' }]}>
                <Ionicons
                  name={group.type === 'personal' ? 'person' : 'people'}
                  size={24}
                  color={group.color}
                />
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupType}>
                  {group.type === 'personal' ? 'Personal' : `${group.members.length} members`}
                </Text>
              </View>
            </View>

            {group.type === 'shared' && group.invite_code && (
              <TouchableOpacity
                style={styles.inviteCodeRow}
                onPress={() => handleShareInviteCode(group.invite_code!, group.name)}
              >
                <View>
                  <Text style={styles.inviteLabel}>Invite Code</Text>
                  <Text style={styles.inviteCode}>{group.invite_code}</Text>
                </View>
                <Ionicons name="share-social" size={20} color="#22D3EE" />
              </TouchableOpacity>
            )}

            {/* Members */}
            {group.type === 'shared' && (
              <View style={styles.membersSection}>
                <Text style={styles.membersTitle}>Members</Text>
                <View style={styles.membersList}>
                  {group.members.slice(0, 4).map((member) => (
                    <View key={member.id} style={styles.memberItem}>
                      <View style={[styles.memberAvatar, { backgroundColor: member.avatar_color }]}>
                        <Text style={styles.memberInitial}>{member.name[0]}</Text>
                      </View>
                      <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
                    </View>
                  ))}
                  {group.members.length > 4 && (
                    <Text style={styles.moreMembers}>+{group.members.length - 4} more</Text>
                  )}
                </View>
              </View>
            )}

            {/* Actions */}
            {group.type === 'shared' && (
              <View style={styles.groupActions}>
                <TouchableOpacity
                  style={styles.groupActionButton}
                  onPress={() => handleLeaveGroup(group.id, group.name)}
                >
                  <Ionicons name="exit-outline" size={18} color="#F59E0B" />
                  <Text style={[styles.groupActionText, { color: '#F59E0B' }]}>Leave</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.groupActionButton}
                  onPress={() => handleDeleteGroup(group.id, group.name)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text style={[styles.groupActionText, { color: '#EF4444' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1F2A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 24,
  },
  scrollContent: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: '#F8FAFC',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#22D3EE',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  groupCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  groupType: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  inviteCodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0B1F2A',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  inviteLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  inviteCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22D3EE',
    letterSpacing: 2,
  },
  membersSection: {
    marginTop: 12,
  },
  membersTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1F2A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  memberInitial: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  memberName: {
    fontSize: 12,
    color: '#F8FAFC',
    maxWidth: 80,
  },
  moreMembers: {
    fontSize: 12,
    color: '#64748B',
    alignSelf: 'center',
  },
  groupActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  groupActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modeContainer: {
    gap: 12,
    marginBottom: 24,
  },
  modeOption: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeOptionActive: {
    borderColor: '#22D3EE',
    backgroundColor: '#22D3EE15',
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 8,
  },
  modeTitleActive: {
    color: '#22D3EE',
  },
  modeDesc: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
});
