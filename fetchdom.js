/** Fetch an XML resource as a Document Object (DOM).
 * @module {ESS2015} fetchdom
 * @version M2021-08-21
 * @license MIT Louis A. de Fouquières 2016-2022
 * Inquiries: https://github.com/Louis-Aime
 */
// Charset UTF-8.
/* Version	M2022-01-19	Enhance JSdoc comments
	M2021-08-21	Handle all error cases in a similar way, setting the error variable to the error code.
	M2021-07-22	make a module.
	M2021-02-13	Build as a Promise, in a similar way to import(), and not embbeded as a module.
*/
"use strict";
/** This function works like import (): it returns a Promise to build a DOM from an XML resource.
 * @static
 * @function fetchDOM
 * @param {String} XMLResource - the URL of the fetched resource.
 * @param {Number} timeout - the timeout passed to XMLHttpRequest in ms; default is 0, meaning no timeout.
 * @return {Promise} The parameter of the resolution function is the fetched resource,
 * the parameter of the failure function is the error message. 
*/
export default function fetchDOM (XMLResource, timeout = 0) {	// This is similar to import () but it builds one DOM from an XML file.
	return new Promise ( (resol, fail) => { 
		var XMLRequest = new XMLHttpRequest();	// Request object. Cannot be reinitiated. State can be rea,d from another script.
		XMLRequest.addEventListener ("loadend", // load external file into a DOM parameter that is passed through the callback
			function (event) {
				// console.log ("fetchDOM result code: " + XMLRequest.status + ", resource: "+ XMLResource);
				if (XMLRequest.responseXML != null) { resol (XMLRequest.responseXML) }
				else fail ("fetchDOM result code: " + XMLRequest.status + ", resource: "+ XMLResource) ;
			})
		XMLRequest.addEventListener ("error", 
			function (event) {
				fail ("XMLHttpRequest error on resource: " + XMLResource)
			})
		XMLRequest.addEventListener ("abort", 
			function (event) {
				fail ("XMLHttpRequest abort on resource: " + XMLResource)
			})
		XMLRequest.addEventListener ("timeout", 
			function (event) {
				fail ("XMLHttpRequest timeout on resource: " + XMLResource)
			})
		if (timeout != 0) XMLRequest.timeout = timeout;
		XMLRequest.open("GET", XMLResource);
		XMLRequest.send();
		})
	}
