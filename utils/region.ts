import { GradingSystemId } from '@/types/gradingSystem';
import { DEFAULT_GRADING_SYSTEM_ID } from '@/utils/gradingSystems';

const INDIA_TIME_ZONES = ['Asia/Kolkata', 'Asia/Calcutta'];

type Hints = { timeZone?: string; locale?: string };

const readDeviceHints = (): Hints => {
  try {
    const options = Intl.DateTimeFormat().resolvedOptions();
    return { timeZone: options.timeZone, locale: options.locale };
  } catch {
    return {};
  }
};

// Best guess at the user's grading system from device settings only: no GPS, no network, no permissions.
// The time zone is checked first because many phones in India are set to "English (US)".
export const guessGradingSystem = (hints: Hints = readDeviceHints()): GradingSystemId => {
  if (hints.timeZone && INDIA_TIME_ZONES.includes(hints.timeZone)) return 'india_10';

  const region = hints.locale
    ?.split(/[-_]/)
    .find((part) => /^[A-Za-z]{2}$/.test(part) && part !== part.toLowerCase());
  if (region?.toUpperCase() === 'IN') return 'india_10';

  return DEFAULT_GRADING_SYSTEM_ID;
};
