import React from 'react';

/**
 * PiMedicalFacemaskDuoSolid icon from the duo-solid style in medical category.
 */
interface PiMedicalFacemaskDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMedicalFacemaskDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'medical-facemask icon',
  ...props
}: PiMedicalFacemaskDuoSolidProps): JSX.Element {
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
      <g fill={color || "currentColor"} clipPath="url(#icon-6ikqdcox3-a)"><path fill={color || "currentColor"} fillRule="evenodd" d="M13.994 3.582a17 17 0 0 0-3.987 0c-1.377.163-2.726.536-4.07.862-.608.147-1.138.275-1.572.557A3 3 0 0 0 3.17 6.52a2.6 2.6 0 0 0-.117.48 3.6 3.6 0 0 0-.646.057A3 3 0 0 0 .06 9.406C0 9.702 0 10.035 0 10.42c0 .35-.011.702.035 1.05a4 4 0 0 0 1.512 2.632c.21.163.447.301.763.485l.792.462a4 4 0 0 0 1.1 1.963c.375.366.834.636 1.27.92 1.551 1.013 2.474 1.615 3.446 1.97a9 9 0 0 0 6.164 0c.972-.355 1.895-.957 3.446-1.97.436-.284.895-.553 1.27-.92a4 4 0 0 0 1.1-1.963l.792-.462c.316-.184.553-.322.763-.485a4 4 0 0 0 1.512-2.633c.046-.347.035-.7.035-1.049 0-.385 0-.718-.06-1.015a3 3 0 0 0-2.347-2.347A3.6 3.6 0 0 0 20.947 7a2.6 2.6 0 0 0-.116-.48A3 3 0 0 0 19.635 5c-.433-.282-.964-.41-1.57-.557-1.346-.326-2.694-.7-4.072-.862ZM2.803 9.018c.038-.007.086-.012.197-.015v3.669a2 2 0 0 1-.226-.15 2 2 0 0 1-.756-1.316c-.016-.116-.018-.25-.018-.7 0-.52.005-.632.02-.705a1 1 0 0 1 .783-.783ZM21 12.672v-3.67c.111.004.16.009.198.016a1 1 0 0 1 .783.783c.014.073.02.185.02.705 0 .45-.003.584-.018.7A2.03 2.03 0 0 1 21 12.672Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M7.8 9a1 1 0 1 0 0 2h8.4a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M9.188 13a1 1 0 1 0 0 2h5.6a1 1 0 1 0 0-2z"/></g><defs><clipPath id="icon-6ikqdcox3-a"><path fill={color || "currentColor"} d="M0 0h24v24H0z"/></clipPath></defs>
    </svg>
  );
}
