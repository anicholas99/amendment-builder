import React from 'react';

/**
 * PiSunContrast icon from the contrast style in weather category.
 */
interface PiSunContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSunContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'sun icon',
  ...props
}: PiSunContrastProps): JSX.Element {
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
      <g clipPath="url(#icon-qz9zdrm69-a)"><path fill="currentColor" d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 23v-1m-7.778-2.222.707-.707M1 12h1m2.222-7.778.707.707M12 2V1m7.071 3.929.707-.707M22 12h1m-3.929 7.071.707.707M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" fill="none"/></g><defs><clipPath id="icon-qz9zdrm69-a"><path fill="currentColor" d="M0 0h24v24H0z" stroke="currentColor"/></clipPath></defs>
    </svg>
  );
}
