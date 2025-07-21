import React from 'react';

/**
 * PiMedicinePillsCapsulesTabletsDuoSolid icon from the duo-solid style in medical category.
 */
interface PiMedicinePillsCapsulesTabletsDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMedicinePillsCapsulesTabletsDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'medicine-pills-capsules-tablets icon',
  ...props
}: PiMedicinePillsCapsulesTabletsDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M16.469 2.531a5.23 5.23 0 0 0-7.394 0L2.531 9.075a5.228 5.228 0 0 0 7.394 7.394l6.544-6.544a5.23 5.23 0 0 0 0-7.394Z"/><path fill={color || "currentColor"} d="M22.999 17.983a4.999 4.999 0 1 0-9.998.035A4.999 4.999 0 0 0 23 17.983Z"/></g><path fill={color || "currentColor"} d="M13.862 4.097a2.21 2.21 0 0 0-2.512.431L9.926 5.951a1 1 0 0 0 1.415 1.415l1.423-1.424a.21.21 0 0 1 .236-.04 1 1 0 0 0 .862-1.805Z"/><path fill={color || "currentColor"} d="M7.217 5.803a1 1 0 0 0-1.414 1.415l5.98 5.979a1 1 0 0 0 1.414-1.414z"/><path fill={color || "currentColor"} d="M22.002 18.986a1 1 0 1 0-.007-2l-7.998.028a1 1 0 1 0 .008 2z"/>
    </svg>
  );
}
