const chevrotain = require("chevrotain");
const Lexer = chevrotain.Lexer;

export function createLexicalAnalyser(txt, tokens){
    const al = new Lexer(tokens);
    return al.tokenize(txt);
}