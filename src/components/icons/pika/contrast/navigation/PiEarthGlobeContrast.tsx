import React from 'react';

/**
 * PiEarthGlobeContrast icon from the contrast style in navigation category.
 */
interface PiEarthGlobeContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEarthGlobeContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'earth-globe icon',
  ...props
}: PiEarthGlobeContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M2.85 12A9.15 9.15 0 0 0 12 21.15c4.974 0 9.15-4.174 9.15-9.15a9.15 9.15 0 0 0-18.3 0Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.962 7.624a6.9 6.9 0 0 0 2.56 1.695 3.118 3.118 0 0 0 2.086 4.575 1.742 1.742 0 1 0 2.763-.776 3.1 3.1 0 0 0 .987-2.275c0-.514-.124-.999-.344-1.426 2.54-.874 4.333-2.984 4.333-5.45v-.02M3.961 7.624A9.15 9.15 0 0 0 12 21.15a9.1 9.1 0 0 0 3.925-.883M3.962 7.624A9.15 9.15 0 0 1 12 2.85a9.1 9.1 0 0 1 4.346 1.097m0 0A9.15 9.15 0 0 1 21.15 12a9.1 9.1 0 0 1-.961 4.086m-4.265 4.182a3.1 3.1 0 0 1-.36-1.454c0-.655.203-1.263.548-1.765a1.742 1.742 0 1 1 3.1-1.306c.349.06.678.177.977.343m-4.265 4.182a9.2 9.2 0 0 0 4.265-4.182" fill="none"/>
    </svg>
  );
}
