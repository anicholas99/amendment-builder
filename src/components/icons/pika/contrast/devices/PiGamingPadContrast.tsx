import React from 'react';

/**
 * PiGamingPadContrast icon from the contrast style in devices category.
 */
interface PiGamingPadContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGamingPadContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'gaming-pad icon',
  ...props
}: PiGamingPadContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M22 16.91v-5.243A6.667 6.667 0 0 0 15.333 5H8.667A6.667 6.667 0 0 0 2 11.667v5.243a3.09 3.09 0 0 0 5.854 1.382L8 18a3.62 3.62 0 0 1 3.236-2h1.528c1.37 0 2.623.774 3.236 2l.146.292A3.09 3.09 0 0 0 22 16.91Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 13v-2m0 0V9m0 2H6m2 0h2m5.01-2-.01.001M18.01 12l-.01.001m4-.334v5.243a3.09 3.09 0 0 1-5.854 1.382L16 18a3.62 3.62 0 0 0-3.236-2h-1.528c-1.37 0-2.623.774-3.236 2l-.146.292A3.09 3.09 0 0 1 2 16.91v-5.243A6.667 6.667 0 0 1 8.667 5h6.666A6.667 6.667 0 0 1 22 11.667Z" fill="none"/>
    </svg>
  );
}
