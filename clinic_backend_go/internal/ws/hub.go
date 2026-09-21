package ws

import (
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Hub struct {
	clients   map[*websocket.Conn]bool
	broadcast chan interface{}
	mutex     sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		clients:   make(map[*websocket.Conn]bool),
		broadcast: make(chan interface{}),
	}
}

func (h *Hub) Run() {
	for {
		msg := <-h.broadcast
		h.mutex.Lock()
		for client := range h.clients {
			if err := client.WriteJSON(msg); err != nil {
				log.Println("Gagal kirim pesan WS:", err)
				client.Close()
				delete(h.clients, client)
			}
		}
		h.mutex.Unlock()
	}
}
func (h *Hub) BroadcastQueue(payload interface{}) {
	h.broadcast <- map[string]interface{}{
		"event": "QUEUE_UPDATED",
		"data":  payload,
	}
}

func (h *Hub) HandleWS(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Gagal upgrade koneksi WebSocket:", err)
		return
	}

	h.mutex.Lock()
	h.clients[conn] = true
	h.mutex.Unlock()

	log.Printf("Client WebSocket terhubung: %s (Total aktif: %d)", conn.RemoteAddr(), len(h.clients))

	// Reader pump untuk menjaga koneksi dan mendeteksi client disconnect
	go func() {
		defer func() {
			h.mutex.Lock()
			delete(h.clients, conn)
			h.mutex.Unlock()
			conn.Close()
			log.Printf("Client WebSocket terputus: %s", conn.RemoteAddr())
		}()

		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				break
			}
		}
	}()
}
