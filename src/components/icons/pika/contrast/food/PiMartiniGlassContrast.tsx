import React from 'react';

/**
 * PiMartiniGlassContrast icon from the contrast style in food category.
 */
interface PiMartiniGlassContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMartiniGlassContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'martini-glass icon',
  ...props
}: PiMartiniGlassContrastProps): JSX.Element {
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
      <path fill="currentColor" d="m6 7 6 6 6-6A72 72 0 0 1 6 7Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13v8m0-8L6 7m6 6 6-6m-6 14h5.5M12 21H7M6 7 3 4h18l-3 3M6 7c3.993.333 8.007.333 12 0" fill="none"/>
    </svg>
  );
}
