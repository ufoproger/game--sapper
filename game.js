function Game (_id)
{
    var id = _id.toString();
    var width = 10;
    var height = 10;
    var mine_count = 10;

    init = function ()
    {
        $(id).append($("<div />", {id: "game_sapper"}));
        $("#game_sapper").append($("<div />", {id: "field"}));

        var mineTypes = new Array("mine_count_1", "mine_count_2", "mine_count_3", "mine_count_4", "mine_count_5", "mine_count_6", "mine_count_7", "mine_count_8", "mine_empty", "mine_empty_checked", "mine", "mine_checked");

        for (var i = 0; i < height; ++i)
        {
            for (var j = 0; j < width; ++j)
                $("#field").append($("<div />").addClass("field_item").addClass(mineTypes[Math.floor(Math.random() * 100) % 12]));

            $("#field").append($("<div />").css("clear", "both"));
        }
    }

    init();
}