import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Plus, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGpa } from '@/hooks/useGpa';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, radii, spacing } from '@/constants/theme';
import ScreenHeader from '@/components/ScreenHeader';
import { customScaleFrom, MAX_CUSTOM_GRADES, MAX_LABEL_LENGTH } from '@/utils/customScale';
import { GRADING_SYSTEMS } from '@/utils/gradingSystems';
import { CustomScaleInput } from '@/types/gradingSystem';
import type { GradingSystemSwitchMode } from '@/context/GpaContext';

type Row = { key: number; label: string; value: string };

const parseNumber = (text: string) => parseFloat(text.replace(',', '.'));

const toRows = (input: CustomScaleInput): Row[] =>
  input.grades.map((g, i) => ({ key: i, label: g.label, value: String(g.value) }));

export default function CustomScaleScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { gradingSystem, customScale, saveCustomScale } = useGpa();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const switchMode: GradingSystemSwitchMode = mode === 'reset' ? 'reset' : 'convert';

  // Start from the saved custom scale, or from the grades in use now
  const initial = customScale ?? customScaleFrom(gradingSystem);
  const [name, setName] = useState(initial.name);
  const [maxGpa, setMaxGpa] = useState(String(initial.maxGpa));
  const [rows, setRows] = useState<Row[]>(() => toRows(initial));
  const [nextKey, setNextKey] = useState(initial.grades.length);
  const [error, setError] = useState<string | null>(null);

  const updateRow = (key: number, patch: Partial<Row>) => {
    setError(null);
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    if (rows.length >= MAX_CUSTOM_GRADES) return;
    setRows((prev) => [...prev, { key: nextKey, label: '', value: '' }]);
    setNextKey((k) => k + 1);
  };

  const applyTemplate = (id: 'us_4.0' | 'india_10') => {
    const template = customScaleFrom(GRADING_SYSTEMS[id]);
    setMaxGpa(String(template.maxGpa));
    setRows(toRows(template));
    setNextKey(template.grades.length);
    setError(null);
  };

  const handleSave = () => {
    const result = saveCustomScale(
      {
        name,
        maxGpa: parseNumber(maxGpa),
        grades: rows.map((r) => ({ label: r.label.trim(), value: parseNumber(r.value) })),
      },
      switchMode
    );
    if (result) {
      setError(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing['3xl'],
      ...(Platform.OS === 'web'
        ? { maxWidth: 720, alignSelf: 'center' as const, width: '100%' as unknown as number }
        : {}),
    },
    intro: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    label: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      marginBottom: spacing.xs + 2,
      marginTop: spacing.md,
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 48,
      fontFamily: fonts.regular,
      fontSize: fontSizes.lg,
      color: colors.text,
    },
    templates: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radii.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    chipText: { fontFamily: fonts.medium, fontSize: fontSizes.sm, color: colors.text },
    headerRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
    headerLabel: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
    labelInput: { width: 84, textAlign: 'center' },
    valueInput: { flex: 1 },
    remove: { width: 40, height: 48, justifyContent: 'center', alignItems: 'center' },
    add: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.md,
      alignSelf: 'flex-start',
      paddingVertical: spacing.sm,
    },
    addText: { fontFamily: fonts.semiBold, fontSize: fontSizes.md, color: colors.primary },
    error: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.md,
      color: colors.error,
      marginTop: spacing.lg,
    },
    footer: {
      padding: spacing.lg,
      paddingBottom: Math.max(insets.bottom, spacing.lg),
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    save: {
      height: 54,
      borderRadius: 14,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveText: { fontFamily: fonts.semiBold, fontSize: fontSizes.lg, color: colors.onPrimary },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title="Custom grading scale" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Enter the grades your university uses and what each is worth. The best grade should be
          worth the maximum.
        </Text>

        <Text style={styles.label}>Start from</Text>
        <View style={styles.templates}>
          <TouchableOpacity style={styles.chip} onPress={() => applyTemplate('india_10')}>
            <Text style={styles.chipText}>🇮🇳 India 10-point</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => applyTemplate('us_4.0')}>
            <Text style={styles.chipText}>🇺🇸 US 4.0</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Scale name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(t) => {
            setName(t);
            setError(null);
          }}
          placeholder="e.g. My University"
          placeholderTextColor={colors.textSecondary}
          maxLength={30}
          accessibilityLabel="Scale name"
        />

        <Text style={styles.label}>Maximum GPA</Text>
        <TextInput
          style={styles.input}
          value={maxGpa}
          onChangeText={(t) => {
            setMaxGpa(t);
            setError(null);
          }}
          keyboardType="decimal-pad"
          placeholder="10"
          placeholderTextColor={colors.textSecondary}
          maxLength={5}
          accessibilityLabel="Maximum GPA"
        />

        <View style={styles.headerRow}>
          <Text style={[styles.headerLabel, { width: 84, textAlign: 'center' }]}>Grade</Text>
          <Text style={[styles.headerLabel, { flex: 1 }]}>Points</Text>
        </View>

        {rows.map((row, index) => (
          <View key={row.key} style={styles.row}>
            <TextInput
              style={[styles.input, styles.labelInput]}
              value={row.label}
              onChangeText={(t) => updateRow(row.key, { label: t })}
              maxLength={MAX_LABEL_LENGTH}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder="A"
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel={`Grade ${index + 1} name`}
            />
            <TextInput
              style={[styles.input, styles.valueInput]}
              value={row.value}
              onChangeText={(t) => updateRow(row.key, { value: t })}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              maxLength={5}
              accessibilityLabel={`Grade ${index + 1} points`}
            />
            <TouchableOpacity
              style={styles.remove}
              onPress={() => {
                setError(null);
                setRows((prev) => prev.filter((r) => r.key !== row.key));
              }}
              accessibilityRole="button"
              accessibilityLabel={`Remove grade ${index + 1}`}
            >
              <Trash2 size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.add} onPress={addRow} accessibilityRole="button">
          <Plus size={16} color={colors.primary} strokeWidth={2.5} />
          <Text style={styles.addText}>Add grade</Text>
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.save} onPress={handleSave} accessibilityRole="button">
          <Text style={styles.saveText}>Save and use this scale</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
