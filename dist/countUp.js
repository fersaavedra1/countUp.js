var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // playground: stackblitz.com/edit/countup-typescript
    var CountUp = /** @class */ (function () {
        function CountUp(target, endVal, options) {
            var _this = this;
            this.target = target;
            this.endVal = endVal;
            this.options = options;
            this.version = '2.0.0';
            this.defaults = {
                startVal: 0,
                decimalPlaces: 0,
                duration: 2,
                useEasing: true,
                useGrouping: true,
                autoSmoothThreshold: 999,
                autoSmoothAmount: 100,
                separator: ',',
                decimal: '.',
                prefix: '',
                suffix: ''
            };
            this.error = '';
            this.startVal = 0;
            this.duration = 0;
            this.countDown = false;
            this.paused = false;
            this.count = function (timestamp) {
                if (!_this.startTime) {
                    _this.startTime = timestamp;
                }
                var progress = timestamp - _this.startTime;
                _this.remaining = _this.duration - progress;
                // to ease or not to ease
                if (_this.options.useEasing) {
                    if (_this.countDown) {
                        _this.frameVal = _this.startVal - _this.easingFn(progress, 0, _this.startVal - _this.endVal, _this.duration);
                    }
                    else {
                        _this.frameVal = _this.easingFn(progress, _this.startVal, _this.endVal - _this.startVal, _this.duration);
                    }
                }
                else {
                    if (_this.countDown) {
                        _this.frameVal = _this.startVal - ((_this.startVal - _this.endVal) * (progress / _this.duration));
                    }
                    else {
                        _this.frameVal = _this.startVal + (_this.endVal - _this.startVal) * (progress / _this.duration);
                    }
                }
                // don't go past endVal since progress can exceed duration in the last frame
                if (_this.countDown) {
                    _this.frameVal = (_this.frameVal < _this.endVal) ? _this.endVal : _this.frameVal;
                }
                else {
                    _this.frameVal = (_this.frameVal > _this.endVal) ? _this.endVal : _this.frameVal;
                }
                // decimal
                _this.frameVal = Math.round(_this.frameVal * _this.decimalMult) / _this.decimalMult;
                // format and print value
                _this.printValue(_this.frameVal);
                // whether to continue
                if (progress < _this.duration) {
                    _this.rAF = requestAnimationFrame(_this.count);
                }
                else if (_this.finalEndVal !== null) {
                    // for auto-smoothing
                    _this.update(_this.finalEndVal);
                }
                else {
                    if (_this.callback) {
                        _this.callback();
                    }
                }
            };
            // default format and easing functions
            this.formatNumber = function (num) {
                var neg = (num < 0) ? '-' : '';
                var result, x, x1, x2, x3;
                result = Math.abs(num).toFixed(_this.options.decimalPlaces);
                result += '';
                x = result.split('.');
                x1 = x[0];
                x2 = x.length > 1 ? _this.options.decimal + x[1] : '';
                if (_this.options.useGrouping) {
                    x3 = '';
                    for (var i = 0, len = x1.length; i < len; ++i) {
                        if (i !== 0 && (i % 3) === 0) {
                            x3 = _this.options.separator + x3;
                        }
                        x3 = x1[len - i - 1] + x3;
                    }
                    x1 = x3;
                }
                // optional numeral substitution
                if (_this.options.numerals && _this.options.numerals.length) {
                    x1 = x1.replace(/[0-9]/g, function (w) { return _this.options.numerals[+w]; });
                    x2 = x2.replace(/[0-9]/g, function (w) { return _this.options.numerals[+w]; });
                }
                return neg + _this.options.prefix + x1 + x2 + _this.options.suffix;
            };
            this.easeOutExpo = function (t, b, c, d) {
                return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
            };
            this.options = __assign({}, this.defaults, options);
            this.formattingFn = (this.options.formattingFn) ?
                this.options.formattingFn : this.formatNumber;
            this.easingFn = (this.options.easingFn) ?
                this.options.easingFn : this.easeOutExpo;
            this.el = (typeof target === 'string') ? document.getElementById(target) : target;
            if (!this.el) {
                this.error = '[CountUp] target is null or undefined';
            }
            this.options.decimalPlaces = Math.max(0 || this.options.decimalPlaces);
            this.decimalMult = Math.pow(10, this.options.decimalPlaces);
            this.duration = Number(this.options.duration) * 1000;
            this.startVal = this.validateValue(this.options.startVal);
            this.endVal = this.validateValue(endVal);
            this.options.separator = String(this.options.separator);
            if (this.options.separator === '') {
                this.options.useGrouping = false;
            }
            if (this.startVal) {
                this.printValue(this.startVal);
            }
        }
        // start animation
        CountUp.prototype.start = function (callback) {
            if (this.error) {
                return;
            }
            this.callback = callback;
            // auto-smooth large numbers
            var animateAmount = this.endVal - this.startVal;
            if (Math.abs(animateAmount) > this.options.autoSmoothThreshold) {
                this.finalEndVal = this.endVal;
                var up = (this.endVal > this.startVal) ? -1 : 1;
                this.endVal = this.endVal + (up * 100);
                this.duration = this.duration / 2;
            }
            this.rAF = requestAnimationFrame(this.count);
        };
        // pause/resume animation
        CountUp.prototype.pauseResume = function () {
            if (!this.paused) {
                this.paused = true;
                cancelAnimationFrame(this.rAF);
            }
            else {
                this.paused = false;
                this.startTime = null;
                this.duration = this.remaining;
                this.startVal = this.frameVal;
                this.start();
            }
        };
        // reset to startVal so animation can be run again
        CountUp.prototype.reset = function () {
            this.paused = false;
            this.startTime = null;
            this.frameVal = null;
            if (this.options.startVal) {
                this.startVal = this.validateValue(this.options.startVal);
            }
            this.finalEndVal = null;
            cancelAnimationFrame(this.rAF);
            this.printValue(this.startVal);
        };
        // pass a new endVal and start animation
        CountUp.prototype.update = function (newEndVal) {
            this.endVal = this.validateValue(newEndVal);
            this.finalEndVal = null;
            if (this.endVal === this.frameVal) {
                return;
            }
            cancelAnimationFrame(this.rAF);
            this.error = '';
            this.paused = false;
            this.startTime = null;
            this.startVal = this.frameVal;
            this.start();
        };
        CountUp.prototype.printValue = function (val) {
            var result = this.formattingFn(val);
            if (this.el.tagName === 'INPUT') {
                var input = this.el;
                input.value = result;
            }
            else if (this.el.tagName === 'text' || this.el.tagName === 'tspan') {
                this.el.textContent = result;
            }
            else {
                this.el.innerHTML = result;
            }
        };
        CountUp.prototype.ensureNumber = function (n) {
            return (typeof n === 'number' && !isNaN(n));
        };
        CountUp.prototype.validateValue = function (value) {
            var newValue = Number(value);
            if (!this.ensureNumber(newValue)) {
                this.error = "[CountUp] invalid start or end value: " + value;
                return null;
            }
            else {
                this.countDown = (this.options.startVal > newValue);
                return newValue;
            }
        };
        return CountUp;
    }());
    exports.CountUp = CountUp;
});
