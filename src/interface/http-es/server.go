package httpES

import (
	//"core"

	"time"

	log "github.com/Sirupsen/logrus"
	"github.com/gin-gonic/gin"
	"github.com/pquerna/ffjson/ffjson"
)

func sendMessage(w gin.ResponseWriter, x interface{}) {
	w.WriteString("data: ")
	err := ffjson.NewEncoder(w).Encode(x)
	if err != nil {
		log.WithField("err", err).Error("HTTP-ES error")
	}
	w.WriteString("\n")
	w.Flush()
}

func Run() {
	router := gin.Default()

	router.GET("/event-source", func(c *gin.Context) {
		c.Header("Content-Type", "text/event-stream; charset=utf-8")
		c.Header("Cache-Control", "no-cache")

		im := MessageInit{
			Event:     "init",
			IP:        "77.108.234.195",
			Caption:   "Penza, RU",
			Latitude:  "53.234971",
			Longitude: "44.995392",
		}

		pkt := MessagePacket{
			Event: "packet",

			Latitude:  "63.234971",
			Longitude: "54.995392",
			Caption:   "Moldova, US",

			IP:       "8.8.8.8",
			Port:     0,
			Protocol: "ICMP",
			Size:     64,
		}

		sendMessage(c.Writer, im)
		for {
			sendMessage(c.Writer, pkt)
			<-time.After(1 * time.Second)
		}
	})

	// By default it serves on :8080 unless a
	// PORT environment variable was defined.
	router.Run(":8740")
	// router.Run(":3000") for a hard coded port
}
