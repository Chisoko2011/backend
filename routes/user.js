
var con = require('../db/connection');
const bcrypt = require('bcrypt');
const saltRounds = 10;
module.exports = function (app) {

    app.get('/login', function (req, res) {
        var un = req.query.userfirstname;
        var pw = req.query.userpassword;
        con.query("SELECT *  FROM users WHERE email = '" + un + "';",  async function (err, result, fields) {
            if (err) throw err;
            if (result.length > 0) {
                const user = result[0];
                const comparison = await bcrypt.compare(pw, user.password);
                if (comparison) {
                    con.query("UPDATE users SET logged_in = 1 WHERE email = '" + un + "';", function (err, result, fields) {
                        if (err) throw err;
                    });
                    if (user.role_id === '1') {
                        res.json({ login: true, role: 'radiographer', user_id: user.id });
                    } else {
                        const hca_status_insert_query = "INSERT INTO hca_status (user_id, name, status) values ('" + user.id + "','" + user.firstname + "',1);";
                        con.query(hca_status_insert_query, function (err, result, fields) {
                            if (err) throw err;
                            res.json({ login: true, role: 'hca', user_id: user.id });
                        });
                    }
                }
                return;
            }
                res.json({ login: false });

        });

    });



    app.get('/logout', async function (req, res) {

        // catch the variables 
        var id = req.query.id;
        con.query("UPDATE users SET logged_in = 0 WHERE id = '" + id + "';", function (err, result, fields) {
            if (err) throw err;
        });
        const hca_status_delete_query = "DELETE FROM hca_status WHERE user_id='" + id + "';";
        con.query(hca_status_delete_query, function (err, result, fields) {
            if (err) throw err;
            res.json({ logout: true });
        });

    });



    app.get('/register', async function (req, res) {
        var firstname = req.query.firstName;
        var lastname = req.query.lastName;
        var email = req.query.email;
        var contact = req.query.contact_number;
        var role = req.query.role;
        var password = req.query.password;
        const encryptedPassword = await bcrypt.hash(password, saltRounds)
        con.query("insert into users (role_id, firstname, lastname, contactnumber, email, password) values ('" +
            role + "','" + firstname + "','" + lastname + "','" + contact + "','" + email + "','" + encryptedPassword + "');", function (err, result, fields) {
                if (err) throw err;
                res.json({ register: true });
            });
    });
}