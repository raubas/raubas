import React, { Component } from 'react';
import { parseString } from 'xml2js'
import iconv from 'iconv-lite'
import Resultat from './Resultat'
import Startlista from './Startlista'
import logo from './assets/logga.png';
import Dropzone from 'react-dropzone'
import './App.css';

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf;
}

const Uploader = (props) => {
  return(
    <div>
      <h1>Upload result!</h1>
    </div>
  )
}
class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      res1: [],
      res2: [],
      res3: [],
      type: 'startlista'
    }
  }

  componentDidMount(){
    this.getResults()
  }

  handleUpload = (acceptedFiles, rejectedFiles) => {
    let fileRead = new FileReader()
    fileRead.onload = (event) => {
      parseString(event.target.result, (err, res) => {
        this.setState({
          res3: res.ResultList.ClassResult
        })
      })
    }
    fileRead.readAsText(acceptedFiles[0])
  }

  getResults(){
    const that = this
    return new Promise(function(resolve, reject) {
      const prom1 = new Promise(function(resolve, reject) {
        var request = new XMLHttpRequest();
        request.open("GET", "./assets/Resultat1_18.xml", false);
        request.send()
        const serializer = new XMLSerializer();
        const serializedS = serializer.serializeToString(request.responseXML)
        parseString(serializedS, (err, res) => {
          resolve(res.ResultList.ClassResult)
        })
      });
      const prom2 =  new Promise(function(resolve, reject) {
        var request = new XMLHttpRequest();
        request.open("GET", "./assets/Resultat2_18.xml", false);
        request.send();
        const serializer = new XMLSerializer();
        const serializedS = serializer.serializeToString(request.responseXML)
        // const textString = iconv.decode(request.responseText, 'win1251')
        parseString(serializedS,(err, res) => {
          resolve(res.ResultList.ClassResult)
        })
      });
      Promise.all([prom1, prom2])
      .then((res) => {
        that.setState({
          res1: res[0],
          res2: res[1]
        })
      })
    });
  }

  handleClick = (type) => {
    console.log(type);
    this.setState({
      type: type
    })
  }

  renderResult = (res1, res2, res3) => {
    if (res1.length > 0 && res2.length > 0 && res3.length > 0) {
      return(<Resultat res1={res1} res2={res2} res3={res3}/>)
    }else{
      return(
        <div style={{paddingTop: '100px'}}>
          <Dropzone style={{margin: 'auto', width: '200px', height: '200px', borderWidth: '2px', borderColor: 'rgb(102, 102, 102)', borderStyle: 'dashed', borderRadius: '5px',}} onDrop={this.handleUpload}>
            <p style={{lineHeight: '170px'}}>Släpp resultatlistan här!</p>
          </Dropzone>
        </div>
      )
    }
  }

  render() {
    const { res1, res2, res3, type } = this.state
    const selectedStyle = { textDecoration: 'underline' }
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Sprintcupen!</h2>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-around'}}>
          <h1 style={type === 'resultat' ? selectedStyle : {}} onClick={() => this.handleClick('resultat')}>Resultatlista</h1>
          <h1 style={type === 'startlista' ? selectedStyle : {}} onClick={() => this.handleClick('startlista')}>Startlista</h1>
        </div>
        {
          type === 'startlista' ?
          <Startlista res1={res1} res2={res2} />
        :
          this.renderResult(res1, res2, res3)
        }
      </div>
    );
  }
}

export default App;
