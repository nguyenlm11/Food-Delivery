import LoadingOverlay from "./components/LoadingOverlay"
import { useAuth } from "./contexts/AuthContext"
import AppRoutes from "./routes/AppRoutes"

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <LoadingOverlay message={"Đang tải dữ liệu"} />
  }

  return <AppRoutes />
}

export default App