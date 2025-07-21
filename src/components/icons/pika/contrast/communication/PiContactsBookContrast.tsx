import React from 'react';

/**
 * PiContactsBookContrast icon from the contrast style in communication category.
 */
interface PiContactsBookContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiContactsBookContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'contacts-book icon',
  ...props
}: PiContactsBookContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M13 2h-2c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 3.545 4.73C3 5.8 3 7.2 3 10v4c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C6.8 22 8.2 22 11 22h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C21 18.2 21 16.8 21 14v-4c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C17.2 2 15.8 2 13 2Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 8h2m-2 8h2m7 6h2c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C21 18.2 21 16.8 21 14v-4c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C17.2 2 15.8 2 13 2h-2c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 3.545 4.73C3 5.8 3 7.2 3 10v4c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C6.8 22 8.2 22 11 22Zm3.222-13.231a2.222 2.222 0 1 1-4.444 0 2.222 2.222 0 0 1 4.444 0Zm-4.444 4.898a2.22 2.22 0 0 0-2.222 2.222A1.11 1.11 0 0 0 8.666 17h6.667a1.11 1.11 0 0 0 1.111-1.111 2.22 2.22 0 0 0-2.222-2.222z" fill="none"/>
    </svg>
  );
}
