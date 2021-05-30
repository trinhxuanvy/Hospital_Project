const oracledb = require('./oracledb');
const jwt = require('jsonwebtoken');
const setup = require('../routes/setup');
const { json } = require('body-parser');
const oracledb2 = require('oracledb');


module.exports = {


    allData: function (query) {
        return new Promise(async function (resolve, reject) {
            let connection;

            try {
                connection = await oracledb.connect('C##ADMIN', 'abcd1234');

                const result = await connection.execute(
                    `update C##ADMIN.NHANVIEN set Username = ':user'
                    where idnhanvien = :id
                    returning id, rowid into :ids, :rids`,
                    {
                        id:    1,
                        user: 'USER2121211',
                    }
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

    getDataTest: function (query, obj) {
        return new Promise(async function (resolve, reject) {
            let connection;

            try {
                connection = await oracledb.connect('C##ADMIN', 'abcd1234');
                const result = await connection.execute(query, obj);
                await connection.commit();
                resolve(1);
                
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

    checkDataTest: async function (query, obj) {
        try {
            let result = await this.getDataTest(query);
            return result;
        } catch (error) {
            return [];
        }
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

    getCheckData: async function (query) { 
        try {
            let result = await this.getData(query);
            return result;
        } catch (error) {
            return [];
        }
    },

    userLogin: async (user, password) => {
        let createUser = setup.setUserName(user);
        let connection = await oracledb.connect(createUser, password);

        return connection ? true : false;
    },

    allRole: [
        'MANAGERMENT_ROLE', 'PRECEPTIONIST_ROLE', 'DOCTOR_ROLE', 'PARAMEDIC_ROLE', 'FINANCE_ROLE',
        'PHARMACY_ROLE', 'ACCOUNTANCE_ROLE'
    ],

    allTable: ['NHANVIEN', 'BENHNHAN', 'THUOC', 'DICHVU',
        'PHONG', 'HOADON', 'HOSODICHVU', 'DONTHUOC', 'LICHTRUC',
        'HOSOBENHAN', 'DONVI', 'CHAMCONG', 'CHITIETDONTHUOC', 'CHITIETHOADON'],

    allTableCol: ['NHANVIENCOL', 'BENHNHANCOL', 'THUOCCOL', 'DICHVUCOL',
        'PHONGCOL', 'HOADONCOL', 'HOSODICHVUCOL', 'DONTHUOCCOL', 'LICHTRUCCOL',
        'HOSOBENHANCOL', 'DONVICOL', 'CHAMCONGCOL', 'CHITIETDONTHUOCCOL', 'CHITIETHOADONCOL'],

    allTableHasSign: ['NHÂN VIÊN', 'BỆNH NHÂN', 'THUỐC', 'DỊCH VỤ',
        'PHÒNG', 'HÓA ĐƠN', 'HỒ SƠ DỊCH VỤ', 'ĐƠN THUỐC', 'LỊCH TRỰC',
        'HỒ SƠ BỆNH ÁN', 'ĐƠN VỊ', 'CHẤM CÔNG', 'CHI TIẾT ĐƠN THUỐC', 'CHI TIẾT HÓA ĐƠN'],

    numColTable: [8, 5, 5, 2, 2, 5, 6, 3, 5, 7, 2, 4, 4, 4],

    DML: ['DELETE', 'INSERT', 'SELECT', 'UPDATE'],

    allColumn: [
        {
            col_1: 'mã nhân viên',
            col_2: 'tên nhân viên',
            col_3: 'đơn vị',
            col_4: 'vai trò',
            col_5: 'năm sinh',
            col_6: 'địa chỉ',
            col_7: 'số điện thoại',
            col_8: 'lương'
        },
        {
            col_1: 'mã bệnh nhân',
            col_2: 'tên bệnh nhân',
            col_3: 'năm sinh',
            col_4: 'địa chỉ',
            col_5: 'số điện thoại'
        },
        {
            col_1: 'mã thuốc',
            col_2: 'tên thuốc',
            col_3: 'đơn vị tính',
            col_4: 'chỉ định thuốc',
            col_5: 'đơn giá'
        },
        {
            col_1: 'mã dịch vụ',
            col_2: 'tên dịch vụ'
        },
        {
            col_1: 'mã phòng',
            col_2: 'tên phòng'
        },
        {
            col_1: 'mã hóa đơn',
            col_2: 'mã hồ sơ bệnh án',
            col_3: 'nhân viên lập',
            col_4: 'ngày lập',
            col_5: 'tổng tiền'
        },
        {
            col_1: 'mã chi tiết dịch vụ',
            col_2: 'mã dịch vụ',
            col_3: 'mã hồ sơ bệnh án',
            col_4: 'nhân viên thực hiện',
            col_5: 'ngày thực hiện',
            col_6: 'kết quả'
        },
        {
            col_1: 'mã đơn thuốc',
            col_2: 'mã hồ sơ bệnh án',
            col_3: 'liều dùng'
        },
        {
            col_1: 'mã lịch trực',
            col_2: 'mã phòng',
            col_3: 'mã nhân viên',
            col_4: 'ngày bắt đầu',
            col_5: 'ngày kết thúc'
        },
        {
            col_1: 'mã hồ sơ bệnh án',
            col_2: 'mã bệnh nhân',
            col_3: 'bác sĩ điều trị',
            col_4: 'nhân viên điều phối',
            col_5: 'tình trạng ban đầu',
            col_6: 'ngày khám',
            col_7: 'kết luận của bác sĩ'
        },
        {
            col_1: 'mã đơn vị',
            col_2: 'tên đơn vị'
        },
        {
            col_1: 'mã chấm công',
            col_2: 'mã nhân viên',
            col_3: 'ngày bắt đầu',
            col_4: 'ngày kết thúc'
        },
        {
            col_1: 'mã chi tiết đơn thuốc',
            col_2: 'mã đơn thuốc',
            col_3: 'mã thuốc',
            col_4: 'số lượng'
        },
        {
            col_1: 'mã chi tiết hóa đơn',
            col_2: 'mã chi tiết dịch vụ',
            col_3: 'mã hóa đơn',
            col_4: 'đơn giá'
        }
    ],

    checkData: async function (query) {
        try {
            let clear = await this.getData(query);
            return clear;
        } catch (error) {
            return false;
        }
    },

    compareJSON: function (a, b) {
        try {
            if (JSON.stringify(a) == JSON.stringify(b)) {
                return 1;
            }
            return 0;
        } catch (error) {
            return -1;
        }
    },

    createOBJ: function (num, arr) {
        let obj = [[arr], []];
        for (let i = 0; i < num; i++) {
            let item = {
                column: '',
                select: 0,
                grantS: 0,
                update: 0,
                grantU: 0
            };
            obj[1].push(item);
        }
        return obj;
    },

    getAllRoleCol: async function (user, table) {
        let pos = this.allTableCol.indexOf(table.toUpperCase());
        let data = await this.getData(`select column_name from DBA_COL_PRIVS where grantee = '${user.toUpperCase()}' and table_name = '${this.allTable[pos]}'`);
        let allCol = await this.getData(`select column_name from all_tab_columns where table_name = '${this.allTable[pos]}' and owner = 'C##ADMIN'`);
        let grantCol = await this.getData(`select column_name from DBA_COL_PRIVS where grantee = '${user.toUpperCase()}' and table_name = '${this.allTable[pos]}' and grantable = 'YES'`)
        let objData = [], objAllCol = [], objGrant = [];
        let arr = this.createOBJ(allCol.length, this.allColumn[pos]);
        num = allCol.length;
        for (let i = 0; i < allCol.length; i++) {
            let temp = JSON.stringify(allCol[i]);
            objAllCol.push(temp);
        }
        for (let i = 0; i < data.length; i++) {
            let temp = JSON.stringify(data[i]);
            objData.push(temp);
        }
        for (let i = 0; i < grantCol.length; i++) {
            let temp = JSON.stringify(grantCol[i]);
            objGrant.push(temp);
        }
        for (let i = 0; i < objAllCol.length; i++) {
            pos = objAllCol.indexOf(objData[i]);
            arr[1][i]['column'] = allCol[i]['COLUMN_NAME'];
            if (pos > -1) {
                arr[1][pos]['update'] = 1;
            }
            pos = objAllCol.indexOf(objGrant[i]);
            if (pos > -1) {
                arr[1][pos]['grantU'] = 1;
            }
        }
        return arr;
    },

    setUpdateRolCol: async function (user, table, arrDML) {
        let pos = this.allTableCol.indexOf(table.toUpperCase());
        let decode;
        let saveData = await this.getData(`select privilege, grantable from sys.DBA_TAB_PRIVS
        where grantee = '${user}' and table_name = '${this.allTable[pos]}'`);
        if (pos > -1) {
            let count = 0;
            let data = await this.getData(`select column_name, privilege from DBA_COL_PRIVS where grantee = '${user.toUpperCase()}' and table_name = '${this.allTable[pos]}'`);
            decode = await this.checkData(`revoke update on C##ADMIN.${this.allTable[pos]} from ${user}`);
            for (let i = 0; i < arrDML.length; i++) {
                if (arrDML[i]['grant']) {
                    decode = await this.checkData(`grant update (${arrDML[i]['col']}) on C##ADMIN.${this.allTable[pos]} to ${user} with grant option`);
                }
                else {
                    decode = await this.checkData(`grant update (${arrDML[i]['col']}) on C##ADMIN.${this.allTable[pos]} to ${user}`);
                }
            }
        }
        
        for (let i = 0; i < saveData.length; i++) {
            if (saveData[i]['GRANTABLE'] == 'YES') {
                decode = this.checkData(`grant ${saveData[i]['PRIVILEGE']} on C##ADMIN.${this.allTable[pos]} to ${user} with grant option`);
            }
            else {
                decode = this.checkData(`grant ${saveData[i]['PRIVILEGE']} on C##ADMIN.${this.allTable[pos]} to ${user}`);
            }
        }
    },

    createOBJTable: function () {
        let arr = [];
        for (let i = 0; i < 4; i++) {
            let obj = {
                PRIVILEGE: 0,
                GRANTABLE: 0
            };
            arr.push(obj);
        }
        return arr;
    },

    getAllRoleTable: async function (user, table) {
        let data = this.createOBJTable();
        if (this.allTable.indexOf(table) > -1) {
            let query = `select privilege, grantable from sys.DBA_TAB_PRIVS
             where grantee = '${user}' and table_name = '${table}'`;
            let decode = await this.getData(query);
            for (let i = 0; i < decode.length; i++) {
                let priv = decode[i]['PRIVILEGE'];
                let grant = decode[i]['GRANTABLE'];
                let pos = this.DML.indexOf(priv);
                if (pos > -1) {
                    data[pos]['PRIVILEGE'] = 1;
                    if (grant == 'YES') {
                        data[pos]['GRANTABLE'] = 1;
                    }
                }
            }
            return data;
        }
        else return [];
    },

    getAllRole: async function (user) {
        let result = this.createOBJRole();
        let data = await this.getData(`select GRANTED_ROLE, ADMIN_OPTION from dba_role_privs where grantee = '${user}'`);
        for (let i = 0; i < data.length; i++) {
            let pos = this.allRole.indexOf(data[i]['GRANTED_ROLE']);
            if (pos > -1) {
                result[pos]['GRANTED_ROLE'] = 1;
                if (data[i]['ADMIN_OPTION'] == 'YES') {
                    result[pos]['ADMIN_OPTION'] = 1;
                }
            }
        }
        return result;
    },

    updateData: async function (query) {
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

    setUpdateRoleTable: async function (user, table, arr) {
        let saveData = await this.getData(`select column_name, privilege, grantable from DBA_COL_PRIVS where grantee = '${user}' and table_name = '${table}'`);
        let decode = this.checkData(`revoke insert on C##ADMIN.${table} from ${user}`);
        decode = this.checkData(`revoke delete on C##ADMIN.${table} from ${user}`);
        decode = this.checkData(`revoke update on C##ADMIN.${table} from ${user}`);
        decode = this.checkData(`revoke select on C##ADMIN.${table} from ${user}`);

        for (let i = 0; i < arr.length; i++) {
            if (arr[i]['grant']) {
                decode = this.checkData(`grant ${arr[i]['dml']} on C##ADMIN.${table} to ${user} with grant option`)
            }
            else {
                decode = this.checkData(`grant ${arr[i]['dml']} on C##ADMIN.${table} to ${user}`)
            }
        }

        for (let i = 0; i < saveData.length; i++) {
            if (saveData[i]['PRIVILEGE'] != 'SELECT' && saveData[i]['PRIVILEGE'] != 'UPDATE') {
                if (saveData[i]['GRANTABLE'] == 'YES') {
                    decode = await this.checkData(`grant ${saveData[i]['PRIVILEGE']} (${saveData[i]['COLUMN_NAME']}) on C##ADMIN.${table} to ${user} with grant option`);
                }
                else {
                    decode = await this.checkData(`grant ${saveData[i]['PRIVILEGE']} (${saveData[i]['COLUMN_NAME']}) on C##ADMIN.${table} to ${user}`);
                }
            }
        }
    },

    createOBJRole: function () {
        let arr = [];
        for (let i = 0; i < 7; i++) {
            let obj = {
                GRANTED_ROLE: 0,
                ADMIN_OPTION: 0
            };
            arr.push(obj);
        }
        return arr;
    },

    setUpdateRole: async function (user, arr) {
        let decode;
        for (let i of this.allRole) {
            decode = await this.checkData(`revoke ${i} from ${user}`);
        }
        for (let i = 0; i < arr.length; i++) {
            decode = await this.checkData(`grant ${arr[i]} to ${user}`);
            let check = arr[i].slice(0, 1);
            if (check != 'g') {
                decode = await this.checkData(`grant ${arr[i]} to ${user}`);
            }
            else {
                decode = await this.checkData(`grant ${arr[i].slice(1)} to ${user} with admin option`);
            }
        }
    },


};
