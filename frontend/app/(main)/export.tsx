import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useGroups } from '@/src/contexts/GroupContext';
import { api } from '@/src/services/api';

export default function Export() {
  const router = useRouter();
  const { groups } = useGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [exportType, setExportType] = useState<'all' | 'monthly' | 'range'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState<{ day: number; month: number; year: number }>({
    day: 1,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [endDate, setEndDate] = useState<{ day: number; month: number; year: number }>({
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [showEndDateModal, setShowEndDateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const formatDateString = (date: { day: number; month: number; year: number }) => {
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  };

  const formatDisplayDate = (date: { day: number; month: number; year: number }) => {
    return `${date.day} ${months[date.month - 1].substring(0, 3)} ${date.year}`;
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const exportData: any = {
        export_type: exportType,
      };

      if (selectedGroupId) {
        exportData.group_id = selectedGroupId;
      }

      if (exportType === 'monthly') {
        exportData.month = selectedMonth;
        exportData.year = selectedYear;
      } else if (exportType === 'range') {
        exportData.start_date = formatDateString(startDate);
        exportData.end_date = formatDateString(endDate);
      }

      const response = await api.exportExpenses(exportData);
      
      // Get the CSV content
      const csvContent = await response.text();
      
      // Generate filename
      const groupName = selectedGroupId 
        ? groups.find(g => g.id === selectedGroupId)?.name?.replace(/\s+/g, '_') || 'expenses'
        : 'all_groups';
      
      let filename = `${groupName}_`;
      if (exportType === 'monthly') {
        filename += `${selectedYear}_${String(selectedMonth).padStart(2, '0')}.csv`;
      } else if (exportType === 'range') {
        filename += `${formatDateString(startDate)}_to_${formatDateString(endDate)}.csv`;
      } else {
        filename += 'all_expenses.csv';
      }

      // Save and share the file
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Check if sharing is available
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Expenses',
        });
      } else {
        Alert.alert('Success', `Exported to: ${filename}`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to export expenses');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.title}>Export Expenses</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Group Selection */}
        <Text style={styles.sectionTitle}>Select Group</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.option, !selectedGroupId && styles.optionActive]}
            onPress={() => setSelectedGroupId(null)}
          >
            <Ionicons name="globe" size={20} color={!selectedGroupId ? '#FFF' : '#94A3B8'} />
            <Text style={[styles.optionText, !selectedGroupId && styles.optionTextActive]}>
              All Groups
            </Text>
          </TouchableOpacity>
          {groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={[styles.option, selectedGroupId === group.id && styles.optionActive]}
              onPress={() => setSelectedGroupId(group.id)}
            >
              <View style={[styles.groupDot, { backgroundColor: group.color }]} />
              <Text style={[styles.optionText, selectedGroupId === group.id && styles.optionTextActive]}>
                {group.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Export Type */}
        <Text style={styles.sectionTitle}>Export Type</Text>
        <View style={styles.exportTypeContainer}>
          <TouchableOpacity
            style={[styles.exportTypeOption, exportType === 'all' && styles.exportTypeOptionActive]}
            onPress={() => setExportType('all')}
          >
            <Ionicons name="documents" size={24} color={exportType === 'all' ? '#10B981' : '#64748B'} />
            <Text style={[styles.exportTypeText, exportType === 'all' && styles.exportTypeTextActive]}>
              Entire History
            </Text>
            <Text style={styles.exportTypeDesc}>Export all expenses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportTypeOption, exportType === 'monthly' && styles.exportTypeOptionActive]}
            onPress={() => setExportType('monthly')}
          >
            <Ionicons name="calendar" size={24} color={exportType === 'monthly' ? '#10B981' : '#64748B'} />
            <Text style={[styles.exportTypeText, exportType === 'monthly' && styles.exportTypeTextActive]}>
              Monthly
            </Text>
            <Text style={styles.exportTypeDesc}>Export specific month</Text>
          </TouchableOpacity>
        </View>

        {/* Date Range Option */}
        <TouchableOpacity
          style={[styles.dateRangeOption, exportType === 'range' && styles.dateRangeOptionActive]}
          onPress={() => setExportType('range')}
        >
          <Ionicons name="calendar-outline" size={24} color={exportType === 'range' ? '#10B981' : '#64748B'} />
          <View style={styles.dateRangeTextContainer}>
            <Text style={[styles.exportTypeText, exportType === 'range' && styles.exportTypeTextActive]}>
              Date Range
            </Text>
            <Text style={styles.exportTypeDesc}>Export specific date range</Text>
          </View>
        </TouchableOpacity>

        {/* Month/Year Selection */}
        {exportType === 'monthly' && (
          <View style={styles.dateSelection}>
            <Text style={styles.sectionTitle}>Select Month & Year</Text>
            
            <Text style={styles.label}>Month</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthSelector}>
              {months.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthChip,
                    selectedMonth === index + 1 && styles.monthChipActive,
                  ]}
                  onPress={() => setSelectedMonth(index + 1)}
                >
                  <Text
                    style={[
                      styles.monthChipText,
                      selectedMonth === index + 1 && styles.monthChipTextActive,
                    ]}
                  >
                    {month.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Year</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearSelector}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearChip,
                    selectedYear === year && styles.yearChipActive,
                  ]}
                  onPress={() => setSelectedYear(year)}
                >
                  <Text
                    style={[
                      styles.yearChipText,
                      selectedYear === year && styles.yearChipTextActive,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Date Range Selection */}
        {exportType === 'range' && (
          <View style={styles.dateSelection}>
            <Text style={styles.sectionTitle}>Select Date Range</Text>
            
            <View style={styles.dateRangeRow}>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowStartDateModal(true)}
              >
                <Text style={styles.datePickerLabel}>Start Date</Text>
                <Text style={styles.datePickerValue}>{formatDisplayDate(startDate)}</Text>
                <Ionicons name="calendar" size={20} color="#10B981" />
              </TouchableOpacity>

              <Ionicons name="arrow-forward" size={20} color="#64748B" />

              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowEndDateModal(true)}
              >
                <Text style={styles.datePickerLabel}>End Date</Text>
                <Text style={styles.datePickerValue}>{formatDisplayDate(endDate)}</Text>
                <Ionicons name="calendar" size={20} color="#10B981" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Export Button */}
        <TouchableOpacity
          style={[styles.exportButton, isLoading && styles.exportButtonDisabled]}
          onPress={handleExport}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="download" size={24} color="#FFF" />
              <Text style={styles.exportButtonText}>Export to CSV</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            The CSV file can be opened in Google Sheets, Excel, or any spreadsheet application.
          </Text>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
    marginTop: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    gap: 8,
  },
  optionActive: {
    backgroundColor: '#10B981',
  },
  optionText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  optionTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  groupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  exportTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  exportTypeOption: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  exportTypeOptionActive: {
    borderColor: '#10B981',
    backgroundColor: '#10B98115',
  },
  exportTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginTop: 8,
  },
  exportTypeTextActive: {
    color: '#10B981',
  },
  exportTypeDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  dateSelection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  monthSelector: {
    marginBottom: 16,
  },
  monthChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
  },
  monthChipActive: {
    backgroundColor: '#10B981',
  },
  monthChipText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  monthChipTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  yearSelector: {
    marginBottom: 8,
  },
  yearChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 8,
  },
  yearChipActive: {
    backgroundColor: '#10B981',
  },
  yearChipText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  yearChipTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  exportButtonDisabled: {
    opacity: 0.7,
  },
  exportButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
});
