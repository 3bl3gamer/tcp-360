package geoip

import (
	"errors"
	"os/exec"
	"regexp"

	log "github.com/Sirupsen/logrus"
)

var (
	ParseError error
	CachedFail error

	cache       map[string]LookupResult
	lookupFails map[string]interface{}

	regexpCity *regexp.Regexp
	regexpOrg  *regexp.Regexp
)

func init() {
	ParseError = errors.New("Parse error")
	CachedFail = errors.New("Failed in past, not retrying")

	cache = make(map[string]LookupResult)
	lookupFails = make(map[string]interface{})

	regexpCity = regexp.MustCompile(`GeoIP City Edition, Rev \d+: (.+, .+, .+, .+), .+, (.+), (.+), .+, .+`)
	regexpOrg = regexp.MustCompile(`GeoIP ASNum Edition: \S+ (.+)`)
}

func Lookup(addr string) (ret LookupResult, err error) {
	// Use cache if possible
	if _, ok := cache[addr]; ok {
		ret = cache[addr]
		return
	}
	// Check if failed before
	if _, ok := lookupFails[addr]; ok {
		err = CachedFail
		return
	}

	log.WithField("addr", addr).Info("Not found in cache")
	cmd := exec.Command("geoiplookup", addr)
	bytes, err := cmd.CombinedOutput()
	if err != nil {
		lookupFails[addr] = nil
		return
	}
	str := string(bytes)

	tmp := regexpCity.FindStringSubmatch(str)
	if tmp == nil {
		lookupFails[addr] = nil
		err = ParseError
		return
	}
	ret.Caption = tmp[1]
	ret.Latitude = tmp[2]
	ret.Longitude = tmp[3]
	// cache result
	cache[addr] = ret
	return
}

// DB location on Arch Linux:
// geoip-database /usr/share/GeoIP/GeoIP.dat
// geoip-database /usr/share/GeoIP/GeoIPv6.dat
// geoip-database-extra /usr/share/GeoIP/GeoIPASNum.dat
// geoip-database-extra /usr/share/GeoIP/GeoIPASNumv6.dat
// geoip-database-extra /usr/share/GeoIP/GeoIPCity.dat
// geoip-database-extra /usr/share/GeoIP/GeoIPCityv6.dat
