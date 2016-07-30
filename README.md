# TCP-360

Intercepts IP packets and shows their path on the globe.


## Requirements

* go compiler;
* gb;
* ffjson;
* tcpdump;
* geoip with City Edition database (called `geoip-database-extra` in some distributions).


## Building and running

```
gb build
bin/main
```

Last command requires permission to intercept network activity. You might need to run it with `sudo`.

Then, navigate to `http://localhost:8740/` and enjoy.
