const { preprocessText } = require('./utils/helper');

const text = "y our   r ea L iT y   d oesn' T   c hange   m ine This section is for the haters.";
const processedText = preprocessText(text);
console.log('Original text:', text);
console.log('Processed text:', processedText); 