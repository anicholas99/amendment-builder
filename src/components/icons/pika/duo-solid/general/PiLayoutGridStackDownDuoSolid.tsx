import React from 'react';

/**
 * PiLayoutGridStackDownDuoSolid icon from the duo-solid style in general category.
 */
interface PiLayoutGridStackDownDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLayoutGridStackDownDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'layout-grid-stack-down icon',
  ...props
}: PiLayoutGridStackDownDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M5.5 2h-.084c-.38 0-.708 0-1.001.058a3 3 0 0 0-2.357 2.357C1.999 4.708 2 5.035 2 5.416v2.168c0 .38 0 .709.058 1.001a3 3 0 0 0 2.357 2.357c.293.059.62.058 1.001.058h.168c.38 0 .709 0 1.001-.058a3 3 0 0 0 2.357-2.357c.059-.293.058-.62.058-1.001V5.416c0-.38 0-.708-.058-1.001a3 3 0 0 0-2.357-2.357C6.293 1.999 5.965 2 5.584 2z"/><path fill={color || "currentColor"} d="M20.362 2.327c-.378-.193-.771-.264-1.167-.296C18.82 2 18.365 2 17.84 2h-2.677c-.528 0-.982-.001-1.357.03-.395.032-.788.103-1.167.296a3 3 0 0 0-1.31 1.311c-.194.378-.265.772-.297 1.167-.03.375-.03.83-.03 1.357v.677c0 .527 0 .982.03 1.356.032.395.103.789.296 1.167a3 3 0 0 0 1.311 1.311c.379.193.772.264 1.167.297.375.03.83.03 1.357.03h2.677c.527 0 .982 0 1.356-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.31c.193-.38.264-.773.297-1.168.03-.374.03-.83.03-1.356v-.677c0-.528 0-.982-.03-1.357-.033-.395-.104-.788-.297-1.167a3 3 0 0 0-1.31-1.31Z"/></g><path fill={color || "currentColor"} d="M6.161 13c-.527 0-.981 0-1.356.03-.395.033-.789.104-1.167.297a3 3 0 0 0-1.311 1.311c-.193.378-.264.772-.296 1.167C2 16.18 2 16.635 2 17.161v.677c0 .528 0 .982.03 1.357.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.296.375.031.83.031 1.356.031H17.84c.527 0 .982 0 1.356-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.311c.193-.378.264-.772.296-1.167.031-.375.031-.83.031-1.356v-.678c0-.527 0-.982-.03-1.356-.033-.395-.104-.789-.297-1.167a3 3 0 0 0-1.311-1.311c-.378-.193-.772-.264-1.167-.296C18.82 13 18.365 13 17.839 13z"/>
    </svg>
  );
}
