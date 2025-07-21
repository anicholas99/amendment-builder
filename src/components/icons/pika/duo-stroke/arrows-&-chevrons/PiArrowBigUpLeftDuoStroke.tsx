import React from 'react';

/**
 * PiArrowBigUpLeftDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiArrowBigUpLeftDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowBigUpLeftDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-big-up-left icon',
  ...props
}: PiArrowBigUpLeftDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.809 4.91a61 61 0 0 0-3.062 2.594l7.017 7.017c.396.396.594.594.668.822a1 1 0 0 1 0 .618c-.074.228-.272.426-.668.822l-1.98 1.98c-.396.396-.594.595-.823.669a1 1 0 0 1-.618 0c-.228-.074-.426-.272-.822-.669l-7.017-7.016a61 61 0 0 0-2.595 3.062" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.809 4.91a35.3 35.3 0 0 0-9.097-.178 1.11 1.11 0 0 0-.98.98 35.3 35.3 0 0 0 .177 9.097" fill="none"/>
    </svg>
  );
}
