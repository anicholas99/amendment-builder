import React from 'react';

/**
 * PiUserShieldContrast icon from the contrast style in users category.
 */
interface PiUserShieldContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserShieldContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'user-shield icon',
  ...props
}: PiUserShieldContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="m14.807 15.135 2.306-.73c.233-.073.486-.073.719 0l2.338.74c.431.137.735.504.773.934l.04.453c.167 1.905-.904 3.714-2.705 4.57l-.284.134a1.19 1.19 0 0 1-1.037-.01l-.327-.163c-1.683-.841-2.705-2.527-2.626-4.331l.027-.618a1.09 1.09 0 0 1 .776-.979Z" fill="none" stroke="currentColor"/><path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" fill="none" stroke="currentColor"/><path d="M11.047 15H8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h5.91v-.505a7.45 7.45 0 0 1-.903-3.9l.027-.618q.018-.394.106-.762h-.093z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.047 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h2.16M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm1.113 7.406-2.306.73a1.09 1.09 0 0 0-.776.978l-.027.617c-.079 1.805.943 3.49 2.626 4.332l.327.163c.323.162.71.166 1.037.01l.284-.135c1.801-.855 2.872-2.664 2.705-4.57l-.04-.452a1.09 1.09 0 0 0-.773-.933l-2.338-.74a1.2 1.2 0 0 0-.719 0Z" fill="none"/>
    </svg>
  );
}
