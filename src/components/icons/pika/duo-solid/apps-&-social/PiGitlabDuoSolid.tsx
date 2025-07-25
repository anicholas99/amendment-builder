import React from 'react';

/**
 * PiGitlabDuoSolid icon from the duo-solid style in apps-&-social category.
 */
interface PiGitlabDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGitlabDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'gitlab icon',
  ...props
}: PiGitlabDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M7.3 2.603c-.504-1.474-2.575-1.47-3.073.006L1.835 9.697c-.84 2.49-.067 5.254 1.952 6.922l6.27 5.179a3.05 3.05 0 0 0 3.887.005l6.257-5.14c2.025-1.665 2.805-4.432 1.966-6.927l-2.395-7.122c-.496-1.477-2.57-1.483-3.073-.008l-1.763 5.157c-.01.03-.03.034-.036.034H9.1c-.006 0-.026-.004-.036-.034z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m20.796 8.797-1.972-5.864a.62.62 0 0 0-1.18-.003l-1.762 5.157c-.145.425-.54.71-.982.71H9.1c-.443 0-.837-.285-.983-.71l-1.763-5.16a.62.62 0 0 0-1.18.002l-1.98 5.868"/>
    </svg>
  );
}
