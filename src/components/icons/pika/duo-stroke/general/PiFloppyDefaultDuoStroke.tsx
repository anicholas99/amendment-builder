import React from 'react';

/**
 * PiFloppyDefaultDuoStroke icon from the duo-stroke style in general category.
 */
interface PiFloppyDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFloppyDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'floppy-default icon',
  ...props
}: PiFloppyDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.21 3.937C16.488 3.217 15.964 3 14.946 3H9.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C3 6.04 3 7.16 3 9.4V17a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V9.053c0-1.018-.217-1.542-.937-2.262z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 7H7m10 14v-3.2c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C14.72 13 13.88 13 12.2 13h-.4c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C7 15.28 7 16.12 7 17.8V21" fill="none"/>
    </svg>
  );
}
