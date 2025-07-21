import React from 'react';

/**
 * PiPhoneIncomingDuoStroke icon from the duo-stroke style in communication category.
 */
interface PiPhoneIncomingDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPhoneIncomingDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'phone-incoming icon',
  ...props
}: PiPhoneIncomingDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.407 12.974a15.8 15.8 0 0 0 5.307 5.43" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.85 4.906a14.7 14.7 0 0 0 .007 3.647c.04.312.277.55.59.59a14.7 14.7 0 0 0 3.646.006M19.999 4l-4.95 4.95M3.036 5.71c.321 2.723 1.135 5.167 2.373 7.264.653-.502 1.354-.974 1.959-1.534a5.43 5.43 0 0 0 1.57-5.332c-.37-1.442-1.066-2.927-2.75-3.08-.402-.036-.893-.045-1.29.02-1.262.206-2.003 1.465-1.862 2.661Zm7.68 12.695c2.164 1.343 4.715 2.223 7.573 2.56 1.196.141 2.455-.6 2.66-1.863a5 5 0 0 0 .012-1.366c-.21-1.77-1.914-2.44-3.435-2.788a5.43 5.43 0 0 0-4.867 1.276c-.714.65-1.311 1.453-1.943 2.18Z" fill="none"/>
    </svg>
  );
}
