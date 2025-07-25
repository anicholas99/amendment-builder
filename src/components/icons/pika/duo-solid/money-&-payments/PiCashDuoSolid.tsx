import React from 'react';

/**
 * PiCashDuoSolid icon from the duo-solid style in money-&-payments category.
 */
interface PiCashDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCashDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'cash icon',
  ...props
}: PiCashDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 8.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C3.52 5 4.08 5 5.2 5h13.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C22 6.52 22 7.08 22 8.2v7.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C20.48 19 19.92 19 18.8 19H5.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C2 17.48 2 16.92 2 15.8z" opacity=".28"/><path fill={color || "currentColor"} d="M5.161 4c-.527 0-.981 0-1.356.03-.395.033-.789.104-1.167.297a3 3 0 0 0-1.311 1.311c-.193.378-.264.772-.296 1.167C1 7.18 1 7.635 1 8.161V9a1 1 0 0 0 1 1h.839c.527 0 .981 0 1.356-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.311c.193-.378.264-.772.296-1.167C7 6.82 7 6.365 7 5.839V5a1 1 0 0 0-1-1z"/><path fill={color || "currentColor"} d="M21.362 4.327c-.378-.193-.772-.264-1.167-.296A18 18 0 0 0 18.839 4H18a1 1 0 0 0-1 1v.839c0 .527 0 .981.03 1.356.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.296.375.031.83.031 1.357.031H22a1 1 0 0 0 1-1v-.839c0-.527 0-.981-.03-1.356-.033-.395-.104-.789-.297-1.167a3 3 0 0 0-1.311-1.311Z"/><path fill={color || "currentColor"} d="M5.362 14.327c-.378-.193-.772-.264-1.167-.296C3.82 14 3.365 14 2.839 14H2a1 1 0 0 0-1 1v.838c0 .528 0 .982.03 1.357.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.296.375.031.83.031 1.356.031H6a1 1 0 0 0 1-1v-.838c0-.528 0-.982-.03-1.357-.033-.395-.104-.789-.297-1.167a3 3 0 0 0-1.311-1.311Z"/><path fill={color || "currentColor"} d="M21.162 14c-.528 0-.982 0-1.357.03-.395.033-.789.104-1.167.297a3 3 0 0 0-1.311 1.311c-.193.378-.264.772-.296 1.167-.031.375-.031.83-.031 1.357V19a1 1 0 0 0 1 1h.838c.528 0 .982 0 1.357-.03.395-.033.789-.104 1.167-.297a3 3 0 0 0 1.311-1.311c.193-.378.264-.772.296-1.167.031-.375.031-.83.031-1.356V15a1 1 0 0 0-1-1z"/><path fill={color || "currentColor"} d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>
    </svg>
  );
}
