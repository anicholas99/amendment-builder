import React from 'react';

/**
 * PiVideoCallCancelDuoSolid icon from the duo-solid style in devices category.
 */
interface PiVideoCallCancelDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiVideoCallCancelDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'video-call-cancel icon',
  ...props
}: PiVideoCallCancelDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M13 4a5 5 0 0 1 4.704 3.302l.366-.307C20.022 5.355 23 6.743 23 9.292v5.416c0 2.55-2.978 3.937-4.93 2.297l-.366-.307A5 5 0 0 1 13 20H6a5 5 0 0 1-5-5V9a5 5 0 0 1 5-5zm5.001 9.915V10.08a1 1 0 0 1 .356-.714l1-.84A1 1 0 0 1 21 9.292v5.416a1 1 0 0 1-1.643.766l-1-.84a1 1 0 0 1-.356-.72Z" clipRule="evenodd" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 14.5 9.5 12m0 0L12 9.5M9.5 12 7 9.5M9.5 12l2.5 2.5"/>
    </svg>
  );
}
