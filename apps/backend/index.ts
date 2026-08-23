import express from "express"
import userRoutes from "./src/auth.ts"
import orgRoutes from "./src/org.ts"
import boardRoutes from "./src/board.ts"

const app = express()
app.use(express.json())

app.use("/api/v1", userRoutes)
app.use("/api/v1", orgRoutes)
app.use("/api/v1", boardRoutes)

app.listen(3000, () => console.log("server is running on port 3000"))

