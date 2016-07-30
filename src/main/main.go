package main

import (
	"geoip"
	"nethack"

	log "github.com/Sirupsen/logrus"
)

func main() {
	log.SetLevel(log.DebugLevel)
	log.Info("Starting up...")

	w := nethack.NewWorker()
	ch := w.Channel
	go w.Run()
	for {
		tmp := <-ch
		log.WithField("packet", tmp).Info("Got packet")

		geo, err := geoip.Lookup(tmp.DestIP)
		if err != nil {
			log.WithField("err", err).Error("Geo lookup error")
		}
		log.WithField("geo", geo).Info("Got geo info")
	}
}
