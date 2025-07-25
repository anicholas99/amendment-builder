import React from 'react';

/**
 * PiPriorityTrivialContrast icon from the contrast style in development category.
 */
interface PiPriorityTrivialContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPriorityTrivialContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'priority-trivial icon',
  ...props
}: PiPriorityTrivialContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M11.307 19.84c-2.052-1.074-3.916-2.296-5.556-3.645A2.02 2.02 0 0 1 5 14.631V4c1.815 1.603 3.935 3.043 6.307 4.285.203.106.448.16.693.16s.49-.054.693-.16C15.065 7.043 17.185 5.603 19 4v10.631c0 .592-.262 1.162-.75 1.564-1.641 1.349-3.505 2.571-5.557 3.645-.203.107-.448.16-.693.16s-.49-.053-.693-.16Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.307 19.84c-2.052-1.074-3.916-2.296-5.556-3.645A2.02 2.02 0 0 1 5 14.631V4c1.815 1.603 3.935 3.043 6.307 4.285.203.106.448.16.693.16s.49-.054.693-.16C15.065 7.043 17.185 5.603 19 4v10.631c0 .592-.262 1.162-.75 1.564-1.641 1.349-3.505 2.571-5.557 3.645-.203.107-.448.16-.693.16s-.49-.053-.693-.16Z" fill="none"/>
    </svg>
  );
}
