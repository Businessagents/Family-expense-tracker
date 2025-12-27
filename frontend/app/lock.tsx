import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/src/contexts/AuthContext';

export default function LockScreen() {
  const router = useRouter();
  const { user, unlockWithPin, unlockWithBiometric, biometricAvailable, logout } = useAuth();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Try biometric on mount
    if (biometricAvailable && user?.biometric_enabled) {
      handleBiometricUnlock();
    }
  }, []);

  const handleBiometricUnlock = async () => {
    const success = await unlockWithBiometric();
    if (success) {
      router.replace('/(main)/home');
    }
  };

  const handlePinUnlock = async () => {
    if (pin.length < 4) {
      Alert.alert('Error', 'Please enter your PIN');
      return;
    }

    setIsLoading(true);
    const success = await unlockWithPin(pin);
    setIsLoading(false);

    if (success) {
      router.replace('/(main)/home');
    } else {
      Vibration.vibrate(200);
      setAttempts(prev => prev + 1);
      setPin('');
      
      if (attempts >= 4) {
        Alert.alert(
          'Too Many Attempts',
          'You have entered wrong PIN too many times. Would you like to logout?',
          [
            { text: 'Try Again', style: 'cancel' },
            {
              text: 'Logout',
              style: 'destructive',
              onPress: async () => {
                await logout();
                router.replace('/(auth)/login');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Incorrect PIN');
      }
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const renderPinDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {[0, 1, 2, 3, 4, 5].map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < pin.length && styles.pinDotFilled,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      [biometricAvailable && user?.biometric_enabled ? 'bio' : '', '0', 'del'],
    ];

    return (
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key, keyIndex) => {
              if (key === '') {
                return <View key={keyIndex} style={styles.keyEmpty} />;
              }
              if (key === 'bio') {
                return (
                  <TouchableOpacity
                    key={keyIndex}
                    style={styles.key}
                    onPress={handleBiometricUnlock}
                  >
                    <Ionicons name="finger-print" size={28} color="#22D3EE" />
                  </TouchableOpacity>
                );
              }
              if (key === 'del') {
                return (
                  <TouchableOpacity
                    key={keyIndex}
                    style={styles.key}
                    onPress={handleDelete}
                    onLongPress={() => setPin('')}
                  >
                    <Ionicons name="backspace-outline" size={28} color="#94A3B8" />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={keyIndex}
                  style={styles.key}
                  onPress={() => handlePinInput(key)}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="lock-closed" size={40} color="#22D3EE" />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>{user?.name}</Text>
          <Text style={styles.instruction}>Enter your PIN to unlock</Text>
        </View>

        {renderPinDots()}

        {isLoading ? (
          <ActivityIndicator size="large" color="#22D3EE" style={styles.loader} />
        ) : (
          <>
            {renderKeypad()}
            
            <TouchableOpacity style={styles.unlockButton} onPress={handlePinUnlock}>
              <Text style={styles.unlockButtonText}>Unlock</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1F2A',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22D3EE20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#22D3EE',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#94A3B8',
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#334155',
    marginHorizontal: 8,
  },
  pinDotFilled: {
    backgroundColor: '#22D3EE',
  },
  keypad: {
    marginBottom: 24,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  keyEmpty: {
    width: 72,
    height: 72,
    marginHorizontal: 12,
  },
  keyText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#F8FAFC',
  },
  loader: {
    marginVertical: 40,
  },
  unlockButton: {
    backgroundColor: '#22D3EE',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
