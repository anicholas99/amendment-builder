import React from 'react';

/**
 * PiGodlyWebsiteDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiGodlyWebsiteDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGodlyWebsiteDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'godly-website icon',
  ...props
}: PiGodlyWebsiteDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m13.5 2-6 10h9l-6 10" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.5 12h9" fill="none"/>
    </svg>
  );
}
