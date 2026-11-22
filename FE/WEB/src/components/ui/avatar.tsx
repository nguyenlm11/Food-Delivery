import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cn } from "cn"

const AVATAR_TONES = [
    "bg-badge-brand-bg text-badge-brand-fg",
    "bg-badge-success-bg text-badge-success-fg",
    "bg-badge-warning-bg text-badge-warning-fg",
    "bg-badge-error-bg text-badge-error-fg",
    "bg-badge-info-bg text-badge-info-fg",
    "bg-badge-food-bg text-badge-food-fg",
    "bg-badge-neutral-bg text-badge-neutral-fg"
]

function getAvatarColor(name: string) {
    const hash = Array.from(name).reduce((total, char) => total + char.charCodeAt(0), 0)
    return AVATAR_TONES[hash % AVATAR_TONES.length]
}

function Avatar({
  className,
  size = "default",
  ...props
}: AvatarPrimitive.Root.Props & {
  size?: "default" | "sm" | "lg"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  name,
  ...props
}: AvatarPrimitive.Fallback.Props & { name?: string }) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full text-sm font-semibold group-data-[size=sm]/avatar:text-xs",
        name ? getAvatarColor(name) : "bg-muted text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
}
