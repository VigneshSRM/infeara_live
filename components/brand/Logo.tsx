import Image from "next/image";

type Props = {
  variant?: "dark" | "light";
  priority?: boolean;
  className?: string;
};

export function Logo({ variant = "light", priority = false, className = "" }: Props) {
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
      priority={priority}
      sizes="176px"
      className={`h-8 w-auto md:h-9 ${className}`}
    />
  );
}
