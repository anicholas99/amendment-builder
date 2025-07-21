import React from 'react';

/**
 * PiWashingMachineDuoSolid icon from the duo-solid style in appliances category.
 */
interface PiWashingMachineDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiWashingMachineDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'washing-machine icon',
  ...props
}: PiWashingMachineDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M7.161 1h9.678c.527 0 .982 0 1.356.03.395.033.789.104 1.167.297a3 3 0 0 1 1.311 1.311c.193.378.264.772.296 1.167.031.375.031.83.031 1.356V7H3V5.161c0-.527 0-.981.03-1.356.033-.395.104-.789.297-1.167a3 3 0 0 1 1.311-1.311c.378-.193.772-.264 1.167-.296C6.18 1 6.635 1 7.161 1Z"/><path fill={color || "currentColor"} d="M3 9v9.839c0 .527 0 .982.03 1.356.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.296.375.031.83.031 1.356.031h9.678c.527 0 .982 0 1.356-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.311c.193-.378.264-.772.296-1.167.031-.375.031-.83.031-1.356V9z"/></g><path fill={color || "currentColor"} d="M6 4a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H7a1 1 0 0 1-1-1Z"/><path fill={color || "currentColor"} d="M13 4a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H14a1 1 0 0 1-1-1Z"/><path fill={color || "currentColor"} d="M17 3a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M12 10.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/>
    </svg>
  );
}
