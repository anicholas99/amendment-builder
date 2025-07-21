import React from 'react';

/**
 * PiUserCircleDottedContrast icon from the contrast style in users category.
 */
interface PiUserCircleDottedContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserCircleDottedContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'user-circle-dotted icon',
  ...props
}: PiUserCircleDottedContrastProps): JSX.Element {
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
      <g opacity=".28"><path fill="currentColor" d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor"/><path fill="currentColor" d="M8.5 16h7c1.867 0 3.393 1.393 3.495 3.147A9.97 9.97 0 0 1 12 22a9.97 9.97 0 0 1-6.995-2.853C5.107 17.393 6.633 16 8.5 16Z" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M12 2h.01" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M15.826 2.761h.01" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M8.17 2.761h.01" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M19.065 4.924h.01" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M4.929 4.924h.01" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M21.226 8.154h.01" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M2.757 8.154h.01" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M22 12h.01" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M2 12h.01" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M21.22 15.872h.01" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M2.767 15.872h.01" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.5 16h-7c-1.867 0-3.393 1.393-3.495 3.147A9.97 9.97 0 0 0 12 22a9.97 9.97 0 0 0 6.995-2.853C18.893 17.393 17.367 16 15.5 16Z" fill="none"/>
    </svg>
  );
}
