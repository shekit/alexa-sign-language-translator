# Making Alexa respond to Sign Language using Tensorflow.js

[Alt Text]!(https://i.imgur.com/CbvRZIY.gif)

**[Try the live demo](https://shekit.github.io/alexa-sign-language-translator/)**

**[Read the Blog Post]() Coming Soon**

**[Watch the video](https://www.youtube.com/watch?v=kS53y6GWm0w)**

Run the demo to train the model using your own words and corresponding signs/gestures. If you have an Echo plugged in closeby, it should respond, otherwise simply play around and have fun. You will need to give permission to access your webcam and microphone.


## Running the code
To use the code, first install the JavaScript dependencies by running  

```
npm install
```

Then start the local budo web server by running 

```
npm start
```

This will start a web server on [`localhost:9966`](http://localhost:9966). 

1. Allow permission to your webcam and microphone. 

2. Add some words you want to train on. 

[Alt Text]!(https://i.imgur.com/zk3kwIZ.gif)

## Reference
To learn more about the classifier used in this repo go to [KNN Image Classifier](https://github.com/PAIR-code/deeplearnjs/tree/master/models/knn_image_classifier)

There is a newer version of this classifier released in the new [tensorflow.js](https://js.tensorflow.org) which can be found [here](https://github.com/tensorflow/tfjs-models/tree/master/knn-classifier)

