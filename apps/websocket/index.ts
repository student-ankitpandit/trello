import type { WebSocket } from "ws"
import { WebSocketServer } from "ws"

const wss = new WebSocketServer({ port: 3002 })

const BOARDS: Record<string, { userId: string, socket: WebSocket }[]> = {
  
}

wss.on("connection", (socket) => {
  socket.on("message", (data) => {
    const parsedData = JSON.parse(data.toString())
    
    if (parsedData.type === "join") {
      const boardId = parsedData.boardId
      if (!BOARDS[boardId]) {
        BOARDS[boardId] = []
      }
      
      const newUserId = Math.random().toString()
      
      for (let i = 0; i < BOARDS[boardId].length; i++) {
        const user = BOARDS[boardId][i]
        user?.socket.send(JSON.stringify({
          type: "join",
          userId: newUserId
        }))
      }
      
      BOARDS[boardId].push({ userId: newUserId, socket: socket })

      //broadcast to all other connected/alive user on the ws sever except itself
      socket.send(JSON.stringify({
        type: "initial_state",
        users: BOARDS[boardId].filter((u) => u.userId != newUserId).map((u) => ({ id: u.userId }))
      }))
    }

    socket.on("close", () => {
      Object.entries(BOARDS).forEach(([boardId, users]) => {
        const userExists = users.find(u => u.socket == socket)
        if (userExists) {
          //removing the user from the board
          BOARDS[boardId] = users.filter(x => x.socket != socket)
          users.forEach(({ socket }) => {
            socket.send(JSON.stringify({
              type: "leave",
              userId: userExists.userId
            }))
          })
        }
      })  
    })
  })
})