/* This function takes table being edited (like 'Specials') and the id of the row to be deleted.
It makes an ajax call to delete the table and reload the page on success.   */
function deleteRow(table, id) {
    var XHR = new XMLHttpRequest();
    var url = '/manage' + table + '/' + id;

    XHR.open('DELETE', url, true);
    XHR.addEventListener('load', () => {
        window.location.reload(true);
    });
    XHR.send();

};