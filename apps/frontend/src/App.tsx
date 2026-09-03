

import { BrowserRouter, Route, Routes, useParams } from "react-router"
import { useEffect, useState } from "react";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/board/:boardId" element={<Board />}>
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function Board() {
  const { boardId } = useParams()
  const [users, setUsers] = useState([])
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3002')
    ws.onmessage = (ev) => {
      const parsedData = JSON.parse(ev.data)
      if (parsedData.type === "initial_state") {
        setUsers(parsedData.users)
      }

      if (parsedData.type === "join") {
        setUsers(u => [...u, { id: parsedData.userId }])
      }

      if (parsedData.type === "leave") {
        setUsers(u => u.filter(x => x.id != parsedData.userId))
      }
    }

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "join",
        boardId: boardId
      }))
    }
    
    // return () => {
    //   ws.close()
    // }
  }, []) 
  
  return <div>
    <h1>You're on board {boardId}</h1>
    currently alive users - {JSON.stringify(users)}
  </div>
}

export default App;
