import { StatusBar } from "expo-status-bar"
import * as Location from "expo-location"
import { useRef, useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button
} from "react-native"
import { io, Socket } from "socket.io-client"

const API_URL = "http://192.168.2.5:8080"
const SOCKET_URL = API_URL

export default function App() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [accessToken, setAccessToken] = useState("")
  const [socket, setSocket] = useState<Socket | null>(null)

  const [socketStatus, setSocketStatus] = useState("Disconnected")
  const [tracking, setTracking] = useState(false)

  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)

  const [error, setError] = useState("")

  const locationStarted = useRef(false)
  const locationSubscription =
    useRef<Location.LocationSubscription | null>(null)

  // ==============================
  // START GPS TRACKING
  // ==============================
  const startTracking = async (currentSocket: Socket) => {
    try {
      setError("")

      if (!currentSocket.connected) {
        setError("Socket is not connected!")
        return
      }

      const { status } =
        await Location.requestForegroundPermissionsAsync()

      if (status !== "granted") {
        setError("Location permission denied!")
        return
      }

      if (locationStarted.current) {
        return
      }

      const subscription =
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10
          },
          (location) => {
            const {
              latitude,
              longitude,
              accuracy
            } = location.coords

            setLatitude(latitude)
            setLongitude(longitude)
            setAccuracy(accuracy ?? null)

            currentSocket.emit(
              "driver:location:update",
              {
                latitude,
                longitude,
                accuracy
              }
            )

            console.log(
              "Location sent:",
              {
                latitude,
                longitude,
                accuracy
              }
            )
          }
        )

      locationSubscription.current = subscription
      locationStarted.current = true
      setTracking(true)

      console.log("Foreground GPS tracking started")
    } catch (error) {
      console.error(error)
      setError("Failed to start GPS tracking!")
    }
  }

  // ==============================
  // STOP GPS TRACKING
  // ==============================
  const stopTracking = async () => {
    try {
      locationSubscription.current?.remove()

      locationSubscription.current = null
      locationStarted.current = false

      setTracking(false)

      console.log("GPS tracking stopped")
    } catch (error) {
      console.error(error)
      setError("Failed to stop GPS tracking!")
    }
  }

  // ==============================
  // CONNECT SOCKET
  // ==============================
  const connectSocket = (token: string) => {
    if (socket) {
      socket.disconnect()
    }

    const newSocket = io(SOCKET_URL, {
      auth: {
        token
      }
    })

    newSocket.on("connect", () => {
      setSocketStatus("Connected")

      console.log(
        "Socket connected:",
        newSocket.id
      )

      startTracking(newSocket)
    })

    newSocket.on("connect_error", (error) => {
      setSocketStatus("Connection Error")

      setError(error.message)

      console.log(
        "Socket error:",
        error.message
      )
    })

    newSocket.on("disconnect", (reason) => {
      setSocketStatus("Disconnected")

      console.log(
        "Socket disconnected:",
        reason
      )
    })

    setSocket(newSocket)
  }

  // ==============================
  // LOGIN
  // ==============================
  const handleLogin = async () => {
    try {
      setError("")

      if (!email || !password) {
        setError(
          "Email and password are required!"
        )
        return
      }

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      )

      const result = await response.json()

      if (!response.ok) {
        setError(
          result.message ||
          "Login failed!"
        )
        return
      }

      const token =
        result.data.accessToken

      setAccessToken(token)

      console.log(
        "Login successfully"
      )

      connectSocket(token)
    } catch (error) {
      console.error(error)

      setError(
        "Cannot connect to server!"
      )
    }
  }

  // ==============================
  // LOGOUT
  // ==============================
  const handleLogout = async () => {
    await stopTracking()

    if (socket) {
      socket.disconnect()
    }

    setSocket(null)
    setAccessToken("")

    setSocketStatus(
      "Disconnected"
    )

    setLatitude(null)
    setLongitude(null)
    setAccuracy(null)

    setError("")
  }

  // ==============================
  // UI
  // ==============================
  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Driver Mobile
      </Text>

      {!accessToken ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Login"
            onPress={handleLogin}
          />
        </>
      ) : (
        <>
          <Text>
            Socket: {socketStatus}
          </Text>

          <Text>
            Tracking:{" "}
            {tracking
              ? "Running"
              : "Stopped"}
          </Text>

          <Text>
            Latitude:{" "}
            {latitude ?? "-"}
          </Text>

          <Text>
            Longitude:{" "}
            {longitude ?? "-"}
          </Text>

          <Text>
            Accuracy:{" "}
            {accuracy ?? "-"}
          </Text>

          <View style={styles.button}>
            <Button
              title="Stop Tracking"
              onPress={stopTracking}
            />
          </View>

          <View style={styles.button}>
            <Button
              title="Logout"
              onPress={handleLogout}
            />
          </View>
        </>
      )}

      {error ? (
        <Text style={styles.error}>
          {error}
        </Text>
      ) : null}

      <StatusBar style="auto" />
    </View>
  )
}

// ==============================
// STYLES
// ==============================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center"
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5
  },

  button: {
    marginTop: 10
  },

  error: {
    color: "red",
    marginTop: 15
  }
})