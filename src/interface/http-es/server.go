package httpES

import (
	//"core"

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
}

func Run() {
	router := gin.Default()

	router.GET("/event-source", func(c *gin.Context) {
		im := MessageInit{
			Event:     "init",
			IP:        "77.108.234.195",
			Caption:   "Penza, RU",
			Latitude:  "53.234971",
			Longitude: "44.995392",
		}

		sendMessage(c.Writer, im)
		sendMessage(c.Writer, im)
	})

	// By default it serves on :8080 unless a
	// PORT environment variable was defined.
	router.Run(":8740")
	// router.Run(":3000") for a hard coded port
}
