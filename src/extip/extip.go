package extip

import (
	"bufio"
	"net/http"
)

func GetExternalIP() (ret string, err error) {
	resp, err := http.Get("http://myexternalip.com/raw")
	if err != nil {
		return
	}
	defer resp.Body.Close()

	ret, err = bufio.NewReader(resp.Body).ReadString('\n')
	if err != nil {
		return
	}

	return
}
