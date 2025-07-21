import React from 'react';

/**
 * PiMergeDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiMergeDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMergeDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'merge icon',
  ...props
}: PiMergeDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v9l-6 7m12 0-3.429-4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8.03a20.6 20.6 0 0 0-3.604-3.885.62.62 0 0 0-.792 0A20.6 20.6 0 0 0 8 8.03" fill="none"/>
    </svg>
  );
}
