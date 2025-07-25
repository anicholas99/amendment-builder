import React from 'react';

/**
 * PiAlignBottomDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiAlignBottomDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAlignBottomDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'align-bottom icon',
  ...props
}: PiAlignBottomDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 20h14" opacity=".28"/><path fill={color || "currentColor"} d="M13 4a1 1 0 1 0-2 0v7.124a50 50 0 0 1-3.003-.152 1 1 0 0 0-.886 1.59 21.8 21.8 0 0 0 3.853 4.069 1.64 1.64 0 0 0 2.072 0 21.8 21.8 0 0 0 3.852-4.069 1 1 0 0 0-.886-1.59q-1.499.122-3.002.152z"/>
    </svg>
  );
}
