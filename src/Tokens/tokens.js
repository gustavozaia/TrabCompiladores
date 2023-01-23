const chevrotain = require("chevrotain");
const createToken = chevrotain.createToken;

const identificador = createToken({name:"IDENTIFICADOR", pattern:/(_|[A-Z]|[a-z])(_|[A-Z]|[a-z]|[0-9]){0,14}/})

const definitions = [
    {name:"ESPACO", pattern: /\s+/, group: chevrotain.Lexer.SKIPPED},
    {name:"INTEGER", pattern:/[1-9][0-9]{0,7}/},
    {name:"IGUAL", pattern:/=/},
    {name:"DIFERENTE", pattern:/<>/},
    {name:"MAIORIGUAL", pattern:/>=/},
    {name:"MENORIGUAL", pattern:/<=/},
    {name:"MENOR", pattern:/</},
    {name:"MAIOR", pattern:/>/},
    {name:"VAR", pattern:/var/, longer_alt: identificador},
    {name:"ATRIBUICAO", pattern:/:=/},
    {name:"PONTO_VIRGULA", pattern:/;/},
    {name:"DOIS_PONTOS", pattern:/:/},
    {name:"COMENTARIO", pattern:/\{(.*)\}/, group: chevrotain.Lexer.SKIPPED},
    {name:"COMENTARIODELINHA", pattern:/\/\/.*/, group: chevrotain.Lexer.SKIPPED},
    {name:"DIV", pattern:/div/, longer_alt: identificador},
    {name:"MUL", pattern:/\*/},
    {name:"SUB", pattern:/-/},
    {name:"SOM", pattern:/\+/},
    {name:"NOT", pattern:/not/, longer_alt: identificador},
    {name:"AND", pattern:/and/, longer_alt: identificador},
    {name:"OR", pattern:/or/, longer_alt: identificador},
    {name:"ELSE", pattern:/else/, longer_alt: identificador},
    {name:"THEN", pattern:/then/, longer_alt: identificador},
    {name:"IF", pattern:/if/, longer_alt: identificador},
    {name:"BOOL", pattern:/boolean/, longer_alt: identificador},
    {name:"INT", pattern:/int/, longer_alt: identificador},
    {name:"WRITE", pattern:/write/, longer_alt: identificador},
    {name:"READ", pattern:/read/, longer_alt: identificador},
    {name:"TRUE", pattern:/true/, longer_alt: identificador},
    {name:"FALSE", pattern:/false/, longer_alt: identificador},
    {name:"VIRGULA", pattern:/,/},
    {name:"PONTO", pattern:/\./},
    {name:"PAROPEN", pattern:/\(/},
    {name:"PARCLOSE", pattern:/\)/},
    {name:"COLOPEN", pattern:/\[/},
    {name:"COLCLOSE", pattern:/]/},
    {name:"BEGIN", pattern:/begin/, longer_alt: identificador},
    {name:"END", pattern:/end/, longer_alt: identificador},
    {name:"WHILE", pattern:/while/, longer_alt: identificador},
    {name:"DO", pattern:/do/, longer_alt: identificador},
    {name:"PROGRAM", pattern:/program/, longer_alt: identificador},
    {name:"PROCEDURE", pattern:/procedure/, longer_alt: identificador},
]

export function generateTokens(){
    let tokens=[];
    definitions.forEach(definition => {
        tokens.push(createToken(definition));
    });
    tokens.push(identificador);
    return tokens;
}