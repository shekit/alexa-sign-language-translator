// Launch in kiosk mode
// /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --kiosk --app=http://localhost:9966


import {KNNImageClassifier} from 'deeplearn-knn-image-classifier';
import * as dl from 'deeplearn';


// Webcam Image size. Must be 227. 
const IMAGE_SIZE = 227;
// K value for KNN
const TOPK = 10;

const predictionThreshold = 0.98

var words = ["alexa", "hello", "other"]
// var words = ["alexa", "hello", "what is", "the weather", "the time",
//"add","eggs","to the list","five","feet","in meters","tell me","a joke", "bye", "other"]


// words from above array which act as terminal words in a sentence
var endWords = ["hello"]


class Main {
  constructor(){
    // Initiate variables
    this.infoTexts = [];
    this.training = -1; // -1 when no class is being trained
    this.videoPlaying = false;

    this.previousPrediction = -1
    this.currentPredictedWords = []

    // variables to restrict prediction rate
    this.now;
    this.then = Date.now()
    this.startTime = this.then;
    this.fps = 5; //framerate - number of prediction per second
    this.fpsInterval = 1000/(this.fps); 
    this.elapsed = 0;

    this.trainingListDiv = document.getElementById("training-list")
    this.exampleListDiv = document.getElementById("example-list")
    
    this.knn = null
    
    // Get video element that will contain the webcam image
    this.video = document.getElementById('video');

    this.addWordForm = document.getElementById("add-word")

    this.video.addEventListener('mousedown', () => {
      // click on video to go back to training buttons
      main.pausePredicting();
      this.trainingListDiv.style.display = "block"
    })

    // add word to training example set
    this.addWordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let word = document.getElementById("new-word").value.trim().toLowerCase();
      let checkbox = document.getElementById("is-terminal-word")

      if(word && !words.includes(word)){
        console.log(word)
        words.splice(words.length-1,0,word) //insert at penultimate index in array
        this.createButtonList(false)
        this.updateExampleCount()
        console.log(words)
        

        if(checkbox.checked){
          endWords.push(word)
        }

        document.getElementById("new-word").value = ''
        checkbox.checked = false;

        // console.log(words)
        // console.log(endWords)

      } else {
        alert("Duplicate word or no word entered")
      }

      return
    })


    this.updateExampleCount()

    

    this.createTrainingBtn()
    
    this.createButtonList(false)
    
    // load text to speech
    this.tts = new TextToSpeech()

  }

  createPredictBtn(){
    var div = document.getElementById("action-btn")
    div.innerHTML = ""
    const predButton = document.createElement('button')

    predButton.innerText = "Start Predicting >>>"
    div.appendChild(predButton);

    predButton.addEventListener('mousedown', () => {
      console.log("start predicting")
      this.trainingListDiv.style.display = "none"
      this.startPredicting()
    })
  }

  createTrainingBtn(){
    var div = document.getElementById("action-btn")
    div.innerHTML = ""

    const trainButton = document.createElement('button')
    trainButton.innerText = "Training >>>"
    div.appendChild(trainButton);


    trainButton.addEventListener('mousedown', () => {

      this.startWebcam()

      console.log("ready to train")
      this.createButtonList(true)
      this.addWordForm.innerHTML = ''
      let p = document.createElement('p')
      p.innerText = `Perform the appropriate sign while holding down on the button near each word to capture training examples

      For OTHER, capture yourself in an idle state to act as a catchall sign. e.g hands down by your side`
      this.addWordForm.appendChild(p)
      
      this.loadKNN()

      this.createPredictBtn()
    })
  }

  startWebcam(){
    // Setup webcam
    navigator.mediaDevices.getUserMedia({video: {facingMode: 'user'}, audio: false})
    .then((stream) => {
      this.video.srcObject = stream;
      this.video.width = IMAGE_SIZE;
      this.video.height = IMAGE_SIZE;

      this.video.addEventListener('playing', ()=> this.videoPlaying = true);
      this.video.addEventListener('paused', ()=> this.videoPlaying = false);
    })
  }

  loadKNN(){

    this.knn = new KNNImageClassifier(words.length, TOPK);

    // Load knn model
    this.knn.load()
    .then(() => this.startTraining()); 
  }

  updateExampleCount(){
    var p = document.getElementById('count')
    p.innerText = `Training: ${words.length} words`
  }

  createButtonList(showBtn){
    //showBtn - true: show training btns, false:show only text

    // Clear List
    this.exampleListDiv.innerHTML = ""

    // Create training buttons and info texts    
    for(let i=0;i<words.length; i++){
      this.createButton(i, showBtn)
    }
  }

  createButton(i, showBtn){
    const div = document.createElement('div');
    this.exampleListDiv.appendChild(div);
    div.style.marginBottom = '10px';
    
    // Create Word Text
    const wordText = document.createElement('span')

    if(i==0 && !showBtn){
      wordText.innerText = words[i].toUpperCase()+" (wake word) "
    } else if(i==words.length-1 && !showBtn){
      wordText.innerText = words[i].toUpperCase()+" (catchall sign) "
    } else {
      wordText.innerText = words[i].toUpperCase()+" "
      wordText.style.fontWeight = "bold"
    }
    
    
    div.appendChild(wordText);

    if(showBtn){
      // Create training button
      const button = document.createElement('button')
      button.innerText = "Train"//"Train " + words[i].toUpperCase()
      div.appendChild(button);

      // Listen for mouse events when clicking the button
      button.addEventListener('mousedown', () => this.training = i);
      button.addEventListener('mouseup', () => this.training = -1);

      // Create clear button to emove training examples
      const btn = document.createElement('button')
      btn.innerText = "Clear"//`Clear ${words[i].toUpperCase()}`
      div.appendChild(btn);

      btn.addEventListener('mousedown', () => {
        console.log("clear training data for this label")
        this.knn.clearClass(i)
        this.infoTexts[i].innerText = " 0 examples"
      })
      
      // Create info text
      const infoText = document.createElement('span')
      infoText.innerText = " 0 examples";
      div.appendChild(infoText);
      this.infoTexts.push(infoText);
    }
  }
  
  startTraining(){
    if (this.timer) {
      this.stopTraining();
    }
    var promise = this.video.play();

    if(promise !== undefined){
      promise.then(_ => {
        console.log("Autoplay started")
      }).catch(error => {
        console.log("Autoplay prevented")
      })
    }
    this.timer = requestAnimationFrame(this.train.bind(this));
  }
  
  stopTraining(){
    this.video.pause();
    cancelAnimationFrame(this.timer);
  }
  
  train(){
    if(this.videoPlaying){
      // Get image data from video element
      const image = dl.fromPixels(this.video);
      
      // Train class if one of the buttons is held down
      if(this.training != -1){
        // Add current image to classifier
        this.knn.addImage(image, this.training)
      }

      const exampleCount = this.knn.getClassExampleCount()

      if(Math.max(...exampleCount) > 0){
        for(let i=0;i<words.length;i++){
          if(exampleCount[i] > 0){
            this.infoTexts[i].innerText = ` ${exampleCount[i]} examples`
          }
        }
      }
    }
    this.timer = requestAnimationFrame(this.train.bind(this));
  }

  startPredicting(){
    // stop training
    if(this.timer){
      this.stopTraining();
    }

    this.video.play();

    this.pred = requestAnimationFrame(this.predict.bind(this))
  }

  pausePredicting(){
    console.log("pause predicting")
    cancelAnimationFrame(this.pred)
  }

  predict(){
    this.now = Date.now()
    this.elapsed = this.now - this.then

    if(this.elapsed > this.fpsInterval){

      this.then = this.now - (this.elapsed % this.fpsInterval)

      if(this.videoPlaying){
        const exampleCount = this.knn.getClassExampleCount();

        const image = dl.fromPixels(this.video);

        if(Math.max(...exampleCount) > 0){
          this.knn.predictClass(image)
          .then((res) => {
            for(let i=0;i<words.length;i++){

              // if matches & is above threshold & isnt same as prev prediction
              // and is not the last class which is a catch all class
              if(res.classIndex == i 
                && res.confidences[i] > predictionThreshold 
                && res.classIndex != this.previousPrediction
                && res.classIndex != words.length-1){

                this.tts.speak(words[i])

                // set previous prediction so it doesnt get called again
                this.previousPrediction = res.classIndex;


              }
            }
          })
          .then(() => image.dispose())
        } else {
          image.dispose()
        }
      }
    }

    this.pred = requestAnimationFrame(this.predict.bind(this))
  }

}

