import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { LoaderCircle, Utensils } from "lucide-react"
import { useAuth } from "./contexts/AuthContext"
import AppRoutes from "./routes/AppRoutes"

function App() {
  const { isLoading } = useAuth()
  const shouldReduceMotion = useReducedMotion()

    return (
    <AnimatePresence initial={false}>
      {isLoading ? (
        <motion.div
          key="loading"
          className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background-base px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
        >
          <div className="relative flex size-16 items-center justify-center">
            <span className="absolute inset-0 rounded-2xl bg-brand-primary-soft" />
            <Utensils className="relative size-7 text-brand-primary-strong" aria-hidden="true" />
            <LoaderCircle
              className="absolute -bottom-2 -right-2 size-8 animate-spin rounded-full bg-background-base p-1.5 text-brand-primary motion-reduce:animate-none"
              aria-hidden="true"
            />
          </div>

          <div className="space-y-1.5 text-center">
            <p className="text-base font-semibold tracking-tight text-foreground">Foodie</p>
            <p className="text-sm text-muted-foreground">Đang tải dữ liệu, vui lòng chờ...</p>
          </div>

          <div className="h-1 w-40 overflow-hidden rounded-full bg-background-surface-hover" role="presentation">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-primary" />
          </div>
        </motion.div>
      ) : (
    <motion.div
          key="app"
          className="min-h-dvh"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.1 : 0.2, ease: [0.32, 0.72, 0, 1] }}
        >
          <AppRoutes />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
