import React from 'react';

/**
 * PiGraduationHatContrast icon from the contrast style in general category.
 */
interface PiGraduationHatContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGraduationHatContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'graduation-hat icon',
  ...props
}: PiGraduationHatContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M9.096 3.957 3.032 6.95c-.578.285-.867.428-.965.621a.6.6 0 0 0-.01.534c.092.197.376.348.944.65L5 9.82v6.316c0 .338 0 .507.05.658a1 1 0 0 0 .209.361c.107.118.254.202.547.37l.637.364c2.026 1.157 3.038 1.736 4.114 1.963a7 7 0 0 0 2.886 0c1.076-.227 2.088-.806 4.114-1.963l.637-.364c.293-.168.44-.252.547-.37a1 1 0 0 0 .21-.36c.049-.152.049-.312.049-.65V9.82l1.999-1.065c.568-.303.852-.454.944-.65a.6.6 0 0 0-.01-.535c-.098-.193-.387-.336-.965-.621l-6.065-2.992c-1.062-.524-1.593-.786-2.153-.889a4.2 4.2 0 0 0-1.5 0c-.56.103-1.091.365-2.154.89Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9.82 1.999-1.065c.568-.303.852-.454.944-.65a.6.6 0 0 0-.01-.535c-.098-.193-.387-.336-.965-.621l-6.065-2.992c-1.062-.524-1.593-.786-2.153-.889a4.2 4.2 0 0 0-1.5 0c-.56.103-1.091.365-2.154.89l-6.064 2.99c-.578.286-.867.429-.965.622A.6.6 0 0 0 2 7.847M19 9.82l-3.919 2.087c-1.123.599-1.685.898-2.281 1.015a4.2 4.2 0 0 1-1.6 0c-.596-.117-1.157-.416-2.281-1.015L5 9.82m14 0v6.325c0 .338 0 .498-.05.65a1 1 0 0 1-.209.36c-.107.118-.254.202-.547.37l-.637.364c-2.026 1.157-3.038 1.736-4.114 1.963a7 7 0 0 1-2.886 0c-1.076-.227-2.088-.806-4.114-1.963l-.637-.364c-.293-.168-.44-.252-.547-.37a1 1 0 0 1-.21-.36C5 16.642 5 16.473 5 16.134V9.82m0 0L3.001 8.755c-.568-.303-.852-.454-.944-.65A.6.6 0 0 1 2 7.846m0 0V15" fill="none"/>
    </svg>
  );
}
