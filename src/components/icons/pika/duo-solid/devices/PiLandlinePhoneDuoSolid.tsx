import React from 'react';

/**
 * PiLandlinePhoneDuoSolid icon from the duo-solid style in devices category.
 */
interface PiLandlinePhoneDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLandlinePhoneDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'landline-phone icon',
  ...props
}: PiLandlinePhoneDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M19 3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-8a1 1 0 0 1-1-1V4l.005-.103A1 1 0 0 1 11 3z" opacity=".28"/><path fill={color || "currentColor"} d="M6.5 2A2.5 2.5 0 0 1 9 4.5v15A2.5 2.5 0 0 1 6.5 22h-2A2.5 2.5 0 0 1 2 19.5v-15A2.5 2.5 0 0 1 4.5 2z"/><path fill={color || "currentColor"} d="M14.5 16a1 1 0 1 1 0 2H13a1 1 0 1 1 0-2z"/><path fill={color || "currentColor"} d="M19 16a1 1 0 1 1 0 2h-1.5a1 1 0 1 1 0-2z"/><path fill={color || "currentColor"} d="M14.5 13a1 1 0 1 1 0 2H13a1 1 0 1 1 0-2z"/><path fill={color || "currentColor"} d="M19 13a1 1 0 1 1 0 2h-1.5a1 1 0 1 1 0-2z"/><path fill={color || "currentColor"} d="M19.103 5.005A1 1 0 0 1 20 6v4a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V6l.005-.103A1 1 0 0 1 13 5h6z"/>
    </svg>
  );
}
