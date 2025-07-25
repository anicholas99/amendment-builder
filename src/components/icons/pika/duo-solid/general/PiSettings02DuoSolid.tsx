import React from 'react';

/**
 * PiSettings02DuoSolid icon from the duo-solid style in general category.
 */
interface PiSettings02DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSettings02DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'settings-02 icon',
  ...props
}: PiSettings02DuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M14.577 4.058c-.622-2.744-4.532-2.744-5.154 0l-.051.226a.643.643 0 0 1-.97.402l-.196-.124c-2.38-1.5-5.144 1.264-3.644 3.644l.123.197a.643.643 0 0 1-.4.969l-.227.051c-2.744.622-2.744 4.532 0 5.154l.226.051a.643.643 0 0 1 .402.97l-.124.196c-1.5 2.38 1.264 5.144 3.644 3.644l.197-.123a.642.642 0 0 1 .969.4l.051.227c.622 2.744 4.532 2.744 5.154 0l.051-.226a.643.643 0 0 1 .97-.402l.196.124c2.38 1.5 5.144-1.264 3.644-3.644l-.123-.197a.643.643 0 0 1 .4-.969l.227-.051c2.744-.622 2.744-4.532 0-5.154l-.226-.051a.642.642 0 0 1-.402-.97l.124-.196c1.5-2.38-1.264-5.144-3.644-3.644l-.197.123a.643.643 0 0 1-.969-.4z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.991 12c0-.552.457-1 1.01-1s1.009.448 1.009 1-.457 1-1.01 1-1.009-.448-1.009-1Z"/>
    </svg>
  );
}
