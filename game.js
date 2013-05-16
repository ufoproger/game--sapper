/**
 * Виджет настроек размера поля и количества мин. Левый клик мыши - изменение размера, правый - количества мин. Размеры поля, а так же пороги количества мин устанавливаются внутри виджета.
 */
$.widget("my.field_grid", {
    options:
    {
        width: 10,  // Текущая ширина игрового поля
        height: 10, // Текущая высота игрового поля
        count: 10   // Текущее количество мин на поле
    },

    /* Конструктор */
    _create: function ()
    {
        this._height = 15;  // Максимальная высота поля
        this._width = 15;   // Максимальная ширина поля
        this._min_q = 0.1;  // Минимальный процент мин на поле
        this._max_q = 0.9;  // Максимальный процент мин на поле
        this._which = 0;    // Нажата ли клавиша мыши
        this.element.addClass("field_grid");    // Добавляем оформление рамки поля

        /* Добавляем элементы поля */
        for (var i = 0; i < this._height; ++i)
        {
            for (var j = 0; j < this._width; ++j)
                this.element.append($("<div />", {class: "field_grid_item"}));

            this.element.append($("<div />", {style: "clear: both;"}));
        }

        var self = this;    // Пригодится для доступа к данным виджета из функций в биндинге
        var grid_item = $(".field_grid_item", this.element);    // Массив элементов игрового поля

        grid_item   // Навешиваем на каждый элемент игрового поля следующие события
            .mouseenter(function (e)    // Вход мыши в клетку
            {
                if (self._which != 1 && self._which != 3)   // Если мышь возла без зажатой кнопки
                    return; // То здесь больше делать нечего

                var index = grid_item.index(this);  // Индекс клетки, в которую мышь зашла
                var x = ((index / self._width) | 0) + 1;    // Координаты клетки в сетке (вертикаль)
                var y = (index % self._width) + 1;          // Координаты клетки в сетке (горизонталь)

                grid_item.removeClass("hover_left hover_right");    // Сброс состояния всех клеток

                if (self._which == 1)   // Если нажата левая кнопка мыши
                {
                    /* Вычисляем размер поля, учитывая, что оно не может быть меньше минимального размера 9х9 */
                    self.options.height = Math.max(x, 9);
                    self.options.width = Math.max(y, 9);
                }

                if (self._which == 3)   // Если нажата правая кнопка мыши
                {
                    self.options.count = (x - 1) * self.options.width + y;  // Текущее количество мин для текущего выбора

                    if (y > self.options.width) // Если курсор мыши правее доступной строки с минами в прямоугольнике,
                        self.options.count -= y - self.options.width;   // то добиваем ее полностью в количество мин
                }

                var max_count = self.options.height * self.options.width;   // Максимально возможное количество мин

                self.options.count = Math.max((max_count * self._min_q) | 0, Math.min((max_count * self._max_q) | 0, self.options.count));  // Корректируем количество мин в допустимых пределах
                self._trigger("mousemove", e, {width: self.options.width, height: self.options.height, count: self.options.count}); // Вызываем триггер искусственного события с данные об изменении
                self._render(); // Перерисовываем поле
            })
            .mousedown(function (e) // Зажатие клавиши мыши (волочение курсора по полю)
            {
                e.preventDefault();
                self._which = e.which;          // Фиксируем факт нажатия и номер клавишы
                $(this).trigger("mouseenter");  // Вызываем событие для перерисовки клеток, а так же применения новых параметров поля
            })
            .mouseup(function ()    // Отпускание клавиши мыши
            {
                self._which = 0;    // Ничего не нажато
            })
            .contextmenu(false);    // Блокируем появление контексного меню по правому клику мыши

        $(".field_grid", this.element).mouseleave(function ()   // Выход курсора мыши за пределы поля настроек
        {
            self._which = 0;    // Курсор потерял, клавиша мыши отпущена
        });

        this._render(); // Перерисовываем клетки
    },

    /* Отрисовка клеток поля */
    _render: function ()
    {
        /* Меняем состояние у клеток, которые отображают текущий размер игорового поля */
        for (var i = 0; i < this.options.height; ++i)
            for (var j = 0; j < this.options.width; ++j)
                this._markFieldGridItem(i * this._height + j, true);

        /* Поверх внутри прямоугольника с размером игрового поля помечаем подряд количество мин */
        for (var i = 0, l = (this.options.count / this.options.width) | 0; i < l; ++i)
            for (var j = 0; j < this.options.width; ++j)
                this._markFieldGridItem(i * this._height + j);

        /* Добиваем оставшийся хвостик (неполную последнюю строку с минами) */
        for (var j = 0, i = (this.options.count / this.options.width) | 0, l = this.options.count % this.options.width; j < l; ++j)
            this._markFieldGridItem(i * this._height + j);
    },

    /* Пометка клетки поля в зависимости от её типа
        * index: индекс клетки
        * is_left: клетка размера поля это или нет
     */
    _markFieldGridItem: function (index, is_left)
    {
        var element = $(".field_grid_item:eq(" + index + ")", this.element);    // Получаем клетку с соответствующим индексом

        if (is_left == undefined || is_left != true)    // Если это точно не клетка размера поля
            element.removeClass("hover_left").addClass("hover_right");  // Перепопечаем клетку клеткой количества мин
        else    // Иначе это клетка размера поля
            element.addClass("hover_left"); // Помечаем это
    }
});

