import React from 'react';

/**
 * PiPeopleFemaleDuoSolid icon from the duo-solid style in users category.
 */
interface PiPeopleFemaleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPeopleFemaleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'people-female icon',
  ...props
}: PiPeopleFemaleDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M12 1.034a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M11.998 9a4.74 4.74 0 0 0-4.624 3.71l-1.35 6.073A1 1 0 0 0 7 20h1.475l.488 1.057a3.345 3.345 0 0 0 6.074 0L15.525 20h1.46a1 1 0 0 0 .977-1.215l-1.34-6.069A4.74 4.74 0 0 0 11.999 9Z" clipRule="evenodd"/>
    </svg>
  );
}
