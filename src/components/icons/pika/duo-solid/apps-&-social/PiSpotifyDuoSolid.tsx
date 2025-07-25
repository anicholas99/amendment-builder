import React from 'react';

/**
 * PiSpotifyDuoSolid icon from the duo-solid style in apps-&-social category.
 */
interface PiSpotifyDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSpotifyDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'spotify icon',
  ...props
}: PiSpotifyDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.05 15.876a10 10 0 0 0-4.1-.876 10 10 0 0 0-2.95.443m8.246-2.32A12.95 12.95 0 0 0 10.951 12c-1.195 0-2.352.161-3.451.463m10-2.066A15.9 15.9 0 0 0 10.951 9C9.588 9 8.264 9.17 7 9.492"/>
    </svg>
  );
}
