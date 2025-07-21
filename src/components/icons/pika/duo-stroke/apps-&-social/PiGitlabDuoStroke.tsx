import React from 'react';

/**
 * PiGitlabDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiGitlabDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGitlabDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'gitlab icon',
  ...props
}: PiGitlabDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8.118 8.087-1.764-5.16a.62.62 0 0 0-1.18.002l-2.392 7.088c-.709 2.101-.053 4.43 1.642 5.83l6.27 5.18a2.05 2.05 0 0 0 2.615.003l6.257-5.14c1.7-1.398 2.361-3.73 1.653-5.835l-2.395-7.122a.62.62 0 0 0-1.179-.003l-1.763 5.157c-.145.425-.54.71-.982.71H9.1a1.04 1.04 0 0 1-.982-.71Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m20.796 8.797-1.972-5.864a.62.62 0 0 0-1.18-.003l-1.762 5.157c-.145.425-.54.71-.982.71H9.1c-.443 0-.837-.285-.983-.71l-1.763-5.16a.62.62 0 0 0-1.18.002l-1.98 5.868" fill="none"/>
    </svg>
  );
}
