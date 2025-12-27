import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { api } from '@/src/services/api';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  CAD: 'C$',
  SAR: '﷼',
};

interface Debt {
  group_id: string;
  group_name: string;
  user_id: string;
  user_name: string;
  avatar_color: string;
  amount: number;
  currency: string;
}

interface BalanceSummary {
  to_pay: Debt[];
  to_receive: Debt[];
  total_to_pay: Record<string, number>;
  total_to_receive: Record<string, number>;
}

export default function Balances() {
  const { user } = useAuth();
  const [balances, setBalances] = useState<BalanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNote, setSettleNote] = useState('');
  const [isSettling, setIsSettling] = useState(false);

  const fetchBalances = async () => {
    try {
      const data = await api.getBalancesSummary();
      setBalances(data);
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBalances();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBalances();
  };

  const handleSettle = (debt: Debt) => {
    setSelectedDebt(debt);
    setSettleAmount(debt.amount.toString());
    setSettleNote('');
    setShowSettleModal(true);
  };

  const confirmSettle = async () => {
    if (!selectedDebt) return;

    const amount = parseFloat(settleAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsSettling(true);
    try {
      await api.createSettlement({
        group_id: selectedDebt.group_id,
        paid_to: selectedDebt.user_id,
        amount,
        currency: selectedDebt.currency,
        note: settleNote,
      });
      
      Alert.alert('Success', `Settled ${CURRENCY_SYMBOLS[selectedDebt.currency]}${amount} with ${selectedDebt.user_name}`);
      setShowSettleModal(false);
      fetchBalances();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to settle');
    } finally {
      setIsSettling(false);
    }
  };

  const formatTotal = (totals: Record<string, number>) => {
    return Object.entries(totals)
      .filter(([_, amount]) => amount > 0)
      .map(([currency, amount]) => `${CURRENCY_SYMBOLS[currency]}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`)
      .join(' + ') || '0';
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

  const hasDebts = (balances?.to_pay?.length || 0) > 0 || (balances?.to_receive?.length || 0) > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22D3EE" />}
      >
        <Text style={styles.title}>Balances</Text>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.oweCard]}>
            <Ionicons name="arrow-up-circle" size={24} color="#EF4444" />
            <Text style={styles.summaryLabel}>You Owe</Text>
            <Text style={styles.summaryAmount}>{formatTotal(balances?.total_to_pay || {})}</Text>
          </View>
          <View style={[styles.summaryCard, styles.owedCard]}>
            <Ionicons name="arrow-down-circle" size={24} color="#22D3EE" />
            <Text style={styles.summaryLabel}>You're Owed</Text>
            <Text style={styles.summaryAmount}>{formatTotal(balances?.total_to_receive || {})}</Text>
          </View>
        </View>

        {!hasDebts ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color="#22D3EE" />
            <Text style={styles.emptyTitle}>All Settled!</Text>
            <Text style={styles.emptySubtext}>You have no outstanding balances</Text>
          </View>
        ) : (
          <>
            {/* You Owe Section */}
            {(balances?.to_pay?.length || 0) > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>You Owe</Text>
                {balances?.to_pay.map((debt, index) => (
                  <View key={`pay-${index}`} style={styles.debtCard}>
                    <View style={styles.debtInfo}>
                      <View style={[styles.avatar, { backgroundColor: debt.avatar_color }]}>
                        <Text style={styles.avatarText}>{debt.user_name[0]}</Text>
                      </View>
                      <View style={styles.debtDetails}>
                        <Text style={styles.debtName}>{debt.user_name}</Text>
                        <Text style={styles.debtGroup}>{debt.group_name}</Text>
                      </View>
                    </View>
                    <View style={styles.debtActions}>
                      <Text style={[styles.debtAmount, styles.oweAmount]}>
                        {CURRENCY_SYMBOLS[debt.currency]}{debt.amount.toLocaleString('en-IN')}
                      </Text>
                      <TouchableOpacity
                        style={styles.settleButton}
                        onPress={() => handleSettle(debt)}
                      >
                        <Text style={styles.settleButtonText}>Settle</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* You're Owed Section */}
            {(balances?.to_receive?.length || 0) > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>You're Owed</Text>
                {balances?.to_receive.map((debt, index) => (
                  <View key={`receive-${index}`} style={styles.debtCard}>
                    <View style={styles.debtInfo}>
                      <View style={[styles.avatar, { backgroundColor: debt.avatar_color }]}>
                        <Text style={styles.avatarText}>{debt.user_name[0]}</Text>
                      </View>
                      <View style={styles.debtDetails}>
                        <Text style={styles.debtName}>{debt.user_name}</Text>
                        <Text style={styles.debtGroup}>{debt.group_name}</Text>
                      </View>
                    </View>
                    <View style={styles.debtActions}>
                      <Text style={[styles.debtAmount, styles.owedAmount]}>
                        {CURRENCY_SYMBOLS[debt.currency]}{debt.amount.toLocaleString('en-IN')}
                      </Text>
                      <TouchableOpacity
                        style={[styles.settleButton, styles.remindButton]}
                        onPress={() => Alert.alert('Reminder', `Remind ${debt.user_name} to settle ${CURRENCY_SYMBOLS[debt.currency]}${debt.amount}`)}
                      >
                        <Text style={styles.remindButtonText}>Remind</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            Balances are calculated based on expense splits in your groups. Settle up to clear your debts.
          </Text>
        </View>
      </ScrollView>

      {/* Settle Modal */}
      <Modal visible={showSettleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settle Up</Text>
              <TouchableOpacity onPress={() => setShowSettleModal(false)}>
                <Ionicons name="close" size={24} color="#F8FAFC" />
              </TouchableOpacity>
            </View>

            {selectedDebt && (
              <>
                <View style={styles.settleInfo}>
                  <View style={[styles.settleavatar, { backgroundColor: selectedDebt.avatar_color }]}>
                    <Text style={styles.settleAvatarText}>{selectedDebt.user_name[0]}</Text>
                  </View>
                  <Text style={styles.settleLabel}>Pay {selectedDebt.user_name}</Text>
                  <Text style={styles.settleGroup}>{selectedDebt.group_name}</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Amount ({CURRENCY_SYMBOLS[selectedDebt.currency]})</Text>
                  <TextInput
                    style={styles.input}
                    value={settleAmount}
                    onChangeText={setSettleAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#64748B"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Note (optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={settleNote}
                    onChangeText={setSettleNote}
                    placeholder="e.g., Cash payment"
                    placeholderTextColor="#64748B"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.confirmButton, isSettling && styles.confirmButtonDisabled]}
                  onPress={confirmSettle}
                  disabled={isSettling}
                >
                  {isSettling ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      Settle {CURRENCY_SYMBOLS[selectedDebt.currency]}{settleAmount || '0'}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
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
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  oweCard: {
    backgroundColor: '#EF444420',
    borderWidth: 1,
    borderColor: '#EF444440',
  },
  owedCard: {
    backgroundColor: '#22D3EE20',
    borderWidth: 1,
    borderColor: '#22D3EE40',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
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
  debtCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  debtInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  debtDetails: {
    marginLeft: 12,
    flex: 1,
  },
  debtName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  debtGroup: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  debtActions: {
    alignItems: 'flex-end',
  },
  debtAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  oweAmount: {
    color: '#EF4444',
  },
  owedAmount: {
    color: '#22D3EE',
  },
  settleButton: {
    backgroundColor: '#22D3EE',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  settleButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  remindButton: {
    backgroundColor: '#3B82F6',
  },
  remindButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
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
  settleInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  settleavatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  settleAvatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  settleLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  settleGroup: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0B1F2A',
    borderRadius: 12,
    padding: 16,
    color: '#F8FAFC',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#22D3EE',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
