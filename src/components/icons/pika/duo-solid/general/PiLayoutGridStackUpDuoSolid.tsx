import React from 'react';

/**
 * PiLayoutGridStackUpDuoSolid icon from the duo-solid style in general category.
 */
interface PiLayoutGridStackUpDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLayoutGridStackUpDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'layout-grid-stack-up icon',
  ...props
}: PiLayoutGridStackUpDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M5.5 13h-.084c-.38 0-.708 0-1.001.058a3 3 0 0 0-2.357 2.357c-.059.293-.058.62-.058 1.001v2.168c0 .38 0 .709.058 1.001a3 3 0 0 0 2.357 2.357c.293.059.62.058 1.001.058h.168c.38 0 .709 0 1.001-.058a3 3 0 0 0 2.357-2.357c.059-.293.058-.62.058-1.001v-2.168c0-.38 0-.708-.058-1.001a3 3 0 0 0-2.357-2.357c-.292-.059-.62-.058-1.001-.058z"/><path fill={color || "currentColor"} d="M15.162 13c-.528 0-.982 0-1.357.03-.395.033-.788.104-1.167.297a3 3 0 0 0-1.31 1.311c-.194.379-.265.772-.297 1.167-.03.375-.03.83-.03 1.357v.677c0 .527 0 .982.03 1.356.032.395.103.789.296 1.167a3 3 0 0 0 1.311 1.311c.379.193.772.264 1.167.297.375.03.83.03 1.357.03h2.677c.527 0 .982 0 1.356-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.31c.193-.38.264-.773.297-1.168.03-.375.03-.83.03-1.356v-.677c0-.528 0-.982-.03-1.357-.033-.395-.104-.788-.297-1.167a3 3 0 0 0-1.31-1.31c-.38-.194-.773-.265-1.168-.297-.375-.03-.83-.03-1.356-.03z"/></g><path fill={color || "currentColor"} d="M6.161 2c-.527 0-.981 0-1.356.03-.395.033-.789.104-1.167.297a3 3 0 0 0-1.311 1.311c-.193.378-.264.772-.296 1.167C2 5.18 2 5.635 2 6.161v.678c0 .527 0 .981.03 1.356.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.296.375.031.83.031 1.356.031H17.84c.527 0 .982 0 1.356-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.311c.193-.378.264-.772.296-1.167.03-.375.03-.83.03-1.356V6.16c0-.527 0-.981-.03-1.356-.033-.395-.104-.789-.297-1.167a3 3 0 0 0-1.311-1.311c-.378-.193-.772-.264-1.167-.296A18 18 0 0 0 17.839 2z"/>
    </svg>
  );
}
