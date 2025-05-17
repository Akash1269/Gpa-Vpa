import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

type SafeAreaWrapperProps = {
  children: React.ReactNode;
};

export default function SafeAreaWrapper({ children }: SafeAreaWrapperProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    bottomSafeArea: {
      height: Platform.OS === 'ios' ? Math.max(insets.bottom, 20) : 0,
      backgroundColor: colors.card,
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      <View style={styles.bottomSafeArea} />
    </View>
  );
}
