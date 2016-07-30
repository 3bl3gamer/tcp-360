package nethack

import (
	"errors"
	//"fmt"
	"regexp"
	"strconv"
)

var (
	ParseError error

	RegexpUDP  *regexp.Regexp
	RegexpICMP *regexp.Regexp
	RegexpTCP  *regexp.Regexp
)

func init() {
	ParseError = errors.New("Unrecognized line format")

	RegexpUDP = regexp.MustCompile(`^IP \d+[.]\d+[.]\d+[.]\d+[.]\d+ [>] (\d+[.]\d+[.]\d+[.]\d+)[.](\d+): UDP, length (\d+)$`)
	RegexpICMP = regexp.MustCompile(`^IP \d+[.]\d+[.]\d+[.]\d+ [>] (\d+[.]\d+[.]\d+[.]\d+): ICMP.*, length (\d+)$`)
	RegexpTCP = regexp.MustCompile(`^IP \d+[.]\d+[.]\d+[.]\d+[.]\d+ [>] (\d+[.]\d+[.]\d+[.]\d+)[.](\d+): tcp (\d+)$`)
}

// AnalyzeAlpha analyzes tcpdump output, assuming following commandline:
// tcpdump -q -n -t 'ip'
//
// Input examples:
// IP 192.168.1.210.52061 > 224.0.0.251.5353: UDP, length 49
// IP 192.168.1.29 > 8.8.8.8: ICMP echo request, id 16701, seq 18969, length 64
// IP 8.8.8.8 > 192.168.1.29: ICMP echo reply, id 16701, seq 18969, length 64
// IP 149.154.167.51.443 > 192.168.1.29.34586: tcp 89
// IP 192.168.1.29.34586 > 149.154.167.51.443: tcp 0
func AnalyzeAlpha(str string) (ret Packet, err error) {
	//fmt.Printf("Input: %s \n", str)
	var tmp []string

	// UDP
	tmp = RegexpUDP.FindStringSubmatch(str)
	if tmp != nil {
		//fmt.Printf("UDP matches: %v \n", tmp)
		ret.Protocol = "UDP"
		ret.DestIP = tmp[1]
		ret.DestPort, err = strconv.ParseUint(tmp[2], 10, 64)
		if err != nil {
			return ret, err
		}
		ret.Size, err = strconv.ParseUint(tmp[3], 10, 64)
		if err != nil {
			return ret, err
		}
		return
	}

	// ICMP
	tmp = RegexpICMP.FindStringSubmatch(str)
	if tmp != nil {
		//fmt.Printf("ICMP matches: %v \n", tmp)
		ret.Protocol = "ICMP"
		ret.DestIP = tmp[1]
		ret.Size, err = strconv.ParseUint(tmp[2], 10, 64)
		if err != nil {
			return ret, err
		}
		return
	}

	// TCP
	tmp = RegexpTCP.FindStringSubmatch(str)
	if tmp != nil {
		//fmt.Printf("TCP matches: %v \n", tmp)
		ret.Protocol = "TCP"
		ret.DestIP = tmp[1]
		ret.DestPort, err = strconv.ParseUint(tmp[2], 10, 64)
		if err != nil {
			return ret, err
		}
		ret.Size, err = strconv.ParseUint(tmp[3], 10, 64)
		if err != nil {
			return ret, err
		}
		return
	}

	return
}
