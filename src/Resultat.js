import React, { Component } from 'react';
import windows1252 from 'windows-1252'

let key = 0;
const generateKey = () => {
  const un = key
  key = key + 1
  return un
}

var WINDOWS_1252 = '\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\b\t\n\u000b\f\r\u000e\u000f\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~€�‚ƒ„…†‡ˆ‰Š‹Œ�Ž��‘’“”•–—˜™š›œ�žŸ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ';

function fromWindows1252(binaryString) {
  var text = '';

  for (var i = 0; i < binaryString.length; i++) {
      text += WINDOWS_1252.charAt(binaryString.charCodeAt(i));
  }

  return text;
}

const sortRes = (prop, arr) => {
    arr.sort(function (a, b) {
        if (a[prop] > b[prop]) {
            return -1;
        } else if (a[prop] < b[prop]) {
            return 1;
        } else {
            return 0;
        }
    });
};

const getScore = (placering, status) => {
  if (status !== 'OK') {
    return 0
  }
  switch (placering) {
    case 1:
      return 10;
    default:
      return (10 - placering > 0) ? 10 - placering : 0
  }
}

const Person = ({name, results, score}) => {
  return(
    <tr>
      <td style={{textAlign: 'left'}}>{ name }</td>
      { results.map((res) => {
        return (<td key={generateKey()}>{ res }</td>)
      })}
      <td>{ score }</td>
    </tr>
  )
}

const KlassResultat = ({klass, personer}) => {
  return(
    <div style={{paddingTop: '1em'}}>
      <h2 style={{textAlign: 'left'}}>{klass}</h2>
      <table>
        <thead>
          <tr>
            <th style={{textAlign: 'left', width: '200px'}}>{'Namn'}</th>
            <th style={{padding: '0 10px'}}>{'Poäng SC 1'}</th>
            <th style={{padding: '0 10px'}}>{'Poäng SC 2'}</th>
            <th style={{padding: '0 10px'}}>{'Poäng SC 3'}</th>
            <th style={{padding: '0 10px'}}>{'Totalt'}</th>
          </tr>
        </thead>
        <tbody>
        { Object.keys(personer).map((hash) => {
          const person = personer[hash]
          return ( <Person key={generateKey()} {...person} />)
        })}
        </tbody>
      </table>
    </div>
  )
}

class Resultat extends Component {

  constructor(props){
    super(props)
    this.state = {
      total: {}
    }
  }

  componentDidMount(){
    let names, score, results;
    let comp1 = this.props.res1;
    let comp2 = this.props.res2;
    let comp3 = this.props.res3;
    const that = this
    this.getNames(comp1, comp2, comp3)
    .then((nameArr) => {
      names = nameArr
      return that.getScores(names, comp1, comp2, comp3)
    })
    .then((score) => {
      const result =  that.calculateResults(score)
      this.setState({
        total: result
      })
    })
    .catch((err) => {
      console.log(err);
    })
  }

  componentWillReceiveProps(nextProps){
    let names, score, results;
    let comp1 = nextProps.res1;
    let comp2 = nextProps.res2;
    let comp3 = nextProps.res3;
    const that = this
    this.getNames(comp1, comp2, comp3)
    .then((nameArr) => {
      names = nameArr
      return that.getScores(names, comp1, comp2, comp3)
    })
    .then((score) => {
      const result =  that.calculateResults(score)
      this.setState({
        total: result
      })
    })
    .catch((err) => {
      console.log(err);
    })
  }

