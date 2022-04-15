const fs = require("fs");

const originalScript = fs.readFileSync("file.py", { encoding: "utf8" });

const wait = async (ms) => {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(`Waited ${ms}ms`);
		}, ms);
	});
};


/**
 * @param {string} text - String to convert
 * @returns {string} The converted string
**/
const convertData = async (text) => {
	console.log("Starting conversion!");

	console.log("Doing basic conversions...");
	text = text.replace(/\s?#.*?$/gm, "") // Remove any and all comments
		.replace(/;$/gm, "") // Remove all ';' from end of lines
		.replace(/"""(.|\n|\r|\r\n)*?"""/g, "") // Remove all docstrings
		.replace(/^\t+\w+: \w+$/gm, "") // Remove any type setters
		.replace(/\s->\s.*?:/g, ":") // Remove all function output types
		.replace(/^\s+$/gm, "") // Remove any whitespace on otherwise empty lines
		.replace(/(\n|\r|\r\n){2,}/g, "\n") // Remove any multi line gaps

		// Simple word subtitution
		.replace(/for/g, "FOR") // for loops
		.replace(/class/g, "DEFINE CLASS") // for loops
		.replace(/continue/g, "NEXT ITERATION\n") // continue Statements
		.replace(/break/g, "END LOOP\n") // continue Statements
		.replace(/return/g, "RETURN") // return Statements
		.replace(/else/g, "ELSE") // else Statements
		.replace(/ in /g, " IN ") // "in" statements
		.replace(/print\(/g, "OUTPUT(") // Print statements
		.replace(/input\(/g, "INPUT(") // Input statements
		.replace(/eval\(/g, "EVAL(") // Eval functions
		.replace(/\.append\(/g, ".add(") // Append -> 'add"
		.replace(/import/g, "IMPORT") // Imports
		.replace(/re/g, "REGEX"); // Regular Expressions


	await wait(100);
	console.log("Replacing function type setters...");
	let reg = /(\w+):\s?\w+/;
	let matches = 1;
	while(matches > 0){ // Function type setters
		const textMatch = text.match(reg);
		if(!textMatch || textMatch?.length === 0) break;

		text = text.replace(textMatch[0], textMatch[1]);

		matches = (text.match(reg)?.length || 0);
	}

	await wait(100);
	console.log("Replacing variables...");
	reg = /(\w[a-zA-Z0-9]+)\s?=\s?/;
	matches = 1;
	while(matches > 0){ // Setting variables
		const textMatch = text.match(reg);
		if(!textMatch || textMatch?.length === 0) break;

		text = text.replace(textMatch[0], `SET ${textMatch[1]} TO: `);

		matches = (text.match(reg)?.length || 0);
	}

	await wait(100);
	console.log("Replacing if statements...");
	reg = /if\((.*)\):/;
	matches = 1;
	while(matches > 0){ // if statements
		const textMatch = text.match(reg);
		if(!textMatch || textMatch?.length === 0) break;

		text = text.replace(textMatch[0], `IF(${textMatch[1]}) THEN:`);

		matches = (text.match(reg)?.length || 0);
	}

	await wait(100);
	console.log("Replacing while statements...");
	reg = /while\((.*?)\):/;
	matches = 1;
	while(matches > 0){ // While Loops
		const textMatch = text.match(reg);
		if(!textMatch || textMatch?.length === 0) break;

		text = text.replace(textMatch[0], `WHILE(${textMatch[1]}) LOOP:`);

		matches = (text.match(reg)?.length || 0);
	}

	await wait(100);
	console.log("Replacing len() statements...");
	reg = /len\((.*?)\)/;
	matches = 1;
	while(matches > 0){ // len() functions
		const textMatch = text.match(reg);
		if(!textMatch || textMatch?.length === 0) break;

		text = text.replace(textMatch[0], `LENGTH OF ${textMatch[1]}`);

		matches = (text.match(reg)?.length || 0);
	}

	await wait(100);
	console.log("Replacing String.join(Array) statements...");
	reg = /(\w+)\.join\((.*?)\)/;
	matches = 1;
	while(matches > 0){ // String.Join makes no fucking sense python
		const textMatch = text.match(reg);
		if(!textMatch || textMatch?.length === 0) break;

		text = text.replace(textMatch[0], `${textMatch[2]} JOINED WITH ${textMatch[1]}`);

		matches = (text.match(reg)?.length || 0);
	}

	await wait(100);
	console.log("Adding spaces...");
	reg = /(\s+)?def((.|\n|\r|\r\n)*?\n)(\w)/;
	matches = 1;
	while(matches > 0){ // Add a space before and after all functions
		const textMatch = text.match(reg);
		if(!textMatch || textMatch?.length === 0) break;

		text = text.replace(textMatch[0], `\n\n${textMatch[1]}DECLARE FUNCTION${textMatch[2]}\n\n${textMatch[4]}`);

		matches = (text.match(reg)?.length || 0);
	}

	text = text.replace(/\n/g, "\n\n"); // Add a gap between all lines
	text = text.replace(/(\n|\r|\r\n){4,4}/g, "\n\n") // Fix up big gaps
		.replace(/(\n|\r|\r\n){7,7}/g, "\n\n\n\n\n")
		.replace(/(\n|\r|\r\n){5}/g, "\n\n\n\n")
		.replace(/^/, "Converted via PyToPseudo - https://github.com/Multarix/PyToPseudo\n\n");

	await wait(100);
	return text;
};

convertData(originalScript).then(txt => {
	console.log("Writing to file...");
	fs.writeFileSync("pseudo.txt", txt, { encoding: "utf8" });
	console.log("Done!");
});
