$.widget("my.field_grid", {
    options:
    {
        width: 10,
        height: 10,
        count: 10
    },

    _create: function ()
    {
        this._height = 15;
        this._width = 15;
        this._min_q = 0.1;
        this._max_q = 0.9;
        this._which = 0;
        this.element.addClass("field_grid");

        for (var i = 0; i < this._height; ++i)
        {
            for (var j = 0; j < this._width; ++j)
                this.element.append($("<div />", {class: "field_grid_item"}));

            this.element.append($("<div />", {style: "clear: both;"}));
        }

        var self = this;
        var grid_item = $(".field_grid_item", this.element);

        grid_item
            .mouseenter(function (e)
            {
                if (self._which != 1 && self._which != 3)
                    return;

                var index = grid_item.index(this);
                var x = ((index / self._width) | 0) + 1;
                var y = (index % self._width) + 1;

                grid_item.removeClass("hover_left hover_right");

                if (self._which == 1)
                {
                    self.options.height = Math.max(x, 9);
                    self.options.width = Math.max(y, 9);
                }

                if (self._which == 3)
                    self.options.count = (x - 1) * self.options.width + y;

                var max_count = self.options.height * self.options.width;

                self.options.count = Math.max((max_count * self._min_q) | 0, Math.min((max_count * self._max_q) | 0, self.options.count));
                self._trigger("mousemove", e, {width: self.options.width, height: self.options.height, count: self.options.count});
                self._render();
            })
            .mousedown(function (e)
            {
                self._which = e.which;
                $(this).trigger("mouseenter");
            })
            .mouseup(function ()
            {
                self._which = 0;
            })
            .mousedown(function (e)
            {
                e.preventDefault();
            })
            .contextmenu(false);

        $(".field_grid", this.element).mouseleave(function ()
        {
            self._which = 0;
        });

        this._render();
    },

    _render: function ()
    {
        for (var i = 0; i < this.options.height; ++i)
            for (var j = 0; j < this.options.width; ++j)
                this._markFieldGridItem(i * this._height + j, true);

        for (var i = 0, l = (this.options.count / this.options.width) | 0; i < l; ++i)
            for (var j = 0; j < this.options.width; ++j)
                this._markFieldGridItem(i * this._height + j);

        for (var j = 0, i = (this.options.count / this.options.width) | 0, l = this.options.count % this.options.width; j < l; ++j)
            this._markFieldGridItem(i * this._height + j);
    },

    _markFieldGridItem: function (index, is_left)
    {
        var element = $(".field_grid_item:eq(" + index + ")", this.element);

        if (is_left == undefined || is_left != true)
            element.removeClass("hover_left").addClass("hover_right");
        else
            element.addClass("hover_left");
    }
});

$.widget("my.smile", {
    _create: function ()
    {
        this._states = "smile_ok smile_wah smile_die smile_cool smile_ok_checked";
        var self = this;

        this.element.addClass("smile");

        this.element.mousedown(function (e)
        {
            e.preventDefault();

            if (e.which == 1)
                self.element.addClass("smile_ok_checked");
        });

        this.element.mouseup(function ()
        {
            if (self.element.hasClass("smile_ok_checked"))
            {
                self._setSmile("smile_ok");
                self._trigger("click");
            }
        });

        this.element.mouseleave(function (e)
        {
            if (e.which == 1)
                self.element.removeClass("smile_ok_checked");
        });
    },

    _setSmile: function (smile)
    {
        this.element.removeClass(this._states).addClass(smile);
    },

    die: function ()
    {
        this._setSmile("smile_die");
    },

    cool: function ()
    {
        this._setSmile("smile_cool");
    },

    wah: function ()
    {
        this.element.addClass("smile_wah");
    },

    unwah: function ()
    {
        this.element.removeClass("smile_wah");
    }
});

