package core

type Packet struct {
	Latitude  string
	Longitude string
	Caption   string

	IP       string
	Port     uint64
	Protocol string
	Size     uint64
}
