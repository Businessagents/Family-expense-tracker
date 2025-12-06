import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';

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
  date: string;
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(user?.default_currency || 'INR');

  const fetchData = async () => {
    try {
      const [summaryData, expensesData] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getExpenses({ limit: 5 }),
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
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
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
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <View style={styles.familyBadge}>
            <Ionicons name="people" size={16} color="#10B981" />
            <Text style={styles.familyName}>{user?.family_name || 'Family'}</Text>
          </View>
        </View>

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
                onPress={() => router.push({
                  pathname: '/(main)/expenses',
                  params: { expenseId: expense.id }
                })}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  familyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  familyName: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
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
    backgroundColor: '#10B981',
    borderColor: '#10B981',
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
    backgroundColor: '#10B98115',
    borderColor: '#10B98130',
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
    color: '#10B981',
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
});
