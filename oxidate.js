"use strict";

var timeSpan = require('./timeSpan.js');

var monthsAbbr = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
];

var monthsFull = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

var daysAbbr = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
];

var daysFull = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];

var dayNames = {
    'su':         0,
    'sun':        0,
    'sunday':     0,
    'mo':         1,
    'mon':        1,
    'monday':     1,
    'tu':         2,
    'tue':        2,
    'tuesday':    2,
    'we':         3,
    'wed':        3,
    'wednesday':  3,
    'th':         4,
    'thu':        4,
    'thursday':   4,
    'fr':         5,
    'fri':        5,
    'friday':     5,
    'sa':         6,
    'sat':        6,
    'saturday':   6
};
var monthsAll = monthsFull.concat(monthsAbbr);
var daysAll = [
    'su',
    'sun',
    'sunday',
    'mo',
    'mon',
    'monday',
    'tu',
    'tue',
    'tuesday',
    'we',
    'wed',
    'wednesday',
    'th',
    'thu',
    'thursday',
    'fr',
    'fri',
    'friday',
    'sa',
    'sat',
    'saturday'
];

var monthNames = {
    'jan':        0,
    'january':    0,
    'feb':        1,
    'february':   1,
    'mar':        2,
    'march':      2,
    'apr':        3,
    'april':      3,
    'may':        4,
    'jun':        5,
    'june':       5,
    'jul':        6,
    'july':       6,
    'aug':        7,
    'august':     7,
    'sep':        8,
    'september':  8,
    'oct':        9,
    'october':    9,
    'nov':        10,
    'november':   10,
    'dec':        11,
    'december':   11
};

var daysInMonth = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

