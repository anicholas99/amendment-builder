import { useMemo } from 'react';

// This hook has been refactored to be stateless. It no longer manages
// local state. It's now a pure utility that memoizes the props
// to ensure they are always valid Set objects. State management is
// now the responsibility of the parent component.

interface UseSavedArtAndExclusionsProps {
  propsSavedArtNumbers?: Set<string>;
  propsExcludedPatentNumbers?: Set<string>;
}

export const useSavedArtAndExclusions = ({
  propsSavedArtNumbers,
  propsExcludedPatentNumbers,
}: UseSavedArtAndExclusionsProps) => {
  const savedArtNumbers = useMemo(
    () =>
      propsSavedArtNumbers instanceof Set
        ? propsSavedArtNumbers
        : new Set<string>(),
    [propsSavedArtNumbers]
  );

  const excludedPatentNumbers = useMemo(
    () =>
      propsExcludedPatentNumbers instanceof Set
        ? propsExcludedPatentNumbers
        : new Set<string>(),
    [propsExcludedPatentNumbers]
  );

  return {
    savedArtNumbers,
    excludedPatentNumbers,
  };
};
