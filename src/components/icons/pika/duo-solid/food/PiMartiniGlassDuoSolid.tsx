import React from 'react';

/**
 * PiMartiniGlassDuoSolid icon from the duo-solid style in food category.
 */
interface PiMartiniGlassDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMartiniGlassDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'martini-glass icon',
  ...props
}: PiMartiniGlassDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13v8m0 0h5.5M12 21H7" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M3 3a1 1 0 0 0-.707 1.707l9 9a1 1 0 0 0 1.414 0l9-9A1 1 0 0 0 21 3zm3.447 3.033L5.414 5h13.172l-1.033 1.033a71 71 0 0 1-11.106 0Z" clipRule="evenodd"/>
    </svg>
  );
}
