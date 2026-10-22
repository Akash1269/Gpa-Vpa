import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useGpa } from '@/hooks/useGpa';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing, radii } from '@/constants/theme';
import ScreenHeader from '@/components/ScreenHeader';
import GradingSystemModal from '@/components/GradingSystemModal';
import {
  Info,
  CircleHelp as HelpCircle,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Download,
  Upload,
  Database,
  Shield,
  GraduationCap,
  ChevronRight,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme, hideGrades, toggleHideGrades } = useTheme();
  const { clearAllData, courses, loadDemoData, gradingSystem, setGradingSystem } = useGpa();
  const [showSystemPicker, setShowSystemPicker] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing['3xl'],
      ...(Platform.OS === 'web'
        ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number }
        : {}),
    },
    section: {
      marginBottom: spacing['2xl'],
    },
    sectionTitle: {
      fontFamily: fonts.semiBold,
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
      marginLeft: spacing.lg,
      textTransform: 'uppercase',
    },
    sectionContainer: {
      backgroundColor: colors.card,
      borderRadius: Platform.OS === 'ios' ? radii.sm : radii.md,
      overflow: 'hidden',
      marginHorizontal: 0,
      marginBottom: spacing.sm,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: Platform.OS === 'ios' ? 44 : 48,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: Platform.OS === 'ios' ? 0.3 : 1,
      borderBottomColor: colors.border,
      justifyContent: 'space-between',
    },
    lastSettingRow: {
      borderBottomWidth: 0,
    },
    settingLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: spacing.sm,
    },
    settingValue: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
      marginRight: spacing.xs,
    },
    settingLabel: {
      fontFamily: Platform.OS === 'ios' ? '-apple-system' : fonts.regular,
      fontSize: Platform.OS === 'ios' ? 17 : fontSizes.lg,
      color: colors.text,
    },
    settingIcon: {
      marginRight: spacing.md,
      opacity: Platform.OS === 'ios' ? 0.6 : 1,
    },
    dangerButton: {
      backgroundColor: colors.error,
      borderRadius: radii.sm,
      padding: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    dangerButtonText: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.lg,
      color: colors.onError,
    },
  });

  const exportAsCSV = async () => {
    if (courses.length === 0) {
      Alert.alert('No Data', 'Add some courses before exporting.');
      return;
    }
    const header = 'Name,Code,Credits,Grade,Semester,Year';
    const rows = courses.map(
      (c) => `"${c.name}","${c.code}",${c.credits},${c.grade},${c.semester},${c.year}`
    );
    const csv = [header, ...rows].join('\n');

    if (Platform.OS === 'web') {
      downloadFileWeb(csv, 'gpa-calculator-courses.csv', 'text/csv');
    } else {
      const file = new File(Paths.cache, 'gpa-calculator-courses.csv');
      file.write(csv);
      await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Save CSV' });
    }
  };

  const exportAsJSON = async () => {
    if (courses.length === 0) {
      Alert.alert('No Data', 'Add some courses before exporting.');
      return;
    }
    const json = JSON.stringify(
      { gradingSystem: gradingSystem.id, courses, exportedAt: new Date().toISOString() },
      null,
      2
    );

    if (Platform.OS === 'web') {
      downloadFileWeb(json, 'gpa-calculator-backup.json', 'application/json');
    } else {
      const file = new File(Paths.cache, 'gpa-calculator-backup.json');
      file.write(json);
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Save Backup',
      });
    }
  };

  const downloadFileWeb = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmClearData = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Are you sure you want to delete all your academic records? This action cannot be undone.'
      );
      if (confirmed) clearAllData();
    } else {
      Alert.alert(
        'Clear All Data',
        'Are you sure you want to delete all your academic records? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear All Data',
            style: 'destructive',
            onPress: clearAllData,
          },
        ]
      );
    }
  };

  const showAbout = () => {
    Alert.alert(
      'About GPA Calculator',
      'A comprehensive GPA Calculator and Course Management System to help students track their academic progress.',
      [{ text: 'OK' }]
    );
  };

  const showHelp = () => {
    Alert.alert(
      'GPA Calculator Help',
      `1. Add courses using the + button on the Courses tab\n\n2. View your GPA summary on the Dashboard\n\n3. See your complete academic record in the Record tab\n\n4. GPA is calculated on the ${gradingSystem.name} (${gradingSystem.grades[0].label} = ${gradingSystem.grades[0].value}). Change it in Settings > Grading system.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grades</Text>
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={[styles.settingRow, styles.lastSettingRow]}
              onPress={() => setShowSystemPicker(true)}
              accessibilityRole="button"
              accessibilityLabel={`Grading system, ${gradingSystem.name}`}
            >
              <View style={styles.settingLabelContainer}>
                <GraduationCap
                  size={Platform.OS === 'ios' ? 18 : 20}
                  color={colors.text}
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>Grading system</Text>
              </View>
              <Text style={styles.settingValue}>
                {gradingSystem.flag} {gradingSystem.name}
              </Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.sectionContainer}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                {isDark ? (
                  <Moon
                    size={Platform.OS === 'ios' ? 18 : 20}
                    color={colors.text}
                    style={styles.settingIcon}
                  />
                ) : (
                  <Sun
                    size={Platform.OS === 'ios' ? 18 : 20}
                    color={colors.text}
                    style={styles.settingIcon}
                  />
                )}
                <Text style={styles.settingLabel}>Dark Theme</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                accessibilityLabel="Dark theme toggle"
              />
            </View>
            <View style={[styles.settingRow, styles.lastSettingRow]}>
              <View style={styles.settingLabelContainer}>
                {hideGrades ? (
                  <EyeOff
                    size={Platform.OS === 'ios' ? 18 : 20}
                    color={colors.text}
                    style={styles.settingIcon}
                  />
                ) : (
                  <Eye
                    size={Platform.OS === 'ios' ? 18 : 20}
                    color={colors.text}
                    style={styles.settingIcon}
                  />
                )}
                <Text style={styles.settingLabel}>Hide Grades</Text>
              </View>
              <Switch
                value={hideGrades}
                onValueChange={toggleHideGrades}
                accessibilityLabel="Hide grades toggle"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContainer}>
            <TouchableOpacity style={styles.settingRow} onPress={showHelp}>
              <View style={styles.settingLabelContainer}>
                <HelpCircle
                  size={Platform.OS === 'ios' ? 18 : 20}
                  color={colors.text}
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>Help & FAQ</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow} onPress={showAbout}>
              <View style={styles.settingLabelContainer}>
                <Info
                  size={Platform.OS === 'ios' ? 18 : 20}
                  color={colors.text}
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>About</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingRow, styles.lastSettingRow]}
              onPress={() =>
                Linking.openURL(
                  'https://github.com/Akash1269/Gpa-Vpa/blob/main/docs/PRIVACY_POLICY.md'
                )
              }
            >
              <View style={styles.settingLabelContainer}>
                <Shield
                  size={Platform.OS === 'ios' ? 18 : 20}
                  color={colors.text}
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>Privacy Policy</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Data</Text>
          <View style={styles.sectionContainer}>
            <TouchableOpacity style={styles.settingRow} onPress={exportAsCSV}>
              <View style={styles.settingLabelContainer}>
                <Download
                  size={Platform.OS === 'ios' ? 18 : 20}
                  color={colors.text}
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>Export as CSV</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingRow, styles.lastSettingRow]}
              onPress={exportAsJSON}
            >
              <View style={styles.settingLabelContainer}>
                <Upload
                  size={Platform.OS === 'ios' ? 18 : 20}
                  color={colors.text}
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>Export as JSON Backup</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                if (courses.length > 0) {
                  if (Platform.OS === 'web') {
                    const confirmed = window.confirm(
                      'This will replace your current courses with sample data. Continue?'
                    );
                    if (confirmed) loadDemoData();
                  } else {
                    Alert.alert(
                      'Load Demo Data',
                      'This will replace your current courses with sample data. Continue?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Load Demo', onPress: loadDemoData },
                      ]
                    );
                  }
                } else {
                  loadDemoData();
                }
              }}
              accessibilityLabel="Load demo data"
              accessibilityHint="Loads sample courses to preview how the app looks with data"
            >
              <View style={styles.settingLabelContainer}>
                <Database
                  size={Platform.OS === 'ios' ? 18 : 20}
                  color={colors.primary}
                  style={styles.settingIcon}
                />
                <Text style={[styles.settingLabel, { color: colors.primary }]}>Load Demo Data</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingRow, styles.lastSettingRow, { justifyContent: 'center' }]}
              onPress={confirmClearData}
            >
              <Text style={{ fontFamily: fonts.medium, color: colors.error }}>Clear All Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <GradingSystemModal
        visible={showSystemPicker}
        title="Grading system"
        subtitle="Choose the scale your university uses."
        initialId={gradingSystem.id}
        currentId={gradingSystem.id}
        hasData={courses.length > 0}
        confirmLabel="Save"
        onConfirm={(id, mode) => {
          setShowSystemPicker(false);
          setGradingSystem(id, mode);
        }}
        onCancel={() => setShowSystemPicker(false)}
      />
    </View>
  );
}
