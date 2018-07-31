# Making Alexa respond to Sign Language using Tensorflow.js

![Alt Text](https://i.imgur.com/CbvRZIY.gif)

**[Try the live demo](https://shekit.github.io/alexa-sign-language-translator/)**

**[Read the Blog Post on Tensorflow's Blog]() Coming Soon**

**[Watch the video](https://www.youtube.com/watch?v=kS53y6GWm0w)**

This project has been shared extensively across [social media](https://twitter.com/shekitup/status/1017072947624857605), and covered in the press: [BBC](https://www.bbc.com/news/technology-44891054), [Verge](https://www.theverge.com/2018/7/24/17606614/amazon-alexa-echo-mod-sign-language-gestures-ai), [Mashable](https://mashable.com/video/amazon-alexa-sign-language/), [Fast Co](https://www.fastcompany.com/90202730/this-clever-app-lets-amazon-alexa-read-sign-language), [Kottke](https://kottke.org/18/07/making-amazon-alexa-respond-to-sign-language-using-ai), [VentureBeat](https://venturebeat.com/2018/07/24/amazon-alexa-mod-turns-sign-language-into-voice-commands/), [NowThis](https://www.facebook.com/NowThisFuture/videos/alexa-can-now-understand-sign/2221206704587164/) and others  

Run the demo in latest Chrome/Firefox to train the model using your own words and corresponding signs/gestures. If you have an Echo plugged in closeby, it should respond, otherwise simply play around and have fun. You will need to give permission to access your webcam and microphone.


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

![Alt Text](https://i.imgur.com/zk3kwIZ.gif)

## Reference
To learn more about the classifier used in this repo go to [KNN Image Classifier](https://github.com/PAIR-code/deeplearnjs/tree/master/models/knn_image_classifier)

There is a newer version of this classifier released in the new [tensorflow.js](https://js.tensorflow.org) which can be found [here](https://github.com/tensorflow/tfjs-models/tree/master/knn-classifier)

