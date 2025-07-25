import React from 'react';

/**
 * PiSidebarNavigationBarDuoSolid icon from the duo-solid style in general category.
 */
interface PiSidebarNavigationBarDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSidebarNavigationBarDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'sidebar-navigation-bar icon',
  ...props
}: PiSidebarNavigationBarDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3.01v17.98" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M18.724 2.654c-.7-.356-1.463-.51-2.359-.583C15.491 2 14.407 2 13.044 2h-2.052c-.757 0-1.425 0-2.011.011-1.535.03-2.7.131-3.705.643a6 6 0 0 0-2.622 2.622c-.512 1.004-.613 2.17-.643 3.705C2 9.567 2 10.235 2 10.992v2.052c0 1.363 0 2.447.071 3.321.074.896.227 1.66.583 2.359a6 6 0 0 0 2.622 2.622c1.004.512 2.17.613 3.705.643.586.011 1.254.011 2.011.011h2.052c1.363 0 2.447 0 3.321-.071.896-.074 1.66-.227 2.359-.583a6 6 0 0 0 2.622-2.622c.356-.7.51-1.463.583-2.359.071-.874.071-1.958.071-3.321v-2.052c0-.757 0-1.425-.011-2.011-.03-1.535-.131-2.7-.643-3.705a6 6 0 0 0-2.622-2.622ZM19.999 10 20 11v2c0 1.417 0 2.419-.065 3.203-.063.771-.182 1.243-.371 1.613a4 4 0 0 1-1.748 1.748c-.37.189-.841.308-1.613.371C15.419 20 14.417 20 13 20h-2c-.766 0-1.415 0-1.98-.01-1.544-.03-2.284-.145-2.836-.426a4 4 0 0 1-1.748-1.748c-.189-.37-.308-.841-.371-1.613C4 15.419 4 14.417 4 13v-2l.001-1z" clipRule="evenodd"/>
    </svg>
  );
}