/**
 * Виджет кнопки-смайлика. При нажатии начинает новую игру, а в ходе игры отображает эмоции в зависимости от процесса игры.
 */
$.widget("my.smile", {
    /* Конструктор */
    _create: function ()
    {
        this._states = "smile_ok smile_wah smile_die smile_cool smile_ok_checked";  // Всевозможные состояния кнопки
        var self = this;    // Доступ к параметрам виджета из функций в биндингах

        this.element.addClass("smile"); // Рожица по-умолчанию

        this.element    // Навешивание событий на кнопку
            .mousedown(function (e) // Зажатие клавишы
            {
                e.preventDefault(); // Предотвращаем дальнейшую цепочку событий, не срабатывает drag-n-drop

                if (e.which == 1)   // Если левая клавиша мыши
                    self.element.addClass("smile_ok_checked");  // то зажимаем кнопку
            })
            .mouseup(function ()    // Отпускание клавиши мыши
            {
                if (self.element.hasClass("smile_ok_checked"))  // Если кнопка была нажата
                {
                    self._setSmile("smile_ok"); // Сбрасываем состояние
                    self._trigger("click");     // Случился клик, об этом надо всем рассказать
                }
            })
            .mouseleave(function (e)    // Выход курсора за пределы виджета
            {
                if (e.which == 1)   // Если была нажата левая кнопка
                    self.element.removeClass("smile_ok_checked");   // То кнопка больше не нажата
            });
    },

    /* Установка статуса кнопки
        * smile: статус кнопки
     */
    _setSmile: function (smile)
    {
        this.element.removeClass(this._states).addClass(smile); // Удаление старых статусов и добавление нового
    },

    /* Смерть, вызванная проигрышем */
    die: function ()
    {
        this._setSmile("smile_die");
    },

    /* Крутость, вызванная победой */
    cool: function ()
    {
        this._setSmile("smile_cool");
    },

    /* Удивление, вызванное ожиданием чего-либо от пользователя (скорее всего он нажал кноаку мыши */
    wah: function ()
    {
        this.element.addClass("smile_wah");
    },

    /* Прошло удивление, завяли помидоры */
    unwah: function ()
    {
        this.element.removeClass("smile_wah");
    }
});

/**
 *  Виджет цифрового индикатора. Отображает 3 позиции. Если число отрицательное, то знак и две позиции числа.
 */
