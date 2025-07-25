import React from 'react';

/**
 * PiFuelPumpGasDuoSolid icon from the duo-solid style in automotive category.
 */
interface PiFuelPumpGasDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFuelPumpGasDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'fuel-pump-gas icon',
  ...props
}: PiFuelPumpGasDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M6.161 2h5.677c.528 0 .982 0 1.357.03.395.033.789.104 1.167.297a3 3 0 0 1 1.311 1.311c.193.378.264.772.296 1.167.031.375.031.83.031 1.356v11.677c0 .528 0 .982-.03 1.357-.033.395-.104.789-.297 1.167a3 3 0 0 1-1.311 1.311c-.378.193-.772.264-1.167.296-.375.031-.83.031-1.356.031H6.16c-.527 0-.981 0-1.356-.03-.395-.033-.789-.104-1.167-.297a3 3 0 0 1-1.311-1.311c-.193-.378-.264-.772-.296-1.167A18 18 0 0 1 2 17.839V6.16c0-.527 0-.981.03-1.356.033-.395.104-.789.297-1.167a3 3 0 0 1 1.311-1.311c.378-.193.772-.264 1.167-.296C5.18 2 5.635 2 6.161 2Zm.615 2.9h4.448c.118 0 .264 0 .394.01.151.013.374.045.608.165a1.6 1.6 0 0 1 .7.699c.119.234.151.457.163.608.011.13.011.276.01.394v2.448a4 4 0 0 1-.01.394 1.6 1.6 0 0 1-.164.609 1.6 1.6 0 0 1-.699.699c-.234.12-.457.152-.608.164-.13.01-.276.01-.394.01H6.776c-.118 0-.264 0-.394-.01a1.6 1.6 0 0 1-.608-.164 1.6 1.6 0 0 1-.7-.7 1.6 1.6 0 0 1-.164-.608c-.01-.13-.01-.275-.01-.394V6.776c0-.118 0-.264.01-.394.013-.151.045-.374.164-.608a1.6 1.6 0 0 1 .7-.7c.234-.119.457-.15.608-.163.13-.01.276-.01.394-.01Z" clipRule="evenodd"/><path fill={color || "currentColor"} fillRule="evenodd" d="M16 16.085v-2.05a3.5 3.5 0 0 1 3 3.465v1a.5.5 0 1 0 1 0v-7.55a2.5 2.5 0 0 1-1.288-4.823l-1.419-1.42a1 1 0 0 1 1.414-1.414l2.414 2.414a3 3 0 0 1 .88 2.121V18.5a2.5 2.5 0 0 1-5 0v-1a1.5 1.5 0 0 0-1-1.415ZM19.5 8a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M6.8 4.9h-.024c-.118 0-.264 0-.394.01a1.6 1.6 0 0 0-.608.165 1.6 1.6 0 0 0-.7.699c-.12.234-.151.457-.164.608-.01.13-.01.276-.01.394v2.448c0 .119 0 .265.01.394.013.152.045.374.164.609a1.6 1.6 0 0 0 .7.699c.234.12.457.152.608.164.13.01.276.01.394.01h4.448c.118 0 .264 0 .394-.01.151-.012.374-.045.608-.164a1.6 1.6 0 0 0 .7-.7c.119-.234.151-.456.163-.608a4 4 0 0 0 .01-.394V6.776a4 4 0 0 0-.01-.394 1.6 1.6 0 0 0-.164-.608 1.6 1.6 0 0 0-.699-.7 1.6 1.6 0 0 0-.608-.163c-.13-.01-.276-.01-.394-.01z" clipRule="evenodd" opacity=".28"/>
    </svg>
  );
}
