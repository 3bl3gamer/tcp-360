package httpES

//go:generate ffjson $GOFILE

import (
	"core"
)

// ffjson: nodecoder
type MessageInit struct {
	Event string `json:"event"`

	IP        string `json:"ip"`
	Latitude  string `json:"latitude"`
	Longitude string `json:"longitude"`
	Caption   string `json:"caption"`
}

func messageInitFromCore(src core.Origin) MessageInit {
	return MessageInit{
		Event: "init",

		IP:        src.IP,
		Latitude:  src.Latitude,
		Longitude: src.Longitude,
		Caption:   src.Caption,
	}
}
