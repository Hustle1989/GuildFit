import Image from "next/image";
import { Logo } from "@/components/site/logo";
import { Stars, UserAvatar } from "@/components/shared";
import { testimonials } from "@/lib/mock-data";
import { photo } from "@/lib/utils";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = testimonials[1];
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-4 py-8 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">{children}</div>
      </div>

      <div className="dark relative hidden overflow-hidden text-foreground lg:block">
        <Image src={photo("1517836357463-d25dfeac3438", 1600)} alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
        <p className="font-script absolute right-12 top-16 -rotate-6 text-right text-5xl text-primary">
          Show up.
          <br />
          Get stronger.
        </p>
        <figure className="absolute inset-x-12 bottom-12 rounded-2xl border border-border bg-background/70 p-6 backdrop-blur-md">
          <Stars />
          <blockquote className="mt-3 text-lg font-medium leading-relaxed">“{t.quote}”</blockquote>
          <figcaption className="mt-4 flex items-center gap-3">
            <UserAvatar src={t.image} name={t.name} size={40} />
            <span>
              <span className="block font-semibold">{t.name}</span>
              <span className="text-sm text-muted-foreground">{t.result}</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
