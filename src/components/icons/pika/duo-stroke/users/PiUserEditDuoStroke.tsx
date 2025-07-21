import React from 'react';

/**
 * PiUserEditDuoStroke icon from the duo-stroke style in users category.
 */
interface PiUserEditDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserEditDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'user-edit icon',
  ...props
}: PiUserEditDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h3.247" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.96 19.812c.012-.35.018-.525.062-.69q.058-.219.179-.412c.09-.144.214-.268.462-.516l5.973-5.973a.9.9 0 0 1 1.12-.122c.43.274.795.636 1.074 1.063l.02.03a.94.94 0 0 1-.122 1.18l-5.918 5.917c-.257.257-.386.386-.536.478a1.5 1.5 0 0 1-.43.18c-.17.042-.352.043-.716.045L12.922 21z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" fill="none"/>
    </svg>
  );
}
