import pdf from 'pdf-parse';
import mammoth from 'mammoth';

async function test() {
    console.log("PDF-PARSE TYPE:", typeof pdf);
    console.log("MAMMOTH TYPE:", typeof mammoth);
    console.log("MAMMOTH KEYS:", Object.keys(mammoth));
}

test();
