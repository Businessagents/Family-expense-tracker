import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { api } from '@/src/services/api';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  CAD: 'C$',
  SAR: '﷼',
};

interface Expense {
  id: string;
  amount: number;
  currency: string;
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  description: string;
  paid_by: string;
  paid_by_name: string;
  paid_by_color: string;
  date: string;
}

interface FamilyMember {
  id: string;
  name: string;
  avatar_color: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMember, setFilterMember] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const params: any = { limit: 100 };
      if (filterMember) params.paid_by = filterMember;
      if (filterCategory) params.category_id = filterCategory;

      const [expensesData, familyData, categoriesData] = await Promise.all([
        api.getExpenses(params),
        api.getFamily().catch(() => ({ members: [] })),
        api.getCategories(),
      ]);

      setExpenses(expensesData);
      setMembers(familyData.members || []);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [filterMember, filterCategory])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteExpense(expenseId);
              setExpenses(expenses.filter((e) => e.id !== expenseId));
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  const clearFilters = () => {
    setFilterMember(null);
    setFilterCategory(null);
    setShowFilters(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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

  const filteredExpenses = expenses.filter((expense) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      expense.category_name.toLowerCase().includes(query) ||
      expense.description.toLowerCase().includes(query) ||
      expense.paid_by_name.toLowerCase().includes(query)
    );
  });

  const groupedExpenses = filteredExpenses.reduce((groups: Record<string, Expense[]>, expense) => {
    const date = formatDate(expense.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {});

  const groupedData = Object.entries(groupedExpenses).map(([date, items]) => ({
    date,
    items,
    total: items.reduce((sum, item) => sum + item.amount, 0),
  }));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22D3EE" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expenses</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
          <Ionicons
            name="filter"
            size={20}
            color={filterMember || filterCategory ? '#22D3EE' : '#F8FAFC'}
          />
          {(filterMember || filterCategory) && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search expenses..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#64748B" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Active Filters */}
      {(filterMember || filterCategory) && (
        <View style={styles.activeFilters}>
          <Text style={styles.activeFiltersLabel}>Filters:</Text>
          {filterMember && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>
                {members.find((m) => m.id === filterMember)?.name || 'Member'}
              </Text>
              <TouchableOpacity onPress={() => setFilterMember(null)}>
                <Ionicons name="close" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          )}
          {filterCategory && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>
                {categories.find((c) => c.id === filterCategory)?.name || 'Category'}
              </Text>
              <TouchableOpacity onPress={() => setFilterCategory(null)}>
                <Ionicons name="close" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFilters}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Expenses List */}
      <FlatList
        data={groupedData}
        keyExtractor={(item) => item.date}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22D3EE" />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#64748B" />
            <Text style={styles.emptyText}>No expenses found</Text>
            <Text style={styles.emptySubtext}>
              {filterMember || filterCategory ? 'Try adjusting your filters' : 'Add your first expense'}
            </Text>
          </View>
        }
        renderItem={({ item: group }) => (
          <View style={styles.dateGroup}>
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>{group.date}</Text>
            </View>
            {group.items.map((expense) => (
              <TouchableOpacity
                key={expense.id}
                style={styles.expenseCard}
                onLongPress={() => handleDeleteExpense(expense.id)}
              >
                <View style={[styles.expenseIcon, { backgroundColor: expense.category_color + '20' }]}>
                  <Ionicons name={getIconName(expense.category_icon)} size={20} color={expense.category_color} />
                </View>
                <View style={styles.expenseDetails}>
                  <Text style={styles.expenseCategory}>{expense.category_name}</Text>
                  {expense.description ? (
                    <Text style={styles.expenseDescription} numberOfLines={1}>
                      {expense.description}
                    </Text>
                  ) : null}
                  <View style={styles.expenseMeta}>
                    <View style={[styles.paidByDot, { backgroundColor: expense.paid_by_color }]} />
                    <Text style={styles.expensePaidBy}>{expense.paid_by_name}</Text>
                  </View>
                </View>
                <Text style={styles.expenseAmount}>
                  {CURRENCY_SYMBOLS[expense.currency] || expense.currency}
                  {expense.amount.toLocaleString('en-IN')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Expenses</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>By Family Member</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterOption, !filterMember && styles.filterOptionActive]}
                onPress={() => setFilterMember(null)}
              >
                <Text style={[styles.filterOptionText, !filterMember && styles.filterOptionTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {members.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.filterOption,
                    filterMember === member.id && styles.filterOptionActive,
                  ]}
                  onPress={() => setFilterMember(member.id)}
                >
                  <View style={[styles.memberDot, { backgroundColor: member.avatar_color }]} />
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterMember === member.id && styles.filterOptionTextActive,
                    ]}
                  >
                    {member.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>By Category</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterOption, !filterCategory && styles.filterOptionActive]}
                onPress={() => setFilterCategory(null)}
              >
                <Text style={[styles.filterOptionText, !filterCategory && styles.filterOptionTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.slice(0, 8).map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterOption,
                    filterCategory === category.id && styles.filterOptionActive,
                  ]}
                  onPress={() => setFilterCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterCategory === category.id && styles.filterOptionTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.applyButton} onPress={() => setShowFilters(false)}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  filterButton: {
    padding: 8,
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22D3EE',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#F8FAFC',
    fontSize: 16,
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFiltersLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  filterChipText: {
    color: '#F8FAFC',
    fontSize: 12,
  },
  clearFilters: {
    color: '#22D3EE',
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#F8FAFC',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseDetails: {
    flex: 1,
    marginLeft: 12,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F8FAFC',
  },
  expenseDescription: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  expenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  paidByDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  expensePaidBy: {
    fontSize: 12,
    color: '#64748B',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
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
    maxHeight: '80%',
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
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
    marginTop: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0B1F2A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterOptionActive: {
    backgroundColor: '#22D3EE',
    borderColor: '#22D3EE',
  },
  filterOptionText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  filterOptionTextActive: {
    color: '#FFF',
  },
  memberDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  applyButton: {
    backgroundColor: '#22D3EE',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
