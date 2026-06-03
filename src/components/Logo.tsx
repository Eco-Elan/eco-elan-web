type LogoProps = { light?: boolean; size?: number };

export function Logo({ light = false, size = 38 }: LogoProps) {
  return (
    <img
      src="/assets/logo.svg"
      alt="Eco Elan"
      style={{
        height: size * 1.4,
        width: "auto",
        display: "block",
        filter: light ? "brightness(0) invert(1)" : "none",
      }}
    />
  );
}
