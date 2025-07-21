import React from 'react';

/**
 * PiCryptoCurrencyEthereumDuoSolid icon from the duo-solid style in web3-&-crypto category.
 */
interface PiCryptoCurrencyEthereumDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCryptoCurrencyEthereumDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'crypto-currency-ethereum icon',
  ...props
}: PiCryptoCurrencyEthereumDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M7.761 14.275a14 14 0 0 0-.957-.245 2.5 2.5 0 0 0-.464-.052 1.4 1.4 0 0 0-.649.147 1.5 1.5 0 0 0-.805 1.245c-.015.287.075.521.147.668.074.15.169.285.253.395.16.21.387.462.637.74l.013.014 3.454 4.176.027.031.026.03c.295.328.558.62.796.842.252.237.547.463.925.594a2.57 2.57 0 0 0 1.674 0c.379-.13.673-.357.925-.594.238-.222.5-.514.796-.843l.026-.029q.015-.015.026-.03l3.467-4.177.013-.014c.25-.278.477-.53.637-.74.084-.11.178-.245.253-.395.072-.147.162-.38.146-.668a1.5 1.5 0 0 0-.804-1.245 1.4 1.4 0 0 0-.649-.147 2.5 2.5 0 0 0-.464.052c-.26.051-.59.143-.957.245l-3.394.943c-.447.124-.565.154-.677.166a1.6 1.6 0 0 1-.35 0c-.112-.012-.23-.042-.677-.166z" opacity=".28"/><path fill={color || "currentColor"} d="M12.879 1.155a2.57 2.57 0 0 0-1.758 0c-.4.145-.703.4-.96.662-.244.248-.513.575-.817.945L5.427 7.519c-.372.452-.693.843-.922 1.18-.234.344-.46.755-.498 1.247a2.46 2.46 0 0 0 .64 1.848c.328.36.755.551 1.153.686.39.133.887.253 1.465.394l3.565.867c.315.076.566.137.826.162q.345.033.688 0c.26-.025.51-.086.827-.162l3.564-.867c.578-.14 1.076-.261 1.465-.394.398-.135.825-.325 1.154-.686a2.46 2.46 0 0 0 .639-1.848c-.038-.492-.264-.903-.498-1.248-.229-.336-.55-.727-.922-1.179l-3.917-4.757a15 15 0 0 0-.816-.945c-.258-.262-.562-.517-.961-.662Z"/>
    </svg>
  );
}
