import React from 'react';

/**
 * PiDeleteForwardRightDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiDeleteForwardRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDeleteForwardRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'delete-forward-right icon',
  ...props
}: PiDeleteForwardRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.794 11.307a33 33 0 0 0-4.42-5.287c-.357-.345-.536-.518-.784-.667a2.7 2.7 0 0 0-.71-.287C15.598 5 15.319 5 14.76 5H7c-1.4 0-2.1 0-2.635.272a2.5 2.5 0 0 0-1.093 1.093C3 6.9 3 7.6 3 9v6c0 1.4 0 2.1.272 2.635a2.5 2.5 0 0 0 1.093 1.092C4.9 19 5.6 19 7 19h7.761c.558 0 .837 0 1.119-.066.234-.055.503-.164.71-.287.248-.148.427-.321.785-.667a33 33 0 0 0 4.419-5.287c.137-.203.206-.448.206-.693s-.069-.49-.206-.693Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 15 3-3m0 0 3-3m-3 3L8 9m3 3 3 3" fill="none"/>
    </svg>
  );
}
