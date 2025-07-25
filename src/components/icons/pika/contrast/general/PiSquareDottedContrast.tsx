import React from 'react';

/**
 * PiSquareDottedContrast icon from the contrast style in general category.
 */
interface PiSquareDottedContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSquareDottedContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'square-dotted icon',
  ...props
}: PiSquareDottedContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M3 12c0-2.796 0-4.193.457-5.296a6 6 0 0 1 3.247-3.247C7.807 3 9.204 3 12 3s4.194 0 5.296.457a6 6 0 0 1 3.247 3.247C21 7.807 21 9.204 21 12s0 4.194-.457 5.296a6 6 0 0 1-3.247 3.247C16.194 21 14.796 21 12 21s-4.193 0-5.296-.457a6 6 0 0 1-3.247-3.247C3 16.194 3 14.796 3 12Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v.01m0 17.98V21m9-9.005v.01m-18-.01v.01m.457-5.308v.01m17.087-.01v.01M3.457 17.277v.01m17.087-.01v.01M17.3 3.451v.01m-10.587-.01v.01M17.3 20.531v.01m-10.587-.01v.01" fill="none"/>
    </svg>
  );
}
