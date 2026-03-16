interface LogoProps {
  size?: "sm" | "lg";
}

export function Logo({ size = "lg" }: LogoProps) {
  return (
    <h1
      className={`font-bold text-gradient ${
        size === "lg" ? "text-3xl" : "text-xl"
      }`}
    >
      Dayvoice
    </h1>
  );
}
