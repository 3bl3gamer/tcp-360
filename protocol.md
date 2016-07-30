# Protocol reference

Format: JSON.


## Init message

Must be sent at least once. Client must ignore "packet" messages until this one is sent. If sent twice, client must use the new location.

```
{
	event: "init"
	ip: "1.2.3.4"  // this computer's external IP
	latitude: ...
	longitude: ...
	caption: "Newbee Street, California, US"
}
```


## Packet message

```
{
	event: "packet"
	ip: "4.3.2.1"
	latitude: ...
	longitude: ...
	caption: "Bamboo Street, Kyoto, JP"
	port: 1523  // 0 if not applicable
	protocol: "TCP"  // TCP, UDP, ICMP
	size: 3672  // bytes
}
```
