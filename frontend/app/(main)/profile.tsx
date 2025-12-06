import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { api } from '@/src/services/api';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  CAD: 'C$',
  SAR: '﷼',
};

interface Family {
  id: string;
  name: string;
  invite_code: string;
  members: {
    id: string;
    name: string;
    avatar_color: string;
  }[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_custom: boolean;
}

export default function Profile() {
  const router = useRouter();
  const { user, logout, updateUser, refreshUser } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10B981');

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [familyData, categoriesData] = await Promise.all([
        api.getFamily().catch(() => null),
        api.getCategories(),
      ]);
      setFamily(familyData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleShareInviteCode = async () => {
    if (family?.invite_code) {
      try {
        await Share.share({
          message: `Join our family on Family Finance app! Use invite code: ${family.invite_code}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
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

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      const newCategory = await api.createCategory({
        name: newCategoryName.trim(),
        color: selectedColor,
      });
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setShowCategoryModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    Alert.alert('Delete Category', 'Are you sure you want to delete this category?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteCategory(categoryId);
            setCategories(categories.filter((c) => c.id !== categoryId));
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete category');
          }
        },
      },
    ]);
  };

  const handleLeaveFamily = () => {
    Alert.alert(
      'Leave Family',
      'Are you sure you want to leave this family? You will lose access to shared expenses.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.leaveFamily();
              await refreshUser();
              router.replace('/(auth)/family-setup');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to leave family');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Profile</Text>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: user?.avatar_color || '#10B981' }]}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Family Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family</Text>
          <View style={styles.card}>
            <View style={styles.familyHeader}>
              <Ionicons name="people" size={24} color="#10B981" />
              <Text style={styles.familyName}>{family?.name || user?.family_name}</Text>
            </View>

            {/* Invite Code */}
            {family?.invite_code && (
              <TouchableOpacity style={styles.inviteCodeRow} onPress={handleShareInviteCode}>
                <View>
                  <Text style={styles.inviteLabel}>Invite Code</Text>
                  <Text style={styles.inviteCode}>{family.invite_code}</Text>
                </View>
                <Ionicons name="share-social" size={20} color="#10B981" />
              </TouchableOpacity>
            )}

            {/* Members */}
            <Text style={styles.membersTitle}>Members ({family?.members?.length || 0})</Text>
            <View style={styles.membersList}>
              {family?.members?.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <View style={[styles.memberAvatar, { backgroundColor: member.avatar_color }]}>
                    <Text style={styles.memberInitial}>{member.name[0]}</Text>
                  </View>
                  <Text style={styles.memberName}>{member.name}</Text>
                  {member.id === user?.id && <Text style={styles.youBadge}>You</Text>}
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveFamily}>
              <Ionicons name="exit-outline" size={20} color="#EF4444" />
              <Text style={styles.leaveButtonText}>Leave Family</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow} onPress={() => setShowCurrencyModal(true)}>
              <View style={styles.settingLeft}>
                <Ionicons name="cash" size={20} color="#10B981" />
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

        {/* Custom Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Custom Categories</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(true)}>
              <Ionicons name="add-circle" size={24} color="#10B981" />
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {categories.filter((c) => c.is_custom).length === 0 ? (
              <Text style={styles.noCategoriesText}>No custom categories yet</Text>
            ) : (
              categories
                .filter((c) => c.is_custom)
                .map((category) => (
                  <View key={category.id} style={styles.categoryRow}>
                    <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <TouchableOpacity onPress={() => handleDeleteCategory(category.id)}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))
            )}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.version}>Family Finance v1.0.0</Text>
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
                  <Ionicons name="checkmark" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Add Category Modal */}
      <Modal visible={showCategoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.categoryInput}
              placeholder="Category Name"
              placeholderTextColor="#64748B"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <Text style={styles.colorLabel}>Select Color</Text>
            <View style={styles.colorOptions}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionActive,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.addCategoryButton} onPress={handleAddCategory}>
              <Text style={styles.addCategoryButtonText}>Add Category</Text>
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
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    padding: 16,
  },
  familyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  familyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginLeft: 12,
  },
  inviteCodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  inviteLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  inviteCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    letterSpacing: 2,
  },
  membersTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 12,
  },
  membersList: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  memberName: {
    flex: 1,
    fontSize: 14,
    color: '#F8FAFC',
  },
  youBadge: {
    fontSize: 12,
    color: '#10B981',
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  leaveButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  noCategoriesText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: '#F8FAFC',
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
    backgroundColor: '#0F172A',
  },
  currencyOptionActive: {
    backgroundColor: '#10B98120',
    borderWidth: 1,
    borderColor: '#10B981',
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
  categoryInput: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    color: '#F8FAFC',
    fontSize: 16,
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionActive: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  addCategoryButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addCategoryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
