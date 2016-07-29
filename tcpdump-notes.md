## Insteresting tcpdump options

* `-e`: Print the link-level header on each  dump  line.
* `-i interface`: Listen on interface.  If unspecified, tcpdump searches the  system interface list for the lowest numbered, configured up interface (excluding loopback), which may turn out to be,  for  example, `eth0`. On  Linux  systems with 2.2 or later kernels, an interface argument of `any` can be used to capture packets from  all  interfaces.   Note  that  captures  on the `any` device will not be done in promiscuous mode.
* `-n`: Don't  convert  addresses  (i.e.,  host addresses, port numbers, etc.) to names.
* `-q`: Quick (quiet?) output.  Print less protocol information so  output lines are shorter.
* `-t`: Don't print a timestamp on each dump line.
* `-v`, `-vv`, `-vvv`: Increase verbosity.
* `expression`: selects which packets will  be  dumped. For the expression syntax, see pcap-filter(7).
