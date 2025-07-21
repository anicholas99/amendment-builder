import React from 'react';

/**
 * PiCarFrontViewBoltDuoSolid icon from the duo-solid style in automotive category.
 */
interface PiCarFrontViewBoltDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCarFrontViewBoltDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'car-front-view-bolt icon',
  ...props
}: PiCarFrontViewBoltDuoSolidProps): JSX.Element {
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
      <g clipPath="url(#icon-c3vyb8z56-a)"><path fill={color || "currentColor"} d="M8.136 4c-.794 0-1.394 0-1.956.167a4 4 0 0 0-1.36.712c-.457.367-.798.86-1.25 1.514L1.988 8.678a14 14 0 0 0-.386.575l-.433-.072a1 1 0 0 0-.338 1.971l.178.03C1 11.381 1 11.595 1 11.84V19a3 3 0 0 0 6 .004c2.364.012 4.73.007 7.093.002L17 19a3 3 0 0 0 6 0v-7.162c0-.244 0-.458-.008-.657l.177-.03a1 1 0 0 0-.338-1.971l-.433.072a14 14 0 0 0-.386-.575L20.43 6.393c-.452-.654-.793-1.147-1.25-1.514a4 4 0 0 0-1.36-.712C17.258 3.999 16.66 4 15.864 4z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12 8-2.154 3.5h4.307L12 15"/></g><defs><clipPath id="icon-c3vyb8z56-a"><path fill={color || "currentColor"} d="M0 0h24v24H0z"/></clipPath></defs>
    </svg>
  );
}
