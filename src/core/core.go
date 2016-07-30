package core

import (
	"extip"
	"geoip"
	"nethack"

	log "github.com/Sirupsen/logrus"
)

type Core struct {
	originChannel chan Origin
	packetChannel chan Packet
	currentOrigin *Origin
}

type Origin struct {
	IP        string
	Latitude  string
	Longitude string
	Caption   string
}

type Packet struct {
	Latitude  string
	Longitude string
	Caption   string

	IP       string
	Port     uint64
	Protocol string
	Size     uint64
}

func New() (ret *Core) {
	ret = &Core{}
	ret.originChannel = make(chan Origin, 2)
	ret.packetChannel = make(chan Packet, 10)
	return
}

func (c *Core) RecastOrigin() {
	if c.currentOrigin != nil {
		c.originChannel <- *c.currentOrigin
	}
}

func (c *Core) OriginChannel() chan Origin {
	return c.originChannel
}

func (c *Core) PacketChannel() chan Packet {
	return c.packetChannel
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
	c.originChannel <- *c.currentOrigin

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
		c.packetChannel <- pp
	}
}
