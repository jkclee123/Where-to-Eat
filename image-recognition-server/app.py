#! /usr/bin/env python

import BaseHTTPServer
import CGIHTTPServer
import webbrowser

PORT = 8080
#TODO: check that port is available,
# and look for a different one if it isn't.

server_class = BaseHTTPServer.HTTPServer
handler_class = CGIHTTPServer.CGIHTTPRequestHandler
server_address = ("", PORT)

httpd = server_class(server_address, handler_class)

print "HTTP Server Started..."

httpd.serve_forever()
