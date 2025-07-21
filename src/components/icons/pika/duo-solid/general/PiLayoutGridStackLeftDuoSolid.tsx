import React from 'react';

/**
 * PiLayoutGridStackLeftDuoSolid icon from the duo-solid style in general category.
 */
interface PiLayoutGridStackLeftDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLayoutGridStackLeftDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'layout-grid-stack-left icon',
  ...props
}: PiLayoutGridStackLeftDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} opacity=".28"><path fill={color || "currentColor"} d="M16.416 2c-.38 0-.708 0-1.001.058a3 3 0 0 0-2.357 2.357C12.987 4.77 13 5.139 13 5.5s-.013.73.058 1.085a3 3 0 0 0 2.357 2.357c.293.059.62.058 1.001.058h2.168c.38 0 .709 0 1.001-.058a3 3 0 0 0 2.357-2.357C22.013 6.23 22 5.861 22 5.5s.013-.73-.058-1.085a3 3 0 0 0-2.357-2.357c-.293-.059-.62-.058-1.001-.058z"/><path fill={color || "currentColor"} d="M17.162 11c-.528 0-.982 0-1.357.03-.395.033-.788.104-1.167.297a3 3 0 0 0-1.31 1.311c-.194.379-.265.772-.297 1.167-.031.375-.03.83-.03 1.357v2.677c0 .527-.001.982.03 1.356.032.395.103.789.296 1.167a3 3 0 0 0 1.311 1.311c.379.193.772.264 1.167.297.375.03.83.03 1.357.03h.677c.527 0 .982 0 1.356-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.31c.193-.38.264-.773.297-1.168.03-.375.03-.83.03-1.356v-2.677c0-.528 0-.982-.03-1.357-.033-.395-.104-.788-.297-1.167a3 3 0 0 0-1.311-1.31c-.378-.194-.772-.265-1.167-.297-.375-.03-.83-.03-1.356-.03z"/></g><path fill={color || "currentColor"} d="M4.805 2.03c-.395.032-.789.104-1.167.297a3 3 0 0 0-1.311 1.31c-.193.379-.264.772-.296 1.168C2 5.179 2 5.634 2 6.16v11.677c0 .527 0 .982.03 1.357.033.395.104.788.297 1.166a3 3 0 0 0 1.311 1.312c.378.192.772.264 1.167.296.563.046 1.13.03 1.695.03s1.132.016 1.695-.03c.395-.032.789-.104 1.167-.296a3 3 0 0 0 1.311-1.311c.193-.379.264-.772.296-1.167.031-.375.031-.83.031-1.357V6.161c0-.527 0-.982-.03-1.356-.033-.396-.104-.789-.297-1.167a3 3 0 0 0-1.311-1.311c-.378-.193-.772-.265-1.167-.297C7.632 1.984 7.065 2 6.5 2s-1.132-.016-1.695.03Z"/>
    </svg>
  );
}
