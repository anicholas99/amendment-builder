import React from 'react';

/**
 * PiLockOpenDuoStroke icon from the duo-stroke style in security category.
 */
interface PiLockOpenDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLockOpenDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'lock-open icon',
  ...props
}: PiLockOpenDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.303 9H9.697c-1.662 0-2.584 0-3.27.239q-.125.043-.242.098c-.951.45-1.684 1.307-2.021 2.366-.253.793-.175 1.794-.02 3.795.133 1.723.2 2.584.507 3.26.41.901 1.119 1.604 1.987 1.969.65.273 1.454.273 3.06.273h4.605c1.605 0 2.408 0 3.06-.273.867-.365 1.577-1.068 1.986-1.969.308-.676.374-1.537.508-3.26.155-2.001.232-3.002-.02-3.795-.338-1.059-1.071-1.916-2.022-2.366a3 3 0 0 0-.242-.098C16.887 9 15.965 9 14.303 9Z" opacity=".28" fill="none"/><path fill="none" fillRule="evenodd" d="M10.07 14c0-1.034.796-2 1.93-2s1.928.966 1.928 2A2.04 2.04 0 0 1 13 15.714V17a1 1 0 1 1-2 0v-1.286A2.04 2.04 0 0 1 10.07 14Z" clipRule="evenodd"/><path fill="none" d="m6.77 10.178-.03.01.016-.005z"/><path fill="none" d="M5.438 8.6q.155-.09.32-.167.167-.079.34-.139c.435-.151.902-.22 1.412-.255C7.924 5.692 9.83 4 12 4a4.2 4.2 0 0 1 1.502.276 1 1 0 1 0 .711-1.87A6.2 6.2 0 0 0 12 2C8.432 2 5.63 4.982 5.438 8.6Z"/>
    </svg>
  );
}
