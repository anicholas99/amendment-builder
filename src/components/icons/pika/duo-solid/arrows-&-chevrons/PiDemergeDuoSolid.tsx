import React from 'react';

/**
 * PiDemergeDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiDemergeDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDemergeDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'demerge icon',
  ...props
}: PiDemergeDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7.007 7.007 12 12v8m4.993-12.993L15 9" opacity=".28"/><path fill={color || "currentColor"} d="M10.108 3.3a21.6 21.6 0 0 0-5.554-.21A1.62 1.62 0 0 0 3.09 4.554c-.17 1.842-.1 3.708.21 5.554a1 1 0 0 0 1.744.486 52 52 0 0 1 5.55-5.55 1 1 0 0 0-.486-1.744Z"/><path fill={color || "currentColor"} d="M19.446 3.09c-1.842-.17-3.708-.1-5.554.21a1 1 0 0 0-.486 1.744 52 52 0 0 1 5.55 5.55 1 1 0 0 0 1.744-.486c.31-1.846.38-3.712.21-5.554a1.62 1.62 0 0 0-1.465-1.464Z"/>
    </svg>
  );
}
