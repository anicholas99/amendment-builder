import React from 'react';

/**
 * PiTvOldDuoSolid icon from the duo-solid style in appliances category.
 */
interface PiTvOldDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTvOldDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'tv-old icon',
  ...props
}: PiTvOldDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M18.446 2.908a1 1 0 1 0-.894-1.788l-5.548 2.774-5.431-2.77a1 1 0 0 0-.909 1.78l2.174 1.11h-.08c-.805 0-1.47 0-2.01.044-.563.046-1.08.145-1.565.392a4 4 0 0 0-1.747 1.748c-.247.485-.346 1.002-.391 1.564C2 8.302 2 8.968 2 9.772v6.484c0 .805 0 1.47.045 2.01.045.563.144 1.08.391 1.565a4 4 0 0 0 1.748 1.748c.486.247 1.002.346 1.565.392.54.044 1.205.044 2.01.044h8.483c.805 0 1.469 0 2.01-.044.562-.046 1.079-.145 1.564-.392a4 4 0 0 0 1.748-1.748c.248-.485.346-1.002.392-1.564.044-.541.044-1.206.044-2.01V9.772c0-.805 0-1.47-.044-2.01-.046-.563-.144-1.08-.392-1.565a4 4 0 0 0-1.748-1.748c-.485-.247-1.002-.346-1.564-.392-.541-.044-1.205-.044-2.01-.044h-.006l2.212-1.106z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M7.567 7.014h8.864c.253 0 .498 0 .707.017.228.019.498.063.77.2a2 2 0 0 1 .873.875c.139.27.183.54.201.77.017.208.017.454.017.706v3.864c0 .252 0 .498-.017.706a2 2 0 0 1-.2.77 2 2 0 0 1-.875.874 2 2 0 0 1-.77.2c-.208.018-.453.018-.706.018H7.567c-.252 0-.498 0-.706-.017a2 2 0 0 1-.77-.201 2 2 0 0 1-.874-.874 2 2 0 0 1-.2-.77c-.018-.208-.018-.454-.018-.706V9.582c0-.252 0-.498.017-.706a2 2 0 0 1 .201-.77 2 2 0 0 1 .874-.874 2 2 0 0 1 .77-.201c.208-.017.454-.017.706-.017Zm6.332 12a1.1 1.1 0 0 1 1.1-1.1h.01a1.1 1.1 0 1 1 0 2.2h-.01a1.1 1.1 0 0 1-1.1-1.1Zm3 0a1.1 1.1 0 0 1 1.1-1.1h.01a1.1 1.1 0 1 1 0 2.2h-.01a1.1 1.1 0 0 1-1.1-1.1Z" clipRule="evenodd"/>
    </svg>
  );
}
