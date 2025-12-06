import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { useAuth } from '../../src/contexts/AuthContext';
import { api } from '../../src/services/api';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  CAD: 'C$',
  SAR: '﷼',
};

const { width } = Dimensions.get('window');

interface CategoryData {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  amounts: Record<string, number>;
  count: number;
}

interface MemberData {
  user_id: string;
  user_name: string;
  user_color: string;
  amounts: Record<string, number>;
  count: number;
}

interface TrendData {
  month: string;
  amounts: Record<string, number>;
}

export default function Analytics() {
  const { user } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState(user?.default_currency || 'INR');
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [memberData, setMemberData] = useState<MemberData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'category' | 'member' | 'trends'>('overview');

  const fetchData = async () => {
    try {
      const [summaryData, categoryDataRes, memberDataRes, trendDataRes] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getAnalyticsByCategory(),
        api.getAnalyticsByMember(),
        api.getAnalyticsTrends(6),
      ]);

      setSummary(summaryData);
      setCategoryData(categoryDataRes);
      setMemberData(memberDataRes);
      setTrendData(trendDataRes);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const formatAmount = (amount: number) => {
    return `${CURRENCY_SYMBOLS[selectedCurrency]}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const getPieChartData = () => {
    return categoryData
      .filter((cat) => cat.amounts[selectedCurrency] > 0)
      .map((cat) => ({
        value: cat.amounts[selectedCurrency] || 0,
        color: cat.category_color,
        text: cat.category_name,
        label: cat.category_name,
      }))
      .slice(0, 6);
  };

  const getBarChartData = () => {
    return trendData.map((trend) => ({
      value: trend.amounts[selectedCurrency] || 0,
      label: trend.month.substring(0, 3),
      frontColor: '#10B981',
    }));
  };

  const getMemberBarData = () => {
    return memberData.map((member) => ({
      value: member.amounts[selectedCurrency] || 0,
      label: member.user_name.split(' ')[0],
      frontColor: member.user_color,
    }));
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
        <Text style={styles.title}>Analytics</Text>

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

        {/* Tab Selector */}
        <View style={styles.tabs}>
          {(['overview', 'category', 'member', 'trends'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View>
            <View style={styles.summaryGrid}>
              <View style={[styles.summaryCard, { backgroundColor: '#10B98115', borderColor: '#10B98130' }]}>
                <Text style={styles.summaryLabel}>Today</Text>
                <Text style={styles.summaryValue}>
                  {formatAmount(summary?.today?.[selectedCurrency] || 0)}
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: '#3B82F615', borderColor: '#3B82F630' }]}>
                <Text style={styles.summaryLabel}>This Month</Text>
                <Text style={styles.summaryValue}>
                  {formatAmount(summary?.this_month?.[selectedCurrency] || 0)}
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: '#F59E0B15', borderColor: '#F59E0B30' }]}>
                <Text style={styles.summaryLabel}>Last Month</Text>
                <Text style={styles.summaryValue}>
                  {formatAmount(summary?.last_month?.[selectedCurrency] || 0)}
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: '#8B5CF615', borderColor: '#8B5CF630' }]}>
                <Text style={styles.summaryLabel}>Total All Time</Text>
                <Text style={styles.summaryValue}>
                  {formatAmount(summary?.total?.[selectedCurrency] || 0)}
                </Text>
              </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Ionicons name="receipt" size={24} color="#10B981" />
                <Text style={styles.statValue}>{summary?.total_count || 0}</Text>
                <Text style={styles.statLabel}>Total Expenses</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="people" size={24} color="#3B82F6" />
                <Text style={styles.statValue}>{memberData.length}</Text>
                <Text style={styles.statLabel}>Family Members</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="folder" size={24} color="#F59E0B" />
                <Text style={styles.statValue}>{categoryData.filter((c) => c.count > 0).length}</Text>
                <Text style={styles.statLabel}>Categories Used</Text>
              </View>
            </View>
          </View>
        )}

        {/* Category Tab */}
        {activeTab === 'category' && (
          <View>
            {getPieChartData().length > 0 ? (
              <View style={styles.chartContainer}>
                <PieChart
                  data={getPieChartData()}
                  donut
                  radius={100}
                  innerRadius={60}
                  centerLabelComponent={() => (
                    <View style={styles.pieCenter}>
                      <Text style={styles.pieCenterValue}>
                        {formatAmount(
                          categoryData.reduce((sum, cat) => sum + (cat.amounts[selectedCurrency] || 0), 0)
                        )}
                      </Text>
                      <Text style={styles.pieCenterLabel}>Total</Text>
                    </View>
                  )}
                />
              </View>
            ) : (
              <View style={styles.emptyChart}>
                <Ionicons name="pie-chart-outline" size={48} color="#64748B" />
                <Text style={styles.emptyText}>No data for {selectedCurrency}</Text>
              </View>
            )}

            {/* Category List */}
            <View style={styles.categoryList}>
              {categoryData
                .filter((cat) => cat.amounts[selectedCurrency] > 0)
                .sort((a, b) => (b.amounts[selectedCurrency] || 0) - (a.amounts[selectedCurrency] || 0))
                .map((cat) => (
                  <View key={cat.category_id} style={styles.categoryItem}>
                    <View style={[styles.categoryDot, { backgroundColor: cat.category_color }]} />
                    <Text style={styles.categoryName}>{cat.category_name}</Text>
                    <Text style={styles.categoryCount}>{cat.count} expenses</Text>
                    <Text style={styles.categoryAmount}>
                      {formatAmount(cat.amounts[selectedCurrency] || 0)}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Member Tab */}
        {activeTab === 'member' && (
          <View>
            {getMemberBarData().length > 0 && getMemberBarData().some((d) => d.value > 0) ? (
              <View style={styles.chartContainer}>
                <BarChart
                  data={getMemberBarData()}
                  barWidth={40}
                  spacing={24}
                  roundedTop
                  xAxisThickness={0}
                  yAxisThickness={0}
                  yAxisTextStyle={{ color: '#64748B' }}
                  xAxisLabelTextStyle={{ color: '#94A3B8', fontSize: 12 }}
                  noOfSections={4}
                  maxValue={Math.max(...getMemberBarData().map((d) => d.value)) * 1.2 || 100}
                  hideRules
                  isAnimated
                />
              </View>
            ) : (
              <View style={styles.emptyChart}>
                <Ionicons name="bar-chart-outline" size={48} color="#64748B" />
                <Text style={styles.emptyText}>No data for {selectedCurrency}</Text>
              </View>
            )}

            {/* Member List */}
            <View style={styles.memberList}>
              {memberData
                .sort((a, b) => (b.amounts[selectedCurrency] || 0) - (a.amounts[selectedCurrency] || 0))
                .map((member) => (
                  <View key={member.user_id} style={styles.memberItem}>
                    <View style={[styles.memberAvatar, { backgroundColor: member.user_color }]}>
                      <Text style={styles.memberInitial}>{member.user_name[0]}</Text>
                    </View>
                    <View style={styles.memberDetails}>
                      <Text style={styles.memberName}>{member.user_name}</Text>
                      <Text style={styles.memberCount}>{member.count} expenses</Text>
                    </View>
                    <Text style={styles.memberAmount}>
                      {formatAmount(member.amounts[selectedCurrency] || 0)}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <View>
            {getBarChartData().length > 0 && getBarChartData().some((d) => d.value > 0) ? (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Monthly Spending Trend</Text>
                <BarChart
                  data={getBarChartData()}
                  barWidth={32}
                  spacing={16}
                  roundedTop
                  xAxisThickness={0}
                  yAxisThickness={0}
                  yAxisTextStyle={{ color: '#64748B' }}
                  xAxisLabelTextStyle={{ color: '#94A3B8', fontSize: 10 }}
                  noOfSections={4}
                  maxValue={Math.max(...getBarChartData().map((d) => d.value)) * 1.2 || 100}
                  hideRules
                  isAnimated
                />
              </View>
            ) : (
              <View style={styles.emptyChart}>
                <Ionicons name="trending-up-outline" size={48} color="#64748B" />
                <Text style={styles.emptyText}>No trend data for {selectedCurrency}</Text>
              </View>
            )}

            {/* Trend List */}
            <View style={styles.trendList}>
              {trendData.map((trend, index) => (
                <View key={index} style={styles.trendItem}>
                  <Text style={styles.trendMonth}>{trend.month}</Text>
                  <Text style={styles.trendAmount}>
                    {formatAmount(trend.amounts[selectedCurrency] || 0)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 16,
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#10B981',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFF',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  emptyChart: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
  },
  pieCenter: {
    alignItems: 'center',
  },
  pieCenterValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  pieCenterLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  categoryList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
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
  categoryCount: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 12,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  memberList: {
    gap: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F8FAFC',
  },
  memberCount: {
    fontSize: 12,
    color: '#64748B',
  },
  memberAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  trendList: {
    gap: 8,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
  },
  trendMonth: {
    fontSize: 14,
    color: '#F8FAFC',
  },
  trendAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
});
