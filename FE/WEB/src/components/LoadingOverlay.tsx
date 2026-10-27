import { useMemo } from "react"
import { ShoppingBag, Utensils } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

interface LoadingOverlayProps {
    message: string
}

function LoadingOverlay({ message }: LoadingOverlayProps) {
    const shouldReduceMotion = useReducedMotion()

    const characters = useMemo(() => {
        if (!message) {
            return []
        }

        if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
            const segmenter = new Intl.Segmenter("vi", { granularity: "grapheme" })

            return Array.from(segmenter.segment(message), (segment) => segment.segment)
        }

        return Array.from(message)
    }, [message])

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/75 p-4 backdrop-blur-sm"
            role="status"
            aria-live="polite"
            aria-label="Đang tải"
        >
            <div className="relative grid size-20 place-items-center" aria-hidden="true">
                <div className="absolute size-16 animate-spin rounded-full border-2 border-foreground/10 border-t-foreground motion-reduce:animate-none" />
                <motion.div
                    className="relative text-foreground"
                    animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ShoppingBag className="size-10" strokeWidth={1.7} />
                    <Utensils className="absolute -right-2 -top-1 size-4 bg-background" strokeWidth={1.8} />
                </motion.div>
            </div>
            <p className="text-sm font-medium text-foreground">
                {characters.map((character, index) => (
                    <motion.span
                        key={`${character}-${index}`}
                        className="inline-block"
                        animate={shouldReduceMotion ? undefined : { y: [0, -2, 0] }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: index * 0.04,
                            ease: "easeInOut",
                        }}
                    >
                        {character === " " ? "\u00A0" : character}
                    </motion.span>
                ))}
            </p>
        </div>
    )
}

export default LoadingOverlay
