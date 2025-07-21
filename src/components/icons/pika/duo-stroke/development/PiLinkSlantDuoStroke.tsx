import React from 'react';

/**
 * PiLinkSlantDuoStroke icon from the duo-stroke style in development category.
 */
interface PiLinkSlantDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLinkSlantDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'link-slant icon',
  ...props
}: PiLinkSlantDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m10.586 6.343.707-.707a5 5 0 0 1 7.07 7.07l-.706.708M6.343 10.586l-.707.707a5 5 0 0 0 7.07 7.07l.708-.706" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.122 9.879-4.243 4.243" fill="none"/>
    </svg>
  );
}
