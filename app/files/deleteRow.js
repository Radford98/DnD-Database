function deleteRow(table, id) {
    var XHR = new XMLHttpRequest();
    var url = '/manage' + table + '/' + id;

    XHR.open('DELETE', url, true);
    XHR.addEventListener('load', () => {
        window.location.reload(true);
    })
    XHR.send();

}