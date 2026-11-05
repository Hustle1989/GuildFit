import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** URL-driven search + filter chips. Plain GET form, no client JS needed. */
export function FilterBar({
  basePath,
  q,
  paramName,
  active,
  options,
  placeholder,
}: {
  basePath: string;
  q?: string;
  paramName: string;
  active?: string;
  options: readonly string[];
  placeholder: string;
}) {
  const hrefFor = (value?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (value) params.set(paramName, value);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="mb-8 space-y-4">
      <form action={basePath} className="flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder={placeholder} className="h-10 pl-9" />
        </div>
        {active && <input type="hidden" name={paramName} value={active} />}
        <Button type="submit" className="h-10">Search</Button>
      </form>
      <div className="flex flex-wrap gap-2">
        {[undefined, ...options].map((option) => (
          <Link
            key={option ?? "all"}
            href={hrefFor(option)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm capitalize transition",
              active === option ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option ?? "All"}
          </Link>
        ))}
      </div>
    </div>
  );
}
