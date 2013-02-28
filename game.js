function InitGame ()
{
   $("#game").append($("<div />", {id: "game_field"}));
    $("#game_field").append($("<div />").addClass("field_item").addClass("mine_count_1"));
    $("#game_field").append($("<div />").addClass("field_item").addClass("mine_count_2"));
    $("#game_field").append($("<div />").css("clear", "both"));
    $("#game_field").append($("<div />").addClass("field_item").addClass("mine_count_1"));



    var newDiv1 = $(document.createElement("div")).addClass("field_item").addClass("mine_count_1");
    var newDiv2 = $(document.createElement("div")).addClass("field_item").addClass("mine_count_2");
    var newDiv3 = $(document.createElement("div")).css("clear", "both");
    var newDiv4 = $(document.createElement("div")).addClass("field_item").addClass("mine_empty");

/*
    for (i = 0; i < 6; ++i)
    {
        $("#game").append($(document.createElement("div")).addClass("field_item").addClass("mine_empty"));

        if (i == 4)
            $("#game").append($(document.createElement("div")).css("clear", "both"));
    }

    $("#game").append(newDiv1, newDiv2, newDiv4, newDiv3);    for (i = 0; i < 6; ++i)
{
    $("#game").append($(document.createElement("div")).addClass("field_item").addClass("mine_empty"));

    if (i == 4)
        $("#game").append($(document.createElement("div")).css("clear", "both"));
}
  //  var $newDiv2 = document.createElement("div");
 //   $(newDiv1).add("div").addClass("field_item").addClass("mine_count_1");
//    $($newDiv2).add("div").addClass("field_item").addClass("mine_count_2").appendTo($("#game"));
//    $("#game").append(newDiv1);
      //$("#game").append('<div class="field_item mine_count_1"></div>');
  //  $("#game").append(newDiv2);
  */ // newDiv.add add("field_item");
   // $("#game").append(newDiv);
//    $("#game").add("div").addClass("field_item").addClass("mine_count_1");
}