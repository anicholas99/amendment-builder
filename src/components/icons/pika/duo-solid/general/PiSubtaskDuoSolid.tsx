import React from 'react';

/**
 * PiSubtaskDuoSolid icon from the duo-solid style in general category.
 */
interface PiSubtaskDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSubtaskDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'subtask icon',
  ...props
}: PiSubtaskDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 10v2a5 5 0 0 0 5 5h2" opacity=".28"/><path fill={color || "currentColor"} d="M5.968 3c-.439 0-.817 0-1.13.021a3 3 0 0 0-.986.207 3 3 0 0 0-1.624 1.624 3 3 0 0 0-.207.986C2 6.15 2 6.529 2 6.968v.064c0 .439 0 .817.021 1.13.023.33.072.66.207.986a3 3 0 0 0 1.624 1.624c.326.135.656.184.986.207.313.021.691.021 1.13.021h12.064c.439 0 .817 0 1.13-.021.33-.023.66-.072.986-.207a3 3 0 0 0 1.624-1.624c.135-.326.184-.656.207-.986C22 7.85 22 7.471 22 7.032v-.064c0-.439 0-.817-.021-1.13a3.1 3.1 0 0 0-.207-.986 3 3 0 0 0-1.624-1.624 3 3 0 0 0-.986-.207C18.85 3 18.471 3 18.032 3z"/><path fill={color || "currentColor"} d="M15.968 13c-.439 0-.817 0-1.13.021-.33.023-.66.072-.986.207a3 3 0 0 0-1.624 1.624 3 3 0 0 0-.207.986c-.021.313-.021.691-.021 1.13v.064c0 .439 0 .817.021 1.13.023.33.072.66.207.986a3 3 0 0 0 1.624 1.624c.326.135.656.184.986.207.313.021.691.021 1.13.021h2.064c.439 0 .817 0 1.13-.021.33-.023.66-.072.986-.207a3 3 0 0 0 1.624-1.624c.135-.326.184-.656.207-.986.021-.313.021-.691.021-1.13v-.064c0-.439 0-.817-.021-1.13a3.1 3.1 0 0 0-.207-.986 3 3 0 0 0-1.624-1.624 3 3 0 0 0-.986-.207C18.85 13 18.471 13 18.032 13z"/>
    </svg>
  );
}
