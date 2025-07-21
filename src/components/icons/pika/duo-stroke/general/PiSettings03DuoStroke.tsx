import React from 'react';

/**
 * PiSettings03DuoStroke icon from the duo-stroke style in general category.
 */
interface PiSettings03DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSettings03DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'settings-03 icon',
  ...props
}: PiSettings03DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16.937 5.184-1.499-.865c-1.252-.722-1.879-1.084-2.544-1.225a4.3 4.3 0 0 0-1.788 0c-.665.141-1.292.503-2.544 1.225l-1.499.865c-1.252.723-1.879 1.084-2.334 1.59a4.3 4.3 0 0 0-.894 1.546c-.21.647-.21 1.37-.21 2.816v1.728c0 1.446 0 2.169.21 2.816.186.572.49 1.1.894 1.547.455.505 1.082.866 2.334 1.59l1.499.864c1.252.722 1.879 1.084 2.544 1.225a4.3 4.3 0 0 0 1.788 0c.665-.141 1.292-.503 2.544-1.225l1.499-.865c1.252-.723 1.878-1.084 2.334-1.59.403-.447.707-.974.894-1.546.21-.647.21-1.37.21-2.816v-1.728c0-1.446 0-2.169-.21-2.816a4.3 4.3 0 0 0-.894-1.546c-.456-.506-1.082-.867-2.334-1.59Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" fill="none"/>
    </svg>
  );
}
