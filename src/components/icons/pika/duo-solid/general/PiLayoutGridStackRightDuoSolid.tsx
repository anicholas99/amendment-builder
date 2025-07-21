import React from 'react';

/**
 * PiLayoutGridStackRightDuoSolid icon from the duo-solid style in general category.
 */
interface PiLayoutGridStackRightDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLayoutGridStackRightDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'layout-grid-stack-right icon',
  ...props
}: PiLayoutGridStackRightDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M5.416 2c-.38 0-.708 0-1.001.058a3 3 0 0 0-2.357 2.357C1.999 4.708 2 5.035 2 5.416v.168c0 .38 0 .709.058 1.001a3 3 0 0 0 2.357 2.357c.293.059.62.058 1.001.058h2.168c.38 0 .709 0 1.001-.058a3 3 0 0 0 2.357-2.357c.059-.292.058-.62.058-1.001v-.168c0-.38 0-.708-.058-1.001a3 3 0 0 0-2.357-2.357C8.292 1.999 7.965 2 7.584 2z"/><path fill={color || "currentColor"} d="M6.162 11c-.528 0-.982 0-1.357.03-.395.033-.788.104-1.167.297a3 3 0 0 0-1.31 1.311c-.194.379-.265.772-.297 1.167-.031.375-.03.83-.03 1.357v2.677c0 .527-.001.982.03 1.356.032.395.103.789.296 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.297.375.03.83.03 1.357.03h.677c.527 0 .982 0 1.356-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.31c.193-.38.264-.773.297-1.168.03-.374.03-.83.03-1.356v-2.677c0-.528 0-.982-.03-1.357-.033-.395-.104-.788-.297-1.167a3 3 0 0 0-1.31-1.31c-.38-.194-.773-.265-1.168-.297C7.821 11 7.365 11 6.84 11z"/></g><path fill={color || "currentColor"} d="M17.162 2c-.528 0-.982 0-1.357.03-.395.033-.789.104-1.167.297a3 3 0 0 0-1.311 1.311c-.193.378-.264.772-.296 1.167C13 5.18 13 5.635 13 6.161V17.84c0 .527 0 .982.03 1.356.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.296.375.031.83.031 1.356.031h.678c.527 0 .982 0 1.356-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.311c.193-.378.264-.772.296-1.167.031-.375.031-.83.031-1.356V6.16c0-.527 0-.981-.03-1.356-.033-.395-.104-.789-.297-1.167a3 3 0 0 0-1.311-1.311c-.378-.193-.772-.264-1.167-.296A18 18 0 0 0 17.839 2z"/>
    </svg>
  );
}
