const oracle = require('oracledb');

oracle.outFormat = oracle.OUT_FORMAT_OBJECT;

exports.connect = async (user, password) => {
    let connection;

    try {
        connection = await oracle.getConnection({
            user,
            password,
            connectString: 'localhost:1521/orcl'
        })
        return connection;
    } catch (error) {
        return 0;
    }
}