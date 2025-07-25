import React from 'react';

/**
 * PiCloudSunContrast icon from the contrast style in weather category.
 */
interface PiCloudSunContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCloudSunContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'cloud-sun icon',
  ...props
}: PiCloudSunContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M8.18 12.903a4 4 0 1 1 4.77-4.844q.4-.059.82-.059c2.488 0 4.6 1.614 5.346 3.851a4.768 4.768 0 0 1-1.88 9.15H8.57a3.9 3.9 0 0 1-.419-7.779q.012-.16.032-.318z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m10.582 2.27.022-.097M2.173 7.496l.097.022m3.015-4.43.054.085m9.588 2.166.084-.053M3.087 12.814l.085-.054m5.115 2.173a5.7 5.7 0 0 1-.136-1.71m0 0A3.9 3.9 0 0 0 8.57 21h8.666a4.767 4.767 0 0 0 1.88-9.149 5.636 5.636 0 0 0-6.167-3.792m-4.798 5.163q.011-.16.032-.318m4.766-4.845a4 4 0 1 0-4.77 4.844h.004M12.95 8.06a5.64 5.64 0 0 0-4.766 4.845" fill="none"/>
    </svg>
  );
}
