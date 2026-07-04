import {
  StyleSheet,
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Share,
  Linking,
} from 'react-native';
import { useGpa } from '@/hooks/useGpa';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, spacing, radii } from '@/constants/theme';
import ScreenHeader from '@/components/ScreenHeader';
import {
  Info,
  CircleHelp as HelpCircle,
  Trash2,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Download,
  Upload,
  Database,
  Shield,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme, hideGrades, toggleHideGrades } = useTheme();
  const { clearAllData, courses, loadDemoData } = useGpa();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing['3xl'],
      ...(Platform.OS === 'web' ? { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' as unknown as number } : {}),
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
      color: '#FFFFFF',
    },
    appInfo: {
      alignItems: 'center',
      marginTop: spacing['3xl'],
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    appVersion: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
  });

  const exportAsCSV = async () => {
    if (courses.length === 0) {
      Alert.alert('No Data', 'Add some courses before exporting.');
      return;
    }
    const header = 'Name,Code,Credits,Grade,Semester,Year';
    const rows = courses.map(c => `"${c.name}","${c.code}",${c.credits},${c.grade},${c.semester},${c.year}`);
    const csv = [header, ...rows].join('\n');
    await Share.share({ message: csv, title: 'GPA Calculator - Courses.csv' });
  };

  const exportAsJSON = async () => {
    if (courses.length === 0) {
      Alert.alert('No Data', 'Add some courses before exporting.');
      return;
    }
    const json = JSON.stringify({ courses, exportedAt: new Date().toISOString() }, null, 2);
    await Share.share({ message: json, title: 'GPA Calculator - Backup.json' });
  };

  const confirmClearData = () => {
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
  };

  const showAbout = () => {
    Alert.alert(
      'About GPA Calculator',
      'A comprehensive GPA Calculator and Course Management System to help students track their academic progress.\n\nVersion 0.1.2',
      [{ text: 'OK' }]
    );
  };

  const showHelp = () => {
    Alert.alert(
      'GPA Calculator Help',
      '1. Add courses using the + button on the Courses tab\n\n2. View your GPA summary on the Dashboard\n\n3. See your complete academic record in the Record tab\n\n4. GPA is calculated on a 4.0 scale (A = 4.0, B = 3.0, etc.)',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.content}>

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
              <Switch value={isDark} onValueChange={toggleTheme} accessibilityLabel="Dark theme toggle" />
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
              <Switch value={hideGrades} onValueChange={toggleHideGrades} accessibilityLabel="Hide grades toggle" />
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

            <TouchableOpacity style={[styles.settingRow, styles.lastSettingRow]} onPress={() => Linking.openURL('https://github.com/Akash1269/Gpa-Vpa/blob/main/docs/PRIVACY_POLICY.md')}>
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

            <TouchableOpacity style={[styles.settingRow, styles.lastSettingRow]} onPress={exportAsJSON}>
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
                  Alert.alert(
                    'Load Demo Data',
                    'This will replace your current courses with sample data. Continue?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Load Demo', onPress: loadDemoData },
                    ]
                  );
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
              <Text style={{ fontFamily: fonts.medium, color: colors.error }}>
                Clear All Data
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>GPA Calculator v0.1.2</Text>
        </View>
      </ScrollView>
    </View>
  );
}
