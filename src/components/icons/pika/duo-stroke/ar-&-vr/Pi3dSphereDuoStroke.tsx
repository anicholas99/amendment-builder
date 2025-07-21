import React from 'react';

/**
 * Pi3dSphereDuoStroke icon from the duo-stroke style in ar-&-vr category.
 */
interface Pi3dSphereDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function Pi3dSphereDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = '3d-sphere icon',
  ...props
}: Pi3dSphereDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.142 12.39c-3.803 1.492-8.033 1.884-12.082 1.461m0 0c-2.273-.237-4.376-.745-6.202-1.46m6.202 1.46c.171 2.647.706 5.097 1.513 7.188M9.06 13.851c-.238-3.67.185-7.448 1.513-10.89" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.85 12a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.142 12.39c-3.803 1.492-8.033 1.884-12.082 1.461m0 0c-2.273-.237-4.376-.745-6.202-1.46m6.202 1.46c.171 2.647.706 5.097 1.513 7.188M9.06 13.851c-.238-3.67.185-7.448 1.513-10.89" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.85 12a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z" opacity=".28" fill="none"/>
    </svg>
  );
}
