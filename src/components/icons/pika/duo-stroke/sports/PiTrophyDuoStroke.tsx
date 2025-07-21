import React from 'react';

/**
 * PiTrophyDuoStroke icon from the duo-stroke style in sports category.
 */
interface PiTrophyDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTrophyDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'trophy icon',
  ...props
}: PiTrophyDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.2 12.996A5 5 0 0 0 22 8V6.6A1.6 1.6 0 0 0 20.4 5h-2.405M6.005 5H3.6A1.6 1.6 0 0 0 2 6.6V8a5 5 0 0 0 4.8 4.996M8 21h4m0 0h4m-4 0v-5" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.4 3H8.6c-.558 0-.837 0-1.067.055a2 2 0 0 0-1.478 1.478C6 4.763 6 5.043 6 5.6V10a6 6 0 0 0 12 0V5.6c0-.558 0-.837-.055-1.067a2 2 0 0 0-1.478-1.478C16.237 3 15.957 3 15.4 3Z" fill="none"/>
    </svg>
  );
}
