import React from 'react';

/**
 * PiSettings02DuoStroke icon from the duo-stroke style in general category.
 */
interface PiSettings02DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSettings02DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'settings-02 icon',
  ...props
}: PiSettings02DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m13.653 4.505-.051-.226c-.387-1.705-2.817-1.705-3.204 0l-.051.226a1.643 1.643 0 0 1-2.478 1.027l-.196-.124c-1.48-.933-3.198.786-2.265 2.265l.124.196a1.643 1.643 0 0 1-1.027 2.478l-.226.051c-1.705.387-1.705 2.817 0 3.204l.226.051a1.642 1.642 0 0 1 1.027 2.478l-.124.196c-.933 1.48.786 3.198 2.265 2.265l.196-.123a1.642 1.642 0 0 1 2.478 1.026l.051.226c.387 1.705 2.817 1.705 3.204 0l.051-.226a1.642 1.642 0 0 1 2.478-1.027l.196.124c1.48.933 3.198-.786 2.265-2.265l-.123-.196a1.642 1.642 0 0 1 1.026-2.478l.226-.051c1.705-.387 1.705-2.817 0-3.204l-.226-.051a1.642 1.642 0 0 1-1.027-2.478l.124-.196c.933-1.48-.786-3.198-2.265-2.265l-.196.124a1.642 1.642 0 0 1-2.478-1.027Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.991 12c0-.552.457-1 1.01-1s1.009.448 1.009 1-.457 1-1.01 1-1.009-.448-1.009-1Z" fill="none"/>
    </svg>
  );
}
