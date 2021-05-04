const oracledb = require('./oracledb');
const jwt = require('jsonwebtoken');



module.exports = {


    getUser: function (query) {
        return new Promise(async function (resolve, reject) {
            let connection;

            try {
                connection = await oracledb.connect('sys', 'Vychuoi123');

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
    getRoleUser: function (query) {
        return new Promise(async function (resolve, reject) {
            let connection;

            try {
                connection = await oracledb.connect('system', 'Vychuoi123');

                const result = await connection.execute(
                    query
                );

                let data = result.rows;
                let newData = jwt.sign({ data }, 'Vychuoi123', { algorithm: 'HS256', expiresIn: '3h' });
                resolve(newData);

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

    getData: function (query) {
        return new Promise(async function (resolve, reject) {
            let connection;

            try {
                connection = await oracledb.connect2('sys', 'Vychuoi123');

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

    getAllofUser: async function (query) {
        let obj = [];
        /*let result = await this.getData(`
            select vi.grantee from sys.user_tab_privs vi
            where vi.grantee like 'C##MYUSERS%' and instr(vi.table_name, vi.grantee) > 0
        `);
        for(let item of result) {
            let data = await this.getData(`
                select distinct us.* from ${item['GRANTEE']}_VIEW us, user_tab_privs vi where 
                instr(vi.table_name, us.username) > 0
            `);
            console.log(data);
        }*/
        let result = await this.getData(`
            select vi.grantee from sys.user_tab_privs vi where vi.grantee like 'C##MYUSERS%'
        `);

        return result;
    },

    userLogin: async (user, password) => {
        let connection = await oracledb.connect(user, password);

        return connection ? true : false;
    },

    allTable: ['NHANVIEN', 'BENHNHAN', 'THUOC', 'DICHVU',
        'PHONG', 'HOAHON', 'HOSODICHVU', 'DONTHUOC', 'LICHTRUC',
        'HOSOBENHAN', 'DONVI', 'CHAMCONG', 'CHITIETDONTHUOC', 'CHITIETHOADON'],

    DML: ['delete', 'insert', 'select', 'update'],

    getAllRole: async function (user) {
        let arr = [];
        for (let item of this.allTable) {
            let query = `select distinct rtp.table_name, rtp.privilege
            from sys.DBA_ROLE_PRIVS drp,
                sys.ROLE_TAB_PRIVS rtp
            where drp.grantee like '${user}' and drp.granted_role = rtp.role and table_name = '${item}'
            order by rtp.table_name, rtp.privilege asc`;
            let data = await this.getData(query);
            {
                arr.push(data);
                
            }
        }
        console.log(arr);
        return arr;
    },
};
