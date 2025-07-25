import React from 'react';

/**
 * PiUserSearchContrast icon from the contrast style in users category.
 */
interface PiUserSearchContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserSearchContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'user-search icon',
  ...props
}: PiUserSearchContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" fill="none" stroke="currentColor"/><path d="M4 19a4 4 0 0 1 4-4h3.25v.28A6 6 0 0 0 11 17c0 1.27.394 2.446 1.066 3.416V21H6a2 2 0 0 1-2-2Z" fill="none" stroke="currentColor"/><path d="M19.121 19.121a3 3 0 1 0-4.242-4.243 3 3 0 0 0 4.242 4.243Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.254 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h2.29M21 21l-1.879-1.879m0 0a3 3 0 1 0-4.242-4.243 3 3 0 0 0 4.242 4.243ZM16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" fill="none"/>
    </svg>
  );
}
