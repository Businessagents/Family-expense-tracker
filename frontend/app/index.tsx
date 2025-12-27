import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useGroups } from '@/src/contexts/GroupContext';

export default function Index() {
  const router = useRouter();
  const { user, isLoading, isLocked } = useAuth();
  const { groups } = useGroups();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (isLocked) {
          router.replace('/lock');
        } else if (groups.length === 0) {
          // Wait for groups to load
        } else {
          router.replace('/(main)/home');
        }
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, isLoading, isLocked, groups]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#22D3EE" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1F2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
