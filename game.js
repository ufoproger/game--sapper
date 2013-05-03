$.widget("my.smile", {
    options:
    {
        states: "smile_ok smile_wah smile_die smile_cool smile_ok_checked"
    },

    _create: function ()
    {
        var self = this;

        this.element.addClass("smile");

        this.element.mousedown(function (e)
        {
            self.element.addClass("smile_ok_checked");
        });

        this.element.mouseup(function (e)
        {
            self._setSmile("smile_ok");
            self._trigger("click");
        });
    },

    _setSmile: function (smile)
    {
        this.element.removeClass(this.options.states).addClass(smile);
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
        this._setSmile("smile_wah");
    },

    unwah: function ()
    {
        this._setSmile("smile_ok");
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
        this._num = new Array();
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

        for (index in this._num)
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
    }
});

$.widget("my.sapper", {
    options:
    {
        width: 10,
        height : 10,
        mines_count : 10,
        timer_id: 0
    },

    _create: function ()
    {
        this._mouse_button_pressed = false;
        this._mine_types = new Array("mine_empty", "mine_question", "mine_count_1", "mine_count_2", "mine_count_3", "mine_count_4", "mine_count_5",
            "mine_count_6", "mine_count_7", "mine_count_8", "mine", "mine_checked", "mine_flag", "mine_empty_checked", "mine_wrong_flag");
        this._mines_checked_temp = new Array("mine_empty_checked_temp", "mine_question_checked_temp");
        this._mov_x = new Array(-1, -1, 0, 1, 1, 1, 0, -1);
        this._mov_y = new Array(0, 1, 1, 1, 0, -1, -1, -1);
        this._mines = new Array();

        var self = this;

        this.element.addClass("game_sapper");/*
            .append($("<div />")
            .addClass("game")
            .append($("<div />", {class: "information"}))
            .append($("<div />").css("clear", "left"))
            .append($("<div />", {class: "field"})))
            .append($("<div />", {class: "settings"}));
     */
        $("#test3").children().appendTo(this.element);
   //     $("#test2").children().appendTo(this.element.find(".information"));
        $("#test").children().appendTo(this.element.find(".settings"));
        $("#test").remove();
        $("#test2").remove();
        $("#score, #timer").indicator();
        $("#smile").smile();

        this.options.timer_id = setInterval(function ()
        {
            $("#timer").indicator("inc");
        }, 1000);

        $("#smile").on("click", function ()
        {
            self._startGame($("#spinner_height").val(), $("#spinner_width").val(), $("#slider").slider("value"));
        });

        $("#slider").slider(
            {
                min: 10,
                max: 20,
                change:
                    function (e, ui)
                    {
                        self._updateSliderLabel(ui.value);
                    },
                slide:
                    function (e, ui)
                    {
                        self._updateSliderLabel(ui.value);
                    }
            });

        $("#slider").slider("value", this.options.mines_count);
        $("#spinner_height, #spinner_width").spinner({min: 10, max: 20});
        $("#button_new_game").button();

        $("#spinner_height").on("spin", function (e, ui)
        {
            self._updateSliderValue(ui.value, $("#spinner_width").val());
        });

        $("#spinner_width").on("spin", function (e, ui)
        {
            self._updateSliderValue($("#spinner_height").val(), ui.value);
        });

        $("#button_new_game").click(function ()
        {
            self._startGame($("#spinner_height").val(), $("#spinner_width").val(), $("#slider").slider("value"));
            $("#smile").smile("unwah");
        });

        this._startGame(this.options.height, this.options.width, this.options.mines_count);
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
        for (index in this._mines_checked_temp)
            if (element.hasClass(this._mines_checked_temp[index]))
                return true;

        return false;
    },

    _setItemFieldCheckedTemp: function (element)
    {
        for (index in this._mines_checked_temp)
            if (element.hasClass(this._mine_types[index]))
                element.addClass(this._mines_checked_temp[index]);
    },

    _removeItemFieldCheckedTemp: function (element)
    {
        for (index in this._mines_checked_temp)
            element.removeClass(this._mines_checked_temp[index]);
    },

    _getItemFieldType: function (element)
    {
        for (index in this._mine_types)
            if (element.hasClass(this._mine_types[index]))
                return Number(index);

        return -1;
    },

    _generateMines: function (pos)
{
    //       mines = [106, 12, 78, 50, 359, 352, 144, 287, 272, 223];
//        return;
        while (this._mines.length < this.options.mines_count)
        {
            var mine_pos = ((Math.random() * 100000) | 0) % (this.options.width * this.options.height);

            if (mine_pos != pos && $.inArray(mine_pos, this._mines) == -1)
                this._mines.push(mine_pos);
        }

//        console.debug(this._mines);
    },

    _setItemFieldType: function (element, new_type)
    {
        for (index in this._mine_types)
            element.removeClass(this._mine_types[index]);

        element.addClass(new_type);
    },

    _inRange: function (value, left, right)
    {
        return (value >= left && value <= right);
    },

    _walkAround: function (pos)
    {
        var element = $("div.field_item[pos=" + pos + "]");

        if (!this._isItemFieldFree(element))
            return;

        var x = pos / this.options.width | 0;
        var y = pos % this.options.width;

        var places = new Array();
        var mines_around = 0;

        for (var k = 0; k < 8; ++k)
        {
            var curr_x = x + this._mov_x[k];
            var curr_y = y + this._mov_y[k];

            if (curr_x < 0 | curr_y < 0 || curr_x >= this.options.height || curr_y >= this.options.width)
                continue;

            var curr_pos = curr_x * this.options.width + curr_y;

            places.push(curr_pos);

            if ($.inArray(curr_pos, this._mines) != -1)
                ++mines_around;
        }

        if (mines_around)
            this._setItemFieldType(element, "mine_count_" + mines_around);
        else
        {
            this._setItemFieldType(element, "mine_empty_checked");

            for (index in places)
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
            $(".field_item.mine_flag").removeClass("mine_flag").addClass("mine_wrong_flag");

            for (var index in this._mines)
            {
                var element = $(".field_item[pos=" + this._mines[index] + "]");

                if (element.hasClass("mine_wrong_flag"))
                    this._setItemFieldType(element, "mine_flag")
                else
                    this._setItemFieldType(element, "mine");
            }

            this._setItemFieldType($(".field_item[pos=" + pos + "]"), "mine_checked");
            this._gameOver(false);

            return;
        }
      /*  var now = new Date();

        console.debug("walkAround: begin", now.getSeconds(), now.getMilliseconds());
    */    this._walkAround(pos);

/*        var now2 = new Date();

        console.time("walkAround: end", now2.getSeconds(), now2.getMilliseconds());
  */  },

    _deleteGame: function ()
    {
        $(".field > div").remove();
        this._mines = new Array();
    },

    _startGame: function (_height, _width, _mine_count)
    {
        var self = this;

        this._deleteGame();
        this.options.height = _height;
        this.options.width = _width;
        this.options.mines_count = _mine_count;
        this._updateSliderValue();
        $("#score").indicator("value", this.options.mines_count);
        $("#timer").indicator("value", 0);

        for (var i = 0; i < this.options.height; ++i)
        {
            for (var j = 0; j < this.options.width; ++j)
                $(".field").append($("<div />", {pos: i * this.options.width + j}).addClass("field_item").addClass("mine_empty"));

            $(".field").append($("<div />").css("clear", "both"));
        }

        $(".field_item").mousedown(function (e)
        {
            self._mouse_button_pressed = 1;
            $("#smile").smile("wah");
            e.preventDefault();

            if (this == e.target)
            {
                var element = $(e.target);

                if (e.ctrlKey)
                {
                    var right_click_mines = new Array("mine_empty", "mine_flag", "mine_question");
                    var p = $.inArray(self._mine_types[self._getItemFieldType(element)], right_click_mines);

                    if (p != -1)
                        self._setItemFieldType(element, right_click_mines[(p + 1) % 3]);
                }
                else
                    self._setItemFieldCheckedTemp(element);

                $("#score").indicator("value", self.options.mines_count - $(".field_item.mine_flag").length);
            }
        });

        $(".field_item").mousemove(function (e)
        {
            e.preventDefault();

            if (e.ctrlKey)
                return;

            if (this == e.target)
            {
                var element = $(e.target);

                if (!self._isItemFieldCheckedTemp(element)/* && e.which == 1*/ && self._mouse_button_pressed)
                {
                    self._removeItemFieldCheckedTemp($(".field_item"));
                    self._setItemFieldCheckedTemp(element);
                }
            }
        });

        $(".field_item").mouseup(function (e)
        {
            self._mouse_button_pressed = 0;
            $("#smile").smile("unwah");
            e.preventDefault();
            self._removeItemFieldCheckedTemp($(".field_item"));

            if (!e.ctrlKey && this == e.target)
            {
                var element = $(e.target);
                var pos = Number(element.attr("pos"));

                if (self._mines.length == 0)
                    self._generateMines(pos);

                self._clickToItemField(element);
            }

            if ($(".field_item.mine_empty").length + $(".field_item.mine_question").length + $(".field_item.mine_flag").length == self.options.mines_count)
            {
                self._setItemFieldType($(".field_item.mine_empty"), "mine_flag");
                self._gameOver(true);
            }
        });
    },

    _gameOver: function (win)
    {

        $(".field_item").off();
        clearInterval(this.options.timer_id);

        var time = $("#timer").indicator("value");

        if (win)
        {
            $("#smile").smile("cool");
            alert("Вы победили! Вы достигли победы за " + time + " " + this._getWordByNumber(time, ["секунд", "секунду", "секунды"]) + "!");
        }
        else
        {
            $("#smile").smile("die");
        }
    },

    _updateSliderLabel: function (value)
    {
        var word = "";

        if (value != this.options.mines_count)
            word = "будет ";

        $("#setting_mine_count").text(word + value + " " + this._getWordByNumber(value, ["мин", "мина", "мины"]));
    },

    _updateSliderValue: function (curr_height, curr_width)
    {
        var slider_max = (this.options.height * this.options.width * 0.9) | 0;
        var slider_value = $("#slider").slider("value");

        $("#slider").slider("option", "max", slider_max);
        $("#slider").slider("option", "value", Math.min(slider_value, slider_max));
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