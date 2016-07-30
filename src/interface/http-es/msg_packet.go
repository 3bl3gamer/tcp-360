package httpES

//go:generate ffjson $GOFILE

import (
	"core"
)

// ffjson: nodecoder
type MessagePacket struct {
	Event string `json:"event"`

	Latitude  string `json:"latitude"`
	Longitude string `json:"longitude"`
	Caption   string `json:"caption"`

	IP       string `json:"ip"`
	Port     uint64 `json:"port"`
	Protocol string `json:"protocol"`
	Size     uint64 `json:"size"`
}

func messagePacketFromCore(src core.Packet) MessagePacket {
	return MessagePacket{
		Event: "packet",

		Latitude:  src.Latitude,
		Longitude: src.Longitude,
		Caption:   src.Caption,

		IP:       src.IP,
		Port:     src.Port,
		Protocol: src.Protocol,
		Size:     src.Size,
	}
}
