import React from 'react';

/**
 * PiChefHatDuoStroke icon from the duo-stroke style in food category.
 */
interface PiChefHatDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiChefHatDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'chef-hat icon',
  ...props
}: PiChefHatDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.885 6.042a4.002 4.002 0 0 0-7.77 0A4.5 4.5 0 1 0 7 14.972V18.6c.001.84.001 1.26.164 1.581a1.5 1.5 0 0 0 .656.656c.32.163.74.163 1.581.163h5.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656c.163-.32.163-.74.163-1.581v-3.627a4.5 4.5 0 1 0-1.116-8.931Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 17h4m-4 0v-3m0 3H7m7 0v-5m0 5h3" fill="none"/>
    </svg>
  );
}
