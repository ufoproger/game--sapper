function Game (_id)
{
    var mineTypes = new Array("mine_count_1", "mine_count_2", "mine_count_3", "mine_count_4", "mine_count_5",
        "mine_count_6", "mine_count_7", "mine_count_8", "mine_empty", "mine_empty_checked", "mine", "mine_checked",
        "mine_question", "mine_flag");

    var id = _id.toString();
    var width = 10;
    var height = 10;
    var mine_count = 10;

    this.deleteGame = function ()
    {
        $("#field").remove(".field_item");
    }

    this.startGame = function (_height, _width, _mine_count)
    {
        this.deleteGame();

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
                }
                else
                if (element.hasClass("mine_empty"))
                    element.addClass("mine_empty_checked_temp");
            }
        });

        $(".field_item").mousemove(function (e)
        {
            e.preventDefault();

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
            if (this == e.target)
            {
                var element = $(e.target);

                element.addClass("mine");
            }
        });
    }

    this.gameOver = function ()
    {
        $(".field_item").off();
    }

    init = function ()
    {
        $(id).append($("<div />", {id: "game_sapper"}));
        $("#game_sapper").append($("<div />", {id: "field"}));
    }

    init();
    this.startGame(10, 10, 10);
}
