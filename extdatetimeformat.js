/** Extension of Intl.DateTimeFormat objects, to handle custom calendars.
 * this module is linked to module:extdate.js, but could also be used with Temporal
 * @module {ESS2015} ExtDateTimeFormat
 * @version M2021-09-18
 * @requires module:extdate.js
 * @license MIT Louis A. de Fouquières 2016-2022
 * Inquiries: https://github.com/Louis-Aime
 */
// Character set is UTF-8
/* Purpose
	Handle custom calendars
	New functionnalities for Intl.DateTimeFormat
Contents
	Description of Custom calendar objects
	ExtDateTimeFormat: extension of Intl.DateTimeFormat
*/
/*	Version	M2022-01-24	JSdoc
	M2021-09-18	When asked partFormat.mode is "field", numeric field follows locale numeration
	See history on GitHub
*/
/* Copyright Miletus 2020-2022 - Louis A. de Fouquières
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
	1. The above copyright notice and this permission notice shall be included
	in all copies or substantial portions of the Software.
	2. Changes with respect to any former version shall be documented.

The software is provided "as is", without warranty of any kind,
express of implied, including but not limited to the warranties of
merchantability, fitness for a particular purpose and noninfringement.
In no event shall the authors of copyright holders be liable for any
claim, damages or other liability, whether in an action of contract,
tort or otherwise, arising from, out of or in connection with the software
or the use or other dealings in the software.
Inquiries: www.calendriermilesien.org
*/
"use strict";
import ExtDate from './extdate.js';
	/** Extend and customise capacities to display dates in different calendars
	 * @class
	 * @extends Intl.DateTimeFormat
	 * @param {string} locale	- as for Intl.DateTimeFormat
	 * @param {Object} options	- same as for Intl.DateTimeFormat + this field
		* eraDisplay : ("never"/"always"/"auto"), default to "auto": should era be displayed ?
	 * @param {Object} calendar	- a calendar used to format the date.
		*	If this parameter is not specified, the calendar resolved with locale and options will be used. 
		*	If specified as a built-in calendar string, this calendar supersedes the one resolved with locale and options. 
		*	If specified as a custom calendar and if a Private Locale Data Repository is given, this will be used for calendar's entity names. 
		*	If no pldr is provided, the calendar.canvas field refers to the built-in calendar to use for entity names.
		*	Note: The custom calendar model is specified in 'customcalendarmodel.js', a code-free file that JSDoc displays as a Global object.
 	*/
