#! /usr/bin/env python
import cgi
import Cookie
import datetime
import os, inspect, sys
import random
import subprocess
from shutil import copyfile

# add parent dir path to sys.path
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0,parentdir)

from general_function import *

#set file directory for file storage
storage_dir = '/upload_files'
UPLOAD_DIR = os.path.dirname(os.path.dirname(currentdir))+storage_dir

def copytemp(uploaded_file_path, user_extension):
	copyfile(uploaded_file_path, UPLOAD_DIR+'/temp_.'+user_extension)

def save_uploaded_file():
    form = cgi.FieldStorage()
    if not form.has_key('file'):
        print 'Please use the homepage to upload image.<br><a href="/">Back to Homepage</a>'
        return False

    form_file = form['file']
    if not form_file.file or not form_file.filename:
        print 'No file chosen.<br><a href="/">Back to Homepage</a>'
        return False

    if form.getvalue('mode') == 'null':
    	print 'Please choose the upload mode.<br><a href="/">Back to Homepage</a>'
    	return False

    user_extension = os.path.basename(form_file.filename).split('.')[-1].upper()
    if user_extension == 'JPG':
    	user_extension = 'JPEG'
    if user_extension not in ['JPEG', 'GIF', 'PNG']:
    	print 'File type not supported, please upload gif, png or jpeg image. <br><a href="/">Back to Homepage</a>'
    	return False
    else:
	    # create new file name
	    newfilename = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")+'.'+ user_extension
	    uploaded_file_path = os.path.join(UPLOAD_DIR, os.path.basename(newfilename))

	    with file(uploaded_file_path, 'wb') as fout:
	        while True:
	            chunk = form_file.file.read(100000)
	            if not chunk:
	                break
	            fout.write (chunk)

	    photourl = "/upload_files/" + newfilename
	    if form.getvalue('mode') == 'public':
	    	public = 'True'
	    else:
	    	public = 'False'
	    
	    try:
			command = ("magick identify " + uploaded_file_path).split()
			process = subprocess.Popen(command, stdout=subprocess.PIPE)
			output, err = process.communicate()
			if output.split()[1] != user_extension:
				print 'File type not match will file content. <br><a href="/">Back to Homepage</a>'
				os.remove(uploaded_file_path)
				return False
			else:
				#print 'File uploaded successfully, please proceed to image filter.'
				#copytemp(uploaded_file_path, user_extension)
				#print '<a href="/upload_files/'+newfilename+'">'+newfilename+'</a>'
				command = ("magick " + uploaded_file_path+ " -resize 299x299\! "+uploaded_file_path).split()
				process = subprocess.Popen(command, stdout=subprocess.PIPE)
				output, err = process.communicate()
				return uploaded_file_path
	    except:
			print 'Invalid file type. <br><a href="/">Back to Homepage</a>'
			os.remove(uploaded_file_path)
			return False
    