import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useGroups } from '@/src/contexts/GroupContext';
import { api } from '@/src/services/api';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  CAD: 'C$',
  SAR: '﷼',
};

interface Summary {
  today: Record<string, number>;
  this_month: Record<string, number>;
  last_month: Record<string, number>;
  total: Record<string, number>;
  total_count: number;
}

interface Expense {
  id: string;
  amount: number;
  currency: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  description: string;
  paid_by_name: string;
  paid_by_color: string;
  group_id: string;
  group_name: string;
  date: string;
}

export default function Home() {
  const router = useRouter();
  const { user, lockApp } = useAuth();
  const { groups, selectedGroup, selectGroup, fetchGroups } = useGroups();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(user?.default_currency || 'INR');
  const [showGroupSelector, setShowGroupSelector] = useState(false);

  const fetchData = async () => {
    try {
      const groupId = selectedGroup?.id;
      const [summaryData, expensesData] = await Promise.all([
        api.getAnalyticsSummary(groupId),
        api.getExpenses({ group_id: groupId, limit: 5 }),
      ]);
      setSummary(summaryData);
      setRecentExpenses(expensesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [selectedGroup])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups();
    fetchData();
  };

  const formatAmount = (amounts: Record<string, number>, currency: string) => {
    const amount = amounts[currency] || 0;
    return `${CURRENCY_SYMBOLS[currency] || currency}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22D3EE" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={lockApp} style={styles.lockButton}>
            <Ionicons name="lock-closed" size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Group Selector */}
        <TouchableOpacity style={styles.groupSelector} onPress={() => setShowGroupSelector(true)}>
          <View style={styles.groupSelectorContent}>
            <View style={[styles.groupDot, { backgroundColor: selectedGroup?.color || '#22D3EE' }]} />
            <Text style={styles.groupName}>{selectedGroup?.name || 'Select Group'}</Text>
            {selectedGroup?.type === 'personal' && (
              <View style={styles.personalBadge}>
                <Text style={styles.personalBadgeText}>Personal</Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-down" size={20} color="#94A3B8" />
        </TouchableOpacity>

        {/* Currency Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencySelector}>
          {['INR', 'USD', 'CAD', 'SAR'].map((currency) => (
            <TouchableOpacity
              key={currency}
              style={[
                styles.currencyChip,
                selectedCurrency === currency && styles.currencyChipActive,
              ]}
              onPress={() => setSelectedCurrency(currency)}
            >
              <Text
                style={[
                  styles.currencyChipText,
                  selectedCurrency === currency && styles.currencyChipTextActive,
                ]}
              >
                {CURRENCY_SYMBOLS[currency]} {currency}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.todayCard]}>
            <Text style={styles.summaryLabel}>Today</Text>
            <Text style={styles.summaryAmount}>
              {summary ? formatAmount(summary.today, selectedCurrency) : `${CURRENCY_SYMBOLS[selectedCurrency]}0`}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.monthCard]}>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summaryAmount}>
              {summary ? formatAmount(summary.this_month, selectedCurrency) : `${CURRENCY_SYMBOLS[selectedCurrency]}0`}
            </Text>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.lastMonthCard]}>
            <Text style={styles.summaryLabel}>Last Month</Text>
            <Text style={styles.summaryAmountSmall}>
              {summary ? formatAmount(summary.last_month, selectedCurrency) : `${CURRENCY_SYMBOLS[selectedCurrency]}0`}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.totalCard]}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryAmountSmall}>{summary?.total_count || 0}</Text>
          </View>
        </View>

        {/* Recent Expenses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            <TouchableOpacity onPress={() => router.push('/(main)/expenses')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentExpenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#64748B" />
              <Text style={styles.emptyText}>No expenses yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first expense</Text>
            </View>
          ) : (
            recentExpenses.map((expense) => (
              <TouchableOpacity
                key={expense.id}
                style={styles.expenseCard}
                onPress={() => router.push('/(main)/expenses')}
              >
                <View style={[styles.expenseIcon, { backgroundColor: expense.category_color + '20' }]}>
                  <Ionicons name={getIconName(expense.category_icon)} size={20} color={expense.category_color} />
                </View>
                <View style={styles.expenseDetails}>
                  <Text style={styles.expenseCategory}>{expense.category_name}</Text>
                  <View style={styles.expenseMeta}>
                    <View style={[styles.paidByDot, { backgroundColor: expense.paid_by_color }]} />
                    <Text style={styles.expensePaidBy}>{expense.paid_by_name}</Text>
                    <Text style={styles.expenseDate}> • {formatDate(expense.date)}</Text>
                  </View>
                </View>
                <Text style={styles.expenseAmount}>
                  {CURRENCY_SYMBOLS[expense.currency] || expense.currency}{expense.amount.toLocaleString('en-IN')}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Group Selector Modal */}
      <Modal visible={showGroupSelector} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Group</Text>
              <TouchableOpacity onPress={() => setShowGroupSelector(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.groupOption, !selectedGroup && styles.groupOptionActive]}
              onPress={() => {
                selectGroup(null);
                setShowGroupSelector(false);
              }}
            >
              <View style={[styles.groupOptionDot, { backgroundColor: '#22D3EE' }]} />
              <Text style={styles.groupOptionText}>All Groups</Text>
              {!selectedGroup && <Ionicons name="checkmark" size={20} color="#22D3EE" />}
            </TouchableOpacity>

            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[styles.groupOption, selectedGroup?.id === group.id && styles.groupOptionActive]}
                onPress={() => {
                  selectGroup(group);
                  setShowGroupSelector(false);
                }}
              >
                <View style={[styles.groupOptionDot, { backgroundColor: group.color }]} />
                <View style={styles.groupOptionContent}>
                  <Text style={styles.groupOptionText}>{group.name}</Text>
                  {group.type === 'personal' && (
                    <Text style={styles.groupOptionType}>Personal</Text>
                  )}
                </View>
                {selectedGroup?.id === group.id && <Ionicons name="checkmark" size={20} color="#22D3EE" />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.createGroupButton}
              onPress={() => {
                setShowGroupSelector(false);
                router.push('/(main)/groups');
              }}
            >
              <Ionicons name="add-circle" size={20} color="#22D3EE" />
              <Text style={styles.createGroupText}>Create or Join Group</Text>
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
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#94A3B8',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  lockButton: {
    padding: 8,
  },
  groupSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  groupSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F8FAFC',
  },
  personalBadge: {
    backgroundColor: '#22D3EE20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  personalBadgeText: {
    color: '#22D3EE',
    fontSize: 12,
    fontWeight: '500',
  },
  currencySelector: {
    marginBottom: 16,
  },
  currencyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
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
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  todayCard: {
    backgroundColor: '#22D3EE15',
    borderColor: '#22D3EE30',
  },
  monthCard: {
    backgroundColor: '#3B82F615',
    borderColor: '#3B82F630',
  },
  lastMonthCard: {
    backgroundColor: '#F59E0B15',
    borderColor: '#F59E0B30',
  },
  totalCard: {
    backgroundColor: '#8B5CF615',
    borderColor: '#8B5CF630',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  summaryAmountSmall: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  seeAll: {
    fontSize: 14,
    color: '#22D3EE',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#1E293B',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#F8FAFC',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
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
  expenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  paidByDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  expensePaidBy: {
    fontSize: 12,
    color: '#94A3B8',
  },
  expenseDate: {
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
    maxHeight: '70%',
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
    color: '#F8FAFC',
  },
  groupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#0B1F2A',
  },
  groupOptionActive: {
    backgroundColor: '#22D3EE20',
    borderWidth: 1,
    borderColor: '#22D3EE',
  },
  groupOptionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  groupOptionContent: {
    flex: 1,
  },
  groupOptionText: {
    fontSize: 16,
    color: '#F8FAFC',
  },
  groupOptionType: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  createGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  createGroupText: {
    fontSize: 16,
    color: '#22D3EE',
    fontWeight: '500',
    marginLeft: 8,
  },
});