export default class ExtDateTimeFormat extends Intl.DateTimeFormat {
	constructor (locale, options, calendar) { // options should not be set to null, not accepted by Unicode
		let myOptions = {...options}; // copy originally asked options.
		if (typeof calendar == "string") myOptions.calendar = calendar;
		super (locale, myOptions);
		// Resolve this.calendar options
		if (typeof calendar == "object") this.calendar = calendar;
		this.options = myOptions;	// this.options may be changed without changing the parameter
		this.locale = locale;
		// Resolve case where no field is asked for display : if none of weekday, year, month, day, hour, minute, second is asked, set a standard suite
		if (this.options == undefined) this.options = {};
		if (this.options.weekday == undefined
			&& this.options.year == undefined
			&& this.options.month == undefined
			&& this.options.day == undefined
			&& this.options.hour == undefined
			&& this.options.minute == undefined
			&& this.options.second == undefined
			&& this.options.dateStyle == undefined
			&& this.options.timeStyle == undefined) this.options.year = this.options.month = this.options.day = "numeric";
		this.DTFOptions = super.resolvedOptions();	// should hold all locale resolved information in DTFOptions.locale
		this.options.locale = this.DTFOptions.locale;
		this.options.calendar = (this.calendar != undefined && this.calendar.canvas != undefined) ? this.calendar.canvas : this.DTFOptions.calendar; 
		// set calendar option for standard DTF after calendar.canvas if specified, and re-compute DTF resolved options
		if (this.options.calendar != this.DTFOptions.calendar) { 
			this.DTFOptions.calendar = this.options.calendar 
			this.DTFOptions = new Intl.DateTimeFormat(this.DTFOptions.locale, this.DTFOptions).resolvedOptions();
		}
		this.options.numberingSystem = this.DTFOptions.numberingSystem;
		this.options.timeZone = this.DTFOptions.timeZone;
		this.options.timeZoneName = this.DTFOptions.timeZoneName;
		this.options.dayPeriod = this.DTFOptions.dayPeriod;
		this.options.hour12 = this.DTFOptions.hour12;
		this.options.hourCycle = this.DTFOptions.hourCycle;

		// Control and resolve specific options
		if (this.options.eraDisplay == undefined) this.options.eraDisplay = "auto";
		switch (this.options.eraDisplay) {
			case "always":	if (options.era == undefined) options.era = "short";
			case "auto": 	// we should insert here the preceding statement, however this can have impact if era is asked from the user.
			case "never": break;
			default: throw new RangeError ("Unknown option for displaying era: " + this.options.eraDisplay);
		}
		if (this.options.eraDisplay == "auto" && this.DTFOptions.year == undefined) this.options.eraDisplay = "never";
		if (this.calendar != undefined) {
			if (this.calendar.stringFormat == undefined) this.calendar.stringFormat = "auto";
			switch (this.calendar.stringFormat) {
				case "built-in" : case "fields" : case "auto" : break;
				default : throw new RangeError ("Unknown option for date string computing method ('auto', 'built-in' or 'fields'): " + this.calendar.stringFormat);
				}
		}
		// Prepare implied parameters for formatting
		this.lang = this.options.locale.includes("-") ? this.options.locale.substring (0,this.options.locale.indexOf("-")) : this.options.locale;
		this.figure1 = new Intl.NumberFormat (this.options.locale, {minimumIntegerDigits : 1, useGrouping : false});
		this.figure2 = new Intl.NumberFormat (this.options.locale, {minimumIntegerDigits : 2, useGrouping : false});
		this.figure4 = new Intl.NumberFormat (this.options.locale, {minimumIntegerDigits : 4, useGrouping : false});
		this.figure6 = new Intl.NumberFormat (this.options.locale, {minimumIntegerDigits : 6, useGrouping : false});

		// Resolve extended options for timeStyle and dateStyle
		if (this.options.timeStyle != undefined) {
			this.options.timeZoneName = this.options.timeStyle == "full" ? "long" : "short";
			this.options.hour = this.options.minute = this.options.second = "2-digit"; 
			delete this.options.fractionalSecondDigits;
			switch (this.options.timeStyle) {
				case "short" : delete this.options.second;
				case "medium" : delete this.options.timeZoneName;
				case "long" : case "full": ;		// options.timeZoneName already computed
			}
			delete this.options.timeStyle;
		}
		if (this.options.dateStyle != undefined) {
			delete this.options.weekday;
			this.options.day = "numeric"; this.options.month = "short"; this.options.year = "numeric";
			switch (this.options.dateStyle)  {
				case "medium" : break; 
				case "short" : this.options.day = this.options.month = "2-digit"; break;
				case "full" : this.options.weekday = "long";
				case "long" : this.options.month = "long";
			}
			delete this.options.dateStyle;
		}
		// Resolve numeric options for date and time elements: day or hour elements' 2-digit options overwrite other numeric options of other date resp. time elements.
		if (this.options.day == "2-digit" && this.options.month != undefined && this.options.month == "numeric") this.options.month = "2-digit";
		if (this.options.hour == "2-digit" && this.options.minute != undefined) this.options.minute = "2-digit";
		if (this.options.minute == "2-digit" && this.options.second != undefined) this.options.second = "2-digit";
		// Special options for month
		this.monthContext =  // the context for month may be 'format' or 'stand-alone'
				(this.options.day == null && this.options.year == null) ? 'stand-alone' : 'format';
		if (this.options.month != undefined) {
			this.monthWidth = "";
			switch (this.options.month) {	// analyse month asked option, deduct month display option
				case "numeric" : case "2-digit": this.monthWidth = "numeric"; break;
				case "narrow":	this.monthWidth = "narrow" ; break;
				case "short": this.monthWidth = "abbreviated"; break; 
				case "long" : this.monthWidth = "wide"; break;
			}
		}
		// Special options for days of week
		this.dayContext = (this.options.day == null && this.options.month == null && this.options.year == null) ? 'stand-alone' : 'format';
		// stringFormat "fields" option is only possible with a calendar that uses Roman months
		if (this.calendar != undefined && this.calendar.stringFormat == "fields") switch (this.calendar.canvas) {
			case "iso8601": case "gregory": case "buddhist": case "japanese": case "roc": break;
			default : throw new RangeError ("Canvas formatting implemented only from gregory-like built-in calendars: " + this.calendar.canvas);
		}
		// Exclude lunar calendar models as canvas - for now...
		if (this.calendar != undefined) switch (this.calendar.canvas) {
			case "chinese": case "dangi": case "hebraic" : throw new RangeError ("No canvas formatting from luni-solar calendars: " + this.calendar.canvas);
			default : ;
		}
	}	// end constructor
	/** The names of the fields necessary to fully characterise a date in any calendar.
	 * @static
	 * @return {string[]} the names of the minimum fields necessary for an unambiguous date.
	*/
	static dateFieldNames () { return ["era", "year", "month", "day"] }
	/** The universal keys for the weekdays of the standard 7-days week, used in CLDR and to be used with a Private Locale Data Register
	* @static
	* @param {number} index 0 to 6.
	* @return {string} a three-character string for the weekday.
	*/
	static weekdayKey (i) { return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][i] }	// the keys used for weekdays in CLDR, use the same for PLDR
	/** the resolved options for this object, that slightly differ from those of Intl.DateTimeFormat.
	 * @return {Object} the options revised to reflect what will be provided. eraDisplay is also resolved.
	*/
	resolvedOptions() { 
		return this.options
	}
	/** Should era be displayed for a given date in reference calendar ? manage eraDisplay option.
	* @param {Object} aDate	- the given date with its calendar and options
	* @return {Boolean}	whether era should be displayed
	*/
	displayEra (aDate) {	// Should era be displayed for this date, with these calendar and options ?
		let date = new ExtDate(this.calendar, aDate.valueOf());
		switch (this.options.eraDisplay) {
			case "never" : return false;
			case "always": if (this.calendar != undefined && this.calendar.eras == null) { return false } else return true;	// if custom calendar has no era, return false
			case "auto":
				if ((this.options.year == null && this.options.era == null)	// Neither year option nor era option set
					|| (this.calendar != undefined && this.calendar.eras == null))		// this calendar has no era whatsoever
					return false;
				var today = new ExtDate(this.calendar);
				if (this.calendar == undefined) {	// a built-in calendar, let us just compare with a particular formatting - with Temporal, this part of code is cancelled
								// era : "short" is the better choice to get a discriminant era. "long" may lead to no era field at all !
					let eraFormat = new Intl.DateTimeFormat ( this.options.locale, { calendar : this.options.calendar, year : "numeric", era : "short" } ),
						dateParts = eraFormat.formatToParts(date),
						todaysParts = eraFormat.formatToParts(today),
						eraIndex = dateParts.findIndex(item => item.type == "era"),
						todayEraIndex = todaysParts.findIndex(item => item.type == "era");	// those indexes may be different !
					if (eraIndex >= 0) { return todayEraIndex < 0 ? true : (dateParts[eraIndex].value !== todaysParts[todayEraIndex].value) }
					else return false; // no era part found in date to be displayed, do not atempt to display 
				}
				else 	// a custom calendar with era, simplier to use
					return this.calendar.fieldsFromCounter(date.toResolvedLocalDate (this.options.timeZone).valueOf()).era 
						!== this.calendar.fieldsFromCounter(today.toResolvedLocalDate (this.options.timeZone).valueOf()).era ;
		}
	}
	/** Fetch a value from a Private Locale Date Repository (pldr)
	 * @param {string} name		- name of the date field (era / month / dayofweek)
	 * @param {string} option	- asked format option fot this field 
	 * @param {number|string} value	- field value for the date field in ExtDate "bag"
	 * @return {string} the string value for this date field after the current options
	*/
	pldrFetch (name,options,value) {	// return string value to insert to Parts
		let selector = "", Xpath1 = "", node = {}, result = "";
		switch (name) {
			case "era" :	// analyse era options here since at construction it is not known whether era shall be displayed
				switch (options) { 
					case "long" : selector = "eraNames"; break;
					case "short": selector = "eraAbbr"; break;
					case "narrow":selector = "eraNarrow"; break;
				}
				Xpath1 = "/pldr/ldmlBCP47/calendar[@type='"+this.calendar.id+"']/eras/"+selector
					+"/era[@type=" + value + "]";
				node = this.calendar.pldr.evaluate(Xpath1, this.calendar.pldr, null, XPathResult.STRING_TYPE, null);
				result = node.stringValue;
				// language specific ?
				Xpath1 = "/pldr/ldml/identity/language[@type='"+this.lang
					+"']/../calendar[@type='"+this.calendar.id+"']/eras/"+selector
					+"/era[@type=" + value + "]";
				node = this.calendar.pldr.evaluate(Xpath1, this.calendar.pldr, null, XPathResult.STRING_TYPE, null);
				if (node.stringValue != "") result = node.stringValue; // If found, replace international name with language specific one.
				return result; break;
			case "month": 	// this.monthWidth may be initiated with month being numeric.
				Xpath1 = "/pldr/ldmlBCP47/calendar[@type='"+this.calendar.id+"']/months/monthContext[@type='"+this.monthContext
					+"']/monthWidth[@type='" + this.monthWidth
					+"']/month[@type="+ value + "]";
				node = this.calendar.pldr.evaluate(Xpath1, this.calendar.pldr, null, XPathResult.STRING_TYPE, null);
				result = node.stringValue;
				// Search if a language specific name exists
				Xpath1 = "/pldr/ldml/identity/language[@type='"+this.lang
					+"']/../calendar[@type='"+this.calendar.id+"']/months/monthContext[@type='"+this.monthContext
					+"']/monthWidth[@type='" + this.monthWidth
					+"']/month[@type=" + value + "]";
				node = this.calendar.pldr.evaluate(Xpath1, this.calendar.pldr, null, XPathResult.STRING_TYPE, null);
				if (node.stringValue != "") result = node.stringValue; // If found, replace international name with language specific one.
				if (result == "")		// no result obtained, give a number, or a 2-digit number if this option is set.
					result = options == "2-digit" ? this.figure2.format(value) : this.figure1.format(value);
				return result;
				break;
			case "weekday": 
				switch (options) {
					case "long" : selector = this.dayContext == "format" ? "wide" : "wide"; break;
					case "short": selector = this.dayContext == "format" ? "abbreviated" : "short"; break;
					case "narrow":selector = this.dayContext == "format" ? "short" : "narrow"; break;
				}
				Xpath1 = "/pldr/ldmlBCP47/calendar[@type='"+this.calendar.id+"']/days/dayContext[@type='"+this.dayContext
					+"']/dayWidth[@type='"+selector
					+"']/day[@type=" + value + "]";
				node = this.calendar.pldr.evaluate(Xpath1, this.calendar.pldr, null, XPathResult.STRING_TYPE, null);
				result = node.stringValue;
				// Search if a language specific name exists
				Xpath1 = "/pldr/ldml/identity/language[@type='"+this.lang
					+"']/../calendar[@type='"+this.calendar.id+"']/days/dayContext[@type='"+this.dayContext
					+"']/dayWidth[@type='"+selector
					+"']/day[@type=" + value + "]",
				node = this.calendar.pldr.evaluate(Xpath1, this.calendar.pldr, null, XPathResult.STRING_TYPE, null);
				if (node.stringValue != "") result = node.stringValue; // If found, replace international name with language specific one.
				return result; break;
		}
	}
	/** Extended FormatToParts method.
	 * @param {Object} aDate	- the date to be displayed
	 * @return {Object[]} like the Intl.DateTimeFormat, but enhanced
	*/
	formatToParts (aDate) {	
		// Prepare parameters
		let	date = new ExtDate (this.calendar, aDate),
			options = {...this.options},
			displayEraOfDate = this.displayEra(date); // should Era for this date be displayed

		if (!displayEraOfDate) delete options.era // Alas, this is not enough
		else if (options.era == null) options.era = "short";

		// Determine the date fields (the Temporal Date numeric + era code elements) using UTC representation of expected date
		let myAbsoluteDate = new ExtDate (this.calendar,date.toResolvedLocalDate (options.timeZone).valueOf()), // this the absolute date to print in UTC.
			myDateFields,
			myParts = new Intl.DateTimeFormat(options.locale, options).formatToParts(date), // first try, in desired language and timeZone
			myPartsTZ = myParts.find (item => (item.type == "timeZoneName")),
			myTZ = (myPartsTZ != undefined) ? myPartsTZ.value : null;	// Remember Time zone name since we compute on UTC date values.
		if (this.calendar != undefined) {
			myDateFields = this.calendar.fieldsFromCounter (myAbsoluteDate.valueOf()); // the fields of the date in the calendar, not TZ-dependant.
			try {
				Object.assign(myDateFields, this.calendar.weekFieldsFromCounter (myAbsoluteDate.valueOf()));	// Add week-related fields, including "weekday".
			}
			catch (e) {}	// week fields may not have been implemented. 
		}
		if (this.calendar != undefined && this.calendar.stringFormat == "fields") {	// order of parts is OK, but parts should be computed from fields. Week is considered OK. canvas calendar is Roman.
			options.timeZone = "UTC";
			let myCanvasFields = {...myDateFields};
			let shiftDate = new Date (myAbsoluteDate.valueOf());
			shiftDate.setUTCFullYear(myDateFields.fullYear, myCanvasFields.month-1, 1); // desired year and month, day set to 1.
			let myDOWPart = new Intl.DateTimeFormat(options.locale, {calendar : options.calendar, weekday : options.weekday, timeZone : "UTC" }).format(myAbsoluteDate);
			myParts = new Intl.DateTimeFormat(options.locale, options).formatToParts(shiftDate); // desired month, day = 1.
			// Now put week day, day, and time zone name for these calendars
			if (myParts.findIndex( (item) => item.type == "weekday") >=0 ) myParts.find( (item) => item.type == "weekday").value = myDOWPart;
			if (myParts.findIndex( (item) => item.type == "day") >=0 ) 
				myParts.find( (item) => item.type == "day").value 
					= options.day == "2-digit" ? this.figure2.format(myDateFields.day) : this.figure1.format(myDateFields.day);
			if (myTZ != null) myParts.find (item => (item.type == "timeZoneName")).value = myTZ;
			//if (myParts.findIndex( (item) => item.type == "year") >=0 ) myParts.find( (item) => item.type == "year").value = ""+(myDateFields.year); // the "original" year
			//if (myParts.findIndex( (item) => item.type == "era") >=0 ) myParts.find( (item) => item.type == "era").value = ""+(myDateFields.era); // the coded era
			
		}
		if (this.calendar != undefined && this.calendar.partsFormat != undefined) {
			// some ICU computations have to be anticipated here
			myParts.forEach( function (item, i) { 
				if (this.calendar.partsFormat[item.type] != undefined ) switch (this.calendar.partsFormat[item.type].mode){
					case "cldr" : break; // already computed
					case "field" : switch (item.type) {
						case "year" : switch (options.year) {
							case "2-digit" : // Authorised only if displayed year is strictly positive, and with a quote.
								myParts[i].value = (myDateFields.year > 0) 
									? ("'" + this.figure2.format(myDateFields.year % 100)) 
									: this.figure1.format(myDateFields.year);
								break;
							case "numeric" : myParts[i].value = this.figure1.format(myDateFields.year); break;
							} break;
						case "day": switch (options.day) {
							case "2-digit" : myParts[i].value = this.figure2.format(myDateFields.day); break;
							case "numeric" : myParts[i].value = this.figure1.format(myDateFields.day); break;
							} break;
						default : // insert field directly, blank if undefined
							myParts[i].value = myDateFields[item.type] == undefined ? "" : myDateFields[item.type] ; break; 
						} break; 
					case "list" : switch (item.type) {
						case "era" : myParts[i].value = this.calendar.partsFormat[item.type].source[this.calendar.partsFormat[item.type].codes.indexOf(myDateFields[item.type])];
							break;
						case "month": switch (options.month) {
							case "2-digit" : myParts[i].value = this.figure2.format(myDateFields.month); break;
							case "numeric" : myParts[i].value = this.figure1.format(myDateFields.month); break;
							default : myParts[i].value = this.calendar.partsFormat[item.type].source[myDateFields[item.type]-1]
						} break;
						case "weekday" : myParts[i].value = this.calendar.partsFormat[item.type].source[myDateFields[item.type]-1]; break;
						default : // other fields are numeric, not subject to lists;
						} break;
					case "pldr" : 		// fake ICU computations using pldr. 
						//	myInitialParts = {...myParts}; // Initial code was nested the reverse way.
						// myParts = myInitialParts.map ( ({type, value}) => { // .map may not map to itself
						switch (item.type) {
							case "era": myParts[i].value = this.pldrFetch ("era",options.era,
								this.calendar.eras.indexOf(myDateFields[item.type])); break;
							case "year": switch (options.year) {
								case "2-digit" : // Authorised only if displayed year is strictly positive, and with a quote.
									myParts[i].value = (myDateFields.year > 0) ? ("'" + this.figure2.format(myDateFields.year % 100)) : this.figure1.format(myDateFields.year);
									break;
								case "numeric" : myParts[i].value = this.figure1.format(myDateFields.year); 
								}
								break;
							case "month" : 
								myParts[i].value = this.pldrFetch ("month", options.month, (myDateFields.month)); 
								break;
							case "day": switch (options.day) {
								case "2-digit" : myParts[i].value = this.figure2.format(myDateFields.day); break;
								case "numeric" : myParts[i].value = this.figure1.format(myDateFields.day); break;
								} 
								break;
							case "weekday": 
								let key = this.calendar.partsFormat.weekday.key;
								if ( key == undefined ) key = ExtDateTimeFormat.weekdayKey;	// a function
								myParts[i].value = this.pldrFetch ("weekday", options.weekday, key(myDateFields.weekday)); break;
							case "hour": switch (options.hour) {
								case "numeric" :	// This option is often tranformed in 2-digit with ":" separators, force to individual printing
									let ftime = new Intl.DateTimeFormat (options.locale, {timeZone : options.timeZone, hour : "numeric", timeZoneName : "short"}),
										tparts = ftime.formatToParts(myAbsoluteDate), tindex = tparts.indexOf ( (item) => item.type == "hour" );
									myParts[i].value = this.figure1.format(tparts[tindex].value); 
									break;
								case "2-digit": break;	// do nothing, formatting already done.
								}
								break;
							case "minute": switch (options.minute) {
								case "numeric" :	// This option is often tranformed in 2-digit with ":" separators, force to individual printing
									let ftime = new Intl.DateTimeFormat (options.locale, {timeZone : options.timeZone, minute : "numeric", timeZoneName : "short"}),
										tparts = ftime.formatToParts(myAbsoluteDate), tindex = tparts.indexOf ( (item) => item.type == "minute" );
									myParts[i].value = this.figure1.format(tparts[tindex].value); 
									break;
								case "2-digit": break;	// do nothing, formatting already done.
								}
								break;
							case "second": switch (options.second) {
								case "numeric" :	// This option is often tranformed in 2-digit with ":" separators, force to individual printing
									let ftime = new Intl.DateTimeFormat (options.locale, {timeZone : options.timeZone, second : "numeric", timeZoneName : "short"}),
										tparts = ftime.formatToParts(myAbsoluteDate), tindex = tparts.indexOf ( (item) => item.type == "second" );
									myParts[i].value = this.figure1.format(tparts[tindex].value);
									break;
								case "2-digit": break;	// do nothing, formatting already done.
								}
								break;
							default : throw new RangeError ("Unknown date field: " + item.type);
							}	// End of switch on item.type
						break;	// End of "pldr" case
					}	// End of switch on (this.calendar.partsFormat[item.type].mode)
			} 		// end of forEach function body
			,this);	// Inside the function, this should be the same as here
		}	// End of if (this.calendar.partsFormat != undefined)
		// Erase 2-digit effects on numeric-asked fields, not including related literals.
		// This operation is only done if language is not right-to-left written.
		if (!["ar","fa","he","ji","ug","ur","yi"].some (item => item == this.options.locale.substring(0,2),this)) {
			myParts.forEach ( function (item, i) {
				if (options[item.type] != undefined && options[item.type] == "numeric")	{	// Intl.DateTimeFormat often converts to 2-digit and inserts literals
					if (!isNaN(myParts[i].value)) myParts[i].value = this.figure1.format(item.value);
					switch (item.type) {
						// case "month" : case "day" : if (i+1 < myParts.length && myParts[i+1].value != ' ') myParts[i+1].value = ' '; break; // pb with month before year
						case "hour" : case "minute" : if (i+1 < myParts.length && [":","."].includes(myParts[i+1].value)) 
															myParts[i+1].value = item.type == "hour" ? " h " : " min "; break;
						case "second" : if (i+1 < myParts.length) { if (myParts[i+1].value == " ") myParts[i+1].value = " s " }
										else myParts.push({ type : "literal", value : " s"} );
					}
				}
			},this)
		}
		// suppress era part if required
		if (!displayEraOfDate) {
			let n = myParts.findIndex((item) => (item.type == "era")), nn = n;
			if (n >= 0) { // there is an undesired era section, check whether there is an unwanted literal connected to it
				if (nn > 0) { nn-- } else { nn++ }; // nn is index of era part neighbour.
				if (myParts[nn].type == "literal") myParts.splice (Math.min(n,nn),2) // Suppress era part and its neighbour
				else myParts.splice (n,1); 
			}
		}
	return myParts
	}
	/** format, from computed parts, using extended FormatToParts
	 * @param {Object} date		- the date to display
	 * @return {string} the string to display
	*/
	format (date) {
		let parts = this.formatToParts (date); // Compute components
		return parts.map(({type, value}) => {return value;}).reduce((buf, part)=> buf + part, "");
	}
}
