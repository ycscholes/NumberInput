(function() {
    if (!$) {
        console.log('Please load jQuery file');
        return false;
    }

    var NumberInput = function(el, configs) {
        this.el = el;
        this.$el = $(el);
        this.configs = configs || {};

        this._init();
    };

    NumberInput.prototype = {
        defaults: {
            width: 100,
            step: 1,
            value: 0,
            negative: true,
            arrows: true,
            decimal: true,
            callback: function() {}
        },

        _init: function() {
            this._configAttr('max');
            this._configAttr('min');
            this._configAttr('step');
            this._configAttr('value');
            this.configs = $.extend({}, this.defaults, this.configs);

            this._initContent();
            this._initActions();
            this._initStyle();

            this.$el.data('negative', this.configs.negative);
            this.$el.data('decimal', (this.configs.decimal === false) ? '' : '.');
            this.$el.data('callback', this.configs.callback);
        },

        _initContent: function() {
            var wrapper = $('<div class="ni-wrapper"></div>'),
                arrows = $('<span class="ni-actions"><span class="ni-up"></span><span class="ni-down"></span></span>');
            this.$el.replaceWith(wrapper);
            wrapper.append(this.$el);
            wrapper.append(arrows);

            this.el.type = 'number';
            this.$el.addClass('ni-input');

            this.wrapper = wrapper;
            this.arrows = arrows;

            if (!this.configs.arrows) {
                this.arrows.hide();
            }
        },

        _initStyle: function() {
            if (!this.configs.arrows) {
                this.$el.css({
                    textAlign: 'center',
                    padding: 0
                });
            }

            var arrowsWidth = (this.configs.arrows) ? this.arrows.width() : 0,
                delta = this.$el.outerWidth() - this.$el.width();

            this.$el.css({
                width: (this.configs.width - delta - arrowsWidth) + 'px'
            });

            this.wrapper.css({
                width: (this.configs.width - 2) + 'px'
            });
        },

        _initActions: function() {
            var self = this;

            this.arrows.find('.ni-up').on('click', function(e) {
                var num = (self.$el.val()) ? (self.$el.val()) : 0,
                    delta = self.configs.step,
                    result = Math.round((parseFloat(num)*100 + parseFloat(delta)*100))/100;

                if (self.configs.max != "" && result > self.configs.max) {
                    return false;
                }

                self.$el.val(result);
                self.el.focus();
            });

            this.arrows.find('.ni-down').on('click', function(e) {
                var num = (self.$el.val()) ? (self.$el.val()) : 0,
                    delta = self.configs.step,
                    result = Math.round((parseFloat(num)*100 - parseFloat(delta)*100))/100;

                if (self.configs.min !== "" && result < self.configs.min) {
                    return false;
                }

                self.$el.val(result);
                self.el.focus();
            });

            this.$el.on('keypress', this._keypress);
            this.$el.on('blur', this._blur);
        },

        _configAttr: function(attr) {
            if (this.configs[attr] !== undefined) {
                this.el[attr] = this.configs[attr];
            } else if (this.el[attr] !== '') {
                this.configs[attr] = this.el[attr];
            } else if (this.defaults[attr] !== undefined) {
                this.el[attr] = this.configs[attr] = this.defaults[attr];
            }
        },

        _keypress: function(e) {
            // get decimal character and determine if negatives are allowed
            var decimal = $.data(this, "decimal");
            var negative = $.data(this, "negative");
            // get the key that was pressed
            var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
            // allow enter/return key (only when in an input box)
            if (key == 13 && this.nodeName.toLowerCase() == "input") {
                return true;
            } else if (key == 13) {
                return false;
            }
            var allow = false;
            // allow Ctrl+A
            if ((e.ctrlKey && key == 97 /* firefox */ ) || (e.ctrlKey && key == 65) /* opera */ ) return true;
            // allow Ctrl+X (cut)
            if ((e.ctrlKey && key == 120 /* firefox */ ) || (e.ctrlKey && key == 88) /* opera */ ) return true;
            // allow Ctrl+C (copy)
            if ((e.ctrlKey && key == 99 /* firefox */ ) || (e.ctrlKey && key == 67) /* opera */ ) return true;
            // allow Ctrl+Z (undo)
            if ((e.ctrlKey && key == 122 /* firefox */ ) || (e.ctrlKey && key == 90) /* opera */ ) return true;
            // allow or deny Ctrl+V (paste), Shift+Ins
            if ((e.ctrlKey && key == 118 /* firefox */ ) || (e.ctrlKey && key == 86) /* opera */ || (e.shiftKey && key == 45)) return true;
            // if a number was not pressed
            if (key < 48 || key > 57) {
                /* '-' only allowed at start and if negative numbers allowed */
                if (this.value.indexOf('-') != 0 && negative && key == 45 && (this.value.length == 0 || ($.fn.getSelectionStart(this)) == 0)) return true;
                /* only one decimal separator allowed */

                if (decimal && key == decimal.charCodeAt(0) && this.value.indexOf(decimal) != -1) {
                    allow = false;
                }
                // check for other keys that have special purposes
                if (
                    key != 8 /* backspace */ &&
                    key != 9 /* tab */ &&
                    key != 13 /* enter */ &&
                    (key < 35 || key > 40) &&
                    key != 46 /* del */
                ) {
                    allow = false;
                } else {
                    // for detecting special keys (listed above)
                    // IE does not support 'charCode' and ignores them in keypress anyway
                    if (typeof e.charCode != "undefined") {
                        // special keys have 'keyCode' and 'which' the same (e.g. backspace)
                        if (e.keyCode == e.which && e.which != 0) {
                            allow = true;
                            // . and delete share the same code, don't allow . (will be set to true later if it is the decimal point)
                            if (e.which == 46) allow = false;
                        }
                        // or keyCode != 0 and 'charCode'/'which' = 0
                        else if (e.keyCode != 0 && e.charCode == 0 && e.which == 0) {
                            allow = true;
                        }
                    }
                }
                // if key pressed is the decimal and it is not already in the field
                if (decimal && key == decimal.charCodeAt(0)) {
                    if (this.value.indexOf(decimal) == -1) {
                        allow = true;
                        if (this.value == '') {
                            this.value = 0;
                        }
                    } else {
                        allow = false;
                    }
                }
            } else {
                allow = true;
                if (this.value == '0') {
                    this.value = '';
                }
            }
            return allow;
        },

        _blur: function()
        {
            var decimal = $.data(this, "decimal");
            var callback = $.data(this, "callback");
            var val = this.value;
            if(val != "" && val != '-0')
            {
                if (this.max && val > parseFloat(this.max)) {
                    val = this.max;
                    this.value = val;
                }
                if (this.min && val < parseFloat(this.min)) {
                    val = this.min;
                    this.value = val;
                }

                var re = new RegExp("^\\d+$|\\d*" + decimal + "\\d+");
                if(!re.exec(val))
                {
                    callback.apply(this);
                }
            } else {
                this.value = 0;
            }
        },

        setMax: function(max) {
            this.$el.attr('max', max);
        },

        setMin: function(min) {
            this.$el.attr('min', min);
        },

        setStep: function(step) {
            this.$el.attr('step', step);
        }
    };

    $.fn.numberInput = function(options) {
        // return this.each(function() {
        //     new NumberInput(this, options);
        // });

        /* Need to use code below to replace */
        return this.each(function(i, el) {
            new NumberInput(el, options);
        });
    };

    return NumberInput;
})();
