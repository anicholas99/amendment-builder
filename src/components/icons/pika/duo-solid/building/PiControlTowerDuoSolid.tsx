import React from 'react';

/**
 * PiControlTowerDuoSolid icon from the duo-solid style in building category.
 */
interface PiControlTowerDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiControlTowerDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'control-tower icon',
  ...props
}: PiControlTowerDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M20.411 11.259a3.5 3.5 0 0 1-2.364 2.575l.451 8.11.001.103a1 1 0 0 1-1.986.11l-.011-.101L16.055 14h-8.11l-.447 8.056a1 1 0 1 1-1.996-.112l.45-8.108a3.5 3.5 0 0 1-2.284-2.282l-.08-.295L2.643 7h18.715zm-14.87-.434.034.127A1.5 1.5 0 0 0 7.005 12H8.78l-.6-3H5.137zM10.819 12h2.362l.6-3H10.22zm4.4 0h1.775a1.5 1.5 0 0 0 1.465-1.175L18.864 9H15.82z" clipRule="evenodd"/><path fill={color || "currentColor"} d="M12 1a1 1 0 0 1 1 1v1h-2V2a1 1 0 0 1 1-1Z"/><path fill={color || "currentColor"} d="M19.13 3a2.5 2.5 0 0 1 2.469 2.896l-.029.146L20.913 9H3.087L2.43 6.042A2.5 2.5 0 0 1 4.87 3z" opacity=".28"/>
    </svg>
  );
}
