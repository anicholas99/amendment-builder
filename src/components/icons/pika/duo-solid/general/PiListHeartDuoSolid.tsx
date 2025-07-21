import React from 'react';

/**
 * PiListHeartDuoSolid icon from the duo-solid style in general category.
 */
interface PiListHeartDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListHeartDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'list-heart icon',
  ...props
}: PiListHeartDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M4 5a1 1 0 0 0 0 2h16a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M4 11a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M4 17a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z"/></g><path fill={color || "currentColor"} d="M19.214 10.828a2.87 2.87 0 0 0-1.503.38 2.94 2.94 0 0 0-1.482-.38c-1.585 0-3.229 1.271-3.229 3.166 0 1.704 1.11 3.04 2.062 3.869a9 9 0 0 0 1.42 1.011c.207.119.403.217.573.29.209.09.43.163.66.163.229 0 .45-.074.659-.163a6 6 0 0 0 .573-.29 9 9 0 0 0 1.42-1.011c.952-.828 2.062-2.165 2.062-3.869 0-1.906-1.654-3.145-3.215-3.166Z"/>
    </svg>
  );
}
