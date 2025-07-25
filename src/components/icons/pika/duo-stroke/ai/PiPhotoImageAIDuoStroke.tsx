import React from 'react';

/**
 * PiPhotoImageAIDuoStroke icon from the duo-stroke style in ai category.
 */
interface PiPhotoImageAIDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPhotoImageAIDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'photo-image-ai icon',
  ...props
}: PiPhotoImageAIDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.999 10c-.008-2.15-.068-3.336-.544-4.27a5 5 0 0 0-2.185-2.185C18.2 3 16.8 3 14 3h-4c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 2.545 5.73C2 6.8 2 8.2 2 11v2c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C5.8 21 7.2 21 10 21h2" opacity=".28" fill="none"/><path fill="none" d="M7.5 6.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path fill="none" d="M7.096 19.956c.549.032 1.201.04 2.012.043a10.5 10.5 0 0 1 9.318-8.944C18.95 11.001 19.582 11 21 11h.999a1 1 0 0 1-1-.996A60 60 0 0 0 20.989 9h-.067c-1.32 0-2.062 0-2.7.066a12.5 12.5 0 0 0-11.126 10.89Z"/><path fill="none" fillRule="evenodd" d="M20 13a1 1 0 0 1 .93.633c.293.743.566 1.19.896 1.523s.781.614 1.54.914a1 1 0 0 1 0 1.86c-.759.3-1.21.582-1.54.914s-.603.78-.896 1.523a1 1 0 0 1-1.86 0c-.293-.743-.566-1.19-.896-1.523s-.781-.614-1.54-.914a1 1 0 0 1 0-1.86c.759-.3 1.21-.582 1.54-.914s.603-.78.896-1.523A1 1 0 0 1 20 13Zm-.903 4a4.8 4.8 0 0 1 .903.902 4.8 4.8 0 0 1 .903-.902 4.8 4.8 0 0 1-.903-.902 4.8 4.8 0 0 1-.903.902Z" clipRule="evenodd"/><path fill="none" d="M15 21a1 1 0 0 1 1-1h.001a1 1 0 1 1 0 2H16a1 1 0 0 1-1-1Z"/>
    </svg>
  );
}
