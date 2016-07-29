package nethack

import (
	"bufio"
	//"fmt"
	"os/exec"
	"strings"
)

type Worker struct {
	Channel chan Packet
}

func NewWorker() (ret *Worker) {
	ret = &Worker{}
	ret.Channel = make(chan Packet, 10)
	return
}

func (w *Worker) Run() {
	cmd := exec.Command("tcpdump", "-q", "-n", "-t", "-l", "ip")
	r, err := cmd.StdoutPipe()
	if err != nil {
		return
	}
	rr := bufio.NewReader(r)
	err = cmd.Start()
	if err != nil {
		return
	}

	var line string
	for {
		line, err = rr.ReadString('\n')
		if err != nil {
			return
		}
		line = strings.TrimSpace(line)
		//fmt.Printf("DUMP: %s\n", line)

		p, err := AnalyzeAlpha(line)
		if err == nil {
			//fmt.Printf("AN: %v\n", p)
			w.Channel <- p
		}
	}
}
