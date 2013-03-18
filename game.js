function Game (_id)
{
    var mine_types = new Array("mine_empty", "mine_question", "mine_count_1", "mine_count_2", "mine_count_3", "mine_count_4", "mine_count_5",
        "mine_count_6", "mine_count_7", "mine_count_8", "mine", "mine_checked", "mine_flag", "mine_empty_checked");
    var mines_checked_temp = new Array("mine_empty_checked_temp", "mine_question_checked_temp");
    var body = _id;
    var width = 10;
    var height = 10;
    var mines_count = 10;
    var mines = new Array();

    getWordByNumber = function (num, words)
    {
        num = Math.abs(num);

        if ((num % 100 >= 10 && num % 100 <= 20) || (num % 10 >= 5 && num % 10 <= 9) || (num % 10 == 0))
            return words[0];

        if (num % 10 == 1)
            return words[1];

        return words[2];
    }

    isItemFieldFree = function (element)
    {
        for (var i = 0; i < 2; ++i)
            if (element.hasClass(mine_types[i]))
                return true;

        return false;
    }

    isItemFieldCheckedTemp = function (element)
    {
        for (index in mines_checked_temp)
            if (element.hasClass(mines_checked_temp[index]))
                return true;

        return false;
    }

    setItemFieldCheckedTemp = function (element)
    {
        for (index in mines_checked_temp)
            if (element.hasClass(mine_types[index]))
                element.addClass(mines_checked_temp[index]);
    }

    removeItemFieldCheckedTemp = function (element)
    {
        for (index in mines_checked_temp)
            element.removeClass(mines_checked_temp[index]);
    }

    getItemFieldType = function (element)
    {
        for (index in mine_types)
            if (element.hasClass(mine_types[index]))
                return Number(index);

        return -1;
    }

    generateMines = function (pos)
    {
        while (mines.length < mines_count)
        {
            var mine_pos = ((Math.random() * 100000) | 0) % (width * height);

            if (mine_pos != pos && $.inArray(mine_pos, mines) == -1)
                mines.push(mine_pos);
        }

        console.debug(mines);
    }

    setItemFieldType = function (element, new_type)
    {
        for (index in mine_types)
            element.removeClass(mine_types[index]);

        element.addClass(new_type);
    }

    inRange = function (value, left, right)
    {
        return (value >= left && value <= right);
    }

    walkAround = function (pos)
    {
        if (!isItemFieldFree($(".field_item[pos=" + pos + "]")))
            return;

        var mov_x = new Array(-1, -1, 0, 1, 1, 1, 0, -1);
        var mov_y = new Array(0, 1, 1, 1, 0, -1, -1, -1);
        var x = pos / width | 0;
        var y = pos % width;

        var places = new Array();
        var mines_around = 0;

        for (var k = 0; k < 8; ++k)
        {
            var curr_x = x + mov_x[k];
            var curr_y = y + mov_y[k];

            if (curr_x < 0 | curr_y < 0 || curr_x >= height || curr_y >= width)
                continue;

            var curr_pos = curr_x * width + curr_y;

            places.push(curr_pos);

            if ($.inArray(curr_pos, mines) != -1)
                ++mines_around;
        }

        if (mines_around)
            setItemFieldType($(".field_item[pos=" + pos + "]"), "mine_count_" + mines_around);
        else
        {
            setItemFieldType($(".field_item[pos=" + pos + "]"), "mine_empty_checked");

            for (index in places)
                walkAround(places[index]);
        }
    }

    clickToItemField = function (element)
    {
        if (!isItemFieldFree(element))
            return;
  //      if ($.inArray(getItemFieldType(element), [0, 1]) == -1)
  //          return;

        var pos = Number(element.attr("pos"));

        if ($.inArray(pos, mines) != -1)
        {
            for (index in mines)
                setItemFieldType($(".field_item[pos=" + mines[index] + "]"), "mine");

            setItemFieldType(element, "mine_checked");
            gameOver(false);

            return;
        }

        walkAround(pos);
    }

    deleteGame = function ()
    {
        $("#field > div").remove();
        mines = new Array();
    }

    startGame = function (_height, _width, _mine_count)
    {
        deleteGame();

        height = _height;
        width = _width;
        mines_count = _mine_count;

        updateSliderValue(height, width);

        for (var i = 0; i < height; ++i)
        {
            for (var j = 0; j < width; ++j)
                $("#field").append($("<div />", {/*x: i, y: j, */pos: i * width + j}).addClass("field_item").addClass("mine_empty"));

            $("#field").append($("<div />").css("clear", "both"));
        }

        $(".field_item").mousedown(function (e)
        {
            e.preventDefault();

            if (this == e.target)
            {
                var element = $(e.target);

                if (e.ctrlKey)
                {
                    var right_click_mines = new Array("mine_empty", "mine_flag", "mine_question");
                    var p = $.inArray(mine_types[getItemFieldType(element)], right_click_mines);

                    if (p != -1)
                        setItemFieldType(element, right_click_mines[(p + 1) % 3]);
                }
                else
                    setItemFieldCheckedTemp(element);
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

                if (!isItemFieldCheckedTemp(element) && e.which == 1)
                {
                    removeItemFieldCheckedTemp($(".field_item"));
                    setItemFieldCheckedTemp(element);
                }
            }
        });

        $(".field_item").mouseup(function (e)
        {
            e.preventDefault();
            removeItemFieldCheckedTemp($(".field_item"));

            if (!e.ctrlKey && this == e.target)
            {
                var element = $(e.target);
                var pos = Number(element.attr("pos"));

                if (mines.length == 0)
                    generateMines(pos);

                clickToItemField(element);
            }

            if ($(".field_item.mine_empty").length + $(".field_item.mine_question").length + $(".field_item.mine_flag").length == mines_count)
            {
                setItemFieldType($(".field_item.mine_empty"), "mine_flag");
                gameOver(true);
            }
        });
    }

    gameOver = function (win)
    {

        $(".field_item").off();
    }

    changeSlider = function (e, ui)
    {
        $("#setting_mine_count").text(ui.value + " " + getWordByNumber(ui.value, ["мин", "мина", "мины"]));
    }

    updateSliderValue = function (curr_height, curr_width)
    {
        var slider_max = (curr_height * curr_width * 0.9) | 0;
        var slider_value = $("#slider").slider("value");

        $("#slider").slider("option", "max", slider_max);
        $("#slider").slider("option", "value", Math.min(slider_value, slider_max));
    }

    init = function ()
    {
        body.append($("<div />", {id: "game_sapper"}));
        $("#game_sapper").append($("<div />", {id: "field"}));
        $("#game_sapper").append($("<div />", {id: "settings"}));
        $("#test").children().appendTo($("#settings"));
        $("#test").remove();
        $("#slider").slider({min: 10, max: 20, slide: changeSlider, change: changeSlider});
        $("#slider").slider("value", mines_count);
        $("#spinner_height, #spinner_width").spinner({min: 10, max: 20});
        $("#button_new_game").button();

        $("#spinner_height").on("spin", function (e, ui)
        {
            updateSliderValue(ui.value, $("#spinner_width").val());
        });

        $("#spinner_width").on("spin", function (e, ui)
        {
           updateSliderValue($("#spinner_height").val(), ui.value);
        });

        $("#button_new_game").click(function ()
        {
            startGame($("#spinner_height").val(), $("#spinner_width").val(), $("#slider").slider("value"));
        });
    }

    init();
    startGame(height, width, mines_count);
}