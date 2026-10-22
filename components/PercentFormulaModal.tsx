import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomSheetModal, { SheetButtons } from '@/components/BottomSheetModal';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, radii, spacing } from '@/constants/theme';
import {
  PERCENT_PRESETS,
  PercentFormula,
  PercentFormulaId,
  cgpaToPercent,
} from '@/utils/percentage';

type PercentFormulaModalProps = {
  visible: boolean;
  initial: PercentFormula;
  cgpa: number; // used for the live preview
  onConfirm: (formula: PercentFormula) => void;
  onCancel: () => void;
};

export default function PercentFormulaModal(props: PercentFormulaModalProps) {
  return (
    <BottomSheetModal visible={props.visible} onClose={props.onCancel}>
      <Sheet {...props} />
    </BottomSheetModal>
  );
}

const parseNumber = (text: string): number => parseFloat(text.replace(',', '.'));

function Sheet({ initial, cgpa, onConfirm, onCancel }: PercentFormulaModalProps) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<PercentFormulaId>(initial.id);
  const [multiplier, setMultiplier] = useState(
    initial.id === 'custom' ? String(initial.multiplier) : '9.5'
  );
  const [offset, setOffset] = useState(initial.id === 'custom' ? String(initial.offset) : '0');

  const customFormula: PercentFormula = {
    id: 'custom',
    multiplier: parseNumber(multiplier),
    offset: parseNumber(offset),
  };
  const customValid =
    Number.isFinite(customFormula.multiplier) &&
    customFormula.multiplier > 0 &&
    Number.isFinite(customFormula.offset);

  const formula =
    selected === 'custom' ? customFormula : PERCENT_PRESETS.find((p) => p.id === selected)!.formula;
  const valid = selected !== 'custom' || customValid;

  const styles = StyleSheet.create({
    title: { fontFamily: fonts.bold, fontSize: fontSizes['2xl'], color: colors.text },
    subtitle: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.md,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },
    option: {
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      borderWidth: 1.5,
      borderColor: colors.border,
      padding: spacing.lg,
      marginBottom: spacing.sm,
    },
    optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
    optionLabel: { fontFamily: fonts.semiBold, fontSize: fontSizes.lg, color: colors.text },
    inputs: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
    inputBox: { flex: 1 },
    inputLabel: {
      fontFamily: fonts.medium,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      height: 44,
      fontFamily: fonts.regular,
      fontSize: fontSizes.lg,
      color: colors.text,
    },
    preview: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.lg,
      color: colors.text,
      marginTop: spacing.md,
    },
    note: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    error: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.error,
      marginTop: spacing.sm,
    },
  });

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Percentage formula</Text>
        <Text style={styles.subtitle}>
          Universities convert CGPA to a percentage in different ways. Pick the one yours uses.
        </Text>

        {PERCENT_PRESETS.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={[styles.option, selected === preset.id && styles.optionSelected]}
            onPress={() => setSelected(preset.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: selected === preset.id }}
          >
            <Text style={styles.optionLabel}>{preset.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.option, selected === 'custom' && styles.optionSelected]}
          onPress={() => setSelected('custom')}
          accessibilityRole="radio"
          accessibilityState={{ selected: selected === 'custom' }}
        >
          <Text style={styles.optionLabel}>My university&apos;s formula</Text>
          {selected === 'custom' && (
            <>
              <View style={styles.inputs}>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>CGPA ×</Text>
                  <TextInput
                    style={styles.input}
                    value={multiplier}
                    onChangeText={setMultiplier}
                    keyboardType="decimal-pad"
                    accessibilityLabel="Multiplier"
                  />
                </View>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>then add</Text>
                  <TextInput
                    style={styles.input}
                    value={offset}
                    onChangeText={setOffset}
                    keyboardType="numbers-and-punctuation"
                    accessibilityLabel="Offset"
                  />
                </View>
              </View>
              {!customValid && (
                <Text style={styles.error}>
                  Enter a multiplier above 0 and a number for the offset.
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>

        {valid && cgpa > 0 && (
          <Text style={styles.preview}>
            Your CGPA {cgpa.toFixed(2)} ≈ {cgpaToPercent(cgpa, formula).toFixed(1)}%
          </Text>
        )}
        <Text style={styles.note}>
          This is an estimate. Use your university&apos;s official conversion for anything formal.
        </Text>
      </ScrollView>

      <SheetButtons
        confirmLabel="Save"
        onConfirm={() => onConfirm(formula)}
        confirmDisabled={!valid}
        onCancel={onCancel}
      />
    </>
  );
}
