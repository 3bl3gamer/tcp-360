package main

import (
	"fmt"
	"nethack"
)

func main() {
	fmt.Printf("Hello %v!\n", "world")
	err := nethack.Work()
	if err != nil {
		fmt.Printf("%v\n", err)
	}
}
