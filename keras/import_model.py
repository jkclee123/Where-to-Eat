import tensorflow as tf
from keras.models import load_model, Model
from keras import backend as K

sess = tf.Session()
K.set_session(sess)

model = load_model('./model4b.10-0.68.hdf5')

gd = sess.graph.as_graph_def()
print(len(gd.node), 'Nodes')
print(gd.node[:2])

x = tf.placeholder(tf.float32, shape=model.get_input_shape_at(0))

y = model(x)

import numpy as np
import matplotlib.pyplot as plt

img = plt.imread('test.jpg')

plt.imshow(img)
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
    confidence = scores[0][top_label_ix]
    print('Label: {}, Confidence: {}'.format(top_label_ix, confidence))

find_top_pred(orig_scores)