/** Description of the objects and class structure 
 * suitable for the ExtDate and ExtDateTimeFormat class extensions 
 * provided in calendrical-javascript package.
 * The methods that the user should provide are also described here.
 * This module file does not contain any JS code, only JSDoc specifications. 
 * User provided methods are listed as 'types' despite the JSDoc @callback tag.
 * @module customcalendarmodel
 * @version M2022-08-06
 * @author Louis A. de Fouquières https://github.com/Louis-Aime
 * @license MIT 2016-2022
*/
/**	Class model for custom calendar classes or objects, inspired by Temporal but adapted to ExtDate and ExtDateTimeFormat objects.
 * @typedef {Object} Customcalendar 
 * @property {String} id 	- a specific name for this calendar, used by the ExtDate.toCalString method.
 * @property {String} canvas 	- the name of a built-in calendar that provides the initial structure, and possible the names of months, weekdays etc. for the target calendar.
 * @property {access} pldr 	- the "private locale data repository" document object, to use for displaying certain fields (e.g. months) with ExtDateTimeFormat.
 * @property {String[]} eras	- array of the string codes for the eras for this calendar, if eras used.
 * @property {String} stringFormat	- a field expressing how date string is computed. Possible values are:
	* "built-in" : compute parts of displayed string as an ordinary DateTimeFormat, and then reformat each part as stated by "partsFormat" object;
	* "fields" : general structure of string as stated from options, but values recomputed following fields of this calendar, and modified as stated by "partsFormat";
	* currently, this option only works with Roman-like calendars;
	* "auto" (default): means "built-in".
 * @property {Object} partsFormat	- specifies how to format each part corresponding to each date field. Each tag is the name of a part to display (e.g. "era").
 * @property {Object} partsFormat.current	- 'current' is the name of a date field, like year, month, day etc.
 * @property {String} partsFormat.current.mode	- how to find the value: 
	* "cldr" : leave value set by standard Intl.DateTimeFormat.FormatToParts (equivalent to no object for this part name).
	* "field": put field as is; if undefined, put "". For test and debug, and for void fields.
	* "list" : (enumerable) values indicated in "source" field; if field is not a number, index to be found searching "codes".
	* "pldr" : values to be found in calendar.pldr, an XML document which represents a "private locale data repository"
 * @property {access} partsFormat.current.source 	- the reference to the values, if mode == "list" or "pldr".
 * @property {String[]} partsFormat.current.codes 	- if (mode == "list" ) and for a non-numeric field (e.g. an era), the array of codes to search for.
 * @property {String} partsFormat.current.calname	- if (mode == "pldr"), the calendar name to fetch. If not specified, "canvas".is tried, else "id"
 * @property {function} partsFormat.current.key		- if (mode == "pldr", (field_value) => search_key); 
 * by default, the search key is the field value, except for weekdays of the standard 7-days week, where the keys are ['sun', 'mon' ... 'sat' ]; 
 * therefore, this function should be provided if an alternative week structure is specified.
 * @property {buildDateFromFields} buildDateFromFields - construct a new ExtDate object from date coordinates in this calendar.
 * @property {fieldsFromCounter}	fieldsFromCounter	- from a timestamp, give UTC date and hour fields. 
 * @property {counterFromFields}	counterFromFields	- from a UTC date and time expression, compute the timestamp. 
 * @property {weekFieldsFromCounter}	weekFieldsFromCounter	- from a timestamp, give UTC date in week coordinates and hour fields. 
 * @property {counterFromWeekFields} counterFromWeekFields 	- from a UTC date in week coordinates and time expression, compute the timestamp.
 * @property {solveAskedFields} solveAskedFields 	- from a set of date fields, solve any ambiguity before merging.
 * @property {inLeapYear}	inLeapYear 	function (fields) => (boolean): is this date in a leap year ?
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
 * @property {Number} month		- month number in a year; the months of a given year are enumerated starting from 1 and without hole.
 * this is considered a numeric field.
 * @property {String} monthCode	- (optional) a short acronym, 
 * e.g. 'M01' for the first month, or 'M06L' for the doubled sixth month or leap month after 'M06';
 * inspired from Temporal and used with non-Unicode display applications;
 * if this field is not defined in a custom calendar, the monthCode shall be set to the month number;
 * @property {String} monthType	- (optional) the type under which the month name should be searched for in lists, CLDR or PLDR;
 * with lunisolar calendars, a same 'month' value can lead to different month names; 
 * this field, together with "leapMonth", helps solving such cases;
 * if missing, ExtDateTimeFormat uses .month as monthType when searching the month name. 
 * @property {String} leapMonth	- (optional), value is "leap" indicating that the leap month version of the month name should be used;
 * if present, ExtDateTimeFormat adds a search key before exploring CLDR or the PLDR, 
 * and also searches the PLDR for a "mark" to add before or after the month string.
 * @property {Number} day 		- the number of the day in the month, starting from 1 and without hole. 
 * @property {Number} hour		- the number of hours since the beginning of the present day, no change with respect to Date.
 * @property {Number} minutes		- the number of minutes since the beginning of the present hour, no change with respect to Date.
 * @property {Number} seconds		- the number of seconds since the beginning of the present minute, no change with respect to Date.
 * @property {Number} milliseconds	- the number of milliseconds since the beginning of the present second, no change with respect to Date.
*/
/** Object type for the week figures of a date
 * @typedef WeekFigures 
 * @property {Number} weekYearOffset 	- number to add to the current fullYear to get the fullYear the week belongs to;
 * @property {Number} weekYear 		- year for the week coordinates (civil full year + weekYearOffset);
 * @property {Number} weekNumber 	- number of the week in the year;
 * @property {Number} weekday 		- number of the day in the week, 0..6 for Sunday..Saturday or 1..7 for Monday..Sunday, or a weekday number of another week structure.
 * @property {Number} weeksInYear 	- number of weeks in the weekYear the week belongs to.
*/
/** From a set of date fields, solve any ambiguity between year, era, fullYear, before merging.
 * @callback solveAskedFields
 * @param {Object}		- set of fields to be merged in order to have a consistent and unambiguous date expression.
 * @return {Object} 	the solved fields.
*/
/** Build a new ExtDate object from a calendar and a set of UTC date coordinates. 
 * The constructor is ExtDate by default, however another one may be specified.
 * @callback buildDateFromFields
 * @param {Object} fields	- compound object that expresses the date in this calendar; first month is 1; missing fields are deemed 0 or floor value (1).
 * @param {class} [construct = ExtDate]	- the class used to construct date object.
 * @return {Object} 	the result of 'new construct' applied to the parameters with this calendar.
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
