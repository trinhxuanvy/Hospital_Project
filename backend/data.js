const oracledb = require('./oracledb');
const jwt = require('jsonwebtoken');



module.exports = {

    
    getUser : function (user, password, query) {
        return new Promise(async function (resolve, reject) {
            let connection;

            try {
                connection = await oracledb.connect(user, password);

                const result = await connection.execute(
                    query
                );
                resolve(result.rows);
            } catch (error) {
                reject(error);
            } finally {
                if (connection) {
                    try {
                        await connection.release();
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        });
    },

    // Hàm get role user
    getRoleUser : function (query) {
        return new Promise(async function (resolve, reject) {
            let connection;

            try {
                connection = await oracledb.connect('system', 'Vychuoi123');

                const result = await connection.execute(
                    query
                );
                
                let data = result.rows;
                let token = await jwt.sign({data}, 'Vychuoi123', { algorithm: 'HS256', expiresIn: '3h'})
                resolve(token);

            } catch (error) {
                reject(error);
            } finally {
                if (connection) {
                    try {
                        await connection.release();
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        });
    },

    getAllofUser : async function (user, password, query) {
        let result = await getUser(user, password, query);
        let token = await jwt.sign({result}, 'vychuoi123', {algorithm: 'HS256', expiresIn: '3h'});
        return token;
    },

    userLogin : async (user, password) => {
        let connection = await oracledb.connect(user, password);

        return connection ? true : false;
    },

};
