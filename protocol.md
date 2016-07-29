# Protocol reference

JSON.


## Init message

Must be sent only once.

```
{
	event: "init"
	ip: "1.2.3.4"  // this computer's external IP
	latitude: ...
	longtitude: ...
	caption: "Newbee Street, California, US"
}
```


## Packet message

```
{
	event: "packet"
	ip: "4.3.2.1"
	latitude: ...
	longtitude: ...
	caption: "Bamboo Street, Kyoto, JP"
	port: 1523  // 0 if not applicable
	type: "TCP"  // TCP, UDP, ICMP
	size: 3672  // bytes
}
```
