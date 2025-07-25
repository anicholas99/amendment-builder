import React from 'react';

/**
 * PiTrainContrast icon from the contrast style in automotive category.
 */
interface PiTrainContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTrainContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'train icon',
  ...props
}: PiTrainContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M7.2 19h9.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C20 17.48 20 16.92 20 15.8V13H4v2.8c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C5.52 19 6.08 19 7.2 19Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 9.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C7.04 3 8.16 3 10.4 3h3.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C20 6.04 20 7.16 20 9.4v6.4c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C18.48 19 17.92 19 16.8 19H7.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C4 17.48 4 16.92 4 15.8z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 13h16" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16h1" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16h1" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 19-2 3" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16 19 2 3" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v10" fill="none"/>
    </svg>
  );
}
