import React from 'react';

/**
 * PiGraphChartPyramidDuoStroke icon from the duo-stroke style in chart-&-graph category.
 */
interface PiGraphChartPyramidDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGraphChartPyramidDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'graph-chart-pyramid icon',
  ...props
}: PiGraphChartPyramidDuoStrokeProps): JSX.Element {
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
      <path fill="none" fillRule="evenodd" d="M14.194 4.335a2.478 2.478 0 0 0-4.39 0L7.68 8.262A.5.5 0 0 0 8.12 9h7.762a.5.5 0 0 0 .44-.738z" clipRule="evenodd"/><path fill="none" d="M17.505 11a.5.5 0 0 1 .44.262l1.624 3a.5.5 0 0 1-.44.738H4.869a.5.5 0 0 1-.44-.738l1.626-3a.5.5 0 0 1 .44-.262zm-14.7 6.262-.485.897c-.895 1.653.197 3.849 2.195 3.849h14.97c1.998 0 3.09-2.196 2.195-3.849l-.486-.897a.5.5 0 0 0-.44-.262H3.246a.5.5 0 0 0-.44.262Z" opacity=".28"/>
    </svg>
  );
}