$.widget("my.indicator", {
    options:
    {
        value: 0    // Текущее значение индикатора
    },

    /* Конструктор */
    _create: function ()
    {

        this._class_values = "digit_0 digit_1 digit_2 digit_3 digit_4 digit_5 digit_6 digit_7 digit_8 digit_9"; // Всевозможные цифры
        this._num = []; // Массив позиций
        this.element.addClass("indicator"); // Добавление рамки индикатора

        /* Добавляем и привязываем позиции индикатора к элементам массива для быстрого доступа */
        for (var i = 0; i < 3; ++i)
        {
            this.element.append($("<div />").addClass("num" + i + " digits"));
            this._num.push(this.element.find(".num" + i));
        }

        this._render(); // Перерисовываем индикатор
    },

    /* Функция перерисовки индикатора */
    _render: function ()
    {
        var val = this.options.value;   // Текущее значние индикатора

        /* Очищаем содержимое позиций индикатора от цифр и знаков */
        for (var index in this._num)
            this._num[index].removeClass(this._class_values);


        for (var i = (val < 0 ? 1 : 0); i < 3; ++i) // Если число положительное, то пробегаем по всем позициям; иначе только по второй и третьей
        {
            var digit = Math.abs((val % Math.pow(10, 3 - i)) / Math.pow(10, 2 - i)) | 0;    // Нехитрыми операциями из числа извлекаем требуемую цифру

            this._num[i].addClass("digit_" + digit);    // И добавляем новую цифру на позицию
        }
    },

    /* Увеличение значения индикатора на единицу */
    inc: function ()
    {
        ++this.options.value;   // Добавили единичку
        this._render();         // Перерисовали новый индикатор
    },

    /*  Установка и получение значения индикатора */
    value: function (_value)
    {
        if (_value === undefined)   // Если этот параметр не был передан
            return this.options.value;  // То возвращаем значение индикатора

        this.options.value = _value;    // Иначе у нас есть новое значение
        this._render();     // Которое надо обновить в индикаторе

        return _value;      // Все равно вернем самое свежее значение индикатора
    }
});

/**
 * Виджет игры (игровое поле, настройки, индикаторы, кнопка-смайлик). Вся логика игры находится здесь.
 */
