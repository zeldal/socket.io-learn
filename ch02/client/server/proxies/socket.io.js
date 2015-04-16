var proxyPath = '/socket.io';

module.exports = function (app) {
    // For options, see:
    // https://github.com/nodejitsu/node-http-proxy
    var proxy = require('http-proxy').createProxyServer(
        {
            target: {
                host: 'localhost',
                port: 4101
            },
            ws: true
        });
    var path = require('path');

    proxy.on('error', function (err, req) {
        console.error(err, req.url);
    });

    app.on('upgrade', function (req, socket, head) {
        console.warn("Proxying WS:"+req.url);
        proxy.ws(req, socket, head);
    });
    app.use(proxyPath, function (req, res, next) {
        // include root path in proxied request
        req.url = path.join(proxyPath, req.url);
        proxy.web(req, res);
    });
};