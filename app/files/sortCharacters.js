/* When the sort-select (#sort) changes, it hides all the options (in the case the user changes between them),
then constructs a selector using #sort's value and shows only that one.
*/
$(document).ready(() => {
    $('#sort').change(function (event) {
        $('.sortSelect').hide();
        $('#sort' + $(this).val()).show();
    });

    $('#sortPlayer').change(function (event) {
        if ($(this).val() != '') {
            window.location.href = '/manageCharacters/player/' + $(this).val();
        }
    });

    $('#sortRace').change(function (event) {
        if ($(this).val() != '') {
            window.location.href = '/manageCharacters/race/' + $(this).val();
        }
    });

    $('#sortClass').change(function (event) {
        if ($(this).val() != '') {
            window.location.href = '/manageCharacters/class/' + $(this).val();
        }
    });

    $('#displayAll').click(() => {
        window.location.href = '/manageCharacters';
    });
});