import React from 'react';

/**
 * PiUserGraduationHatDuoStroke icon from the duo-stroke style in users category.
 */
interface PiUserGraduationHatDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserGraduationHatDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'user-graduation-hat icon',
  ...props
}: PiUserGraduationHatDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15H8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 4 4 0 0 0-4-4Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 4 7-2 7 2-3.53 1.009M5 4l3.53 1.009M5 4v3m10.47-1.991L12 6l-3.47-.991m6.94 0a4 4 0 1 1-6.94 0" fill="none"/>
    </svg>
  );
}
