import React, { useState, useRef, useReducer } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "./App.css";

const machine = {
  initial: "initial",
  states: {
    initial: { on: { next: "loadingModel" } },
    loadingModel: { on: { next: "modelReady" } },
    modelReady: { on: { next: "imageReady" } },
    imageReady: { on: { next: "identifying" }, showImage: true },
    identifying: { on: { next: "complete" } },
    complete: { on: { next: "modelReady" }, showImage: true, showResults: true }
  }
};

function App() {
  const [results, setResults] = useState([]);
  const [imageURL, setImageURL] = useState(null);
  const [model, setModel] = useState(null);
  const imageRef = useRef();
  const inputRef = useRef();

  const reducer = (state, event) => {
    console.log("state: "+state);
    console.log("event: "+event);
    console.log(machine.states[state].on[event]);
    return machine.states[state].on[event] || machine.initial;
  }

  const [appState, dispatch] = useReducer(reducer, machine.initial);
  console.log(appState);
  
  const next = () => {
    console.log("inside next");
    return dispatch("next");
  }

  const loadModel = async () => {
    console.log("inside loadModel() 1");
    next();
    console.log("inside loadModel() 2");
    const model = await mobilenet.load();
    console.log("dhik");
    setModel(model);
    console.log("chik");
    next();
    console.log("inside loadModel() 3");
  };

  const identify = async () => {
    console.log("inside identify() 1");
    next();
    console.log("inside identify() 2");
    const results = await model.classify(imageRef.current);
    setResults(results);
    next();
    console.log("inside identify() 3");
  };

  const reset = async () => {
    setResults([]);
    next();
  };

  const upload = () => inputRef.current.click();

  const handleUpload = event => {
    const { files } = event.target;
    console.log(files[0]);
    if (files.length > 0) {
      const url = URL.createObjectURL(event.target.files[0]);
      console.log(url);
      setImageURL(url);
      next();
    }
  };

  const actionButton = {
    initial: { action: loadModel, text: "Load Model" },
    loadingModel: { text: "Loading Model..." },
    modelReady: { action: upload, text: "Upload Image" },
    imageReady: { action: identify, text: "Identify Breed" },
    identifying: { text: "Identifying..." },
    complete: { action: reset, text: "Reset" }
  };

  const { showImage, showResults } = machine.states[appState];

  return (
    <div>
      {showImage && <img src={imageURL} alt="upload-preview" ref={imageRef} />}
      <input
        type="file"
        accept="image/*"
        capture="camera"
        onChange={handleUpload}
        ref={inputRef}
      />
      {showResults && (
        <ul>
          {results.map(({ className, probability }) => (
            <li key={className}>{`${className}: ${(probability * 100).toFixed(
              2
            )}%`}</li>
          ))}
        </ul>
      )}
      <button onClick={actionButton[appState].action || (() => {})}>
        {actionButton[appState].text}
      </button>
    </div>
  );
}

export default App;