$.widget("my.indicator", {
    options:
    {
        value: 0
    },

    _create: function ()
    {

        this._class_values = "digit_0 digit_1 digit_2 digit_3 digit_4 digit_5 digit_6 digit_7 digit_8 digit_9";
        this._num = [];
        this.element.addClass("indicator");

        for (var i = 0; i < 3; ++i)
        {
            this.element.append($("<div />").addClass("num" + i + " digits"));
            this._num.push(this.element.find(".num" + i));
        }

        this._render();
    },

    _render: function ()
    {
        var val = this.options.value;

        for (var index in this._num)
            this._num[index].removeClass(this._class_values);

        for (var i = (val < 0 ? 1 : 0); i < 3; ++i)
        {
            var digit = Math.abs((val % Math.pow(10, 3 - i)) / Math.pow(10, 2 - i)) | 0;

            this._num[i].addClass("digit_" + digit);
        }
    },

    inc: function ()
    {
        ++this.options.value;
        this._render();
    },

    value: function (_value)
    {
        if (_value === undefined)
            return this.options.value;

        this.options.value = _value;
        this._render();

        return _value;
    }
});

$.widget("my.sapper", {
    _create: function ()
    {
        this._mov_x = [-1, -1, 0, 1, 1, 1, 0, -1];
        this._mov_y = [0, 1, 1, 1, 0, -1, -1, -1];
        this._mouse_button_pressed = false;
        this._mines_count = 10;
        this._height = 10;
        this._width = 10;
        this._timer_id = 0;
        this._mines = [];
        this._mine_types = new Array("mine_empty", "mine_question", "mine_count_1", "mine_count_2", "mine_count_3", "mine_count_4", "mine_count_5",
            "mine_count_6", "mine_count_7", "mine_count_8", "mine", "mine_checked", "mine_flag", "mine_empty_checked", "mine_wrong_flag");
        this._mines_checked_temp = new Array("mine_empty_checked_temp", "mine_question_checked_temp");

        var self = this;

        $(this.element).contextmenu(false);

        this.element.addClass("game_sapper");
        this.element
            .append($("<div />", {class: "game"})
                .append($("<table />", {class: "game"})
                    .append($("<tr />", {class: "game"})
                        .append($("<td />", {class: "game"})
                            .append($("<table />", {class: "information"})
                                .append($("<tr />")
                                    .append($("<td />")
                                        .append($("<div />", {class: "indicator_score"}))
                                    )
                                    .append($("<td />", {class: "information"})
                                        .append($("<div />", {class: "button_smile"}))
                                    )
                                    .append($("<td />")
                                        .append($("<div />", {class: "indicator_timer"}))
                                    )
                                )
                            )
                        )
                    )
                    .append($("<tr />")
                        .append($("<td />", {class: "game"})
                            .append($("<div />", {class: "field"}))
                        )
                    )
                )
                .append($("<div />", {class: "setting_expander"})
                    .append($("<a />", {href: "#"}).text("Открыть настройки"))
                )
            )
            .append($("<div />", {class: "settings"})
                .append($("<div />", {class: "align_center"})
                    .append($("<div />", {class: "settings_label"}).text("Настройки"))
                )
                .append($("<div />", {class: "align_center_to_left"})
                    .append($("<div />", {class: "align_center_to_right"})
                        .append($("<div />", {class: "setting_grid"}))
                        .append($("<div />").css("clear", "both"))
                        .append($("<div />", {class: "grid_label"}))
                    )
                )
            );

        $(".settings", this.element).hide();
        $(".indicator_score, .indicator_timer", this.element).indicator();

        $(".setting_expander", this.element).click(function (e)
        {
            var settings = $(".settings", self.element);

            e.preventDefault();

            if (settings.is(":hidden"))
            {
                settings.show();
                $(".setting_expander a", self.element).text("Закрыть настройки");
            }
            else
            {
                settings.hide();
                $(".setting_expander a", self.element).text("Открыть настройки");
            }
        });

        $(".button_smile", this.element)
            .smile()
            .bind("smileclick", function ()
            {
                var grid = $(".setting_grid", self.element);

                self._startGame(grid.field_grid("option", "height"), grid.field_grid("option", "width"), grid.field_grid("option", "count"));
            });

        $(".setting_grid", this.element)
            .field_grid({width: this._width, height: this._height, count: this._mines_count})
            .on("field_gridmousemove", function (e, ui)
            {
                self._updateFieldGridLabel(e, ui);
            });

        this._startGame(this._height, this._width, this._mines_count);
    },

    _updateFieldGridLabel: function (e, ui)
    {
        var width, height, count;

        if (ui == undefined)
        {
            width = this._width;
            height =  this._height;
            count = this._mines_count;
        }
        else
        {
            width = ui.width;
            height = ui.height;
            count = ui.count;
        }

        $(".grid_label", this.element).html("Поле <b>" + width + "x" + height + "</b>, <b>" + count + "</b> " + this._getWordByNumber(count, ["мин", "мина", "мины"]));
    },

    _isItemFieldFree: function (element)
    {
        for (var i = 0; i < 2; ++i)
            if (element.hasClass(this._mine_types[i]))
                return true;

        return false;
    },

    _isItemFieldCheckedTemp: function (element)
    {
        for (var index in this._mines_checked_temp)
            if (element.hasClass(this._mines_checked_temp[index]))
                return true;

        return false;
    },

    _setItemFieldCheckedTemp: function (element)
    {
        for (var index in this._mines_checked_temp)
            if (element.hasClass(this._mine_types[index]))
                element.addClass(this._mines_checked_temp[index]);
    },

    _removeItemFieldCheckedTemp: function (element)
    {
        for (var index in this._mines_checked_temp)
            element.removeClass(this._mines_checked_temp[index]);
    },

    _getItemFieldType: function (element)
    {
        for (var index in this._mine_types)
            if (element.hasClass(this._mine_types[index]))
                return Number(index);

        return -1;
    },

    _generateMines: function (pos)
    {
        while (this._mines.length < this._mines_count)
        {
            var mine_pos = ((Math.random() * 100000) | 0) % (this._width * this._height);

            if (mine_pos != pos && $.inArray(mine_pos, this._mines) == -1)
                this._mines.push(mine_pos);
        }
    },

    _setItemFieldType: function (element, new_type)
    {
        for (var index in this._mine_types)
            element.removeClass(this._mine_types[index]);

        element.addClass(new_type);
    },

    _walkAround: function (pos)
    {
        var element = $("div.field_item[pos=" + pos + "]", this.element);

        if (!this._isItemFieldFree(element))
            return;

        var x = pos / this._width | 0;
        var y = pos % this._width;

        var places = [];
        var mines_around = 0;

        for (var k = 0; k < 8; ++k)
        {
            var curr_x = x + this._mov_x[k];
            var curr_y = y + this._mov_y[k];

            if (curr_x < 0 | curr_y < 0 || curr_x >= this._height || curr_y >= this._width)
                continue;

            var curr_pos = curr_x * this._width + curr_y;

            places.push(curr_pos);

            if ($.inArray(curr_pos, this._mines) != -1)
                ++mines_around;
        }

        if (mines_around)
            this._setItemFieldType(element, "mine_count_" + mines_around);
        else
        {
            this._setItemFieldType(element, "mine_empty_checked");

            for (var index in places)
                this._walkAround(places[index]);
        }
    },

    _clickToItemField: function (element)
    {
        if (!this._isItemFieldFree(element))
            return;

        var pos = Number(element.attr("pos"));

        if ($.inArray(pos, this._mines) != -1)
        {
            $(".field_item.mine_flag", this.element).removeClass("mine_flag").addClass("mine_wrong_flag");

            for (var index in this._mines)
            {
                var curr_element = $(".field_item[pos=" + this._mines[index] + "]", this.element);

                if (curr_element.hasClass("mine_wrong_flag"))
                    this._setItemFieldType(curr_element, "mine_flag");
                else
                    this._setItemFieldType(curr_element, "mine");
            }

            this._setItemFieldType($(".field_item[pos=" + pos + "]", this.element), "mine_checked");
            this._gameOver(false);

            return;
        }
        this._walkAround(pos);
    },

    _deleteGame: function ()
    {
        $(".field > div", this.element).remove();
        this._mines = [];
    },

    _startGame: function (_height, _width, _mines_count)
    {
        var self = this;

        clearInterval(this._timer_id);
        this._deleteGame();
        this._height = _height;
        this._width = _width;
        this._mines_count = _mines_count;
        this._updateFieldGridLabel();
        $(".indicator_score", this.element).indicator("value", _mines_count);
        $(".indicator_timer", this.element).indicator("value", 0);

        for (var i = 0; i < this._height; ++i)
        {
            for (var j = 0; j < this._width; ++j)
                $(".field", this.element).append($("<div />", {pos: i * this._width + j, class: "field_item mine_empty"}));


            $(".field", this.element).append($("<div />").css("clear", "both"));
        }

        $(".field", this.element)
            .mouseleave(function (e)
            {
                if (e.which)
                {
                    self._mouse_button_pressed = false;
                    self._removeItemFieldCheckedTemp($(".field_item", self.element));
                    $(".button_smile", self.element).smile("unwah");
                }
            })
            .mouseenter(function (e)
            {
                if (e.which)
                {
                    self._mouse_button_pressed = true;
                    $(".button_smile", self.element).smile("wah");
                }
            });

        $(".field_item", this.element)
            .mousedown(function (e)
            {
                e.preventDefault();

                self._mouse_button_pressed = true;
                $(".button_smile", self.element).smile("wah");

                if (this == e.target)
                {
                    var element = $(e.target);

                    if (e.which == 3)
                    {
                        var right_click_mines = ["mine_empty", "mine_flag", "mine_question"];
                        var p = $.inArray(self._mine_types[self._getItemFieldType(element)], right_click_mines);

                        if (p != -1)
                            self._setItemFieldType(element, right_click_mines[(p + 1) % 3]);
                    }
                    else
                        self._setItemFieldCheckedTemp(element);

                    $(".indicator_score", self.element).indicator("value", self._mines_count - $(".field_item.mine_flag", self.element).length);
                }
            })
            .mouseenter(function (e)
            {
                e.preventDefault();

                if (e.which == 3)
                    return;

                if (this == e.target)
                {
                    var element = $(e.target);

                    if (!self._isItemFieldCheckedTemp(element) && self._mouse_button_pressed)
                    {
                        self._removeItemFieldCheckedTemp($(".field_item", self.element));
                        self._setItemFieldCheckedTemp(element);
                    }
                }
            })
            .mouseup(function (e)
            {
                self._mouse_button_pressed = false;
                $(".button_smile", self.element).smile("unwah");
                e.preventDefault();
                self._removeItemFieldCheckedTemp($(".field_item", self.element));

                if (e.which != 3 && this == e.target)
                {
                    var element = $(e.target);
                    var pos = Number(element.attr("pos"));

                    if (self._mines.length == 0)
                    {
                        self._generateMines(pos);

                        self._timer_id = setInterval(function ()
                        {
                            $(".indicator_timer", self.element).indicator("inc");
                        }, 1000);
                    }

                    self._clickToItemField(element);
                }

                if ($(".field_item.mine_empty", self.element).length /*+ $(".field_item.mine_question", self.element).length*/ + $(".field_item.mine_flag", self.element).length == self._mines_count)
                {
                    self._setItemFieldType($(".field_item.mine_empty", self.element), "mine_flag");
                    self._gameOver(true);
                }
            });
    },

    _gameOver: function (win)
    {
        $(".field_item", this.element).off();
        $(".field", this.element).off();
        clearInterval(this._timer_id);

        var time = $(".indicator_timer", this.element).indicator("value");

        if (win)
        {
            $(".button_smile", this.element).smile("cool");
            alert("Вы победили! Вы достигли победы за " + time + " " + this._getWordByNumber(time, ["секунд", "секунду", "секунды"]) + "!");
        }
        else
        {
            $(".button_smile", this.element).smile("die");
        }
    },

    _getWordByNumber: function (num, words)
    {
        num = Math.abs(num);

        if ((num % 100 >= 10 && num % 100 <= 20) || (num % 10 >= 5 && num % 10 <= 9) || (num % 10 == 0))
            return words[0];

        if (num % 10 == 1)
            return words[1];

        return words[2];
    }
});