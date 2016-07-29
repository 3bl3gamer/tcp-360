package nethack

type Packet struct {
	DestIP   string
	DestPort uint64
	Protocol string
	Size     uint64
}
