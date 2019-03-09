/* This function updates a row! It needs the table in the form of the handlebar name
(e.g. 'Specials', the id of the row to be update, and the id of the form from the update page.
*/
function updateRow(table, id, formID) {
    $.ajax({
        url: '/manage' + table + '/' + id,
        type: 'PUT',
        data: $(formID).serialize(),
        success: function (result) {
            window.location.replace("./");
        }
    })
};