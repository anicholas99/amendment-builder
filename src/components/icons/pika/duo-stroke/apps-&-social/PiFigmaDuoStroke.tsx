import React from 'react';

/**
 * PiFigmaDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiFigmaDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFigmaDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'figma icon',
  ...props
}: PiFigmaDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2H8.5a3.5 3.5 0 1 0 0 7M12 2v7m0-7h3.5a3.5 3.5 0 1 1 0 7H12m0 0H8.5M12 9v7M8.5 9a3.5 3.5 0 1 0 0 7m3.5 0H8.5m3.5 0v3.5A3.5 3.5 0 1 1 8.5 16" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z" fill="none"/>
    </svg>
  );
}
