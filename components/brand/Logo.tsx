import Image from "next/image";

type Props = {
  variant?: "dark" | "light";
  preload?: boolean;
  className?: string;
  sizes?: string;
};

export function Logo({
  variant = "light",
  preload = false,
  className = "",
  sizes = "176px",
}: Props) {
  const src =
    variant === "light"
      ? "/brand/infeara-logo-light.png"
      : "/brand/infeara-logo.png";

  return (
    <Image
      src={src}
      alt="Infeara Technologies"
      width={1200}
      height={400}
      preload={preload}
      quality={90}
      sizes={sizes}
      className={`w-auto ${className || "h-8 md:h-9"}`}
    />
  );
}
