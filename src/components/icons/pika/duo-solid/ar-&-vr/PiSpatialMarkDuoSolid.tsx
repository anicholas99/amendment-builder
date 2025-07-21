import React from 'react';

/**
 * PiSpatialMarkDuoSolid icon from the duo-solid style in ar-&-vr category.
 */
interface PiSpatialMarkDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSpatialMarkDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'spatial-mark icon',
  ...props
}: PiSpatialMarkDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M13.943 1.935a4 4 0 0 0-3.886 0l-6 3.334A4 4 0 0 0 2 8.765v6.47a4 4 0 0 0 2.057 3.496l6 3.334a4 4 0 0 0 3.886 0l6-3.334A4 4 0 0 0 22 15.235v-6.47a4 4 0 0 0-2.057-3.496z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="m22 14.85-5.399-3.117v8.855l-2 1.111v-5.998l-2.107 1.17-5.779 3.337-2.038-1.133 5.295-3.057-2.057-1.142-.014-.009L2 11.46V9.151l5.401 3.118V3.411l2-1.111v6.002l2.107-1.17 5.78-3.338 2.039 1.133-5.297 3.058 2.057 1.142.014.008L22 12.541zm-9.999-5.705 2.6 1.445v2.823l-2.6 1.444-2.6-1.444V10.59z" clipRule="evenodd"/>
    </svg>
  );
}