function pad(str, length) {
    str = String(str);
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

var isInteger = function (str) {
    if (str.match(/^(\d+)$/)) {
        return true;
    }
    return false;
};
var getInt = function (str, i, minlength, maxlength) {
    for (var x = maxlength; x >= minlength; x--) {
        var token = str.substring(i, i + x);
        if (token.length < minlength) {
            return null;
        }
        if (isInteger(token)) {
            return token;
        }
    }
    return null;
};

var origParse = Date.parse;
// ------------------------------------------------------------------
// getDateFromFormat( date_string , format_string )
//
// This function takes a date string and a format string. It matches
// If the date string matches the format string, it returns the
// getTime() of the date. If it does not match, it returns NaN.
// Original Author: Matt Kruse <matt@mattkruse.com>
// WWW: http://www.mattkruse.com/
// Adapted from: http://www.mattkruse.com/javascript/date/source.html
// ------------------------------------------------------------------


var getDateFromFormat = function (val, format) {
    val = val + "";
    format = format + "";
    var iVal = 0;
    var iFormat = 0;
    var c = "";
    var token = "";
    var token2 = "";
    var x, y;
    var now = new Date();
    var year = now.getYear();
    var month = now.getMonth() + 1;
    var date = 1;
    var hh = 0;
    var mm = 0;
    var ss = 0;
    var ampm = "";

    while (iFormat < format.length) {
        // Get next token from format string
        c = format.charAt(iFormat);
        token = "";
        while ((format.charAt(iFormat) === c) && (iFormat < format.length)) {
            token += format.charAt(iFormat++);
        }
        // Extract contents of value based on format token
        if (token === "yyyy" || token === "yy" || token === "y") {
            if (token === "yyyy") {
                x = 4;
                y = 4;
            }
            if (token === "yy") {
                x = 2;
                y = 2;
            }
            if (token === "y") {
                x = 2;
                y = 4;
            }
            year = getInt(val, iVal, x, y);
            if (year === null) {
                return NaN;
            }
            iVal += year.length;
            if (year.length === 2) {
                if (year > 70) {
                    year = 1900 + (year - 0);
                } else {
                    year = 2000 + (year - 0);
                }
            }
        } else if (token === "MMM" || token === "NNN") {
            month = 0;
            for (var i = 0; i < monthsAll.length; i++) {
                var monthName = monthsAll[i];
                if (val.substring(iVal, iVal + monthName.length).toLowerCase() === monthName.toLowerCase()) {
                    if (token === "MMM" || (token === "NNN" && i > 11)) {
                        month = i + 1;
                        if (month > 12) {
                            month -= 12;
                        }
                        iVal += monthName.length;
                        break;
                    }
                }
            }
            if ((month < 1) || (month > 12)) {
                return NaN;
            }
        } else if (token === "EE" || token === "E") {
            for (var n = 0; n < daysAll.length; n++) {
                var dayName = daysAll[n];
                if (val.substring(iVal, iVal + dayName.length).toLowerCase() === dayName.toLowerCase()) {
                    iVal += dayName.length;
                    break;
                }
            }
        } else if (token === "MM" || token === "M") {
            month = getInt(val, iVal, token.length, 2);
            if (month === null || (month < 1) || (month > 12)) {
                return NaN;
            }
            iVal += month.length;
        } else if (token === "dd" || token === "d") {
            date = getInt(val, iVal, token.length, 2);
            if (date === null || (date < 1) || (date > 31)) {
                return NaN;
            }
            iVal += date.length;
        } else if (token === "hh" || token === "h") {
            hh = getInt(val, iVal, token.length, 2);
            if (hh === null || (hh < 1) || (hh > 12)) {
                return NaN;
            }
            iVal += hh.length;
        } else if (token === "HH" || token === "H") {
            hh = getInt(val, iVal, token.length, 2);
            if (hh === null || (hh < 0) || (hh > 23)) {
                return NaN;
            }
            iVal += hh.length;
        } else if (token === "KK" || token === "K") {
            hh = getInt(val, iVal, token.length, 2);
            if (hh === null || (hh < 0) || (hh > 11)) {
                return NaN;
            }
            iVal += hh.length;
        } else if (token === "kk" || token === "k") {
            hh = getInt(val, iVal, token.length, 2);
            if (hh === null || (hh < 1) || (hh > 24)) {
                return NaN;
            }
            iVal += hh.length;
            hh--;
        } else if (token === "mm" || token === "m") {
            mm = getInt(val, iVal, token.length, 2);
            if (mm === null || (mm < 0) || (mm > 59)) {
                return NaN;
            }
            iVal += mm.length;
        } else if (token === "ss" || token === "s") {
            ss = getInt(val, iVal, token.length, 2);
            if (ss === null || (ss < 0) || (ss > 59)) {
                return NaN;
            }
            iVal += ss.length;
        } else if (token === "a") {
            if (val.substring(iVal, iVal + 2).toLowerCase() === "am") {
                ampm = "AM";
            } else if (val.substring(iVal, iVal + 2).toLowerCase() === "pm") {
                ampm = "PM";
            } else {
                return NaN;
            }
            iVal += 2;
        } else {
            if (val.substring(iVal, iVal + token.length) !== token) {
                return NaN;
            } else {
                iVal += token.length;
            }
        }
    }
    // If there are any trailing characters left in the value, it doesn't match
    if (iVal !== val.length) {
        return NaN;
    }
    // Is date valid for month?
    if (month === 2) {
        // Check for leap year
        if (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)) { // leap year
            if (date > 29) {
                return NaN;
            }
        } else {
            if (date > 28) {
                return NaN;
            }
        }
    }
    if ((month === 4) || (month === 6) || (month === 9) || (month === 11)) {
        if (date > 30) {
            return NaN;
        }
    }
    // Correct hours value
    if (hh < 12 && ampm === "PM") {
        hh = hh - 0 + 12;
    } else if (hh > 11 && ampm === "AM") {
        hh -= 12;
    }
    var newdate = new Date(year, month - 1, date, hh, mm, ss);
    return newdate;
};

let oxiDate = {};
let offsetMinutes = (new Date()).getTimezoneOffset(); 

oxiDate.createUTC = function() {
    return oxiDate.toUTC( new Date());
}

oxiDate.parse = function (cdt, format) {
    return format ? getDateFromFormat(cdt, format) : new Date(cdt);
};

oxiDate.parseUTC = function (cdt, format) {
    let rslt = oxiDate.parse(cdt,format);
    rslt.isUTC = true;
    return rslt;
};

