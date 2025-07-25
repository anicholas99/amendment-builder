import React from 'react';

/**
 * PiMicrowaveDuoSolid icon from the duo-solid style in appliances category.
 */
interface PiMicrowaveDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMicrowaveDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'microwave icon',
  ...props
}: PiMicrowaveDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M15 3H5.161c-.527 0-.981 0-1.356.03-.395.033-.789.104-1.167.297a3 3 0 0 0-1.311 1.311c-.193.378-.264.772-.296 1.167C1 6.18 1 6.635 1 7.161v9.678c0 .527 0 .982.03 1.356.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.296.375.031.83.031 1.356.031H15z"/><path fill={color || "currentColor"} d="M17 21h1.839c.527 0 .982 0 1.356-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.311c.193-.378.264-.772.296-1.167.031-.375.031-.83.031-1.356V16h-6z"/><path fill={color || "currentColor"} d="M23 14V7.161c0-.527 0-.981-.03-1.356-.033-.395-.104-.789-.297-1.167a3 3 0 0 0-1.311-1.311c-.378-.193-.772-.264-1.167-.296C19.82 3 19.365 3 18.839 3H17v11z"/></g><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.01 7H20m.01 3H20"/>
    </svg>
  );
}
