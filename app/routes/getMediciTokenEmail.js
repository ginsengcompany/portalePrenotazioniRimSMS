var express = require('express');
var router = express.Router();
var postgresConnection = require('../../config/postgres');
var moment = require('moment');
var multiUser = require('../../config/configMultiUser');

var connectionPostgres = function () {
    return postgresConnection();
};

router.post('/',function (req, res, next) {

    var datiNotNotifica = req.body;

    var organizzazione = req.session.cod_org;

    for(var i=0;i<multiUser.data.length;i++) {

        if (multiUser.data[i].cod_org === organizzazione) {

            var queryPostEvento = "SELECT * from "+multiUser.data[i].tb_contatti+" A WHERE  NOT EXISTS (SELECT _id_medico FROM  "+multiUser.data[i].tb_notifiche+" B WHERE  A._id = B._id_medico AND B._id_evento='"+datiNotNotifica.idEvento+"') AND (token <> '' OR token <> null OR mail <> '' OR mail <> null)";

            var client = connectionPostgres();

            const query = client.query(queryPostEvento);

            query.on("row", function (row, result) {
                result.addRow(row);
            });

            query.on("end", function (result) {
                var myOjb = JSON.stringify(result.rows, null, "    ");
                var final = JSON.parse(myOjb);
                var jsonFinale = {
                    "data": final
                };
                return res.json(jsonFinale);
            });

        }
    }
});

module.exports = router;