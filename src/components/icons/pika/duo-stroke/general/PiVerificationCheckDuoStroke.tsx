import React from 'react';

/**
 * PiVerificationCheckDuoStroke icon from the duo-stroke style in general category.
 */
interface PiVerificationCheckDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiVerificationCheckDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'verification-check icon',
  ...props
}: PiVerificationCheckDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.274 8.986c1.182.604 1.976 1.723 1.976 3.014s-.794 2.41-1.976 3.014c.415 1.255.18 2.617-.731 3.529-.912.911-2.274 1.137-3.529.73-.595 1.183-1.723 1.977-3.014 1.977s-2.41-.794-3.014-1.976c-1.255.406-2.617.18-3.529-.731-.911-.912-1.137-2.274-.722-3.529C3.553 14.41 2.75 13.291 2.75 12s.803-2.41 1.985-3.014c-.415-1.255-.19-2.617.722-3.529s2.274-1.146 3.538-.73C9.59 3.543 10.71 2.75 12 2.75s2.419.794 3.014 1.976c1.255-.415 2.617-.18 3.529.731.911.912 1.146 2.274.73 3.529Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 12.14 2.007 2.005a12.84 12.84 0 0 1 3.906-4.23l.087-.06" fill="none"/>
    </svg>
  );
}
