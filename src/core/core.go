package core

import (
	"extip"
	"geoip"
	"nethack"

	log "github.com/Sirupsen/logrus"
)

type Core struct {
	currentOrigin *Origin
	subs          map[chan interface{}]interface{}
}

func New() (ret *Core) {
	ret = &Core{}
	ret.subs = make(map[chan interface{}]interface{})
	return
}

func (c *Core) broadcast(x interface{}) {
	for ch, _ := range c.subs {
		ch <- x
	}
}

func (c *Core) Subscribe() (ret chan interface{}) {
	// make new channel
	ret = make(chan interface{}, 10)
	c.subs[ret] = nil
	// recast origin so they can know it
	if c.currentOrigin != nil {
		c.broadcast(*c.currentOrigin)
	}
	return
}

func (c *Core) Run() {
	ip, err := extip.GetExternalIP()
	if err != nil {
		return
	}

	lr, err := geoip.Lookup(ip)
	if err != nil {
		return
	}

	c.currentOrigin = &Origin{
		IP:        ip,
		Caption:   lr.Caption,
		Latitude:  lr.Latitude,
		Longitude: lr.Longitude,
	}
	log.WithField("origin", c.currentOrigin).Info("New origin")
	c.broadcast(*c.currentOrigin)

	w := nethack.NewWorker()
	ch := w.Channel
	go w.Run()
	for {
		pkt := <-ch
		//log.WithField("packet", pkt).Info("Got packet")

		geo, err := geoip.Lookup(pkt.DestIP)
		if err != nil {
			log.WithField("err", err).Error("Geo lookup error")
			continue
		}
		//log.WithField("geo", geo).Info("Got geo info")

		pp := Packet{
			Latitude:  geo.Latitude,
			Longitude: geo.Longitude,
			Caption:   geo.Caption,

			IP:       pkt.DestIP,
			Port:     pkt.DestPort,
			Protocol: pkt.Protocol,
			Size:     pkt.Size,
		}
		log.WithField("pp", pp).Info("Packet")
		c.broadcast(pp)
	}
}
