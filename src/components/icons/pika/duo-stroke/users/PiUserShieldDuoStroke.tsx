import React from 'react';

/**
 * PiUserShieldDuoStroke icon from the duo-stroke style in users category.
 */
interface PiUserShieldDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserShieldDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'user-shield icon',
  ...props
}: PiUserShieldDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.047 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h2.16" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.807 15.135 2.306-.73c.233-.073.486-.073.719 0l2.338.74c.431.137.735.504.773.934l.04.453c.167 1.905-.904 3.714-2.705 4.57l-.284.134a1.19 1.19 0 0 1-1.037-.01l-.327-.163c-1.683-.841-2.705-2.527-2.626-4.331l.027-.618a1.09 1.09 0 0 1 .776-.979Z" fill="none"/>
    </svg>
  );
}
