import React from 'react';

/**
 * PiAirplayCastContrast icon from the contrast style in media category.
 */
interface PiAirplayCastContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAirplayCastContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'airplay-cast icon',
  ...props
}: PiAirplayCastContrastProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill="currentColor" d="M9.287 17.342c.9-1.44 1.35-2.16 1.925-2.407a2 2 0 0 1 1.576 0c.576.247 1.026.967 1.926 2.407l.756 1.21c.5.799.75 1.198.723 1.528a1 1 0 0 1-.4.723c-.266.197-.737.197-1.68.197H9.887c-.942 0-1.413 0-1.679-.197a1 1 0 0 1-.4-.723c-.027-.33.223-.729.722-1.528z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.358 17.231a4 4 0 0 0 1.206-1.415C21 14.96 21 13.84 21 11.6v-1.2c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C17.96 4 16.84 4 14.6 4H9.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C3 7.04 3 8.16 3 10.4v1.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.208 1.416M9.887 21h4.226c.942 0 1.414 0 1.679-.197a1 1 0 0 0 .4-.723c.027-.33-.223-.729-.722-1.528l-.756-1.21c-.9-1.44-1.35-2.16-1.926-2.407a2 2 0 0 0-1.576 0c-.576.247-1.026.967-1.926 2.407l-.756 1.21c-.5.799-.749 1.198-.723 1.528a1 1 0 0 0 .401.723c.266.197.737.197 1.679.197Z" fill="none"/>
    </svg>
  );
}