  hashCode(str){
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++){
      let char = str.charCodeAt(i)
      hash = ((hash<<5)-hash)+char;
      hash = hash & hash;
    }
    return hash;
  }

  getNames(comp1 = [], comp2 = [], comp3 = []){
    const that = this
    return new Promise(function(resolve, reject) {
      let names = {}
      try {
        comp1.map((klass) => {
          let klassRes = names[klass.Class[0].ShortName[0]] || {}
          klass.PersonResult.map((person) => {
            let name = person.Person[0].Name[0].Given[0] + ' ' +person.Person[0].Name[0].Family[0]
            klassRes[that.hashCode(name)] = { name, results: []}
          })
          names[klass.Class[0].ShortName[0]] = klassRes
        })
        comp2.map((klass) => {
          let klassRes = names[klass.Class[0].ShortName[0]] || {}
          klass.PersonResult.map((person) => {
            let name = person.Person[0].Name[0].Given[0] + ' ' +person.Person[0].Name[0].Family[0]
            klassRes[that.hashCode(name)] = { name, results: []}
          })
          names[klass.Class[0].ShortName[0]] = klassRes
        })
        comp3.map((klass) => {
          let klassRes = names[klass.Class[0].ShortName[0]] || {}
          klass.PersonResult.map((person) => {
            let name = person.Person[0].Name[0].Given[0] + ' ' +person.Person[0].Name[0].Family[0]
            klassRes[that.hashCode(name)] = { name, results: []}
          })
          names[klass.Class[0].ShortName[0]] = klassRes
        })
      } catch (e) {
        console.log(e);
        reject(e)
      }
      resolve(names)
    })
  }

  getScores(names = [], comp1 = [], comp2 = [], comp3 = []){
    let total = {}
    const that = this
    return new Promise(function(resolve, reject) {
      try {
        comp1.map((klass) => {
          let klassRes = names[klass.Class[0].ShortName[0]]
          klass.PersonResult.map((person) => {
            let name = person.Person[0].Name[0].Given[0] + ' ' +person.Person[0].Name[0].Family[0]
            const hash = that.hashCode(name)
            let personScore = klassRes[hash]
            const pos = person.Result[0].Position ? parseInt(person.Result[0].Position[0]) : 10
            const status = person.Result[0].Status ? person.Result[0].Status[0] : 'Not OK'
            personScore.results.push(getScore(pos, status))
            klassRes[that.hashCode(name)] = personScore
          })
          Object.keys(klassRes).map((pp) => {
            if (klassRes[pp].results.length === 0) {
              klassRes[pp].results.push(0)
            }
          })
          total[klass.Class[0].ShortName[0]] = klassRes
        })
        comp2.map((klass) => {
          let klassRes = names[klass.Class[0].ShortName[0]]
          klass.PersonResult.map((person) => {
            let name = person.Person[0].Name[0].Given[0] + ' ' +person.Person[0].Name[0].Family[0]
            const hash = that.hashCode(name)
            let personScore = klassRes[hash]
            const pos = person.Result[0].Position ? parseInt(person.Result[0].Position[0]) : 10
            const status = person.Result[0].Status ? person.Result[0].Status[0] : 'Not OK'
            personScore.results.push(getScore(pos, status))
            klassRes[that.hashCode(name)] = personScore
          })
          Object.keys(klassRes).map((pp) => {
            if (klassRes[pp].results.length === 1) {
              klassRes[pp].results.push(0)
            }
          })
          total[klass.Class[0].ShortName[0]] = klassRes
        })
        comp3.map((klass) => {
          let klassRes = names[klass.Class[0].ShortName[0]]
          klass.PersonResult.map((person) => {
            let name = person.Person[0].Name[0].Given[0] + ' ' +person.Person[0].Name[0].Family[0]
            const hash = that.hashCode(name)
            let personScore = klassRes[hash]
            const pos = person.Result[0].Position ? parseInt(person.Result[0].Position[0]) : 10
            const status = person.Result[0].Status ? person.Result[0].Status[0] : 'Not OK'
            personScore.results.push(getScore(pos, status))
            klassRes[that.hashCode(name)] = personScore
          })
          Object.keys(klassRes).map((pp) => {
            if (klassRes[pp].results.length === 2) {
              klassRes[pp].results.push(0)
            }
          })
          total[klass.Class[0].ShortName[0]] = klassRes
        })
      } catch (e) {
        console.log(e);
        reject(e)
      }
      resolve(total)
    })
  }

  calculateResults(total){
    let results = {};
    Object.keys(total).map((klassNamn) => {
      let klass = total[klassNamn]
      let klassArr = []
      Object.keys(klass).map((namnHash) => {
        let person = klass[namnHash]
        person.score = person.results.reduce((a,b) => { return a + b}, 0)
        klassArr.push(person)
      })
      sortRes('score', klassArr)
      results[klassNamn] = klassArr
    })
    return results
  }


  render() {
    const { total } = this.state;
    return (
      <div className="Resultat" style={{padding: '2em'}}>
        { Object.keys(total).length > 0 ? Object.keys(total).map((key) => {
          const personer = total[key]
          return (<KlassResultat key={generateKey()} klass={key} personer={personer} />)
        }) : null }
      </div>
    );
  }
}

export default Resultat;