oxiDate.toUTC = function (date) {
    if (date.isUTC) return date;
    let rslt = oxiDate.addMinutes(date, offsetMinutes);
    rslt.isUTC = true;
    return rslt;
};

oxiDate.fromUTC = function (date) {
    if (!date.isUTC) return date;
    let rslt = oxiDate.addMinutes(date, -offsetMinutes);
    rslt.isUTC = false;
    return rslt;
};

oxiDate.validateDay = function (day, year, month) {
    var date = new Date(year, month, day);
    return (date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day);
};

oxiDate.validateYear = function (year) {
    return (year >= 0 && year <= 9999);
};

oxiDate.validateSecond = function (second) {
    return (second >= 0 && second < 60);
};

oxiDate.validateMonth = function (month) {
    return (month >= 0 && month < 12);
};

oxiDate.validateMinute = function (minute) {
    return (minute >= 0 && minute < 60);
};

oxiDate.validateMillisecond = function (milli) {
    return (milli >= 0 && milli < 1000);
};

oxiDate.validateHour = function (hour) {
    return (hour >= 0 && hour < 24);
};

oxiDate.compare = function (date1, date2) {
    if (date1.valueOf() < date2.valueOf()) {
        return -1;
    } else if (date1.valueOf() > date2.valueOf()) {
        return 1;
    }
    return 0;
};

oxiDate.equals = function (date1, date2) {
    return date1.valueOf() === date2.valueOf();
};

oxiDate.getDayNumberFromName = function (name) {
    return dayNames[name.toLowerCase()];
};


oxiDate.getMonthNumberFromName = function (name) {
    return monthNames[name.toLowerCase()];
};

oxiDate.getMonthNameFromNumber = function (number) {
    return monthsFull[number];
};

oxiDate.getMonthAbbrFromNumber = function (number) {
    return monthsAbbr[number];
};

oxiDate.isLeapYear = function (year) {
    return (new Date(year, 1, 29).getDate() === 29);
};

oxiDate.getDaysInMonth = function (year, month) {
    if (month === 1) {
        return Date.isLeapYear(year) ? 29 : 28;
    }
    return daysInMonth[month];
};

oxiDate.add = function(date, ts) {
   var ms = date.valueOf() + ts.totalMilliseconds();
   return new Date(ms);
};

oxiDate.addDays = function(date, n) {
    let dt = new Date(date.getTime());
    dt.setDate(date.getDate() + n);
    return dt;
};

oxiDate.addHours = function(date, n) {
    return oxiDate.add(date, timeSpan.FromHours(n));
};

oxiDate.addMinutes = function(date, n) {
    return oxiDate.add(date, timeSpan.FromMinutes(n));
};

oxiDate.addSeconds = function(date, n) {
    return oxiDate.add(date, timeSpan.FromSeconds(n));
};

oxiDate.addMilliseconds = function(date, n) {
    return oxiDate.add(date, new timeSpan(n));
};

oxiDate.getMonthAbbr = function (date) {
    return monthsAbbr[date.getMonth()];
};

oxiDate.getMonthName = function (date) {
    return monthsFull[date.getMonth()];
};

oxiDate.clearTime = function (dt) {
	var dt = new Date(dt.getTime());
    dt.setHours(0);
    dt.setMinutes(0);
    dt.setSeconds(0);
    dt.setMilliseconds(0);
    return dt;
};

oxiDate.today = function() {
    return oxiDate.clearTime(new Date());
};

let toFormat = function (date, format, replaceMap) {
    var f = [ format ], i, l, s;
    var replace = function (str, rep) {
        var i = 0, l = f.length, j, ll, t, n = [];
        for (; i < l; i++) {
            if (typeof f[i] == 'string') {
                t = f[i].split(str);
                for (j = 0, ll = t.length - 1; j < ll; j++) {
                    n.push(t[j]);
                    n.push([rep]); // replacement pushed as non-string
                }
                n.push(t[ll]);
            } else {
                // must be a replacement, don't process, just push
                n.push(f[i]);
            }
        }
        f = n;
    };

    for (i in replaceMap) {
        replace(i, replaceMap[i]);
    }

    s = '';
    for (i = 0, l = f.length; i < l; i++)
      s += typeof f[i] == 'string' ? f[i] : f[i][0];
    return f.join('');
};

