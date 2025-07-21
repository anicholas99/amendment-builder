import React from 'react';

/**
 * PiHomeDefaultDuoSolid icon from the duo-solid style in building category.
 */
interface PiHomeDefaultDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiHomeDefaultDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'home-default icon',
  ...props
}: PiHomeDefaultDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M13.49 2.23a5 5 0 0 0-2.98 0c-.61.19-1.136.525-1.68.963-.529.425-1.133.996-1.88 1.702L4.232 7.46c-.657.62-1.111 1.049-1.443 1.567a5 5 0 0 0-.642 1.488C2 11.113 2 11.737 2 12.64v3.84c0 .942 0 1.61.153 2.185a4.5 4.5 0 0 0 3.182 3.182C5.91 22 6.578 22 7.52 22h.214c.235 0 .523.002.784-.068a2 2 0 0 0 1.414-1.414c.07-.261.069-.549.068-.784V17c0-.503.003-.638.018-.735a1.5 1.5 0 0 1 1.247-1.247c.097-.015.232-.018.735-.018s.638.003.735.018a1.5 1.5 0 0 1 1.247 1.247c.015.097.018.232.018.735v2.734c0 .235-.002.523.068.784a2 2 0 0 0 1.414 1.414c.261.07.549.069.784.068h.214c.942 0 1.61 0 2.185-.153a4.5 4.5 0 0 0 3.182-3.182C22 18.09 22 17.422 22 16.48v-3.84c0-.903 0-1.527-.148-2.125a5 5 0 0 0-.642-1.488c-.332-.518-.786-.947-1.443-1.567l-2.716-2.565c-.748-.706-1.352-1.277-1.88-1.702-.545-.438-1.07-.773-1.68-.964Z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M12.894 4.138a3 3 0 0 0-1.788 0c-.273.086-.575.253-1.024.614-.458.369-1.005.884-1.79 1.625l-2.6 2.456c-.775.732-1.035.987-1.218 1.273a3 3 0 0 0-.385.893 1 1 0 1 1-1.94-.484 5 5 0 0 1 .64-1.488c.347-.54.827-.984 1.53-1.648l2.63-2.484c.748-.706 1.352-1.277 1.88-1.702.545-.438 1.071-.773 1.68-.964a5 5 0 0 1 2.982 0c.609.19 1.135.526 1.68.964.528.425 1.132.996 1.88 1.702l2.63 2.484.086.081c.657.62 1.111 1.049 1.443 1.567a5 5 0 0 1 .642 1.488A1 1 0 0 1 19.91 11a3 3 0 0 0-.385-.893c-.183-.286-.443-.54-1.218-1.273l-2.6-2.456c-.785-.741-1.332-1.256-1.79-1.625-.45-.361-.75-.528-1.024-.614Z" clipRule="evenodd"/>
    </svg>
  );
}
