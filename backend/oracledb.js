const oracle = require('oracledb');

oracle.outFormat = oracle.OUT_FORMAT_OBJECT;
oracle.queueMax = 500;
oracle.poolMax = 10;

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

exports.connect2 = async (user, password) => {
    let connection;

    try {
        connection = await oracle.getConnection({
            user,
            password,
            privilege: oracle.SYSDBA,
            connectString: 'localhost:1521/orcl'
        })
        return connection;
    } catch (error) {
        return 0;
    }
}

exports.connectUser = async (user, password) => {
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

exports.connect4 = async (user, password) => {
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