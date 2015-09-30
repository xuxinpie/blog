/**
 * created by Xinux on 9/17/15.
 */

var settings = require('../settings'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

module.exports = new Db(settings.db, new Server(settings.host, settings.port),
    {safe: true});
