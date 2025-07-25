import React from 'react';

/**
 * PiHomeDefaultContrast icon from the contrast style in building category.
 */
interface PiHomeDefaultContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiHomeDefaultContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'home-default icon',
  ...props
}: PiHomeDefaultContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M3 12.759c0-1.017 0-1.526.119-2.002a4 4 0 0 1 .513-1.19c.265-.414.634-.763 1.374-1.461l2.6-2.456c1.546-1.46 2.32-2.19 3.201-2.466a4 4 0 0 1 2.386 0c.882.275 1.655 1.006 3.201 2.466l2.6 2.456c.74.698 1.11 1.047 1.374 1.46a4 4 0 0 1 .513 1.191c.119.476.119.985.119 2.002v3.574c0 1.085 0 1.628-.12 2.073a3.5 3.5 0 0 1-2.474 2.475c-.445.119-.988.119-2.073.119-.31 0-.465 0-.592-.034a1 1 0 0 1-.707-.707C15 20.132 15 19.977 15 19.667V17c0-.465 0-.697-.03-.891a2.5 2.5 0 0 0-2.079-2.078C12.697 14 12.464 14 12 14s-.697 0-.891.03a2.5 2.5 0 0 0-2.079 2.08C9 16.303 9 16.535 9 17v2.667c0 .31 0 .465-.034.592a1 1 0 0 1-.707.707C8.132 21 7.977 21 7.667 21c-1.085 0-1.628 0-2.073-.12a3.5 3.5 0 0 1-2.475-2.474C3 17.96 3 17.418 3 16.333z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 16.333V12.76c0-1.017 0-1.526-.119-2.002a4 4 0 0 0-.513-1.19c-.265-.414-.634-.763-1.374-1.461l-2.6-2.456c-1.546-1.46-2.32-2.19-3.201-2.466a4 4 0 0 0-2.386 0c-.882.275-1.655 1.006-3.201 2.466l-2.6 2.456c-.74.698-1.11 1.047-1.374 1.46a4 4 0 0 0-.513 1.191C3 11.233 3 11.742 3 12.76v3.574c0 1.085 0 1.628.12 2.073a3.5 3.5 0 0 0 2.474 2.475C6.04 21 6.582 21 7.667 21c.31 0 .465 0 .592-.034a1 1 0 0 0 .707-.707C9 20.132 9 19.977 9 19.667V17c0-.465 0-.697.03-.891a2.5 2.5 0 0 1 2.079-2.078C11.303 14 11.536 14 12 14s.697 0 .891.03a2.5 2.5 0 0 1 2.078 2.079c.031.194.031.426.031.891v2.667c0 .31 0 .465.034.592a1 1 0 0 0 .707.707c.127.034.282.034.592.034 1.085 0 1.628 0 2.073-.12a3.5 3.5 0 0 0 2.475-2.474c.119-.445.119-.988.119-2.073Z" fill="none"/>
    </svg>
  );
}
