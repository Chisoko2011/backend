
var con = require('../db/connection');
module.exports = function (app) {

    app.get('/ordersList', function (req, res) {

            const query = `SELECT o.patient_mrn, o.firstname, o.lastname, w.name AS ward_location, o.ordered_at, o.hca_assigned, e.name AS exam, a.name AS order_status, r.text AS reason, o.started_at, o.arrived_at 
      FROM orders_list o 
      JOIN wards w ON o.ward_location_id = w.id
      JOIN exams e ON o.exam_id = e.id
      JOIN order_status a ON o.order_status_id = a.id
      JOIN reasons_for_delay r ON o.reason_id = r.id`
            con.query(query, function (err, result, fields) {
                if (err) throw err;

                if (result.length > 0) {
                    res.send(result);
                } else {
                    res.send("something went wrong");
                }
            });

    });


    app.get('/ordersListHca', function (req, res) {

        const hca_id = req.query.hca_id;
            const query = `SELECT o.patient_mrn, o.firstname, o.lastname, w.name AS ward_location, o.ordered_at, o.hca_assigned, e.name AS exam, a.name AS order_status, r.text AS reason, o.started_at, o.arrived_at 
      FROM orders_list o
      JOIN wards w ON o.ward_location_id = w.id
      JOIN exams e ON o.exam_id = e.id
      JOIN order_status a ON o.order_status_id = a.id
      JOIN reasons_for_delay r ON o.reason_id = r.id
      WHERE o.hca_assigned = ${hca_id}`
            con.query(query, function (err, result, fields) {
                if (err) throw err;

                if (result.length > 0) {
                    res.send(result);
                } else {
                    res.send("something went wrong");
                }
            });

    });

    app.get('/order_mark_arrived', function (req, res) {
        var mrn = req.query.mrn;

            con.query(`UPDATE orders_list SET order_status_id = 3, arrived_at = '${new Date()}' WHERE patient_mrn = '${mrn}';`, function (err, result, fields) {
                if (err) throw err;
                res.send({ udated_list: true });
                if (err) throw err;
            });

    });

    app.get('/submit_reason', function (req, res) {
        var mrn = req.query.mrn;
        var reason_id = req.query.reason_id;
        var hca_id = req.query.hca_id;

            con.query(`UPDATE orders_list SET reason_id = ${reason_id} WHERE patient_mrn = '${mrn}';`, function (err, result, fields) {
                con.query(`UPDATE hca_status SET STATUS = 1, patient_assigned = NULL WHERE user_id = ${hca_id};`, function (err, result, fields) {
                    if (err) throw err;
                    res.send({ udated_list: true });
                });
                if (err) throw err;
            });

    });



    app.get('/add_order', function (req, res) {

        // catch the variables 
        var mrn = req.query.mrn;
        var firstname = req.query.firstName;
        var lastname = req.query.lastName;
        var ward = req.query.ward;
        var exam = req.query.exam;
            con.query("insert into orders_list (patient_mrn, firstname, lastname, ward_location_id , exam_id, ordered_at, order_status_id) values ('" +
                mrn + "','" + firstname + "','" + lastname + "','" + ward + "','" + exam + "','" + new Date() + "',1);", function (err, result, fields) {
                    if (err) throw err;
                });
            res.json({ register: true });
    });

}