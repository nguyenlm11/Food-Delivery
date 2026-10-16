import { ShoppingBag, Utensils } from "lucide-react"
import { motion } from "framer-motion"

interface LoadingOverlayProps {
    message: string
}

function LoadingOverlay({ message }: LoadingOverlayProps) {
    return (
        <div
            className="fixed bottom-0 left-64 right-0 top-19 z-50 flex flex-col items-center justify-center bg-background/75 p-4 backdrop-blur-sm"
            role="status"
            aria-live="polite"
            aria-label="Đang tải"
        >
            <div className="relative grid size-20 place-items-center" aria-hidden="true">
                <div className="absolute size-16 animate-spin rounded-full border-2 border-foreground/10 border-t-foreground motion-reduce:animate-none" />
                <motion.div
                    className="relative text-foreground"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ShoppingBag className="size-10" strokeWidth={1.7} />
                    <Utensils className="absolute -right-2 -top-1 size-4 bg-background" strokeWidth={1.8} />
                </motion.div>
            </div>
            <p className="text-sm font-medium text-foreground">
                {message.split("").map((character, index) => (
                    <motion.span
                        key={index}
                        className="inline-block"
                        animate={{ y: [0, -2, 0] }}
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
