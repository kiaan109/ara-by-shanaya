import React from "react";

type LogoSVGProps = React.ImgHTMLAttributes<HTMLImageElement>;

const LogoSVG = ({ alt = "ARA by Shanaya logo", ...props }: LogoSVGProps) => {
  return (
    <img
      src="/logo.jpg"
      alt={alt}
      {...props}
    />
  );
};

export default LogoSVG;
