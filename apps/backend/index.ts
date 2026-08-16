import express from "express"
import { prisma } from "db/client"

const app = express()

app.post("/signup", (req, res) => {
  
})



app.listen(3000, () => console.log("server is running on port 3000"))

