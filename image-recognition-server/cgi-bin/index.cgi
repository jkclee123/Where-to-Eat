#! /usr/bin/env python
import sys, os
from general_function import *

if __name__ == '__main__':
	try:
		htmlTop('Web Instagram')
		
		print """<form action="/cgi-bin/upload/upload.cgi" method="POST" enctype="multipart/form-data">
					File: <input name="file" type="file">
					<input name="submit" type="submit" value="Upload">
					</form>"""
		htmlTail()
	except:
		cgi.print_exception()