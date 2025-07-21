import React from 'react';

/**
 * PiLinkHorizontalBrokenDuoStroke icon from the duo-stroke style in development category.
 */
interface PiLinkHorizontalBrokenDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLinkHorizontalBrokenDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'link-horizontal-broken icon',
  ...props
}: PiLinkHorizontalBrokenDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H7a5 5 0 0 0 0 10h1m7-10h1a5 5 0 0 1 0 10h-1" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.121 4.121 8 2m6.121 2.121L16.243 2M10.12 20 8 22.121M14.121 20l2.122 2.121" fill="none"/>
    </svg>
  );
}
