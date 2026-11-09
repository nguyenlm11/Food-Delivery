import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "inline-flex h-5 shrink-0 items-center justify-center gap-1 rounded-full px-2 text-xs font-medium leading-none",
  {
    variants: {
      tone: {
        neutral: "bg-badge-neutral-bg text-badge-neutral-fg",
        brand: "bg-badge-brand-bg text-badge-brand-fg",
        success: "bg-badge-success-bg text-badge-success-fg",
        warning: "bg-badge-warning-bg text-badge-warning-fg",
        error: "bg-badge-error-bg text-badge-error-fg",
        info: "bg-badge-info-bg text-badge-info-fg",
        food: "bg-badge-food-bg text-badge-food-fg",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

function Badge({
  className,
  tone = "neutral",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
