import React from 'react';

/**
 * PiFaceAngryContrast icon from the contrast style in general category.
 */
interface PiFaceAngryContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFaceAngryContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'face-angry icon',
  ...props
}: PiFaceAngryContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M2.85 12a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8.386 9.144 1.229.86m4.77 0 1.23-.86M15.57 16A5 5 0 0 0 12 14.5 5 5 0 0 0 8.43 16M12 21.15a9.15 9.15 0 1 1 0-18.3 9.15 9.15 0 0 1 0 18.3Z" fill="none"/>
    </svg>
  );
}
