export default callback => {
    let messageDB_OK = '::: Database set with succes !!! :::';
    // connect to a database if needed, then pass it to `callback`:
    callback(messageDB_OK);
}
