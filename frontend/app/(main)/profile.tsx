import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useGroups } from '@/src/contexts/GroupContext';
import { api } from '@/src/services/api';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  CAD: 'C$',
  SAR: '﷼',
};

export default function Profile() {
  const router = useRouter();
  const { user, logout, updateUser, biometricAvailable, lockApp } = useAuth();
  const { groups } = useGroups();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleChangeCurrency = async (currency: string) => {
    try {
      const updatedUser = await api.updateProfile({ default_currency: currency });
      updateUser(updatedUser);
      setShowCurrencyModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update currency');
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    try {
      const updatedUser = await api.updateProfile({ biometric_enabled: value });
      updateUser(updatedUser);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update setting');
    }
  };

  const handleToggleAutoLock = async (value: boolean) => {
    try {
      const updatedUser = await api.updateProfile({ auto_lock_enabled: value });
      updateUser(updatedUser);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update setting');
    }
  };

  const handleChangeTimeout = async (timeout: number) => {
    try {
      const updatedUser = await api.updateProfile({ auto_lock_timeout: timeout });
      updateUser(updatedUser);
      setShowTimeoutModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update setting');
    }
  };

  const handleChangePin = async () => {
    if (!currentPin || !newPin || !confirmPin) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPin.length < 4 || newPin.length > 6) {
      Alert.alert('Error', 'New PIN must be 4-6 digits');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Error', 'New PINs do not match');
      return;
    }

    setIsChangingPin(true);
    try {
      await api.updatePin(currentPin, newPin);
      Alert.alert('Success', 'PIN changed successfully');
      setShowPinModal(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change PIN');
    } finally {
      setIsChangingPin(false);
    }
  };

  const timeoutOptions = [
    { value: 1, label: '1 minute' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Profile</Text>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: user?.avatar_color || '#22D3EE' }]}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{groups.filter(g => g.type === 'shared').length}</Text>
            <Text style={styles.statLabel}>Groups</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{groups.reduce((sum, g) => sum + g.members.length, 0)}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            {/* PIN Lock */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="lock-closed" size={20} color="#22D3EE" />
                <Text style={styles.settingLabel}>App Lock</Text>
              </View>
              <Switch
                value={user?.auto_lock_enabled || false}
                onValueChange={handleToggleAutoLock}
                trackColor={{ false: '#334155', true: '#22D3EE50' }}
                thumbColor={user?.auto_lock_enabled ? '#22D3EE' : '#64748B'}
              />
            </View>

            {/* Biometric */}
            {biometricAvailable && (
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons name="finger-print" size={20} color="#3B82F6" />
                  <Text style={styles.settingLabel}>Biometric Unlock</Text>
                </View>
                <Switch
                  value={user?.biometric_enabled || false}
                  onValueChange={handleToggleBiometric}
                  trackColor={{ false: '#334155', true: '#3B82F650' }}
                  thumbColor={user?.biometric_enabled ? '#3B82F6' : '#64748B'}
                />
              </View>
            )}

            {/* Auto-lock Timeout */}
            {user?.auto_lock_enabled && (
              <TouchableOpacity style={styles.settingRow} onPress={() => setShowTimeoutModal(true)}>
                <View style={styles.settingLeft}>
                  <Ionicons name="timer" size={20} color="#F59E0B" />
                  <Text style={styles.settingLabel}>Auto-lock Timeout</Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>{user?.auto_lock_timeout || 5} min</Text>
                  <Ionicons name="chevron-forward" size={20} color="#64748B" />
                </View>
              </TouchableOpacity>
            )}

            {/* Change PIN */}
            <TouchableOpacity style={styles.settingRow} onPress={() => setShowPinModal(true)}>
              <View style={styles.settingLeft}>
                <Ionicons name="keypad" size={20} color="#8B5CF6" />
                <Text style={styles.settingLabel}>Change PIN</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </TouchableOpacity>

            {/* Lock Now */}
            <TouchableOpacity style={styles.settingRow} onPress={lockApp}>
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark" size={20} color="#EF4444" />
                <Text style={styles.settingLabel}>Lock Now</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow} onPress={() => setShowCurrencyModal(true)}>
              <View style={styles.settingLeft}>
                <Ionicons name="cash" size={20} color="#22D3EE" />
                <Text style={styles.settingLabel}>Default Currency</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>
                  {CURRENCY_SYMBOLS[user?.default_currency || 'INR']} {user?.default_currency || 'INR'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#64748B" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/(main)/export')}>
              <View style={styles.settingLeft}>
                <Ionicons name="download" size={20} color="#22D3EE" />
                <Text style={styles.settingLabel}>Export Expenses</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/(main)/groups')}>
              <View style={styles.settingLeft}>
                <Ionicons name="people" size={20} color="#3B82F6" />
                <Text style={styles.settingLabel}>Manage Groups</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.version}>Family Expense Tracker v2.0.0</Text>
      </ScrollView>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>
            {['INR', 'USD', 'CAD', 'SAR'].map((currency) => (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.currencyOption,
                  user?.default_currency === currency && styles.currencyOptionActive,
                ]}
                onPress={() => handleChangeCurrency(currency)}
              >
                <Text style={styles.currencySymbol}>{CURRENCY_SYMBOLS[currency]}</Text>
                <Text style={styles.currencyName}>{currency}</Text>
                {user?.default_currency === currency && (
                  <Ionicons name="checkmark" size={20} color="#22D3EE" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Timeout Modal */}
      <Modal visible={showTimeoutModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Auto-lock Timeout</Text>
              <TouchableOpacity onPress={() => setShowTimeoutModal(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>
            {timeoutOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.currencyOption,
                  user?.auto_lock_timeout === option.value && styles.currencyOptionActive,
                ]}
                onPress={() => handleChangeTimeout(option.value)}
              >
                <Text style={styles.currencyName}>{option.label}</Text>
                {user?.auto_lock_timeout === option.value && (
                  <Ionicons name="checkmark" size={20} color="#22D3EE" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Change PIN Modal */}
      <Modal visible={showPinModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change PIN</Text>
              <TouchableOpacity onPress={() => {
                setShowPinModal(false);
                setCurrentPin('');
                setNewPin('');
                setConfirmPin('');
              }}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>

            <View style={styles.pinInputContainer}>
              <Text style={styles.pinLabel}>Current PIN</Text>
              <TextInput
                style={styles.pinInput}
                placeholder="Enter current PIN"
                placeholderTextColor="#64748B"
                value={currentPin}
                onChangeText={setCurrentPin}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
              />
            </View>

            <View style={styles.pinInputContainer}>
              <Text style={styles.pinLabel}>New PIN</Text>
              <TextInput
                style={styles.pinInput}
                placeholder="Enter new PIN (4-6 digits)"
                placeholderTextColor="#64748B"
                value={newPin}
                onChangeText={setNewPin}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
              />
            </View>

            <View style={styles.pinInputContainer}>
              <Text style={styles.pinLabel}>Confirm New PIN</Text>
              <TextInput
                style={styles.pinInput}
                placeholder="Confirm new PIN"
                placeholderTextColor="#64748B"
                value={confirmPin}
                onChangeText={setConfirmPin}
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              style={[styles.changePinButton, isChangingPin && styles.changePinButtonDisabled]}
              onPress={handleChangePin}
              disabled={isChangingPin}
            >
              {isChangingPin ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.changePinButtonText}>Change PIN</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1F2A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#94A3B8',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22D3EE',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    color: '#F8FAFC',
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#94A3B8',
    marginRight: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF444420',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  version: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#0B1F2A',
  },
  currencyOptionActive: {
    backgroundColor: '#22D3EE20',
    borderWidth: 1,
    borderColor: '#22D3EE',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    width: 40,
  },
  currencyName: {
    flex: 1,
    fontSize: 16,
    color: '#F8FAFC',
  },
  pinInputContainer: {
    marginBottom: 16,
  },
  pinLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  pinInput: {
    backgroundColor: '#0B1F2A',
    borderRadius: 12,
    padding: 16,
    color: '#F8FAFC',
    fontSize: 16,
  },
  changePinButton: {
    backgroundColor: '#22D3EE',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  changePinButtonDisabled: {
    opacity: 0.7,
  },
  changePinButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
