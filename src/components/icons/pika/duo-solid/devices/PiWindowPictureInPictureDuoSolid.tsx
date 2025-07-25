import React from 'react';

/**
 * PiWindowPictureInPictureDuoSolid icon from the duo-solid style in devices category.
 */
interface PiWindowPictureInPictureDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWindowPictureInPictureDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'window-picture-in-picture icon',
  ...props
}: PiWindowPictureInPictureDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M22 15.87v-.035c0-.39 0-.74-.024-1.03a2.5 2.5 0 0 0-.248-.97 2.5 2.5 0 0 0-1.093-1.092 2.5 2.5 0 0 0-.968-.25q-.515-.03-1.03-.023h-4.273c-.39 0-.74 0-1.03.024a2.5 2.5 0 0 0-.969.25 2.5 2.5 0 0 0-1.092 1.092 2.5 2.5 0 0 0-.25.967c-.023.292-.023.642-.023 1.031v2.273c0 .39 0 .74.024 1.03.025.313.083.643.249.97a2.5 2.5 0 0 0 1.092 1.092c.325.164.656.223.968.247.292.024.642.024 1.03.024h4.273c.39 0 .74 0 1.03-.023.313-.025.644-.084.969-.248a2.5 2.5 0 0 0 1.092-1.094c.147-.303.232-.631.25-.968.023-.291.023-.642.023-1.03z" clipRule="evenodd"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 9.216V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2.22" opacity=".28"/>
    </svg>
  );
}
