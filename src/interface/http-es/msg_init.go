package httpES

//go:generate ffjson $GOFILE

// ffjson: nodecoder
type MessageInit struct {
	Event     string `json:"event"`
	IP        string `json:"ip"`
	Latitude  string `json:"latitude"`
	Longitude string `json:"longitude"`
	Caption   string `json:"caption"`
}