$.widget("my.sapper", {
    /* Конструктор */
    _create: function ()
    {
        this._mov_x = [-1, -1, 0, 1, 1, 1, 0, -1];  // Положение смежных клеток по оси X
        this._mov_y = [0, 1, 1, 1, 0, -1, -1, -1];  // Положение смежных клеток по оси Y
        this._mouse_button_pressed = false; // Нажата ли кнопка мыши
        this._mines_count = 10; // Текущее количество мин
        this._height = 10;      // Текушая высота игрового поля
        this._width = 10;       // Текущая ширина игрового поля
        this._timer_id = 0;     // Идентификтор таймера отчсета времени
        this._mines = [];       // Массив с индексами мин
        this._mine_types = new Array("mine_empty", "mine_question", "mine_count_1", "mine_count_2", "mine_count_3", "mine_count_4", "mine_count_5",
            "mine_count_6", "mine_count_7", "mine_count_8", "mine", "mine_checked", "mine_flag", "mine_empty_checked", "mine_wrong_flag");  // Состояния клеток на поле
        this._mines_checked_temp = new Array("mine_empty_checked_temp", "mine_question_checked_temp");  // Специальные состояния нажатых клеток

        var self = this;    // Для доступа к параметрам виджета из функций, которые будут в биндинге

        $(this.element).contextmenu(false); // Не даем открыться контекстному меню по правому клику

        this.element.addClass("game_sapper");   // Добавляем в элемент главный класс
        this.element    // Добавляем HTML код в наш элемент
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

        $(".settings", this.element).hide();    // Прячем панель настроек
        $(".indicator_score, .indicator_timer", this.element).indicator();  // Активируем виджеты индикаторов

        $(".setting_expander", this.element).click(function (e) // Реакция на клик по ссылке для открытия панели настроек
        {
            var settings = $(".settings", self.element);    // Получаем панель настроек

            e.preventDefault(); // Не надаем вызывать события дальше по цепочке

            if (settings.is(":hidden")) // Если панель закрыта
            {
                settings.show();    // То открываем её
                $(".setting_expander a", self.element).text("Закрыть настройки");   // И меняем надпись на ссылке
            }
            else    // Иначе надо было закрыть панель
            {
                settings.hide();    // Закрываем панель
                $(".setting_expander a", self.element).text("Открыть настройки");   // И меняем надпись на ссылке
            }
        });

        $(".button_smile", this.element)    // Элемент, в котором будет кнопка-смайлик
            .smile()    // Активируем виджет
            .bind("smileclick", function () // Перехват самопального события клика
            {
                var grid = $(".setting_grid", self.element);    // Поле настройки

                self._startGame(grid.field_grid("option", "height"), grid.field_grid("option", "width"), grid.field_grid("option", "count"));   // Создаем игру с новыми данными
                $(".settings", self.element).hide();    // Прячем настройки
                $(".setting_expander a", self.element).text("Открыть настройки");   // Меняем текст ссылки
            });

        $(".setting_grid", this.element)    // Поле настройки
            .field_grid({width: this._width, height: this._height, count: this._mines_count})   // Активируем виджет с заданными параметрами
            .on("field_gridmousemove", function (e, ui) // Реакция на сомапальное событие изменения параметров поля
            {
                self._updateFieldGridLabel(ui); // Обновляем подпись под полем
            });

        this._startGame(this._height, this._width, this._mines_count);  // Создаем новую игру по-умолчанию
    },

    /* Обновление надписи с размерами поля и количеством мин под полем настройки
        * ui: массив с данными
     */
    _updateFieldGridLabel: function (ui)
    {
        var width, height, count;   // Новые параметры поля

        if (ui == undefined)        // Если изменились не настройки
        {
            /* То берем текущие данные о поле и минах */
            width = this._width;
            height =  this._height;
            count = this._mines_count;
        }
        else    // Иначе
        {
            /* Берем новые настройки */
            width = ui.width;
            height = ui.height;
            count = ui.count;
        }

        $(".grid_label", this.element).html("Поле <b>" + width + "x" + height + "</b>, <b>" + count + "</b> " + this._getWordByNumber(count, ["мин", "мина", "мины"])); // Красиво и по-человечески выводим
    },

    /* Является ли указанная клетка поля свободной
        * element: исследуемый элемент
     */
    _isItemFieldFree: function (element)
    {
        /* Если элемент имеет в себе класс свободной клетки */
        for (var i = 0; i < 2; ++i)
            if (element.hasClass(this._mine_types[i]))
                return true;    // То все ок

        return false;   // Иначе повезет в следующий раз
    },

    /* Является ли указанная клетка поля временно помеченной?
        * element: исследуемый элемент
     */
    _isItemFieldCheckedTemp: function (element)
    {
        /* Если элемент имеет в себе класс временной клетки */
        for (var index in this._mines_checked_temp)
            if (element.hasClass(this._mines_checked_temp[index]))
                return true;    // То все хорошо

        return false;   // Иначе не всё так радужно
    },

    /* Пометить клетку нажатой
        * element: исследуемый элемент
     */
    _setItemFieldCheckedTemp: function (element)
    {
        /* Если находим соответствующее помеченное состояние для текущей клетки, то делаем её нажатой */
        for (var index in this._mines_checked_temp)
            if (element.hasClass(this._mine_types[index]))
                element.addClass(this._mines_checked_temp[index]);
    },

    /* Удалить нажатие с клетки
        * element: исследуемый элемент
     */
    _removeItemFieldCheckedTemp: function (element)
    {
        /* Удаляем классы нажатых элементов */
        for (var index in this._mines_checked_temp)
            element.removeClass(this._mines_checked_temp[index]);
    },

    /* Получение индекса типа клетки в массиве типов
        * element: исследуемый элемент
     */
    _getItemFieldType: function (element)
    {
        for (var index in this._mine_types) // Пробегаем по всем элементам массива
            if (element.hasClass(this._mine_types[index]))  // Если нашли что-то знакомое
                return Number(index);   // То более нам и не надо

        return -1;  // Иначе ничего не нашли
    },

    /* Расположение мин на игровом поле так, чтобы в указанное место мина не встала
        * pos: позиция, куда мину нельзя помещать
     */
    _generateMines: function (pos)
    {
        while (this._mines.length < this._mines_count)  // Пока не размещены все мины
        {
            var mine_pos = ((Math.random() * 100000) | 0) % (this._width * this._height);   // Рандомно выбираем положение мине

            if (mine_pos != pos && $.inArray(mine_pos, this._mines) == -1)  // Если это не противоречит этике и морали
                this._mines.push(mine_pos); // Добавляем мину в массив
        }
    },

    /* Установка нового состояния клетке
        * element: элемент клетки
        * new_type: новое состояние
     */
    _setItemFieldType: function (element, new_type)
    {
        /* Очищаем клетку от других состояний */
        for (var index in this._mine_types)
            element.removeClass(this._mine_types[index]);

        element.addClass(new_type); // Устанавливаем новое состояние
    },

    /* Рекурсивная функция обхода в ширину
        * pos: текущая позиция от которой стоит идти в смежные клетки
     */
    _walkAround: function (pos)
    {
        var element = $(".field_item:eq(" + pos + ")", this.element);   // Получаем текущий по положению элемент

        if (!this._isItemFieldFree(element))    // Если клетка уже занята
            return;     // То нечего больше делать, откатываемся вверх по дереву рекурсии

        /* Вычисляем координаты клетки в сетке */
        var x = pos / this._width | 0;
        var y = pos % this._width;

        var places = [];    // Массив смежных клеток, которые было бы не плохо посетить
        var mines_around = 0;   // Количество мин вокруг текущей клетки

        for (var k = 0; k < 8; ++k) // Пробегая по каждой из восьми смежных клеток
        {
            /* Вычисляем координаты смежной клетки */
            var curr_x = x + this._mov_x[k];
            var curr_y = y + this._mov_y[k];

            if (curr_x < 0 | curr_y < 0 || curr_x >= this._height || curr_y >= this._width) // Если координаты неверные
                continue;   // Переходим к следующей клетке

            var curr_pos = curr_x * this._width + curr_y;   // Получаем индекс клетки

            places.push(curr_pos);  // И добавляем в копилку для обхода

            if ($.inArray(curr_pos, this._mines) != -1)     // Если в клетке находится мина
                ++mines_around;     // То учитываем это
        }

        if (mines_around)   // Если вокруг есть хотя бы одна мина
            this._setItemFieldType(element, "mine_count_" + mines_around);  // То устанавливаем соответствующую цифру
        else    // Иначе
        {
            this._setItemFieldType(element, "mine_empty_checked");  // Помечаем клетку пустой нажатой

            /* И вызываем обход для смежных клеток */
            for (var index in places)
                this._walkAround(places[index]);
        }
    },

    /* Реакция на клик по клетке
        * element: элемент, содержащий клетку
     */
    _clickToItemField: function (element)
    {

        if (!this._isItemFieldFree(element))    // Если клетка не пустая
            return;     // То нечего по ней просто так кликать!

        var pos = $(".field_item", this.element).index(element);    // Вычисляем её положение

        if ($.inArray(pos, this._mines) != -1)  // Если напоролись на мину
        {
            $(".field_item.mine_flag", this.element).removeClass("mine_flag").addClass("mine_wrong_flag");  // Сначала все помеченные флажком клетки помечаем ошибочным флажком

            for (var index in this._mines)  // А потом пробегая по минам
            {
                var curr_element = $(".field_item:eq(" + this._mines[index] + ")", this.element);   // Получаем элемент, являющийся миной

                if (curr_element.hasClass("mine_wrong_flag"))   // Если он помечен ошибочным флажком
                    this._setItemFieldType(curr_element, "mine_flag");  // То превращаем его в обычный флажок
                else
                    this._setItemFieldType(curr_element, "mine");   // Иначе мина непомечена, мина вылезла на поверхность
            }

            this._setItemFieldType($(".field_item:eq(" + pos + ")", this.element), "mine_checked"); // Мина, по которой кликнули, самая красная, самая жирная
            this._gameOver(false);  // Удручающий конец игры

            return;
        }

        this._walkAround(pos);  // Если не попали в мину, то раскрываем смежные пустые клетки
    },

    /* Удаление игрового поля */
    _deleteGame: function ()
    {
        $(".field > div", this.element).remove();   // Удаляем клетки
        this._mines = [];   // Очищаем мины
    },

    /* Начало новой игры
        * _height: высота поля
        * _width: ширина поля
        * _mines_count: количество мин на поле
     */
    _startGame: function (_height, _width, _mines_count)
    {
        var self = this;    // Для доступа к параметрам виджета в бинденных функциях

        clearInterval(this._timer_id);  // Сбрасываем таймер отсчета секунд
        this._deleteGame();             // Если это не первая игра, то поле удалится, чтобы снова возродиться
        this._height = _height;         // Применяем новую высоту поля
        this._width = _width;           // Применяем новую ширину поля
        this._mines_count = _mines_count;   // Применяем новое количество мин на поле
        this._updateFieldGridLabel();   // Обновляем надпись в панели настроек
        $(".indicator_score", this.element).indicator("value", _mines_count);   // Первоначальное количество мин на индикаторе
        $(".indicator_timer", this.element).indicator("value", 0);              // Отсчет секунд начинается с нуля

        /* Создаем игровое поле */
        for (var i = 0; i < this._height; ++i)
        {
            for (var j = 0; j < this._width; ++j)
                $(".field", this.element).append($("<div />", {class: "field_item mine_empty"}));


            $(".field", this.element).append($("<div />").css("clear", "both"));
        }

        $(".field", this.element)   // Игровое поле
            .mouseleave(function (e)    // Мышь вышла за границу
            {
                if (e.which)    // Если нажата кнопка мыши
                {
                    self._mouse_button_pressed = false; // То будто перестаем её нажимать
                    self._removeItemFieldCheckedTemp($(".field_item", self.element));    // Снимаем нажатие с клеток поля
                    $(".button_smile", self.element).smile("unwah");        // И кнопка-смайлик перестаёт удивляться
                }
            })
            .mouseenter(function (e)    // Вход мыши на поле с клетками
            {
                if (e.which)    // Если была нажата кнопка мыши
                {
                    self._mouse_button_pressed = true;              // То это логичный шаг
                    $(".button_smile", self.element).smile("wah");  // И кнопка-смайлик снова удивляется
                }
            });

        $(".field_item", this.element) // Клетки игрового поля
            .mousedown(function (e) // Кнопка зажата
            {
                e.preventDefault(); // Не даем событию происходить дальше

                self._mouse_button_pressed = true;  // Кнопка нажата
                $(".button_smile", self.element).smile("wah");  // Смайлик удивлён

                if (this == e.target)   // Если мы прямо у цели
                {
                    var element = $(e.target);  // Получаем элемент

                    if (e.which == 3)   // Если зажали правую кнопку
                    {
                        var right_click_mines = ["mine_empty", "mine_flag", "mine_question"];   // Объявляем массив состояний клетки при клике правой кнопкой
                        var p = $.inArray(self._mine_types[self._getItemFieldType(element)], right_click_mines);    // Находит индекс того, что сейчас стоит на клетке

                        if (p != -1)    // Если клетка была ранее помечена правой кнопкой мыши
                            self._setItemFieldType(element, right_click_mines[(p + 1) % 3]);    // То помечаем следующим значением в массиве
                    }
                    else    // Иначе если не правая кнопка мыши
                        self._setItemFieldCheckedTemp(element); // Клетка как бы нажата, но не открыта

                    $(".indicator_score", self.element).indicator("value", self._mines_count - $(".field_item.mine_flag", self.element).length);    // Вдруг количество мин изменилось
                }
            })
            .mouseenter(function (e) // Мышь вошла на клетку
            {
                e.preventDefault(); // Отменяем перетаскивание

                if (e.which == 3) // Если правая кнопка мыши, то делать нечего
                    return;

                if (this == e.target)   // Если попали куда надо
                {
                    var element = $(e.target);  // По получаем элемент

                    if (!self._isItemFieldCheckedTemp(element) && self._mouse_button_pressed) // Если клетка не нажата, а кнопка нажата, то непорядок, надо его исправить
                    {
                        self._removeItemFieldCheckedTemp($(".field_item", self.element));   // Очищаем нажатие с других клеток
                        self._setItemFieldCheckedTemp(element); // И ставим нажатие на эту клетку
                    }
                }
            })  // Кнопку мыши отпустили
            .mouseup(function (e)
            {
                self._mouse_button_pressed = false; // Да, отпустили
                $(".button_smile", self.element).smile("unwah");    // Кнопка-смайлик может отдохнуть
                e.preventDefault(); // Не даем выполняться событиям дальше по цепочке
                self._removeItemFieldCheckedTemp($(".field_item", self.element));   // Удаляем нажатия на клетках поля

                if (e.which != 3 && this == e.target)   // Если нажата правая кнопка мыши
                {
                    var element = $(e.target);  // Получаем текущую клетку
                    var pos = $(".field_item", self.element).index(this);   // И её положение

                    if (self._mines.length == 0)    // Если это первый клик за игру
                    {
                        self._generateMines(pos);   // То на поле создаем мины

                        self._timer_id = setInterval(function ()    // А так же запускаем таймер отсчета секунд
                        {
                            $(".indicator_timer", self.element).indicator("inc");   // Запускаем увеличение на 1 каждую секунду
                        }, 1000);
                    }

                    self._clickToItemField(element);    // Нажимаем на клетку
                }

                /* Если вдруг победили */
                if ($(".field_item.mine_empty", self.element).length == 0 &&
                    $(".field_item.mine_question", self.element).length == 0 &&
                    $(".field_item.mine_flag", self.element).length == self._mines_count &&
                    self._timer_id != 0)
                {
                    //self._setItemFieldType($(".field_item.mine_empty", self.element), "mine_flag");
                    self._gameOver(true);   // Мы победили!
                }
            });
    },

    /* Конец игры!
        * win: истина, если победа, иначе поражение
     */
    _gameOver: function (win)
    {
        $(".field_item", this.element).off();   // Делаем клетки неактивными на клики
        $(".field", this.element).off();        // Отключаем биндинги на движения мыши
        clearInterval(this._timer_id);          // Останавливаем отсчет
        this._timer_id = 0;                     // Сбрасываем идентификатор

        var time = $(".indicator_timer", this.element).indicator("value");  // Получаем время

        if (win)    // Если победили
        {
            $(".button_smile", this.element).smile("cool"); // Делаем кнопку-смайлик довольной
            alert("Вы победили! Вы достигли победы за " + time + " " + this._getWordByNumber(time, ["секунд", "секунду", "секунды"]) + "!");    // И поздравляем победителя
        }
        else    // Иначе проиграли
        {
            $(".button_smile", this.element).smile("die");  // Все плохо
        }
    },

    /* Функция получения подходящего падежа для слова в зависимости от числа, с котором оно связано.
        * num: число
        * words: массив из 3-х элементов, где содержатся слова, которые согласуются со своими индексами
     */
    _getWordByNumber: function (num, words)
    {
        num = Math.abs(num);    // Откинем предрассудки и минус

        /* В зависимости от числа возвращаем слово в нужном падеже русского языка */
        if ((num % 100 >= 10 && num % 100 <= 20) || (num % 10 >= 5 && num % 10 <= 9) || (num % 10 == 0))
            return words[0];

        if (num % 10 == 1)
            return words[1];

        return words[2];
    }
});