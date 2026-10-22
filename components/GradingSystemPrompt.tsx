import { useMemo } from 'react';
import { useGpa } from '@/hooks/useGpa';
import GradingSystemModal from '@/components/GradingSystemModal';
import { guessGradingSystem } from '@/utils/region';

// Asks which grading system to use: on a fresh install, and once for users upgrading from a
// version that only had the US scale. Settings can change the choice later.
export default function GradingSystemPrompt() {
  const { gradingSystem, gradingSystemPrompt, setGradingSystem } = useGpa();
  const suggestedId = useMemo(() => guessGradingSystem(), []);

  if (!gradingSystemPrompt) return null;

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
      currentId={isNew ? undefined : gradingSystem.id}
      hasData={!isNew}
      confirmLabel={isNew ? 'Continue' : 'Use this system'}
      cancelLabel={`Keep ${gradingSystem.name}`}
      onConfirm={setGradingSystem}
      onCancel={isNew ? undefined : () => setGradingSystem(gradingSystem.id)}
    />
  );
}
