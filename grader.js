#!/usr/bin/env node
/*
  Automatically grade files for the presence of specified HTML tags/attributes.
  Uses commander.js and cheerio. Teaches command line application development
  and basic DOM parsing.

  References:

   + cheerio
	   - https://github.com/MatthewMueller/cheerio
		   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
			   - http://maxogden.com/scraping-with-node.html

				 + commander.js
				    - https://github.com/visionmedia/commander.js
					    - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

						  + JSON
						     - http://en.wikipedia.org/wiki/JSON
							     - https://developer.mozilla.org/en-US/docs/JSON
								     - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
									  */

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var util= require('util');
var url = require('url');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
	     var instr = infile.toString();
	     if(!fs.existsSync(instr)) {
				        console.log("%s does not exist. Exiting.", instr);
				        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
				    }
	     return instr;
	 };

var loadChecks = function(checksfile) {
	 return JSON.parse(fs.readFileSync(checksfile));

	 };


// Refactored code so HTML checking is handled in a separate function that takes arbitrary html data then checks it
// this was needed due to the asynchronous nature of node - we need to do the check sequentially, not using
// return values from a "get data at this URL" function
var checkHtml = function(html, checksfile) {
	 var $ = cheerio.load(html);
	 var checks = loadChecks(checksfile).sort();
	 var out = {};
	 for(var ii in checks) {
		  var present = $(checks[ii]).length > 0;
		  out[checks[ii]] = present;
	 }
	 
	 var outJson = JSON.stringify(out, null, 4);
	 console.log(outJson);
};

// response function for REST
var buildfn = function(checksfile) {
	 var gradeURL = function(result, response) {
		  if (result instanceof Error) {
				console.error('HTTP Error: ' + util.format(response.message));
		  } else {
				console.error("Graded data from %s", this.url.href);
				// https://github.com/danwrong/restler/blob/master/lib/restler.js
				// internal URL variable
				checkHtml(result,checksfile);
		  }
	 };
	 return gradeURL;
};

// takes a path - either a URL or a filename, and runs tests on it
var runTests = function(location,checksfile){
	 if (url.parse(location).protocol == 'http:'){
		  var gradeURL = buildfn(checksfile);
		  rest.get(location).on('complete',gradeURL);
	 } else {

		  /* here, wre are using an asynchronous rest call if it's a URL
			  and a synchronous file read command if it 's a file
			  for consistency, we could switch this to an async file read
			  too, so the program behaves the same in both instances */
		  console.log(location + "    " + checksfile);
		  html = fs.readFileSync(location);
		  checkHtml(html,checksfile);
	 }	 
};

var clone = function(fn) {
	     // Workaround for commander.js issue.
	     // http://stackoverflow.com/a/6772648
	     return fn.bind({});
	 };

if(require.main == module) {
	 program
	     .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	     .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		  .option('-u, --url <url_address>', 'URL to check', null)
		  .parse(process.argv);
	 if(program.url == null) {
		  runTests(program.file, program.checks);
	 } else {
		  runTests(program.url, program.checks);
	 }

} else {
	 exports.checkHtmlFile = checkHtmlFile;
}
