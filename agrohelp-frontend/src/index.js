// Dentro de ws.on('message', (message) => { ... })

if (data.type === "chat") {
  // Repassa a mensagem para todos da sala
  rooms[data.room].forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "chat",
          message: data.message,
          sender: data.sender,
          
        })
        
      );
    }
  });
}
