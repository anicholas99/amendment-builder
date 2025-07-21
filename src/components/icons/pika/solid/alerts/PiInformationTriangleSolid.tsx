import React from 'react';

/**
 * PiInformationTriangleSolid icon from the solid style in alerts category.
 */
interface PiInformationTriangleSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiInformationTriangleSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'information-triangle icon',
  ...props
}: PiInformationTriangleSolidProps): JSX.Element {
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
      <path d="M13.782 2.364a4.55 4.55 0 0 0-3.564 0c-.485.206-.97.574-1.425.988-.468.426-.96.956-1.457 1.547C6.342 6.08 5.29 7.56 4.335 9.078s-1.827 3.095-2.453 4.479c-.313.69-.572 1.35-.748 1.939-.17.568-.288 1.155-.253 1.67A4.63 4.63 0 0 0 2.7 20.539c.431.327 1.026.551 1.63.717a17 17 0 0 0 2.18.42c1.618.218 3.562.324 5.49.324 1.93 0 3.874-.106 5.491-.323a17 17 0 0 0 2.18-.42c.605-.167 1.2-.39 1.631-.718a4.63 4.63 0 0 0 1.818-3.373c.035-.515-.084-1.102-.254-1.67a16 16 0 0 0-.747-1.94c-.626-1.383-1.498-2.961-2.453-4.478s-2.007-2.997-3.001-4.18a16 16 0 0 0-1.457-1.546c-.454-.414-.94-.782-1.426-.988ZM13 9za1 1 0 1 1-2 0v0a1 1 0 1 1 2 0Zm0 3.376v4a1 1 0 1 1-2 0v-4a1 1 0 1 1 2 0Z" fill="currentColor"/>
    </svg>
  );
}
