/** Description of the objects and class structure 
 * suitable for the ExtDate and ExtDateTimeFormat class extensions 
 * provided in calendrical-javascript package.
 * The methods that the user should provide are also described here.
 * This module file does not contain any JS code, only JSDoc specifications. 
 * @module customcalendarmodel
 * @version M2022-08-03
 * @author Louis A. de Fouquières https://github.com/Louis-Aime
 * @license MIT 2016-2022
*/
/**	Class model for custom calendar classes or objects, inspired by Temporal but adapted to ExtDate and ExtDateTimeFormat objects.
 * @typedef {Object} Customcalendar 
 * @property {String} id 	- a specific name for this calendar, used by the ExtDate.toCalString method.
 * @property {String} canvas 	- the name of a built-in calendar that provides the initial structure, and possible the names of months, weekdays etc. for the target calendar.
 * @property {access} pldr 	- the "private locale data repository" Document Object, to use for displaying certain fields (e.g. months) with ExtDateTimeFormat.
 * @property {String[]} eras	- array of the string codes for the eras for this calendar, if eras used.
 * @property {String} stringFormat	- a field expressing how date string is computed. Possible values are:
	* "built-in" : compute parts of displayed string as an ordinary DateTimeFormat, and then modify each part as stated by "partsFormat" object;
	* "fields" : general structure of string as stated from options, but values changed following fields of this calendar, and modified as stated by "partsFormat";
	* currently, this option only works with Roman-like calendars;
	* "auto" (default): means "built-in".
 * @property {displayFields} displayFields	- optional function (fields) that changes fields values before fetching CLDR or PLDR for displaying.
 * @property {Object} partsFormat	- specifies how to format each part corresponding to each date field. Each tag is the name of a part to display (e.g. "era").
 * @property {Object} partsFormat.current	- 'current' is the name of a date field, like year, month, day etc.
 * @property {String} partsFormat.current.mode	- how to find the value: 
	* "cldr" : leave value set by standard Intl.DateTimeFormat.FormatToParts (equivalent to no object for this part name).
	* "field": put field as is; if undefined, put "". For test and debug, and for void fields.
	* "list" : (enumerable) values indicated in "source" field; if field is not a number, index to be found searching "codes".
	* "pldr" : values to be found in calendar.pldr, a DOM which represents a "private locale data repository" designated with its URI/URL or identifier.
 * @property {access} partsFormat.current.source 	- the reference to the values, if mode == "list" or "pldr".
 * @property {String[]} partsFormat.current.codes 	- if (mode == "list" ) and for a non-numeric field (e.g. an era), the array of codes to search for.
 * @property {keyFromField} partsFormat.current.key	- used with "cldr" or "pldr": (field_value) => (search_key), the search_key to be used for searching in CLDR or PLDR. 
 * @property {buildDateFromFields} buildDateFromFields - construct a new ExtDate object from date coordinates in this calendar.
 * @property {fieldsFromCounter}	fieldsFromCounter	- from a timestamp, give UTC date and hour fields. 
 * @property {counterFromFields}	counterFromFields	- from a UTC date and time expression, compute the timestamp. 
 * @property {weekFieldsFromCounter}	weekFieldsFromCounter	- from a timestamp, give UTC date in week coordinates and hour fields. 
 * @property {counterFromWeekFields} counterFromWeekFields 	- from a UTC date in week coordinates and time expression, compute the timestamp.
 * @property {solveAskedFields} solveAskedFields 	- from a set of date fields, solve any ambiguity before merging.
 * @property {inLeapYear}	inLeapYear 	function (fields) is this date a leap year
 */
