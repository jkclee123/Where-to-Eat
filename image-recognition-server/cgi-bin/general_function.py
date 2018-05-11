#! /usr/bin/env python
from __future__ import division
import cgi
import Cookie
import datetime
import os, inspect
import random
from math import ceil

def getWEBSITE_DOMAIN():
	global WEBSITE_DOMAIN
	return WEBSITE_DOMAIN

#redirect browser
def redirectBrowser(url):
	'''print("""Content-type:text/html\n\n
						 <!DOCTYPE html>
						 <html lang='en'>
						 	<head>
						 		<meta charset='utf-8'/>
						 		<title>Redirect</title>
						 		<meta http-equiv="refresh" content="0;url=%s" />
					 		</head>
					 		<body>
					 		Redirecting...
					 		</body>
						</html>""") % url'''
	print "Refresh: 0; url=%s " % "/"

#print html top
def htmlTop(title):
	print("""Content-type:text/html\n\n
			 <!DOCTYPE html>
			 <html lang='en'>
			 	<head>
			 		<meta charset='utf-8'/>
			 		<title>%s</title>
		 		</head>
		 		<body>""") % title

#print html tail
def htmlTail():
	print("""</body>
			</html>""")
