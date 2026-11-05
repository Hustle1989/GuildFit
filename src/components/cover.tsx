import { Image } from "@imagekit/next";
import { cn } from "@/lib/utils";

/** An ImageKit-optimized image, or a branded gradient when there's no image yet. */
export function Cover({
  src,
  alt,
  className,
  sizes = "(min-width: 768px) 33vw, 100vw",
  priority,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {src ? (
        <Image
          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,oklch(0.9_0.21_125/0.35),transparent_55%),linear-gradient(135deg,oklch(0.22_0.01_260),oklch(0.16_0.01_260))]">
          <span className="text-3xl font-black tracking-tight text-foreground/30">
            {alt.slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
