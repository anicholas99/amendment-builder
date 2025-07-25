import React from 'react';

/**
 * PiUserRectangleContrast icon from the contrast style in users category.
 */
interface PiUserRectangleContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserRectangleContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'user-rectangle icon',
  ...props
}: PiUserRectangleContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M15.5 3h-7A4.5 4.5 0 0 0 4 7.5v9A4.5 4.5 0 0 0 8.5 21h7a4.5 4.5 0 0 0 4.5-4.5v-9A4.5 4.5 0 0 0 15.5 3Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.974 19.36v-.003A3.357 3.357 0 0 0 15.617 16H8.383a3.357 3.357 0 0 0-3.357 3.357v.003m13.948 0q.31-.376.535-.817C20 17.58 20 16.32 20 13.8v-3.6c0-2.52 0-3.78-.49-4.743a4.5 4.5 0 0 0-1.967-1.967C16.58 3 15.32 3 12.8 3h-1.6c-2.52 0-3.78 0-4.743.49A4.5 4.5 0 0 0 4.49 5.457C4 6.42 4 7.68 4 10.2v3.6c0 2.52 0 3.78.49 4.743q.226.44.536.817m13.948 0a4.5 4.5 0 0 1-1.431 1.15C16.58 21 15.32 21 12.8 21h-1.6c-2.52 0-3.78 0-4.743-.49a4.5 4.5 0 0 1-1.43-1.15M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="none"/>
    </svg>
  );
}
