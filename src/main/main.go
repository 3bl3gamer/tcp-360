package main

import (
	//"geoip"
	//"nethack"
	"interface/http-es"

	log "github.com/Sirupsen/logrus"
)

func main() {
	log.SetLevel(log.DebugLevel)
	log.Info("Starting up...")

	// w := nethack.NewWorker()
	// ch := w.Channel
	// go w.Run()
	// for {
	// 	tmp := <-ch
	// 	log.WithField("packet", tmp).Info("Got packet")

	// 	geo, err := geoip.Lookup(tmp.DestIP)
	// 	if err != nil {
	// 		log.WithField("err", err).Error("Geo lookup error")
	// 	}
	// 	log.WithField("geo", geo).Info("Got geo info")
	// }

	ifaces := []string{"http-es"}
	for _, item := range ifaces {
		switch item {
		case "http-es":
			log.WithField("name", item).Info("Starting up interface")
			go httpES.Run()
		default:
			log.WithField("name", item).Error("Unknown interface")
		}
	}

	for {
		// block main thread so goroutines can work
	}
}
