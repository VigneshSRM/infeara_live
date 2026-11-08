import Image from "next/image";

type Props = {
  variant?: "dark" | "light";
  preload?: boolean;
  cropped?: boolean;
  className?: string;
  sizes?: string;
};

export function Logo({
  variant = "light",
  preload = false,
  cropped = false,
  className = "",
  sizes = "176px",
}: Props) {
  const src =
    variant === "light"
      ? "/brand/infeara-logo-light.png"
      : "/brand/infeara-logo.png";

  if (cropped) {
    const croppedSrc = variant === "light"
      ? "/brand/infeara-logo-light-cropped.png"
      : "/brand/infeara-logo-cropped.png";

    return (
      <span className={`flex h-9 w-40 items-center md:h-11 md:w-44 ${className}`}>
        <Image
          src={croppedSrc}
          alt="Infeara Technologies"
          width={1123}
          height={163}
          preload={preload}
          loading={preload ? "eager" : undefined}
          quality={90}
          sizes={sizes}
          className="block h-auto w-full"
        />
      </span>
    );
  }

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
