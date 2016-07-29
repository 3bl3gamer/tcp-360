package nethack_test

import (
	"nethack"

	. "github.com/smartystreets/goconvey/convey"
	"testing"
)

func TestAnalyzer(t *testing.T) {
	Convey("So...", t, func() {
		Convey("AnalyzeAlpha", func() {
			ret, err := nethack.AnalyzeAlpha("IP 192.168.1.210.52061 > 224.0.0.251.5353: UDP, length 49")
			So(err, ShouldBeNil)
			So(ret.DestIP, ShouldEqual, "224.0.0.251")
			So(ret.DestPort, ShouldEqual, 5353)
			So(ret.Protocol, ShouldEqual, "UDP")

			ret, err = nethack.AnalyzeAlpha("IP 192.168.1.29 > 8.8.8.8: ICMP echo request, id 16701, seq 18969, length 64")
			So(err, ShouldBeNil)
			So(ret.DestIP, ShouldEqual, "8.8.8.8")
			So(ret.DestPort, ShouldEqual, 0)
			So(ret.Protocol, ShouldEqual, "ICMP")

			ret, err = nethack.AnalyzeAlpha("IP 8.8.8.8 > 192.168.1.29: ICMP echo reply, id 16701, seq 18969, length 64")
			So(err, ShouldBeNil)
			So(ret.DestIP, ShouldEqual, "192.168.1.29")
			So(ret.DestPort, ShouldEqual, 0)
			So(ret.Protocol, ShouldEqual, "ICMP")

			ret, err = nethack.AnalyzeAlpha("IP 149.154.167.51.443 > 192.168.1.29.34586: tcp 89")
			So(err, ShouldBeNil)
			So(ret.DestIP, ShouldEqual, "192.168.1.29")
			So(ret.DestPort, ShouldEqual, 34586)
			So(ret.Protocol, ShouldEqual, "TCP")

			ret, err = nethack.AnalyzeAlpha("IP 192.168.1.29.34586 > 149.154.167.51.443: tcp 0")
			So(err, ShouldBeNil)
			So(ret.DestIP, ShouldEqual, "149.154.167.51")
			So(ret.DestPort, ShouldEqual, 443)
			So(ret.Protocol, ShouldEqual, "TCP")
		})
	})
}
