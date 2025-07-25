import React from 'react';

/**
 * PiAcDefaultDuoSolid icon from the duo-solid style in appliances category.
 */
interface PiAcDefaultDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAcDefaultDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'ac-default icon',
  ...props
}: PiAcDefaultDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M4 7a3 3 0 0 0-3 3v6a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1v-6a3 3 0 0 0-3-3z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12h-2"/>
    </svg>
  );
}
