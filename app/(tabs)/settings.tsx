import { useState } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { useGpa } from '@/hooks/useGpa';
import { useTheme } from '@/hooks/useTheme';
import { Info, CircleHelp as HelpCircle, Trash2, Sun, Moon } from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { clearAllData } = useGpa();
  const [hideGrades, setHideGrades] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    header: {
      marginBottom: 24,
      paddingHorizontal: 4,
    },
    title: {
      fontFamily: 'Inter-Bold',
      fontSize: 22,
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 8,
      marginLeft: 16,
      textTransform: 'uppercase',
    },
    sectionContainer: {
      backgroundColor: colors.card,
      borderRadius: Platform.OS === 'ios' ? 8 : 10,
      overflow: 'hidden',
      marginHorizontal: 0,
      marginBottom: 8,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: Platform.OS === 'ios' ? 44 : 48,
      paddingHorizontal: Platform.OS === 'ios' ? 16 : 16,
      borderBottomWidth: Platform.OS === 'ios' ? 0.3 : 1,
      borderBottomColor: colors.border,
      justifyContent: 'space-between',
    },
    settingLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 8,
    },
    settingLabel: {
      fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'Inter-Regular',
      fontSize: Platform.OS === 'ios' ? 17 : 16,
      color: colors.text,
    },
    settingIcon: {
      marginRight: 12,
      opacity: Platform.OS === 'ios' ? 0.6 : 1,
    },
    dangerButton: {
      backgroundColor: colors.error,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
      marginTop: 16,
    },
    dangerButtonText: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      color: '#FFFFFF',
    },
    appInfo: {
      alignItems: 'center',
      marginTop: 32,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    appVersion: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    }
  });

  const confirmClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all your academic records? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All Data", 
          style: "destructive",
          onPress: clearAllData
        }
      ]
    );
  };

  const showAbout = () => {
    Alert.alert(
      "About GPA Calculator",
      "A comprehensive GPA Calculator and Course Management System to help students track their academic progress.\n\nVersion 1.0.0",
      [{ text: "OK" }]
    );
  };

  const showHelp = () => {
    Alert.alert(
      "GPA Calculator Help",
      "1. Add courses using the + button on the Courses tab\n\n2. View your GPA summary on the Dashboard\n\n3. See your complete academic record in the Record tab\n\n4. GPA is calculated on a 4.0 scale (A = 4.0, B = 3.0, etc.)",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your GPA Calculator experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.sectionContainer}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                {isDark ? (
                  <Moon size={Platform.OS === 'ios' ? 18 : 20} color={colors.text} style={styles.settingIcon} />
                ) : (
                  <Sun size={Platform.OS === 'ios' ? 18 : 20} color={colors.text} style={styles.settingIcon} />
                )}
                <Text style={styles.settingLabel}>Dark Theme</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ 
                  false: Platform.OS === 'ios' ? '#e9e9ea' : colors.border,
                  true: Platform.OS === 'ios' ? colors.primary : colors.primary 
                }}
                thumbColor={Platform.select({
                  android: isDark ? colors.primary : '#f4f3f4',
                  ios: '#ffffff'
                })}
                ios_backgroundColor="#e9e9ea"
              />
            </View>
          </View>
          
          <View style={styles.sectionContainer}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Info size={Platform.OS === 'ios' ? 18 : 20} color={colors.text} style={styles.settingIcon} />
                <Text style={styles.settingLabel}>Hide Grades</Text>
              </View>
              <Switch
                value={hideGrades}
                onValueChange={setHideGrades}
                trackColor={{ 
                  false: Platform.OS === 'ios' ? '#e9e9ea' : colors.border,
                  true: Platform.OS === 'ios' ? colors.primary : colors.primary 
                }}
                thumbColor={Platform.select({
                  android: hideGrades ? colors.primary : '#f4f3f4',
                  ios: '#ffffff'
                })}
                ios_backgroundColor="#e9e9ea"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContainer}>
            <TouchableOpacity style={styles.settingRow} onPress={showHelp}>
              <View style={styles.settingLabelContainer}>
                <HelpCircle size={Platform.OS === 'ios' ? 18 : 20} color={colors.text} style={styles.settingIcon} />
                <Text style={styles.settingLabel}>Help & FAQ</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingRow} onPress={showAbout}>
              <View style={styles.settingLabelContainer}>
                <Info size={Platform.OS === 'ios' ? 18 : 20} color={colors.text} style={styles.settingIcon} />
                <Text style={styles.settingLabel}>About</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <View style={styles.sectionContainer}>
            <TouchableOpacity style={[styles.settingRow, { justifyContent: 'center' }]} onPress={confirmClearData}>
              <Text style={{ fontFamily: 'Inter-Medium', color: colors.error }}>Clear All Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>GPA Calculator v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}