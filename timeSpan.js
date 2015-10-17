'use strict';

function pad(str, length) {
    str = String(str);
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

var TimeSpan = function (milliseconds) {
    var msecPerSecond = 1000;
    var msecPerMinute = 60000;
    var msecPerHour = 3600000;
    var msecPerDay = 86400000;
    var msecs = milliseconds;

    var isNumeric = function (input) {
        return !isNaN(parseFloat(input)) && isFinite(input);
    };


    this.addMilliseconds = function (milliseconds) {
        if (!isNumeric(milliseconds)) {
            return;
        }
        return new TimeSpan(msecs = milliseconds);
    };
    this.addSeconds = function (seconds) {
        if (!isNumeric(seconds)) {
            return;
        }
        return new TimeSpan(msecs + (seconds * msecPerSecond));
    };
    this.addMinutes = function (minutes) {
        if (!isNumeric(minutes)) {
            return;
        }
        return new TimeSpan(msecs + (minutes * msecPerMinute));
    };
    this.addHours = function (hours) {
        if (!isNumeric(hours)) {
            return;
        }
        return new TimeSpan(msecs + (hours * msecPerHour));
    };
    this.addDays = function (days) {
        if (!isNumeric(days)) {
            return;
        }
        return new TimeSpan(msecs + (days * msecPerDay));
    };

    this.add = function (otherTimeSpan) {
        return new TimeSpan(msecs + otherTimeSpan.totalMilliseconds());
    };
    this.subtract = function (otherTimeSpan) {
        return new TimeSpan(msecs - otherTimeSpan.totalMilliseconds());
    };
    this.equals = function (otherTimeSpan) {
        return msecs === otherTimeSpan.totalMilliseconds();
    };

    // Getters
    this.totalMilliseconds = function () {
        return msecs;
    };
    this.totalSeconds = function () {
        var result = msecs / msecPerSecond;
        return result;
    };
    this.totalMinutes = function () {
        var result = msecs / msecPerMinute;
        return result;
    };
    this.totalHours = function () {
        var result = msecs / msecPerHour;
        return result;
    };
    this.totalDays = function () {
        var result = msecs / msecPerDay;
        return result;
    };

    this.milliseconds = function () {
        return msecs % msecPerSecond
    };
    this.seconds = function () {
        var ms = msecs % msecPerMinute 
        return Math.floor(ms / msecPerSecond);
    };
    this.minutes = function () {
        var ms = msecs % msecPerHour 
        return Math.floor(ms / msecPerMinute);
    };
    this.hours = function () {
        var ms = msecs % msecPerDay  
        return Math.floor(ms / msecPerHour);
    };
    this.days = function () {
        return Math.floor(msecs / msecPerHour);
    };
    this.toString = function () {
        return this.toFormat("H:MI:SS");
    };
    this.toFormat = function (format) {
        var replaceMap = {
            'hh': pad(this.hours(), 2),
            'H': this.hours(),
            'MI': pad(this.minutes(), 2),
            'SS': pad(this.seconds(), 2),
            'LLL': pad(this.milliseconds(), 3)
        };
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
};

// "Static Constructors"
TimeSpan.FromSeconds = function (n) {
    return new TimeSpan(0).addSeconds(n);
};
TimeSpan.FromMinutes = function (n) {
    return new TimeSpan(0).addMinutes(n);
};
TimeSpan.FromHours = function (n) {
    return new TimeSpan(0).addHours(n);
};
TimeSpan.FromDays = function (n) {
    return new TimeSpan(0).addDays(n);
};
TimeSpan.FromDates = function (firstDate, secondDate) {
    var diff = secondDate.valueOf() - firstDate.valueOf();
    return new TimeSpan(diff, 0, 0, 0, 0);
};

module.exports = TimeSpan;