import React from 'react';

/**
 * PiPhotoImageCancelDuoStroke icon from the duo-stroke style in media category.
 */
interface PiPhotoImageCancelDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPhotoImageCancelDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'photo-image-cancel icon',
  ...props
}: PiPhotoImageCancelDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 12.194V11c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C18.2 3 16.8 3 14 3h-4c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 2.545 5.73C2 6.8 2 8.2 2 11v2c0 2.8 0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C5.8 21 7.2 21 10 21h3.2" opacity=".28" fill="none"/><path fill="none" fillRule="evenodd" d="M16.493 15.493a1 1 0 0 1 1.414 0l1.693 1.693 1.693-1.693a1 1 0 0 1 1.414 1.414L21.014 18.6l1.693 1.693a1 1 0 0 1-1.414 1.414L19.6 20.014l-1.693 1.693a1 1 0 0 1-1.414-1.414l1.693-1.693-1.693-1.693a1 1 0 0 1 0-1.414Z" clipRule="evenodd"/><path fill="none" d="M7.096 19.956q.412.024.94.034.489.008 1.072.01a10.5 10.5 0 0 1 9.318-8.945C18.95 11.001 19.582 11 21 11l-.001-.996A59 59 0 0 0 20.988 9h-.066c-1.32 0-2.062 0-2.7.066a12.5 12.5 0 0 0-11.126 10.89Z"/><path fill="none" fillRule="evenodd" d="M5.5 8.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" clipRule="evenodd"/>
    </svg>
  );
}
