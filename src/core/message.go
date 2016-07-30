package core

type Message struct {
	DestIP   string
	DestPort uint64
	Protocol string
	Size     uint64

	Latitude   string
	Longtitude string
	Caption    string
}
