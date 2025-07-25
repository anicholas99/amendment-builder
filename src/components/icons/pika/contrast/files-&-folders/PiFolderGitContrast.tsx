import React from 'react';

/**
 * PiFolderGitContrast icon from the contrast style in files-&-folders category.
 */
interface PiFolderGitContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFolderGitContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'folder-git icon',
  ...props
}: PiFolderGitContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M8.806 2c.377 0 .758-.001 1.118.108a2.5 2.5 0 0 1 .86.46c.291.24.502.557.71.871l.05.075.576.863c.295.442.335.485.365.51a.5.5 0 0 0 .173.092c.037.011.095.021.626.021h2.359c1.084 0 1.958 0 2.666.058.729.06 1.369.185 1.961.487a5 5 0 0 1 2.185 2.185c.302.593.428 1.233.487 1.962.058.707.058 1.582.058 2.665V13.4c0 .659-.785 1.067-1.41.858A5 5 0 0 0 20 14a4.98 4.98 0 0 0-2.998.999A5 5 0 1 0 10 16v5a1 1 0 0 1-1 1h-.644c-1.084 0-1.958 0-2.666-.059-.728-.06-1.369-.185-1.961-.487a5 5 0 0 1-2.185-2.185c-.302-.592-.428-1.232-.487-1.961C1 16.6 1 15.727 1 14.643V9.357c0-1.083 0-1.958.058-2.665.06-.73.185-1.37.487-1.962A5 5 0 0 1 3.73 2.545c.592-.302 1.233-.427 1.961-.487C6.4 2 7.273 2 8.357 2z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 13.338V12.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C18.96 6 17.84 6 15.6 6h-2.316c-.47 0-.704 0-.917-.065a1.5 1.5 0 0 1-.517-.276c-.172-.142-.302-.337-.562-.728l-.575-.862c-.261-.391-.391-.586-.563-.728a1.5 1.5 0 0 0-.517-.276C9.42 3 9.185 3 8.716 3H8.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C2 6.04 2 7.16 2 9.4v5.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C5.04 21 6.16 21 8.4 21H9m4-7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0c0 2.8 2.2 5 5 5m-5-5v8m5-3a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" fill="none"/>
    </svg>
  );
}
