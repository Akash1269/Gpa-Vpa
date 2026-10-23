import {
  Award,
  BookOpen,
  Crown,
  Flame,
  Gem,
  GraduationCap,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react-native';
import { AchievementIcon as IconName } from '@/utils/achievements';

const ICONS = {
  star: Star,
  book: BookOpen,
  award: Award,
  graduation: GraduationCap,
  flame: Flame,
  trending: TrendingUp,
  gem: Gem,
  target: Target,
  trophy: Trophy,
  crown: Crown,
};

export default function AchievementIcon({
  name,
  size = 22,
  color,
}: {
  name: IconName;
  size?: number;
  color: string;
}) {
  const Icon = ICONS[name];
  return <Icon size={size} color={color} strokeWidth={2.2} />;
}
