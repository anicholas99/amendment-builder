import React from 'react';

/**
 * PiMicrosoftWindowsContrast icon from the contrast style in apps-&-social category.
 */
interface PiMicrosoftWindowsContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMicrosoftWindowsContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'microsoft-windows icon',
  ...props
}: PiMicrosoftWindowsContrastProps): JSX.Element {
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
      <path fill="currentColor" d="m18.78 4.012-14 1.556A2 2 0 0 0 3 7.556v8.42a2 2 0 0 0 1.78 1.987l14 1.556A2 2 0 0 0 21 17.53V6.001a2 2 0 0 0-2.22-1.989Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4.877v13.778m10-6.89H3m1.78 6.198 14 1.556A2 2 0 0 0 21 17.53V6.001a2 2 0 0 0-2.22-1.989l-14 1.556A2 2 0 0 0 3 7.556v8.42a2 2 0 0 0 1.78 1.987Z" fill="none"/>
    </svg>
  );
}
