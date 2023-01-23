
const { EmbeddedActionsParser } = require("chevrotain")

function findToken(name, tokens){
    return tokens.find((token) => token.name === name); 
}


let tabelaSemantica = [];
let errosSemanticos = [];

function findVariavel(variavel){
  for(let i=0; i<tabelaSemantica.length; i++){
    if(tabelaSemantica[i].cadeia === variavel && tabelaSemantica[i].categoria === 'var'){
      tabelaSemantica[i].usado = true;
      return tabelaSemantica[i].tipo;
    } 
  }
  return '';
}

function checkIfParserIsProcessing(item){
  if(typeof item !== 'object') return true;
  if(!item) return true;
  return !('description' in item)
}

function insertSemantica(item, opcionais){
  if(checkIfParserIsProcessing(item)){
    tabelaSemantica.push({
      cadeia: item.image,
      token: item.tokenType.name,
      categoria: 'categoria' in opcionais ? opcionais.categoria:'-',
      tipo: 'tipo' in opcionais ? opcionais.tipo:'-',
      valor: 'valor' in opcionais ? opcionais.valor:'-',
      escopo: 'escopo' in opcionais ? opcionais.escopo:'-',
      usado: 'usado' in opcionais ? opcionais.usado:'-',
    })
  }
}

class VarParser extends EmbeddedActionsParser {
  constructor(allTokens) {
    super(allTokens)

    const $ = this
     $.RULE("program", () => {
      let programa;

      $.CONSUME(findToken("PROGRAM", allTokens))
      programa = $.CONSUME(findToken("IDENTIFICADOR", allTokens))
      insertSemantica(programa, {categoria:'program_name'});
      $.CONSUME(findToken("PONTO_VIRGULA", allTokens))
      $.SUBRULE($.bloco)
    })

    $.RULE("bloco", ()=>{
      $.MANY(() => {
       $.OR([
        { ALT: () => { $.SUBRULE($.declaracaoDeVariaveis)} },
        { ALT: () => {$.SUBRULE($.declaracaoDeSubRotinas)} }
       ])
      })
      $.SUBRULE($.comandoComposto)
    })

    $.RULE('comandoComposto', () => {
      $.CONSUME(findToken("BEGIN", allTokens))
      $.AT_LEAST_ONE_SEP({
        SEP: findToken("PONTO_VIRGULA", allTokens),
        DEF: () => {
          $.SUBRULE($.comando)
        }
      })
      $.CONSUME(findToken("END", allTokens))
    })
    
    $.RULE("atribuicao",() => {
      let variavel, expressao;

      variavel = $.SUBRULE($.variavel)
      $.CONSUME(findToken('ATRIBUICAO', allTokens))
      expressao = $.SUBRULE($.expressao)

      insertSemantica(variavel, {categoria: 'var', tipo: expressao.tipo, usado: false})
    })

    $.RULE("comando", () => {
      $.AT_LEAST_ONE(()=>{
        $.OR([
          { ALT: () => {$.SUBRULE($.atribuicao)} },
          { ALT: () => {$.SUBRULE($.chamadaProcedimento)} },
          { ALT: () => {$.SUBRULE($.comandoComposto)} },
          { ALT: () => {$.SUBRULE($.comandoCondicional)} },
          { ALT: () => {$.SUBRULE($.comandoRepeticao)} }
         ])
        })
      })

    $.RULE("chamadaProcedimento", () => {
      $.OR([
        { ALT: () => {$.CONSUME(findToken("READ", allTokens)) }},
        { ALT: () => {$.CONSUME(findToken("WRITE", allTokens))} },
       ])
      $.OPTION(()=>{
        $.CONSUME(findToken("PAROPEN", allTokens))
        $.SUBRULE($.listaExpressoes)
        $.CONSUME(findToken("PARCLOSE", allTokens))
      })
    })

    $.RULE("comandoCondicional", () => {
      let expressao;
      $.CONSUME(findToken("IF", allTokens))
      expressao = $.SUBRULE($.expressao)
      $.CONSUME(findToken("THEN", allTokens))
      $.SUBRULE($.comando)
      $.OPTION(()=>{
        $.CONSUME(findToken("ELSE", allTokens))
        $.SUBRULE1($.comando)
      })

      if(checkIfParserIsProcessing(expressao)){
        //checar tipo da expressão, se não for boolean, erro semantico
        if(expressao.tipo !== 'boolean'){
          errosSemanticos.push(`"if INT" está errado`)
        }
      }
    })

    $.RULE("comandoRepeticao", () => {
      let expressao;
      $.CONSUME(findToken("WHILE", allTokens))
      expressao = $.SUBRULE($.expressao)
      $.CONSUME(findToken("DO", allTokens))
      $.SUBRULE($.comando)

      if(checkIfParserIsProcessing(expressao)){
        //checar tipo da expressão, se não for boolean, erro semantico
        if(expressao.tipo !== 'boolean'){
          errosSemanticos.push(`"While INT" está errado`)
        }
      }
    })

    $.RULE("listaExpressoes", () => {
      $.AT_LEAST_ONE_SEP({
        SEP: findToken("VIRGULA", allTokens),
        DEF: () => {
          $.SUBRULE($.expressao)
        }
      })
    })

    $.RULE("expressao", () => {
      let expressao = {};
      let expressao2 = {};
      let relacao = "";
      let aux = false;

      expressao = $.SUBRULE($.expressaoSimples)
      
      $.OPTION(()=>{
        aux = true;
        relacao = $.SUBRULE($.relacao)
        expressao2 = $.SUBRULE1($.expressaoSimples)
      })

      if(checkIfParserIsProcessing(expressao) && checkIfParserIsProcessing(expressao2)&& checkIfParserIsProcessing(relacao)){
        if((expressao.tipo==='boolean' || expressao2.tipo==='boolean') && ('tipo' in expressao2)){
          //erro semantico, pois operação de relação é entre inteiros
          errosSemanticos.push(`Uma expressão "${expressao.tipo} ${relacao.image} ${expressao2.tipo}" não é valida`)
        }

        expressao['tipo'] = aux ? 'boolean':expressao.tipo;
      }

      return expressao;
    })

    $.RULE("relacao", () => {
      let relacao = '';
      $.OR([
        { ALT: () => {relacao = $.CONSUME(findToken("IGUAL", allTokens))} },
        { ALT: () => {relacao = $.CONSUME(findToken("DIFERENTE", allTokens))} },
        { ALT: () => {relacao = $.CONSUME(findToken("MAIORIGUAL", allTokens))} },
        { ALT: () => {relacao = $.CONSUME(findToken("MENORIGUAL", allTokens))} },
        { ALT: () => {relacao = $.CONSUME(findToken("MENOR", allTokens))} },
        { ALT: () => {relacao = $.CONSUME(findToken("MAIOR", allTokens))} }
      ])
      return relacao;
    })

    $.RULE("expressaoSimples", () => {
      let expressao = {};
      $.OR([{
        ALT: () => {
          expressao['tipo'] = 'boolean';
          $.OR1([
            {ALT: () => $.CONSUME(findToken("TRUE", allTokens))},
            {ALT: () => $.CONSUME(findToken("FALSE", allTokens))},
          ])
        }

      },{ 
      ALT: () => {
      $.OPTION(()=>{
      $.OR2([
        { ALT: () => {$.CONSUME(findToken("SUB", allTokens))} },
        { ALT: () => {$.CONSUME(findToken("SOM", allTokens))} },
      ])
      })
      expressao['tipo'] = $.SUBRULE($.termo)
      $.MANY(() => {
        $.OR3([
          { ALT: () => {$.CONSUME(findToken("OR", allTokens))} },
          { ALT: () => {$.CONSUME1(findToken("SUB", allTokens))} },
          { ALT: () => {$.CONSUME1(findToken("SOM", allTokens))} },
        ])
        $.SUBRULE1($.termo)
      })
      }
      }])
    
      return expressao;
    })

    $.RULE('termo', () => {
      let operation = '', fator1, fator2, tipo = '';

      fator1 = $.SUBRULE($.fator)
      $.MANY(()=>{
          $.OR([
            { ALT: () => {operation = $.CONSUME(findToken("DIV", allTokens))} },
            { ALT: () => {operation = $.CONSUME(findToken("MUL", allTokens))} },
            { ALT: () => {operation = $.CONSUME(findToken("AND", allTokens))} },
          ])
        fator2 = $.SUBRULE1($.fator)

        if(checkIfParserIsProcessing(fator1) && checkIfParserIsProcessing(fator2)){
          if(operation.image === '/' || operation.image === '*'){
            tipo = 'int';
            if(fator1!=='int' || fator2!=='int'){
              //registrar erro de tipo na operação aritmética
              errosSemanticos.push(`erro de tipos na operação aritmética: ${fator1} ${operation} ${fator2}`);
            }
          }
          else if(operation.image === 'and'){
            tipo = 'boolean';
            if(fator1!=='boolean' || fator2!=='boolean'){
              //registrar erro de tipo na operação lógica
              errosSemanticos.push(`erro de tipos na operação lógica: ${fator1} ${operation} ${fator2}`);
            }
          }
        }

        })
      
        return tipo ? tipo:fator1;
    })

    $.RULE('fator', () => {
      let tipo = '', fator='', variavel;
      $.OR([
        { ALT: () => {
          tipo = 'int'
          $.CONSUME(findToken("INTEGER", allTokens))} },
        { ALT: () => {
            variavel = $.SUBRULE($.variavel) 
            if(checkIfParserIsProcessing(variavel)){
              tipo = findVariavel(variavel.image);
              if(!tipo){
                errosSemanticos.push(`variavel ${variavel.image} não foi instanciada`);
              }
            }
          }
        },
        { ALT: () => {
          $.CONSUME(findToken("PAROPEN", allTokens))
          tipo = $.SUBRULE($.expressao)
          $.CONSUME(findToken("PARCLOSE", allTokens))
        } },
        { ALT: () => {
          tipo = 'boolean'
          $.CONSUME(findToken("NOT", allTokens))
          fator = $.SUBRULE($.fator)
          if(checkIfParserIsProcessing(fator)){
            //checar se fator é do tipo boolean, se não, erro.
            if(fator !== 'boolean'){
              errosSemanticos.push(`Não se pode negar um tipo não boleano: not ${fator}`)
            }
          }
        } },
      ])
      return tipo;
    })
    
    $.RULE('variavel', () => {
      let variavel;
      variavel = $.CONSUME(findToken("IDENTIFICADOR", allTokens))
      $.OPTION(()=>{
        $.CONSUME(findToken("COLOPEN", allTokens))
        $.SUBRULE($.expressao)
        $.CONSUME(findToken("COLCLOSE", allTokens))
      })
      return variavel;
    })

    $.RULE("declaracaoDeSubRotinas", () => {
      $.MANY(()=>{
        $.SUBRULE($.declaracaoDeProcedimento)
        $.CONSUME(findToken("PONTO_VIRGULA", allTokens))
      })
    })

    $.RULE("declaracaoDeProcedimento", () => {
      $.CONSUME(findToken("PROCEDURE", allTokens))
      $.CONSUME(findToken("IDENTIFICADOR", allTokens))
      $.OPTION(()=>{
        $.SUBRULE($.parametrosFormais)
      })
      $.CONSUME(findToken("PONTO_VIRGULA", allTokens))
      $.SUBRULE($.bloco)
    })

    $.RULE("parametrosFormais", () => {
      $.CONSUME(findToken("PAROPEN", allTokens))
      $.AT_LEAST_ONE_SEP({
        SEP: findToken("PONTO_VIRGULA", allTokens),
        DEF: () => {
          $.SUBRULE($.secaoDeParametrosFormais)
        }
      })
      $.CONSUME(findToken("PARCLOSE", allTokens))
    })
 
    $.RULE("secaoDeParametrosFormais", () => {
      $.OPTION(()=>{
        $.CONSUME(findToken("VAR", allTokens))
      })
      $.SUBRULE($.listaIdentificadores)
      $.CONSUME(findToken("DOIS_PONTOS", allTokens))
      $.SUBRULE($.identificaTipo)
    })

    $.RULE("declaracaoDeVariaveis", () => {
      $.SUBRULE($.identificaTipo)
      $.SUBRULE($.listaIdentificadores)
      $.CONSUME(findToken("PONTO_VIRGULA", allTokens))
    })

    $.RULE("listaIdentificadores",()=>{
      $.AT_LEAST_ONE_SEP({
        SEP: findToken("VIRGULA", allTokens),
        DEF: () => {
          $.CONSUME(findToken("IDENTIFICADOR", allTokens))
        }
      })
    })

   $.RULE("identificaTipo",()=>{
      $.OR([
        { ALT: () =>{ $.CONSUME(findToken("INT", allTokens))} },
        { ALT: () => $.CONSUME(findToken("BOOL", allTokens)) }
      ])
    })

    this.performSelfAnalysis()
  }
}

export function parserAnalysis(lexical, tokens){
    errosSemanticos = [];
    tabelaSemantica = [];

    const parser = new VarParser(tokens);

    parser.input = lexical.tokens;

    parser.program();

    console.log(tabelaSemantica);

    return {
      sintatico: parser.errors,
      semantico: errosSemanticos
    };
}