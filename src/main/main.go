package main

import (
	//"geoip"
	//"nethack"
	"core"
	"interface/http-es"

	log "github.com/Sirupsen/logrus"
)

func main() {
	log.SetLevel(log.DebugLevel)
	log.Info("Starting up")

	log.Info("Creating core")
	cc := core.New()

	log.Info("Setting up core interfaces")
	ifaces := []string{"http-es"}
	for _, item := range ifaces {
		switch item {
		case "http-es":
			log.WithField("name", item).Info("Starting up interface")
			go httpES.Run(cc)
		default:
			log.WithField("name", item).Error("Unknown interface")
		}
	}

	cc.Run()
}
