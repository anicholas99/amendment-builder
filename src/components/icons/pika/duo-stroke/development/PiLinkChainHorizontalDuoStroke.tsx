import React from 'react';

/**
 * PiLinkChainHorizontalDuoStroke icon from the duo-stroke style in development category.
 */
interface PiLinkChainHorizontalDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLinkChainHorizontalDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'link-chain-horizontal icon',
  ...props
}: PiLinkChainHorizontalDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.1 11q-.1.486-.1 1c0 1.636.786 3.088 2 4 .836.628 1.874 1 3 1h2a5 5 0 0 0 0-10h-1" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.9 13q.1-.486.1-1a5 5 0 0 0-2-4 4.98 4.98 0 0 0-3-1H7a5 5 0 0 0 0 10h1" fill="none"/>
    </svg>
  );
}
