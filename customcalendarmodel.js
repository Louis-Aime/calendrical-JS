/** 
 * @file Description of the class structure that defines a calendar
 * suitable for the ExtDate and ExtDateTimeFormat extensions provided in calendrical-javascript package.
 * This file does not contain any JS code, only specifications. 
 * Contents may be read from the Global section of the JSDoc generated doclet.
 * @version M2022-01-26
 * @author Louis A. de Fouquières https://github.com/Louis-Aime
 * @license MIT 2016-2022
*/
/**	Class model for custom calendar classes or objects, inspired by Temporal but adapted to Date Object
 * @typedef {Object} Customcalendar 
 * @property {string} id 	- a specific name for this calendar, for the ExtDate.toCalString method
 * @property {string} canvas 	- the name of a built-in calendar that provides the initial structure, and possible the names of months, weekdays etc. for the target calendar.
 * @property {access} pldr 	- the "private locale data register" Document Object, to use for displaying certain fields (e.g. months) with ExtDateTimeFormat.
 * @property {string[]} eras	- array of the string codes for the eras for this calendar, if eras used.
 * @property {string} stringFormat	- a field expressing how date string is computed. Possible values are:
	* "built-in" : compute parts of displayed string as an ordinary DateTimeFormat, and then modify each part as stated by "partsFormat" object;
	* "fields" : general structure of string as stated from options, but values changed following fields of this calendar, and modified as stated by "partsFormat";
	* currently, this option only works with Roman-like calendars;
	* "auto" (default): means "built-in".
 * @property {object} partsFormat	- an Object, that specify how to format each part corresponding to each date field. Each tag is the name of a part to display (e.g. "era").
 * @property {object} partsFormat.current	- 'current' is the name of a date field, like year, month, day etc.
 * @property {string} partsFormat.current.mode	- how to find the value: 
	* "cldr" : leave value set by standard FormatToParts (equivalent to no object for this part name).
	* "field": put field as is; if undefined, put "". For test and debug, and for void fields.
	* "list" : (enumerable) values indicated in "source" field; if field is not a number, index to be found in "codes".
	* "pldr" : values to be found in calendar.pldr, a DOM which represents a "private locale data register" designated with its URI/URL or identifier.
 * @property {access} partsFormat.current.source 	- the reference to the values, if mode == "list" or "pldr".
 * @property {string[]} partsFormat.current.codes 	- if (mode == "list" ) and for a non-numeric field, the array of codes to search for.
 * @property {function} partsFormat.current.key	- used with "cldr" or "pldr": (field_value) => (search_key), the search_key to be used for searching in cldr or pldr. 
 * @todo	partFormats.current.codes could be inserted in "source" field; the routine would test typeof source.
 * @property {function}	fieldsFromCounter	- function (number), from a date stamp deemed UTC, give date and hour fields. Date fields shall be as follows: 
	*	The fields in the numericFields list: fullYear, month, day. 
	*	year, as it should be displayed. 
	*	era, to be displayed. If era is not in fields, year is fullYear. 
	*	month is 1-based. 
	*	return {fields}. if (fields.era = undefined), year (if existing) is fullYear. Otherwhise a fullYear() method is provided. You may always get fullYear. 
 * @property {function}	counterFromFields	- function (fields),  from a compound object that expresses the date in calendar (with month in base 1), create the Posix Value for the date (UTC); 
	*	return (number).
 * @property {function}	weekFieldsFromCounter	- function (timeStamp), the week fields, from a timestamp deemed UTC.
	* return the following object {
	*		weekYearOffset: number to add to current fullYear to get fullYear the week belongs to.
	*		weekYear : year for the week coordinates (civil full year + weekYearOffset).
	*		weekNumber : number of the week in the year.
	*		weekday : number of the day in the week, 0..6 for Sunday..Saturday or 1..7, depending on the calendar.
	*		weeksInYear : number of weeks in the weekYear the week belongs to.
 * @property {function} counterFromWeekFields 	- function(fields), from a compound object that expresses the date in week coordinates for the calendar, compute the time stamp.
	* required entry fields are weekYear, weekNumber, weekday
	* return (timeStamp)
 * @property {function} solveAskedFields 	- function (fields), from a set of fields, solve any ambiguity between year, era, fullYear, month, monthCode, before merging.
	*	return (fields)
	}
 * @property {function}	fullYear 	 function(fields), the signed integer number that unambigously represents the year in the calendar. If in regressive era, the year is translated into a negative or null number.
 * @property {function}	era	function (date) : the era code
 * @property {function}	year	function (date) : the year displayed with the era (if existing), or the unambiguous year .
 * @property {function}	inLeapYear 	function (fields) is this date a leap year
 */