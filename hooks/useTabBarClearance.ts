import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_HEIGHT = 62;

// Gap between the floating tab bar and the bottom edge of the screen
export function useTabBarOffset() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, 16);
}

// Bottom padding for tab screen scroll content so the last item clears the floating tab bar
export function useTabBarClearance() {
  return useTabBarOffset() + TAB_BAR_HEIGHT + 24;
}