oxiDate.toFormatUTC = function (date, format) {
    return toFormat(date, format, date.isUTC ? getReplaceMap(date) : getUTCReplaceMap(date));
}

oxiDate.toFormat = function (date, format) {
    return toFormat(date, format, getReplaceMap(date));
}

var getReplaceMap = function(date) {
    var hours = (date.getHours() % 12) ? date.getHours() % 12 : 12;
    return {
        'YYYY': date.getFullYear(),
        'yyyy': date.getFullYear(),
        'YY': String(date.getFullYear()).slice(-2),
        'MMMM': monthsFull[date.getMonth()],
        'MMM': monthsAbbr[date.getMonth()],
        'MM': pad(date.getMonth() + 1, 2),
        'MI': pad(date.getMinutes(), 2),
        'M': date.getMonth() + 1,
        'DDDD': daysFull[date.getDay()],
        'DDD': daysAbbr[date.getDay()],
        'DD': pad(date.getDate(), 2),
        'dd': pad(date.getDate(), 2),
        'D': date.getDate(),
        'HH': pad(date.getHours(), 2),
        'hh': pad(hours, 2),
        'H': hours,
        'SS': pad(date.getSeconds(), 2),
        'PP': (date.getHours() >= 12) ? 'PM' : 'AM',
        'P': (date.getHours() >= 12) ? 'pm' : 'am',
        'LL': pad(date.getMilliseconds(), 3)
    };
};

var getUTCReplaceMap = function(date) {
    var hours = (date.getUTCHours() % 12) ? date.getUTCHours() % 12 : 12;
    return {
        'YYYY': date.getUTCFullYear(),
        'yyyy': date.getUTCFullYear(),
        'YY': String(date.getUTCFullYear()).slice(-2),
        'MMMM': monthsFull[date.getUTCMonth()],
        'MMM': monthsAbbr[date.getUTCMonth()],
        'MM': pad(date.getUTCMonth() + 1, 2),
        'MI': pad(date.getUTCMinutes(), 2),
        'M': date.getUTCMonth() + 1,
        'DDDD': daysFull[date.getUTCDay()],
        'DDD': daysAbbr[date.getUTCDay()],
        'DD': pad(date.getUTCDate(), 2),
        'dd': pad(date.getUTCDate(), 2),
        'D': date.getUTCDate(),
        'HH': pad(date.getUTCHours(), 2),
        'hh': pad(hours, 2),
        'H': hours,
        'SS': pad(date.getUTCSeconds(), 2),
        'PP': (date.getUTCHours() >= 12) ? 'PM' : 'AM',
        'P': (date.getUTCHours() >= 12) ? 'pm' : 'am',
        'LL': pad(date.getUTCMilliseconds(), 3)
    };
};

let pauseableTimer = function(strt) {
    let pstrt = new Date();
    strt = strt || pstrt;
    let rslt = {started: strt, paused: 0, pauseStarted: pstrt};

    rslt.pause = function() {
        if (!rslt.isPaused()) rslt.pauseStarted = new Date();
    };

    rslt.unPause = function() {
        if (rslt.isPaused()) {
            let diff = timeSpan.FromDates( rslt.pauseStarted, new Date() ).totalMilliseconds();
            rslt.paused += diff;
            rslt.pauseStarted = null;
        }
    };

    rslt.start = rslt.unPause;

    rslt.isPaused = function() { 
        return rslt.pauseStarted === null;
    };

    rslt.elapsed = function() {
        //console.log('elapsed called');
        let now = rslt.isPaused() ? rslt.pauseStarted : new Date();
        let msecs = timeSpan.FromDates( rslt.started, now ).totalMilliseconds();
        return msecs - rslt.paused;
    };

    return rslt;

};

oxiDate.pauseableTimer = pauseableTimer;

module.exports = oxiDate;