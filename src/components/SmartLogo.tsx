import React from 'react';

interface SmartLogoProps {
  baseName: 'logo-indo-teknik' | 'logo-itech' | 'icon-it';
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SmartLogo: React.FC<SmartLogoProps> = ({ baseName, alt, className, style }) => {
  const logoMap = {
    'logo-indo-teknik': '/Logo Indoteknik.png',
    'logo-itech': '/Logo ITech background White.png',
    'icon-it': '/Logo Indoteknik.png',
  };

  const src = logoMap[baseName];

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
    />
  );
};
