import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { fonts, fontSizes, radii, spacing } from '@/constants/theme';

type BottomSheetModalProps = {
  visible: boolean;
  onClose?: () => void;
  children: ReactNode;
};

// Dimmed backdrop with a sheet pinned to the bottom. Children are only mounted while visible, so
// any state inside them resets each time the sheet opens.
export default function BottomSheetModal({ visible, onClose, children }: BottomSheetModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Dismiss" />
        {visible && (
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.background,
                paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.sm,
              },
            ]}
          >
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

type SheetButtonsProps = {
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
  confirmDisabled?: boolean;
};

export function SheetButtons({
  confirmLabel,
  onConfirm,
  cancelLabel = 'Cancel',
  onCancel,
  confirmDisabled = false,
}: SheetButtonsProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.buttons}>
      {onCancel && (
        <TouchableOpacity
          style={[
            styles.button,
            { borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card },
          ]}
          onPress={onCancel}
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>{cancelLabel}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.primary, opacity: confirmDisabled ? 0.45 : 1 },
        ]}
        onPress={onConfirm}
        disabled={confirmDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: confirmDisabled }}
      >
        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>{confirmLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    maxHeight: '90%',
  },
  buttons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  button: {
    flex: 1,
    height: 50,
    borderRadius: radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontFamily: fonts.semiBold, fontSize: fontSizes.lg },
});
