//Nomes: Gustavo Palmeira Zaia, Vinicius Polachini

import './App.css';
import { useState } from 'react';

import {createLexicalAnalyser} from './AL/AL';
import { generateTokens } from './Tokens/tokens';
import { parserAnalysis } from './AS/AS';
import Modal from './components/Modal';

function App(){
  const [codigo, setCodigo] = useState("");
  const [lexicalOutput, setLexicalOutput] = useState({errors: [], tokens:[]});
  const [parserOutput, setParserOutput] = useState([]);
  const [semanticOutput, setSemanticOutput] = useState([]);
  const [lexicalModal, setLexicalModal] = useState("none");
  const [parserModal, setParserModal] = useState("none");
  const [semanticModal, setSemanticModal] = useState("none");
  const tokens = generateTokens();

  const handleSetCodigo = (value) => {
    setCodigo(value);
  }

  const readAndAnalyzeFile = (e) => {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      setCodigo(event.target.result);
    });
    reader.readAsText(e.target.files[0])
    e.target.value = null;
  }

  const analyze = (e) => {
    e.preventDefault();

    const lexico = createLexicalAnalyser(codigo, tokens);
    let newLexical = {...lexicalOutput};
    newLexical = lexico;
    setLexicalOutput(newLexical);

    const parser = parserAnalysis(lexico, tokens);
    setParserOutput(parser.sintatico);
    setSemanticOutput(parser.semantico);
    console.log(parser.semantico);
  }

  return (
    <div className="container">
      <Modal disp={lexicalModal} setDisp={setLexicalModal}>
        <p>Erros:</p>
        { lexicalOutput.errors.length ? <div>
          {lexicalOutput.errors.map((error)=>{
            return(
              <p>{error.message}</p>
            )
          })}
        </div>:"vazio"}
        <p>Tokens:</p>
        <table className="tokenTable">
          <tr>
            <th>Lexema</th>
            <th>Token</th>
          </tr>
          {lexicalOutput.tokens.map((token)=>{
            return (
            <tr>
              <td>{token.image}</td>
              <td>{token.tokenType.name}</td>
            </tr>
            )
          })}
        </table>
      </Modal>

      <Modal disp={parserModal} setDisp={setParserModal}>
        <p>Erros:</p>
        { parserOutput.length ? <div>
          {parserOutput.map((error)=>{
            return(
              <>
                <p>
                  Error: row({error.token.startLine}) Collumn({error.token.startColumn})
                </p>
                <p>
                  {error.message}
                </p>
              </>
            )
          })}
        </div>:"Sem erros"}
      </Modal>

      <Modal disp={semanticModal} setDisp={setSemanticModal}>
      <p>Erros:</p>
        { semanticOutput.length ? <div>
          {semanticOutput.map((error)=>{
            return(
              <>
                <p>
                  -{error}
                </p>
              </>
            )
          })}
        </div>:"Sem erros"}
      </Modal>
      <div className="input">
      <h4>Nomes: Gustavo Zaia, Vinicius Polachini</h4>
        <p>Input:</p>
        <textarea id="Code" value={codigo} onChange={(e)=>handleSetCodigo(e.target.value)}></textarea>
        <button onClick={(e)=>analyze(e)}>Executar Código</button>
        <label>Importar arquivo</label>
        <input type='file' style={{color: 'white'}} onChange={(e)=>readAndAnalyzeFile(e)}></input>
      </div>

      <div className="output">
        <p>Outputs:</p>
        <button onClick={() => {setLexicalModal("block")}}>Lexico</button>
        <button onClick={() => {setParserModal("block")}}>Sintatico</button>
        <button onClick={() => {setSemanticModal("block")}}>Semantico</button>
      </div>
    </div>
  );
}

export default App;
