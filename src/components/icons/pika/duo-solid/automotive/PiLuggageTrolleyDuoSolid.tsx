import React from 'react';

/**
 * PiLuggageTrolleyDuoSolid icon from the duo-solid style in automotive category.
 */
interface PiLuggageTrolleyDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLuggageTrolleyDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'luggage-trolley icon',
  ...props
}: PiLuggageTrolleyDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12.162 4.5c-.528 0-.982 0-1.357.03-.395.033-.789.104-1.167.297a3 3 0 0 0-1.311 1.311c-.193.378-.264.772-.296 1.167C8 7.68 8 8.135 8 8.661v3.678c0 .527 0 .981.03 1.356.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.296.375.031.83.031 1.356.031h5.678c.527 0 .982 0 1.356-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.311c.193-.378.264-.772.296-1.167.031-.375.031-.83.031-1.356V8.66c0-.527 0-.981-.03-1.356-.033-.395-.104-.789-.297-1.167a3 3 0 0 0-1.311-1.311c-.378-.193-.772-.264-1.167-.296a18 18 0 0 0-1.356-.031z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M3 2a1 1 0 0 0 0 2 1 1 0 0 1 1 1v10.126A4.002 4.002 0 0 0 5 23a4 4 0 0 0 3.874-3H21a1 1 0 1 0 0-2H8.874A4.01 4.01 0 0 0 6 15.126V5a3 3 0 0 0-3-3Zm0 17a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" clipRule="evenodd"/><path fill={color || "currentColor"} d="M16 5.5a1 1 0 1 0-2 0V9a1 1 0 1 0 2 0z"/>
    </svg>
  );
}
