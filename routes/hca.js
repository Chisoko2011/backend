
var con = require('../db/connection');
module.exports = function (app) {

    app.get('/hca_loggedin', function (req, res) {
        con.query("SELECT *  FROM users WHERE role_id = '2' AND logged_in = 1;", function (err, result, fields) {
            if (err) throw err;

            if (result.length > 0) {
                res.send(result);
            } else {
                res.send("something went wrong");
            }
        });

    });


    app.get('/hca-assign', function (req, res) {
        var hca_id = req.query.hca_id;
        var mrn = req.query.mrn;
        con.query(`UPDATE orders_list SET hca_assigned = ${hca_id}, order_status_id = 2, started_at = '${new Date()}' WHERE patient_mrn = '${mrn}';`, function (err, result, fields) {
            con.query(`UPDATE hca_status SET STATUS = 0, patient_assigned = ${mrn} WHERE user_id = ${hca_id};`, function (err, result, fields) {
                if (err) throw err;
                res.send({ udated_list: true });
            });
            if (err) throw err;
        });

    });




    app.get('/hca_available', function (req, res) {
        const query = `SELECT * FROM hca_status WHERE STATUS = 1;`;
        con.query(query, function (err, result, fields) {
            if (err) throw err;

            if (result.length > 0) {
                res.send(result);
            } else {
                res.send("something went wrong");
            }
        });

    });

}