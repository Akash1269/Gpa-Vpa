import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check } from 'lucide-react-native';
import BottomSheetModal, { SheetButtons } from '@/components/BottomSheetModal';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, radii, spacing } from '@/constants/theme';
import { GradingSystemId } from '@/types/gradingSystem';
import { GRADING_SYSTEM_LIST } from '@/utils/gradingSystems';
import type { GradingSystemSwitchMode } from '@/context/GpaContext';

type GradingSystemModalProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  initialId: GradingSystemId;
  suggestedId?: GradingSystemId; // marked "Suggested for your device"
  customName?: string; // set when the user has already defined a custom scale
  currentId?: GradingSystemId; // when data exists, picking a different system asks what to do with it
  hasData?: boolean;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: (id: GradingSystemId, mode: GradingSystemSwitchMode) => void;
  onCancel?: () => void;
};

export default function GradingSystemModal(props: GradingSystemModalProps) {
  return (
    <BottomSheetModal visible={props.visible} onClose={props.onCancel}>
      <Sheet {...props} />
    </BottomSheetModal>
  );
}

function Sheet({
  title,
  subtitle,
  initialId,
  suggestedId,
  customName,
  currentId,
  hasData = false,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: GradingSystemModalProps) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<GradingSystemId>(initialId);
  const [mode, setMode] = useState<GradingSystemSwitchMode>('convert');

  const changing = hasData && currentId !== undefined && selected !== currentId;

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
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: radii.lg,
      borderWidth: 1.5,
      borderColor: colors.border,
      padding: spacing.lg,
      marginBottom: spacing.sm,
    },
    optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
    flag: { fontSize: 28, marginRight: spacing.md },
    optionBody: { flex: 1 },
    optionName: { fontFamily: fonts.semiBold, fontSize: fontSizes.lg, color: colors.text },
    optionMeta: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    suggested: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.xs,
      color: colors.accentText,
      marginTop: spacing.xs,
    },
    modeLabel: {
      fontFamily: fonts.semiBold,
      fontSize: fontSizes.md,
      color: colors.text,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    modeOption: {
      borderRadius: radii.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    modeTitle: { fontFamily: fonts.semiBold, fontSize: fontSizes.md, color: colors.text },
    modeText: {
      fontFamily: fonts.regular,
      fontSize: fontSizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {GRADING_SYSTEM_LIST.map((system) => {
          const isSelected = system.id === selected;
          const first = system.grades[0].label;
          const last = system.grades[system.grades.length - 1].label;
          return (
            <TouchableOpacity
              key={system.id}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => setSelected(system.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${system.country}, ${system.name}`}
            >
              <Text style={styles.flag}>{system.flag}</Text>
              <View style={styles.optionBody}>
                <Text style={styles.optionName}>{system.name}</Text>
                <Text style={styles.optionMeta}>
                  {system.country} · grades {first} to {last} · out of {system.scaleLabel}
                </Text>
                {system.id === suggestedId && (
                  <Text style={styles.suggested}>Suggested for your device</Text>
                )}
              </View>
              {isSelected && <Check size={20} color={colors.primary} strokeWidth={3} />}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.option, selected === 'custom' && styles.optionSelected]}
          onPress={() => setSelected('custom')}
          accessibilityRole="radio"
          accessibilityState={{ selected: selected === 'custom' }}
          accessibilityLabel="Custom grading scale"
        >
          <Text style={styles.flag}>✏️</Text>
          <View style={styles.optionBody}>
            <Text style={styles.optionName}>{customName ?? 'Custom scale'}</Text>
            <Text style={styles.optionMeta}>
              {customName
                ? 'Your own grades and points · opens the editor'
                : 'For universities with their own grades and points'}
            </Text>
          </View>
          {selected === 'custom' && <Check size={20} color={colors.primary} strokeWidth={3} />}
        </TouchableOpacity>

        {changing && (
          <>
            <Text style={styles.modeLabel}>What about your existing grades?</Text>
            <TouchableOpacity
              style={[styles.modeOption, mode === 'convert' && styles.optionSelected]}
              onPress={() => setMode('convert')}
              accessibilityRole="radio"
              accessibilityState={{ selected: mode === 'convert' }}
            >
              <Text style={styles.modeTitle}>Convert my grades</Text>
              <Text style={styles.modeText}>
                Each grade and goal moves to the closest equivalent. Results are approximate, so
                check them against your transcript.
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeOption, mode === 'reset' && styles.optionSelected]}
              onPress={() => setMode('reset')}
              accessibilityRole="radio"
              accessibilityState={{ selected: mode === 'reset' }}
            >
              <Text style={styles.modeTitle}>Start fresh</Text>
              <Text style={styles.modeText}>
                Removes your courses and grade goals so you can enter everything again.
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <SheetButtons
        confirmLabel={selected === 'custom' ? 'Continue' : confirmLabel}
        onConfirm={() => onConfirm(selected, mode)}
        cancelLabel={cancelLabel}
        onCancel={onCancel}
      />
    </>
  );
}
