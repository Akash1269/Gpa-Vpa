import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/useTheme';
import { GraduationCap, BarChart3, Target } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const ONBOARDING_KEY = '@hasSeenOnboarding';

const slides = [
  {
    id: '1',
    title: 'Track Your Courses',
    description: 'Add courses with grades and credits to keep your academic record organized in one place.',
    Icon: GraduationCap,
  },
  {
    id: '2',
    title: 'Monitor Your GPA',
    description: 'See your cumulative and semester GPA update in real-time as you add or edit courses.',
    Icon: BarChart3,
  },
  {
    id: '3',
    title: 'Set Your Goals',
    description: 'Track your academic standing and work toward your target GPA each semester.',
    Icon: Target,
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      router.replace('/(tabs)');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    slide: {
      width,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    description: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 50,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 32,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
    },
    dotActive: {
      backgroundColor: colors.primary,
      width: 24,
    },
    dotInactive: {
      backgroundColor: colors.border,
    },
    buttons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    skipButton: {
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    skipText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: colors.textSecondary,
    },
    nextButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 12,
    },
    nextText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: '#FFFFFF',
    },
  });

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconContainer}>
              <item.Icon size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={styles.nextButton}
            accessibilityRole="button"
            accessibilityLabel={currentIndex === slides.length - 1 ? 'Get started' : 'Next slide'}
          >
            <Text style={styles.nextText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}
