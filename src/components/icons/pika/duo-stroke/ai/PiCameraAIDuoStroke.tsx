import React from 'react';

/**
 * PiCameraAIDuoStroke icon from the duo-stroke style in ai category.
 */
interface PiCameraAIDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCameraAIDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'camera-ai icon',
  ...props
}: PiCameraAIDuoStrokeProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} strokeLinejoin="round" strokeWidth="2" d="M16.757 6.417c1.157 0 1.735 0 2.202.158a3 3 0 0 1 1.884 1.883C21 8.925 21 9.503 21 10.66v4.957c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311c-.642.327-1.482.327-3.162.327H7.816c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.31c-.327-.643-.327-1.483-.327-3.163v-4.97c0-1.145 0-1.717.154-2.18a3 3 0 0 1 1.896-1.896c.462-.154 1.035-.154 2.18-.154.213 0 .32 0 .419-.02a1 1 0 0 0 .504-.27c.072-.071.131-.16.25-.338l1.106-1.66c.174-.26.26-.39.375-.484a1 1 0 0 1 .345-.184c.142-.044.298-.044.611-.044h2.288c.313 0 .47 0 .611.044a1 1 0 0 1 .345.184c.114.094.201.224.375.485l1.105 1.657c.12.18.18.27.252.342a1 1 0 0 0 .5.267c.101.021.209.021.425.021Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.466 16.604h.01m3.99-7c-.637 1.616-1.339 2.345-3 3 1.661.655 2.363 1.383 3 3 .638-1.617 1.34-2.345 3-3-1.66-.655-2.362-1.384-3-3Z" fill="none"/>
    </svg>
  );
}
