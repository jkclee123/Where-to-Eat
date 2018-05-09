import tensorflow as tf
from keras.models import load_model, Model
from keras import backend as K

sess = tf.Session()
K.set_session(sess)

model = load_model('./model4b.10-0.68.hdf5')

x = tf.placeholder(tf.float32, shape=model.get_input_shape_at(0))

y = model(x)

import numpy as np
import matplotlib.pyplot as plt

img = plt.imread('test.jpg')

#plt.imshow(img)
#plt.show()

print ("start")

def preprocess_input(x):
    x_copy = np.copy(x)
    x_copy = x_copy / 255.
    x_copy = x_copy-0.5
    x_copy *= 2.
    return x_copy

img_processed = preprocess_input(img)
plt.imshow(img_processed)
#plt.show()

imgs = np.expand_dims(img_processed, 0)

orig_scores = sess.run(y, feed_dict={x: imgs, K.learning_phase(): False})

def find_top_pred(scores):
    top_label_ix = np.argmax(scores) # label 95 is Sushi
    sort_arr = scores.argsort()[0]

    file = open('food-101-label-cal.txt', "r")
    lines = file.readlines()
    file.close()

    for i in range(5):
    	top_label_ix = sort_arr[-1-i]
    	confidence = scores[0][top_label_ix]
    	print('Label: {}, Confidence: {}'.format(lines[top_label_ix].replace("\n",""), confidence))

find_top_pred(orig_scores)