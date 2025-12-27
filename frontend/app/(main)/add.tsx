import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
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

const CURRENCIES = ['INR', 'USD', 'CAD', 'SAR'];

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_custom: boolean;
}

export default function AddExpense() {
  const router = useRouter();
  const { user } = useAuth();
  const { groups, selectedGroup, getPersonalGroup } = useGroups();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(user?.default_currency || 'INR');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(true);

  useEffect(() => {
    // Set default group
    if (selectedGroup) {
      setSelectedGroupId(selectedGroup.id);
    } else {
      const personal = getPersonalGroup();
      if (personal) {
        setSelectedGroupId(personal.id);
      } else if (groups.length > 0) {
        setSelectedGroupId(groups[0].id);
      }
    }
    fetchCategories();
  }, [selectedGroup, groups]);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsFetchingCategories(false);
    }
  };

  const handleAddExpense = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (!selectedGroupId) {
      Alert.alert('Error', 'Please select a group');
      return;
    }

    setIsLoading(true);
    try {
      await api.createExpense({
        amount: parseFloat(amount),
        currency,
        category_id: selectedCategory.id,
        group_id: selectedGroupId,
        description: description.trim(),
      });

      Alert.alert('Success', 'Expense added successfully', [
        {
          text: 'OK',
          onPress: () => {
            setAmount('');
            setDescription('');
            setSelectedCategory(null);
            router.push('/(main)/home');
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  };

  const getIconName = (icon: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      cart: 'cart',
      flash: 'flash',
      home: 'home',
      car: 'car',
      film: 'film',
      medkit: 'medkit',
      restaurant: 'restaurant',
      bag: 'bag',
      school: 'school',
      'ellipsis-horizontal': 'ellipsis-horizontal',
    };
    return iconMap[icon] || 'ellipsis-horizontal';
  };

  const selectedGroupData = groups.find(g => g.id === selectedGroupId);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Add Expense</Text>

          {/* Group Selector */}
          <Text style={styles.sectionTitle}>Select Group</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupSelector}>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupChip,
                  selectedGroupId === group.id && styles.groupChipActive,
                  selectedGroupId === group.id && { borderColor: group.color },
                ]}
                onPress={() => setSelectedGroupId(group.id)}
              >
                <View style={[styles.groupChipDot, { backgroundColor: group.color }]} />
                <Text
                  style={[
                    styles.groupChipText,
                    selectedGroupId === group.id && styles.groupChipTextActive,
                  ]}
                >
                  {group.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Amount Input */}
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>{CURRENCY_SYMBOLS[currency]}</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="#64748B"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Currency Selector */}
          <View style={styles.currencySelector}>
            {CURRENCIES.map((curr) => (
              <TouchableOpacity
                key={curr}
                style={[
                  styles.currencyChip,
                  currency === curr && styles.currencyChipActive,
                ]}
                onPress={() => setCurrency(curr)}
              >
                <Text
                  style={[
                    styles.currencyChipText,
                    currency === curr && styles.currencyChipTextActive,
                  ]}
                >
                  {curr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="create-outline" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              placeholderTextColor="#64748B"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Category Selection */}
          <Text style={styles.sectionTitle}>Select Category</Text>
          {isFetchingCategories ? (
            <ActivityIndicator color="#22D3EE" style={styles.categoriesLoader} />
          ) : (
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory?.id === category.id && styles.categoryCardActive,
                    selectedCategory?.id === category.id && { borderColor: category.color },
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: category.color + '20' },
                      selectedCategory?.id === category.id && { backgroundColor: category.color + '40' },
                    ]}
                  >
                    <Ionicons name={getIconName(category.icon)} size={24} color={category.color} />
                  </View>
                  <Text
                    style={[
                      styles.categoryName,
                      selectedCategory?.id === category.id && styles.categoryNameActive,
                    ]}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Add Button */}
          <TouchableOpacity
            style={[styles.addButton, isLoading && styles.addButtonDisabled]}
            onPress={handleAddExpense}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="add-circle" size={24} color="#FFF" />
                <Text style={styles.addButtonText}>Add Expense</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1F2A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
  },
  groupSelector: {
    marginBottom: 20,
  },
  groupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  groupChipActive: {
    backgroundColor: '#22D3EE20',
  },
  groupChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  groupChipText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  groupChipTextActive: {
    color: '#F8FAFC',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#22D3EE',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#F8FAFC',
    minWidth: 100,
    textAlign: 'center',
  },
  currencySelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  currencyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  currencyChipActive: {
    backgroundColor: '#22D3EE',
    borderColor: '#22D3EE',
  },
  currencyChipText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  currencyChipTextActive: {
    color: '#FFF',
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
  categoriesLoader: {
    marginVertical: 40,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  categoryCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 8,
  },
  categoryCardActive: {
    backgroundColor: '#1E293B',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  categoryNameActive: {
    color: '#F8FAFC',
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#22D3EE',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
