import { useMemo } from 'react';
import { router, usePathname } from 'expo-router';
import { useGpa } from '@/hooks/useGpa';
import GradingSystemModal from '@/components/GradingSystemModal';
import { guessGradingSystem } from '@/utils/region';

// Asks which grading system to use: on a fresh install, and once for users upgrading from a
// version that only had the US scale. Settings can change the choice later.
export default function GradingSystemPrompt() {
  const { gradingSystem, gradingSystemPrompt, setGradingSystem, customScale } = useGpa();
  const pathname = usePathname();
  const suggestedId = useMemo(() => guessGradingSystem(), []);

  // Hide while the custom-scale editor is open on top; the prompt returns if it is dismissed
  if (!gradingSystemPrompt || pathname === '/custom-scale') return null;

  const isNew = gradingSystemPrompt === 'new';

  return (
    <GradingSystemModal
      visible
      title={isNew ? 'Where do you study?' : 'Choose your grading system'}
      subtitle={
        isNew
          ? 'Pick the scale your university uses. You can change it any time in Settings.'
          : 'Your grades have been on the US 4.0 scale. Switch if your university uses a different one.'
      }
      initialId={isNew ? suggestedId : gradingSystem.id}
      suggestedId={suggestedId}
      customName={customScale ? customScale.name.trim() || 'My scale' : undefined}
      currentId={isNew ? undefined : gradingSystem.id}
      hasData={!isNew}
      confirmLabel={isNew ? 'Continue' : 'Use this system'}
      cancelLabel={`Keep ${gradingSystem.name}`}
      onConfirm={(id, mode) => {
        if (id === 'custom') router.push({ pathname: '/custom-scale', params: { mode } });
        else setGradingSystem(id, mode);
      }}
      onCancel={isNew ? undefined : () => setGradingSystem(gradingSystem.id)}
    />
  );
}
