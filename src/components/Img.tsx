import type { CSSProperties, ImgHTMLAttributes } from "react";

type ImgProps = {
  src: string;
  alt?: string;
  style?: CSSProperties;
  radius?: number;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "style" | "src" | "alt">;

export function Img({ src, alt = "", style, radius, ...rest }: ImgProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        borderRadius: radius,
        ...style,
      }}
      {...rest}
    />
  );
}
