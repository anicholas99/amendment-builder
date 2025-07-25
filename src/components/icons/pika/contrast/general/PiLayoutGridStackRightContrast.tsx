import React from 'react';

/**
 * PiLayoutGridStackRightContrast icon from the contrast style in general category.
 */
interface PiLayoutGridStackRightContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLayoutGridStackRightContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'layout-grid-stack-right icon',
  ...props
}: PiLayoutGridStackRightContrastProps): JSX.Element {
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
      <g opacity=".28"><path fill="currentColor" d="M21 6.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C19.48 3 18.92 3 17.8 3h-.6c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C14 4.52 14 5.08 14 6.2v11.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C15.52 21 16.08 21 17.2 21h.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C21 19.48 21 18.92 21 17.8z" stroke="currentColor"/><path fill="currentColor" d="M10 5.5c0-.465 0-.697-.038-.89A2 2 0 0 0 8.39 3.038C8.197 3 7.965 3 7.5 3h-2c-.465 0-.697 0-.89.038A2 2 0 0 0 3.038 4.61C3 4.803 3 5.035 3 5.5s0 .697.038.89A2 2 0 0 0 4.61 7.962C4.803 8 5.035 8 5.5 8h2c.465 0 .697 0 .89-.038A2 2 0 0 0 9.962 6.39C10 6.197 10 5.965 10 5.5Z" stroke="currentColor"/><path fill="currentColor" d="M10 15.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C8.48 12 7.92 12 6.8 12h-.6c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C3 13.52 3 14.08 3 15.2v2.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C4.52 21 5.08 21 6.2 21h.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C10 19.48 10 18.92 10 17.8z" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 6.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C19.48 3 18.92 3 17.8 3h-.6c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C14 4.52 14 5.08 14 6.2v11.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C15.52 21 16.08 21 17.2 21h.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C21 19.48 21 18.92 21 17.8z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 5.5c0-.465 0-.697-.038-.89A2 2 0 0 0 8.39 3.038C8.197 3 7.965 3 7.5 3h-2c-.465 0-.697 0-.89.038A2 2 0 0 0 3.038 4.61C3 4.803 3 5.035 3 5.5s0 .697.038.89A2 2 0 0 0 4.61 7.962C4.803 8 5.035 8 5.5 8h2c.465 0 .697 0 .89-.038A2 2 0 0 0 9.962 6.39C10 6.197 10 5.965 10 5.5Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 15.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C8.48 12 7.92 12 6.8 12h-.6c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C3 13.52 3 14.08 3 15.2v2.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C4.52 21 5.08 21 6.2 21h.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C10 19.48 10 18.92 10 17.8z" fill="none"/>
    </svg>
  );
}