class TextToSpeech{
  constructor(){
    this.synth = window.speechSynthesis
    this.voices = []
    this.pitch = 1.0
    this.rate = 0.9

    this.textLine = document.getElementById("text")
    this.ansText = document.getElementById("answerText")
    this.loader = document.getElementById("loader")

    this.selectedVoice = 48 // this is Google-US en. Can set voice and language of choice

    this.currentPredictedWords = []
    this.waitTimeForQuery = 5000

    this.synth.onvoiceschanged = () => {
      this.populateVoiceList()
    }
    
  }

  populateVoiceList(){
    if(typeof speechSynthesis === 'undefined'){
      console.log("no synth")
      return
    }
    this.voices = this.synth.getVoices()

    if(this.voices.indexOf(this.selectedVoice) > 0){
      console.log(`${this.voices[this.selectedVoice].name}:${this.voices[this.selectedVoice].lang}`)
    } else {
      //alert("Selected voice for speech did not load or does not exist.\nCheck Internet Connection")
    }
    
  }

  clearPara(queryDetected){
    this.textLine.innerText = '';
    this.ansText.innerText = ''
    if(queryDetected){
      this.loader.style.display = "block"
    } else {
      this.loader.style.display = "none"
      this.ansText.innerText = "No query detected"
    }
    this.currentPredictedWords = []
  }

