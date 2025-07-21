import React from 'react';

/**
 * PiBeachUmbrellaDuoStroke icon from the duo-stroke style in building category.
 */
interface PiBeachUmbrellaDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBeachUmbrellaDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'beach-umbrella icon',
  ...props
}: PiBeachUmbrellaDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.141 12.074 6.987 21M9.373 9.982c2.412-4.177 5.702-6.793 7.349-5.842 1.647.95 1.027 5.108-1.385 9.285a22 22 0 0 1-.451.748l-1.292-1.26a6.8 6.8 0 0 0-2.906-1.678l-1.737-.489q.2-.381.422-.764Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.722 4.14C12.604 1.763 7.312 3.222 4.9 7.4q-.222.383-.4.777l.396.079c1.47.292 2.8 1.06 3.789 2.187l.266.304q.2-.383.422-.765c2.412-4.177 5.702-6.793 7.349-5.842Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.81 16.008c2.412-4.177 1.03-9.49-3.088-11.867 1.647.95 1.027 5.108-1.385 9.285q-.221.383-.451.748l.396.078c1.47.292 2.8 1.06 3.789 2.188l.266.303q.252-.352.473-.735Z" opacity=".28" fill="none"/>
    </svg>
  );
}
