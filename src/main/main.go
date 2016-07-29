package main

import (
	"fmt"
	"nethack"
)

func main() {
	fmt.Printf("Hello %v!\n", "world")

	w := nethack.NewWorker()
	ch := w.Channel
	go w.Run()
	for {
		tmp := <-ch
		fmt.Printf("PKT: %v\n", tmp)
	}
}
