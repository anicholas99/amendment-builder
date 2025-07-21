import React from 'react';

/**
 * PiRssSimpleDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiRssSimpleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiRssSimpleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'rss-simple icon',
  ...props
}: PiRssSimpleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.421 20c0-2.212-.902-4.39-2.466-5.954A8.5 8.5 0 0 0 4 11.579" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4a16 16 0 0 1 16 16m-15.59-.421h.011" fill="none"/>
    </svg>
  );
}