/** Object type for the date figures using ExtDate. There is a distinction between 'numeric' fields and others.
 * The numeric fields are all numbers, and define the date in a unique way. All custom calendars shall provide all numeric fields.
 * Non numeric fields are not required from custom calendars.
 * Fields may hold the date and time coordinates for any time zone.
 * @typedef ExtDateType
 * @property {String} era	- a short international acronym that helps resolving the complete date together with the other date fields;
 * e.g. "BC" or "AD" in the context of the Julian calendar, that is necessary in addition to the 'year' indication; 
 * this field is not numeric.
 * @property {Number} year	- a positive number that expresses the year; the era element is necessary in order to fully determine the year; 
 * this element is considered non numeric, although it is a number.
 * @property {Number} fullYear	- an algebraic number that determines the year in a non ambiguous manner; 
 * the range of possible values is without hole; this is considered a numeric field.
 * @property {String} monthCode	- a short acronym, e.g. 'M01' for the first month, or 'M06L' for the doubled sixth month or leap month after 'M06';
 * this code helps finding the month name, since M07 has the same name, whether or not it is month 7 in a regular year or month 8 in a leap year;
 * if this field is not defined in a custom calendar, the monthCode shall be set to the string corresponding to the month number;
 * this is considered non numeric.
 * @property {Number} month		- month number in a year; the months of a given year are enumerated starting from 1 and without hole.
 * this is considered a numeric field.
 * @property {String} leapMonth	- if present, value is "leap" indicating that the leap month version of the month name should be used.
 * @property {Number} day 		- the number of the day in the month, starting from 1 and without hole. 
 * @property {Number} hour		- the number of hours since the beginning of the present day, no change with respect to Date.
 * @property {Number} minutes		- the number of minutes since the beginning of the present hour, no change with respect to Date.
 * @property {Number} seconds		- the number of seconds since the beginning of the present minute, no change with respect to Date.
 * @property {Number} milliseconds	- the number of milliseconds since the beginning of the present second, no change with respect to Date.
*/
/** Object type for the week figures of a date
 * @typedef WeekFigures 
 * @property {Number} weekYearOffset 	- number to add to current fullYear to get fullYear the week belongs to;
 * @property {Number} weekYear 		- year for the week coordinates (civil full year + weekYearOffset);
 * @property {Number} weekNumber 	- number of the week in the year;
 * @property {Number} weekday 		- number of the day in the week, 0..6 for Sunday..Saturday or 1..7 for Monday..Sunday, or a weekday number of another week structure.
 * @property {Number} weeksInYear 	- number of weeks in the weekYear the week belongs to.
*/
/** From the value of a date field, provide the search key to use for searching in Unicode's CLDR or in the PLDR used,
 * to be referenced in partsFormat.
 * In most cases, the simple unnamed function 'i => i' will fit.
 * @callback keyFromField
 * @param {Number|String}	- the value of the date field, a year, month or day number, or an era string.
 * @return {String}		- the key to be used for searching in CLDR or in the PLDR.
*/
/** From a set of date fields, solve any ambiguity between year, era, fullYear, before merging.
 * @callback solveAskedFields
 * @param {Object}		- set of fields to be merged in order to have a consistent and unambiguous date expression.
 * @return {Object} 	the solved fields.
*/
/** Build a new ExtDate object from a calendar and a set of date coordinates. It is possible to use a variant to ExtDate.
 * @callback buildDateFromFields
 * @param {Object} fields	- compound object that expresses the date in this calendar; first month is 1; missing fields are deemed 0 or floor value (1).
 * @param {class} [construct = ExtDate]	- class used to construct date object; provided for possible extensions.
 * @return {Object} 	the result of 'new construct' applied to the parameters with this calendar.
 *
*/
/** Compute the UTC date fields in this calendar from the Posix timestamp.
 * @callback fieldsFromCounter
 * @param {Number} timeStamp	- the timestamp in ms.
 * @return {Object} 		the UTC date figures; the names are in numericFields list: fullYear, month, day; 
 * the year field, as it should be displayed (e.g. 55 for 55 B.C.
 * the era (string) field if applicable; if era is not present, year is fullYear.
 * month number is always 1-based (January is 1).
*/
/** Compute the Posix timestamp from a UTC date expression in this calendar.
 * @callback counterFromFields
 * @param {Object} fields	- compound object that expresses the date in this calendar; first month is 1; missing fields are deemed 0 or floor value (1).
 * @return {Number} 	the Posix timestamp, in ms, corresponding to the date expression.
*/
/** Compute the UTC date week fields in this calendar from the Posix timestamp.
 * @callback weekFieldsFromCounter
 * @param {Number} timeStamp	- the timestamp in ms.
 * @return {WeekFigures} the UTC date week figures, see WeekFigures type for details.
*/
/** Compute the Posix timestamp from a UTC date week expression in this calendar.
 * @callback counterFromWeekFields
 * @param {WeekFigures} fields	- compound object that expresses the date in week coordinates in this calendar; missing fields are deemed 0 or floor value (1).
 * @return {Number} 	the Posix timestamp, in ms, corresponding to the date expression.
*/
/** Is the calendar year of this UTC date a leap year ?
 * @callback inLeapYear
 * @param {Object}	- the coordinates of a date in this calendar.
 * @return {boolean}	this year is a leap year for this calendar.
*/
/** Change the value of certain date fields before using CLDR.
 * This is done for example with the Hebrew calendar, where the month number above 5 of any non-leap year is incremented by one in CLDR.
 * @callback displayFields
 * @param {ExtDateType} internalFields	- fields as they are computed internally, with no hole
 * @return {ExtDateType} displayTypeFields	- types for the search in CLDR
*/