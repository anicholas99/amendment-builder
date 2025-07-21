import React from 'react';

/**
 * PiFaceAnnoyedBoredDuoSolid icon from the duo-solid style in general category.
 */
interface PiFaceAnnoyedBoredDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFaceAnnoyedBoredDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'face-annoyed-bored icon',
  ...props
}: PiFaceAnnoyedBoredDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12c0 5.605 4.544 10.15 10.15 10.15S22.15 17.605 22.15 12 17.606 1.85 12 1.85Z" opacity=".3"/><path fill={color || "currentColor"} fillRule="evenodd" d="M7 10a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Zm6 0a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1Zm-6 5a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z" clipRule="evenodd"/>
    </svg>
  );
}