  speak(word){

    if(word == 'alexa'){
      console.log("clear para")
      this.clearPara(true);

      setTimeout(() => {
        // if no query detected after alexa is signed
        if(this.currentPredictedWords.length == 1){
          this.clearPara(false)
        }
      }, this.waitTimeForQuery)
    } 

    if(word != 'alexa' && this.currentPredictedWords.length == 0){
      console.log("first word should be alexa")
      console.log(word)
      return
    }

    // if(endWords.includes(word) && this.currentPredictedWords.length == 1 && (word != "hello" && word != "bye")){
    //   console.log("end word detected early")
    //   console.log(word)
    //   return;
    // }

    if(this.currentPredictedWords.includes(word)){
      // prevent word from being detected repeatedly in phrase
      console.log("word already been detected in current phrase")
      return
    }


    this.currentPredictedWords.push(word)


    this.textLine.innerText += ' ' + word;


    var utterThis = new SpeechSynthesisUtterance(word)

    utterThis.onend = (evt) => {
      if(endWords.includes(word)){
         //if last word is one of end words start listening for transcribing
        console.log("this was the last word")
        let stt = new SpeechToText()
      }
    }

    utterThis.onerror = (evt) => {
      console.log("Error speaking")
    }

    utterThis.voice = this.voices[this.selectedVoice]

    utterThis.pitch = this.pitch
    utterThis.rate = this.rate

    this.synth.speak(utterThis)

  }
}

class SpeechToText{
  constructor(){
    this.interimTextLine = document.getElementById("interimText")
    this.textLine = document.getElementById("answerText")
    this.loader = document.getElementById("loader")
    this.finalTranscript = ''
    this.recognizing = false

    this.recognition = new webkitSpeechRecognition();

    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.lang = 'en-US'

    this.cutOffTime = 15000 // cut off speech to text after

    this.recognition.onstart = () => {
      this.recognizing = true;
      console.log("started recognizing")
    }

    this.recognition.onerror = (evt) => {
      console.log(evt + " recogn error")
    }

    this.recognition.onend = () => {
      console.log("stopped recognizing")
      if(this.finalTranscript.length == 0){
        this.type("No response detected")
      }
      this.recognizing = false;

      // restart prediction after a pause
      setTimeout(() => {
        main.startPredicting()
      }, 1000)
    }

    this.recognition.onresult = (event) => {
      var interim_transcript = ''
      if(typeof(event.results) == 'undefined'){
        return;
      }
   

      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          this.finalTranscript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }


      this.interimType(interim_transcript)
      this.type(this.finalTranscript)
    }

    setTimeout(()=>{
      this.startListening();
    },0)
    

    setTimeout(()=>{
      this.stopListening()
    },this.cutOffTime)
  }

  startListening(){
    if(this.recognizing){
      this.recognition.stop()
      return
    }

    console.log("listening")

    main.pausePredicting()

    this.recognition.start()
  }

  stopListening(){
    console.log("STOP LISTENING")
    if(this.recognizing){
      console.log("stop speech to text")
      this.recognition.stop()

      //restart predicting
      main.startPredicting()
      return
    }
  }

  interimType(text){
    this.loader.style.display = "none"
    this.interimTextLine.innerText = text
  }

  type(text){
    this.loader.style.display = "none"
    this.textLine.innerText = text;
  }
}

var main = null;

window.addEventListener('load', () => {

  main = new Main()

});