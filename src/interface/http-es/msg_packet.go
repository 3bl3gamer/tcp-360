package httpES

//go:generate ffjson $GOFILE

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
