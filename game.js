function Game (_id)
{
    var mine_types = new Array("mine_count_1", "mine_count_2", "mine_count_3", "mine_count_4", "mine_count_5",
        "mine_count_6", "mine_count_7", "mine_count_8", "mine_empty", "mine_empty_checked", "mine", "mine_checked",
        "mine_question", "mine_flag");

    var body = $(_id);
    var width = 10;
    var height = 10;
    var mine_count = 10;

    setItemFieldType = function (element, new_type)
    {

        for (index in mine_types)
            element.removeClass(mine_types[index]);

        element.addClass(new_type);
    }

    deleteGame = function ()
    {
        $("#field > div").remove();
    }

    startGame = function (_height, _width, _mine_count)
    {
        deleteGame();

        height = _height;
        width = _width;
        mine_count = _mine_count;

        for (var i = 0; i < height; ++i)
        {
            for (var j = 0; j < width; ++j)
                $("#field").append($("<div />", {x: i, y: j}).addClass("field_item").addClass("mine_empty"));

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
                    //element.addClass("mine_flag");
                    setItemFieldType(element, "mine_flag");
                }
                else
                if (element.hasClass("mine_empty"))
                    element.addClass("mine_empty_checked_temp");
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

                if (!element.hasClass("mine_empty_checked_temp") && e.which == 1)
                {
                    $(".field_item").removeClass("mine_empty_checked_temp");
                    element.addClass("mine_empty_checked_temp");
                }
            }
        });

        $(".field_item").mouseup(function (e)
        {
            e.preventDefault();
            $(".field_item").removeClass("mine_empty_checked_temp");

            if (e.ctrlKey)
                return;

            if (this == e.target)
            {
                var element = $(e.target);

                setItemFieldType(element, "mine");
            }
        });
    }

    gameOver = function ()
    {
        $(".field_item").off();
    }

    changeSlider = function (e, ui)
    {
        $("#setting_mine_count").text(ui.value + " мин");
    }

    init = function ()
    {
        body.append($("<div />", {id: "game_sapper"}));
        $("#game_sapper").append($("<div />", {id: "field"}));
        $("#game_sapper").append($("<div />", {id: "settings"}));
        $("#test").children().appendTo($("#settings"));
        $("#slider").slider({min: 10, max: 20, slide: changeSlider, change: changeSlider});
        $("#slider").slider("value", mine_count);
        $("#spinner_height, #spinner_width").spinner({min: 10, max: 20});
        $("#button_new_game").button();

        $("#button_new_game").click(function ()
        {
            startGame($("#spinner_height").val(), $("#spinner_width").val(), $("#slider").val());
        });
    }

    init();
    startGame(height, width, mine_count);
}
