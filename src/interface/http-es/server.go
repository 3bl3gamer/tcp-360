package httpES

import (
	"core"

	//"time"

	log "github.com/Sirupsen/logrus"
	"github.com/gin-gonic/gin"
	"github.com/pquerna/ffjson/ffjson"
)

func sendMessage(w gin.ResponseWriter, x interface{}) (err error) {
	_, err = w.WriteString("data: ")
	if err != nil {
		return
	}

	err = ffjson.NewEncoder(w).Encode(x)
	if err != nil {
		return
	}

	_, err = w.WriteString("\n")
	if err != nil {
		return
	}

	w.Flush()
	return
}

func Run(cc *core.Core) {
	router := gin.Default()

	router.GET("/event-source", func(c *gin.Context) {
		c.Header("Content-Type", "text/event-stream; charset=utf-8")
		c.Header("Cache-Control", "no-cache")

		ch := cc.Subscribe()

		for {
			tmp := <-ch
			switch tmp.(type) {
			case core.Origin:
				err := sendMessage(c.Writer, messageInitFromCore(tmp.(core.Origin)))
				if err != nil {
					break
				}
			case core.Packet:
				err := sendMessage(c.Writer, messagePacketFromCore(tmp.(core.Packet)))
				if err != nil {
					break
				}
			default:
				log.Warn("Got unknown type from core")
			}
		}
	})

	router.GET("/", func(c *gin.Context) {
		c.Redirect(301, "/static/")
	})
	router.Static("/static", "static/")

	// By default it serves on :8080 unless a
	// PORT environment variable was defined.
	router.Run(":8740")
	// router.Run(":3000") for a hard coded port
}
