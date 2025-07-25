import React from 'react';

/**
 * PiCameraRefreshDuoSolid icon from the duo-solid style in devices category.
 */
interface PiCameraRefreshDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCameraRefreshDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'camera-refresh icon',
  ...props
}: PiCameraRefreshDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M22 10.243v-.17c0-.99.001-1.726-.21-2.352a4 4 0 0 0-2.51-2.51c-.627-.212-1.363-.21-2.352-.21h-.171c-.115 0-.174 0-.217-.003h-.004l-.002-.003-.122-.18-1.105-1.657-.036-.055c-.134-.2-.301-.455-.536-.648a2 2 0 0 0-.689-.368c-.29-.089-.595-.088-.836-.087h-2.42c-.242 0-.546-.002-.837.087a2 2 0 0 0-.689.368c-.234.193-.402.447-.536.648l-.036.055-1.106 1.66q-.059.09-.12.177l-.003.003H7.46C7.418 5 7.36 5 7.246 5h-.17c-.978 0-1.706 0-2.326.206a4 4 0 0 0-2.529 2.528c-.206.62-.206 1.348-.205 2.326v5.181c0 .805 0 1.47.044 2.01.046.563.144 1.08.392 1.565A4 4 0 0 0 4.2 20.564c.485.247 1.002.346 1.564.392C6.305 21 6.97 21 7.774 21h8.468c.805 0 1.469 0 2.01-.044.562-.046 1.079-.145 1.564-.392a4 4 0 0 0 1.748-1.748c.247-.485.346-1.002.392-1.564.044-.54.044-1.206.044-2.01z" clipRule="evenodd" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.595 13.95c-.985-.43-1.636-.61-2.082-.464m0 0c-.554.181-.791.864-.961 2.19m.961-2.19a3.5 3.5 0 0 0 5.697 2.21m2.239-5.343c-.204 1.31-.456 1.986-1.005 2.16m0 0c-.45.142-1.099-.054-2.083-.514m2.083.514a3.5 3.5 0 0 0-2.195-2.774 3.5 3.5 0 0 0-3.493.557"/>
    </svg>
  );
}
