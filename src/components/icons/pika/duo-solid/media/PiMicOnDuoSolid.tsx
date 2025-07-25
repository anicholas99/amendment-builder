import React from 'react';

/**
 * PiMicOnDuoSolid icon from the duo-solid style in media category.
 */
interface PiMicOnDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMicOnDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'mic-on icon',
  ...props
}: PiMicOnDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20a8 8 0 0 1-8-8m8 8a8 8 0 0 0 8-8m-8 8v2" opacity=".28"/><path fill={color || "currentColor"} d="M12 2a5 5 0 0 0-5 5v5a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z"/>
    </svg>
  );
}
