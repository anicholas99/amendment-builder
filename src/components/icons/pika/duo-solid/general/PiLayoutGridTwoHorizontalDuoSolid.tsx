import React from 'react';

/**
 * PiLayoutGridTwoHorizontalDuoSolid icon from the duo-solid style in general category.
 */
interface PiLayoutGridTwoHorizontalDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLayoutGridTwoHorizontalDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'layout-grid-two-horizontal icon',
  ...props
}: PiLayoutGridTwoHorizontalDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M20.362 13.327c-.378-.193-.772-.264-1.167-.296C18.82 13 18.365 13 17.839 13H6.16c-.527 0-.981 0-1.356.03-.395.033-.789.104-1.167.297a3 3 0 0 0-1.311 1.311c-.193.378-.264.772-.296 1.167-.03.375-.03.83-.03 1.356v.677c0 .528 0 .982.03 1.357.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.296.375.031.83.031 1.356.031H17.84c.527 0 .981 0 1.356-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.311c.193-.378.264-.772.296-1.167.031-.375.031-.83.031-1.356v-.678c0-.527 0-.982-.03-1.356-.033-.395-.104-.789-.297-1.167a3 3 0 0 0-1.311-1.311Z" opacity=".28"/><path fill={color || "currentColor"} d="M20.362 2.327c-.378-.193-.772-.264-1.167-.296A18 18 0 0 0 17.839 2H6.16c-.527 0-.981 0-1.356.03-.395.033-.789.104-1.167.297a3 3 0 0 0-1.311 1.311c-.193.378-.264.772-.296 1.167C2 5.18 2 5.635 2 6.161v.678c0 .527 0 .981.03 1.356.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.296.375.031.83.031 1.356.031H17.84c.527 0 .982 0 1.356-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.311c.193-.378.264-.772.296-1.167.03-.375.03-.83.03-1.356V6.16c0-.527 0-.981-.03-1.356-.033-.395-.104-.789-.297-1.167a3 3 0 0 0-1.311-1.311Z"/>
    </svg>
  );
}
