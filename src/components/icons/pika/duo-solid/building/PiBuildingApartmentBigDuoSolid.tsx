import React from 'react';

/**
 * PiBuildingApartmentBigDuoSolid icon from the duo-solid style in building category.
 */
interface PiBuildingApartmentBigDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBuildingApartmentBigDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'building-apartment-big icon',
  ...props
}: PiBuildingApartmentBigDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M8.161 1c-.527 0-.981 0-1.356.03-.395.033-.789.104-1.167.297a3 3 0 0 0-1.311 1.311c-.193.378-.264.772-.296 1.167C4 4.18 4 4.635 4 5.161v15.27c0 .253 0 .5.017.707.019.229.063.499.201.77a2 2 0 0 0 .874.874c.271.138.541.182.77.201.208.017.454.017.706.017H7.5v-3.42c0-.263 0-.49.015-.677.016-.198.052-.395.149-.584a1.5 1.5 0 0 1 .655-.655 1.5 1.5 0 0 1 .583-.149c.188-.015.415-.015.679-.015h4.838c.264 0 .491 0 .678.015.198.016.395.052.584.148a1.5 1.5 0 0 1 .656.656c.096.19.132.386.148.584.015.187.015.414.015.678V23h.932c.252 0 .498 0 .706-.017a2 2 0 0 0 .77-.201 2 2 0 0 0 .874-.874 2 2 0 0 0 .201-.77c.017-.208.017-.454.017-.706V5.162c0-.528 0-.982-.03-1.357-.033-.395-.104-.789-.297-1.167a3 3 0 0 0-1.311-1.311c-.378-.193-.772-.264-1.167-.296C16.82 1 16.365 1 15.839 1z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M8 5a1 1 0 0 0 0 2h2a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M14 5a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M14 9a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M13 14a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1Z"/><path fill={color || "currentColor"} d="M7 10a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z"/><path fill={color || "currentColor"} d="M8 13a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2z"/>
    </svg>
  );
}
