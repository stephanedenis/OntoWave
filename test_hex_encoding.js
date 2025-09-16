// Test HEX encoding for PlantUML
function toHex(str) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16).padStart(2, '0').toUpperCase();
  }
  return result;
}

const umlContent = "Alice -> Bob: Hello";
const hexEncoded = "h" + toHex(umlContent);
const url = `https://www.plantuml.com/plantuml/svg/~${hexEncoded}`;

console.log("Content:", umlContent);
console.log("HEX encoded:", hexEncoded);
console.log("PlantUML URL:", url);

// Test with curl
const { exec } = require('child_process');
exec(`curl -s "${url}" | head -5`, (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log("Response preview:");
  console.log(stdout);
});
