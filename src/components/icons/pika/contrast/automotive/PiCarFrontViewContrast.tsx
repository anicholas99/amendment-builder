import React from 'react';

/**
 * PiCarFrontViewContrast icon from the contrast style in automotive category.
 */
interface PiCarFrontViewContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCarFrontViewContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'car-front-view icon',
  ...props
}: PiCarFrontViewContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M21.95 10.812c.05.268.05.547.05 1.104V19a2 2 0 1 1-4 0v-1c-4 0-8 .026-12-.002V19a2 2 0 1 1-4 0v-7.084c0-.557 0-.836.05-1.104q.043-.235.122-.46C4.998 10.762 8.374 11 12 11s7.002-.239 9.828-.648q.08.225.123.46Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.828 10.352c-2.826.41-6.202.648-9.828.648s-7.002-.238-9.828-.648m19.656 0q.08.225.123.46c.049.269.049.547.049 1.104V19a2 2 0 1 1-4 0v-1c-4 0-8 .026-12-.002V19a2 2 0 1 1-4 0v-7.084c0-.557 0-.835.05-1.104q.043-.235.122-.46m19.656 0a3 3 0 0 0-.093-.232c-.113-.25-.271-.478-.588-.936l-1.465-2.116c-.524-.757-.786-1.135-1.128-1.409a3 3 0 0 0-1.02-.534C17.117 5 16.656 5 15.736 5h-7.47c-.92 0-1.38 0-1.8.125a3 3 0 0 0-1.02.534c-.34.274-.603.652-1.127 1.409L2.853 9.184c-.317.458-.475.687-.588.936a3 3 0 0 0-.093.232m19.656 0q.603-.088 1.172-.186m-20.828.186Q1.57 10.264 1 10.166m17 3.606q-.494.04-1 .071m-10 0a70 70 0 0 1-1-.07" fill="none"/>
    </svg>
  );
}
