const oracledb = require('./oracledb');
const jwt = require('jsonwebtoken');
const setup = require('../routes/setup');
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
        'ROLE_QUANLYTAINGUYENNHANSU', 'QUANLYTAIVU_ROLE', 'QUANLYCHUYENMON_ROLE', 'KETOAN_ROLE', 'BANTHUOC_ROLE',
        'BACSI_ROLE', 'TAIVU_ROLE', 'TIEPTAN_ROLE'
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
            col_2: 'username',
            col_3: 'tên nhân viên',
            col_4: 'đơn vị',
            col_5: 'vai trò',
            col_6: 'năm sinh',
            col_7: 'địa chỉ',
            col_8: 'số điện thoại',
            col_9: 'lương'
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
            col_3: 'liều dùng',
            col_4: 'ngày tạo'
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

    setData: function (query, obj) {
        return new Promise(async function (resolve, reject) {
            let connection;

            try {
                connection = await oracledb.connect2('sys', 'Vychuoi123');
                console.log('adsdsasdsdsdsssssssssssssssssssssssssssssssssssss/')
                const result = await connection.execute(query, obj);
                console.log('â;asssssssssssssssssssssssssssss')
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

    changePass: function (user, password, newPass) {
        return new Promise(async function (resolve, reject) {
            let connection;

            try {
                connection = await oracledb.connect4(user, password);

                let promise = await connection.changePassword(user, password, newPass);
                //await connection.close();
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

    setDataDBA: async function (query, obj) {
        try {
            let decode = await this.setData(query);
            return decode = 1 ? 1 : 0;
        } catch (error) {
            return 0;
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
                allowU: 1,
                allowS: 1,
                allowgU: 1,
                allowgS: 1,
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
        //let data = this.createOBJ(allCol.length, this.allColumn[pos]);
        let pos = this.allTable.indexOf(table.toUpperCase());
        let hasRole =  await this.getData(`select granted_role from dba_role_privs where grantee = upper('${user}')`);
        let allCol = await this.getData(`select column_name from all_tab_columns where table_name = '${this.allTable[pos]}' and owner = 'C##ADMIN'`);
        let data = this.createOBJ(allCol.length, this.allColumn[pos]);
        let flag = 0;
        let temp = [];
        for (let i = 0; i < hasRole.length; i++)
        {
            let hasColRole = await this.getCheckData(`select * from role_tab_privs where role = upper('${hasRole[i]['GRANTED_ROLE']}') and table_name = upper('${this.allTable[pos]}')`);
            if (hasColRole.length > 0) {
                temp = hasColRole;
                flag = 1;
                break;
            }
        }

        if (flag == 1) {
            if (hasRole.length > 0) {
                for (let i = 0; i < allCol.length; i++) {
                    data[1][i]['column'] = allCol[i]['COLUMN_NAME'];
                    for (let j = 0; j < temp.length; j++) {   
                        let check = 0;
                        // let decode = await this.getCheckData(`select GRANTED_ROLE, ADMIN_OPTION from dba_role_privs where grantee = '${user}'`);
                        // for (let l = 0; l < decode.length; l++) {
                        //     if (decode[l]['GRANTED_ROLE'] == temp[j]['ROLE']) {
                        //         if (decode[l]['ADMIN_OPTION'] == 'YES') {
                        //             check = 1;
                        //         }
                        //     }
                        // }

                        if (temp[j]['COLUMN_NAME'] == allCol[i]['COLUMN_NAME']) {
                            if (temp[j]['PRIVILEGE'] == 'UPDATE') {
                                data[1][i]['update'] = 1;
                                data[1][i]['allowU'] = 0;
                            }
                            else if (temp[j]['PRIVILEGE'] == 'SELECT') {
                                data[1][i]['select'] = 1;
                                data[1][i]['allowS'] = 0;
                            }

                            if (temp[j]['GRANTABLE'] == 'YES') {
                                data[1][i]['grantU'] = 1;
                            }
                            else if (temp[j]['GRANTABLE'] == 'YES') {
                                data[1][i]['grantS'] = 1;
                            }

                            // if (check == 1) {
                            //     data[1][i]['allowgS'] = 0;
                            //     data[1][i]['allowgU'] = 0;
                            //     data[1][i]['grantU'] = 1;
                            //     data[1][i]['grantS'] = 1;
                            // }
                        }
                        else if (temp[j]['COLUMN_NAME'] == null) {
                            if (temp[j]['PRIVILEGE'] == 'UPDATE') {
                                data[1][i]['update'] = 1;
                                data[1][i]['allowU'] = 0;
                            }
                            else if (temp[j]['PRIVILEGE'] == 'SELECT') {
                                data[1][i]['select'] = 1;
                                data[1][i]['allowS'] = 0;
                            }

                            if (temp[j]['GRANTABLE'] == 'YES') {
                                data[1][i]['grantU'] = 1;
                            }
                            else if (temp[j]['GRANTABLE'] == 'YES') {
                                data[1][i]['grantS'] = 1;
                            }

                            // if (check == 1) {
                            //     data[1][i]['allowgS'] = 0;
                            //     data[1][i]['allowgU'] = 0;
                            //     data[1][i]['grantU'] = 1;
                            //     data[1][i]['grantS'] = 1;
                            // }
                        }
                    }
                }

                
            }
        }

        let isData = await this.getCheckData(`select column_name, privilege, grantable from dba_col_privs where
        grantee = '${user}' and table_name = '${this.allTable[pos]}'`);     
        
        for (let i = 0; i < allCol.length; i++) {
            data[1][i]['column'] = allCol[i]['COLUMN_NAME'];
            for (let j = 0; j < isData.length; j++) {     
                if (isData[j]['COLUMN_NAME'] == allCol[i]['COLUMN_NAME']) {
                    let res = '';
                    if (isData[j]['PRIVILEGE'] == 'UPDATE') {
                        data[1][i]['update'] = 1;
                    }
                    else if (isData[j]['PRIVILEGE'] == 'SELECT') {
                        data[1][i]['select'] = 1;
                    }

                    if (isData[j]['GRANTABLE'] == 'YES') {
                        data[1][i]['grantU'] = 1;
                    }
                    else if (isData[j]['GRANTABLE'] == 'YES') {
                        data[1][i]['grantS'] = 1;
                    }
                }
            }
        }

        query = `select privilege, grantable from sys.DBA_TAB_PRIVS
            where grantee = '${user}' and table_name = '${this.allTable[pos]}'`;
        isData = await this.getCheckData(query);

        for (let i = 0; i < isData.length; i++) {
            if (isData[i]['PRIVILEGE'] == 'SELECT') {
                if (isData[i]['GRANTABLE'] == 'NO') {
                    for (let j = 0; j < allCol.length; j++) {
                        data[1][j]['select'] = 1;
                    }
                }
                else {
                    for (let j = 0; j < allCol.length; j++) {
                        data[1][j]['select'] = 1;
                        data[1][j]['grantS'] = 1;
                    }
                }
            }
            else if (isData[i]['PRIVILEGE'] == 'UPDATE') {
                if (isData[i]['GRANTABLE'] == 'NO') {
                    for (let j = 0; j < allCol.length; j++) {
                        data[1][j]['update'] = 1;
                    }
                }
                else {
                    for (let j = 0; j < allCol.length; j++) {
                        data[1][j]['update'] = 1;
                        data[1][j]['grantU'] = 1;
                    }
                }
            }
        }
        console.log(data)
        return data;
    },

    setUpdateRolCol: async function (user, table, arrDML) {
        let pos = this.allTable.indexOf(table.toUpperCase());
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
                ALLOW: 1,
                ALLOWG: 1,
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
            let hasRole =  await this.getData(`select granted_role from dba_role_privs where grantee = upper('${user}')`);
            let flag = 0;
            let temp = [];
            for (let i = 0; i < hasRole.length; i++)
            {
                let hasColRole = await this.getData(`select * from role_tab_privs where role = upper('${hasRole[i]['GRANTED_ROLE']}') and table_name = upper('${table}')`)
                if (hasColRole.length > 0) {
                    temp = hasColRole;
                    flag = 1;
                    break;
                }
            }
            
            let query;
            if (flag == 1) {
                if (hasRole.length > 0) {
                    for (let k = 0; k < hasRole.length; k++) {
                        // let check = 0;
                        // let decode = await this.getCheckData(`select GRANTED_ROLE, ADMIN_OPTION from dba_role_privs where grantee = '${user}'`);
                        // for (let i = 0; i < decode.length; i++) {
                        //     if (decode[i]['GRANTED_ROLE'] == hasRole[k]['GRANTED_ROLE']) {
                        //         if (decode[i]['ADMIN_OPTION'] == 'YES') {
                        //             check = 1;
                        //         }
                        //     }
                        // }

                        query = `select privilege, grantable from sys.role_tab_privs
                        where role = upper('${hasRole[k]['GRANTED_ROLE']}') and table_name = upper('${table}')`;
                        let decode = await this.getCheckData(query);
                        for (let i = 0; i < decode.length; i++) {
                            let priv = decode[i]['PRIVILEGE'];
                            let grant = decode[i]['GRANTABLE'];
                            let pos = this.DML.indexOf(priv);
                            if (pos > -1) {
                                data[pos]['PRIVILEGE'] = 1;
                                data[pos]['ALLOW'] = 0;
                                if (grant == 'YES') {
                                    data[pos]['GRANTABLE'] = 1;
                                }
                                // if (check == 1) {
                                //     data[pos]['GRANTABLE'] = 1;
                                //     data[pos]['ALLOWG'] = 0;
                                // }
                            }
                        }

                        

                    } 
                }
            }

            query = `select privilege, grantable from sys.DBA_TAB_PRIVS
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

            let isData = await this.getCheckData(`select column_name, privilege, grantable from dba_col_privs where
            grantee = '${user}' and table_name = '${table}'`);
            if (isData.length > 0) {
                for (let i = 0; i < isData.length; i++) {
                    if (isData[i]['PRIVILEGE'] == 'UPDATE') {
                        data[3]['PRIVILEGE'] = 1;
                    }
                    if (isData[i]['GRANTABLE'] == 'YES') {
                        data[3]['GRANTABLE'] = 1;
                    }
                }
            }

        
            return data;
        }
        else return [];
    },

    getAllRole: async function (user) {
        let result = await this.createOBJRole();
        let data = await this.getData(`select GRANTED_ROLE, ADMIN_OPTION from dba_role_privs where grantee = '${user}'`);
        for (let i = 0; i < data.length; i++) {
            //let pos = this.allRole.indexOf(data[i]['GRANTED_ROLE']);
            console.log('đasa')
            for (let j = 0; j < result[0].length; j++) {
                console.log(data[i]['GRANTED_ROLE'].slice(16) ,result[0][j]['ROLE'])
                if (data[i]['GRANTED_ROLE'].slice(16) == result[0][j]['ROLE']) {
                    result[1][j]['GRANTED_ROLE'] = 1;
                    if (data[i]['ADMIN_OPTION'] == 'YES') {
                        result[1][j ]['ADMIN_OPTION'] = 1;
                    }
                    break;
                }
            }
        }
        console.log(result);
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
                decode = this.checkData(`grant ${arr[i]['dml']} on C##ADMIN.${table} to ${user}`);
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

    createOBJRole: async function () {
        let decode = await this.getCheckData(`select distinct(role) from dba_roles where role like upper('role_qlbenhvien_%')`)
        let arr = [[], []];
        console.log(decode)
        for (let i = 0; i < decode.length; i++) {
            let obj = {
                GRANTED_ROLE: 0,
                ADMIN_OPTION: 0
            };
            arr[1].push(obj);
            obj = {
                ROLE: decode[i]['ROLE'].slice(16),
            }
            arr[0].push(obj);
        }
        return arr;
    },

    setUpdateRole: async function (user, arr) {
        let allR = await this.getCheckData(`select distinct(role) from dba_roles where role like upper('role_qlbenhvien_%')`)
        let decode;
        console.log(allR);
        for (let i = 0; i < allR.length; i++) {
            decode = await this.checkData(`revoke ${allR[i]['ROLE']} from ${user}`);
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

    // Dành cho user
    getDataOfUser: function (user, password, query) {
        return new Promise(async function (resolve, reject) {
            let connection;

            try {
                connection = await oracledb.connectUser(user, password);

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

    getCheckDataOfUser: async function (user, password, query) {
        try {
            let decoded = await this.getDataOfUser(user, password, query);

            return decoded;
        } catch (error) {
            return [];
        }
    },

    setDataOfUser: function (user, password, query, obj) {
        return new Promise(async function (resolve, reject) {
            let connection;

            try {
                connection = await oracledb.connectUser(user, password);
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

    setCheckDataOfUser: async function (user, password, query, obj) {
        try {
            let decoded = await this.setDataOfUser(user, password, query, obj);
            return decoded == 1 ? 1 : 0;
        } catch (error) {
            return 0;
        }
    },

    // Dành cho role
    getAllRoleTableRole: async function (role, table) {
        let data = this.createOBJTable();
        if (this.allTable.indexOf(table) > -1) {
            // let hasRole =  await this.getData(`select granted_role from dba_role_privs where grantee = upper('${user}')`);
            // let flag = 0;
            // let temp = [];
            // for (let i = 0; i < hasRole.length; i++)
            // {
            //     let hasColRole = await this.getData(`select * from role_tab_privs where role = upper('${hasRole[i]['GRANTED_ROLE']}') and table_name = upper('${table}')`)
            //     if (hasColRole.length > 0) {
            //         temp = hasColRole;
            //         flag = 1;
            //         break;
            //     }
            // }
            
            // let query;
            // if (flag == 1) {
            //     if (hasRole.length > 0) {
            //         for (let k = 0; k < hasRole.length; k++) {
                        // let check = 0;
                        // let decode = await this.getCheckData(`select GRANTED_ROLE, ADMIN_OPTION from dba_role_privs where grantee = '${user}'`);
                        // for (let i = 0; i < decode.length; i++) {
                        //     if (decode[i]['GRANTED_ROLE'] == hasRole[k]['GRANTED_ROLE']) {
                        //         if (decode[i]['ADMIN_OPTION'] == 'YES') {
                        //             check = 1;
                        //         }
                        //     }
                        // }
                        let allR = await this.getCheckData(`select distinct(role) from dba_roles where role like upper('role_qlbenhvien_%')`)
                        console.log(allR)
                        for (let m = 0; m < allR.length; m++) {
                            if ('ROLE_QLBENHVIEN_' + role.toUpperCase() == allR[m]['ROLE']) {
                                query = `select column_name, privilege, grantable from sys.role_tab_privs
                                where role = upper('${'ROLE_QLBENHVIEN_' + role.toUpperCase()}') and table_name = upper('${table}')`;
                                let decode = await this.getCheckData(query);
                                for (let i = 0; i < decode.length; i++) {
                                    if (decode[i]['COLUMN_NAME'] == null)
                                    {
                                        let priv = decode[i]['PRIVILEGE'];
                                        let grant = decode[i]['GRANTABLE'];
                                        let pos = this.DML.indexOf(priv);
                                        if (pos > -1) {
                                            data[pos]['PRIVILEGE'] = 1;
                                            data[pos]['ALLOW'] = 0;
                                            if (grant == 'YES') {
                                                data[pos]['GRANTABLE'] = 1;
                                            }
                                            // if (check == 1) {
                                            //     data[pos]['GRANTABLE'] = 1;
                                            //     data[pos]['ALLOWG'] = 0;
                                            // }
                                        }
                                    }  
                                }
                                break;
                            }
                            
                        }

                            


            //         } 
            //     }
            // }

            // query = `select privilege, grantable from sys.DBA_TAB_PRIVS
            // where grantee = '${user}' and table_name = '${table}'`;

            // let decode = await this.getData(query);
            // for (let i = 0; i < decode.length; i++) {
            //     let priv = decode[i]['PRIVILEGE'];
            //     let grant = decode[i]['GRANTABLE'];
            //     let pos = this.DML.indexOf(priv);
            //     if (pos > -1) {
            //         data[pos]['PRIVILEGE'] = 1;
            //         if (grant == 'YES') {
            //             data[pos]['GRANTABLE'] = 1;
            //         }
            //     }
            // }

            // let isData = await this.getCheckData(`select column_name, privilege, grantable from dba_col_privs where
            // grantee = '${user}' and table_name = '${table}'`);
            // if (isData.length > 0) {
            //     for (let i = 0; i < isData.length; i++) {
            //         if (isData[i]['PRIVILEGE'] == 'UPDATE') {
            //             data[3]['PRIVILEGE'] = 1;
            //         }
            //         if (isData[i]['GRANTABLE'] == 'YES') {
            //             data[3]['GRANTABLE'] = 1;
            //         }
            //     }
            // }

        
            return data;
        }
        else return [];
    },

    setAllRoleTableRole: async function (role, table, arr) {
        let saveData = await this.getData(`select column_name, privilege from role_tab_privs where role = '${role.toUpperCase() + '_ROLE'}' and table_name = '${table.toUpperCase()}'`);
        let decode = this.checkData(`revoke insert on C##ADMIN.${table} from ${'role_qlbenhvien_' + role}`);
        decode = this.checkData(`revoke delete on C##ADMIN.${table} from ${'role_qlbenhvien_' + role}`);
        decode = this.checkData(`revoke update on C##ADMIN.${table} from ${'role_qlbenhvien_' + role}`);
        decode = this.checkData(`revoke select on C##ADMIN.${table} from ${'role_qlbenhvien_' + role}`);
        for (let i = 0; i < arr.length; i++) {
            if (arr[i]['grant']) {
                decode = this.checkData(`grant ${arr[i]['dml']} on C##ADMIN.${table} to ${'role_qlbenhvien_' + role} with grant option`)
            }
            else {
                decode = this.checkData(`grant ${arr[i]['dml']} on C##ADMIN.${table} to ${'role_qlbenhvien_' + role}`);
            }
        }

        for (let i = 0; i < saveData.length; i++) {
            if (saveData[i]['COLUMN_NAME'] != null)
            {
                if (saveData[i]['PRIVILEGE'] == 'UPDATE' || saveData[i]['PRIVILEGE'] == 'INSERT') {        
                    decode = await this.checkData(`grant ${saveData[i]['PRIVILEGE']} (${saveData[i]['COLUMN_NAME']}) on C##ADMIN.${table} to ${'role_qlbenhvien_' + role}`);
                }
            }
            
        }
    },

    createOBJ2: function (num, arr) {
        let obj = [[arr], []];
        for (let i = 0; i < num; i++) {
            let item = {
                column: '',
                allowU: 1,
                allowI: 1,
                allowgU: 1,
                allowgI: 1,
                insert: 0,
                grantI: 0,
                update: 0,
                grantU: 0
            };
            obj[1].push(item);
        }
        return obj;
    },

    getAllRoleColRole: async function (role, table) {
        //let data = this.createOBJ(allCol.length, this.allColumn[pos]);
        let pos = this.allTable.indexOf(table.toUpperCase());
        //let hasRole =  await this.getData(`select granted_role from dba_role_privs where grantee = upper('${user}')`);
        let allCol = await this.getCheckData(`select column_name from all_tab_columns where table_name = '${this.allTable[pos]}' and owner = 'C##ADMIN'`);
        let data = this.createOBJ2(allCol.length, this.allColumn[pos]);
        let flag = 0;
        let temp = [];
        //for (let i = 0; i < hasRole.length; i++)
        //{
            let hasColRole = await this.getCheckData(`select * from role_tab_privs where role = upper('${'ROLE_QLBENHVIEN_' + role.toUpperCase()}') and table_name = upper('${this.allTable[pos]}')`);
            //if (hasColRole.length > 0) {
                temp = hasColRole;
                //flag = 1;
                //break;
            //}
        //}
        console.log(allCol)
        // if (flag == 1) {
        //     if (hasRole.length > 0) {
                for (let i = 0; i < allCol.length; i++) {
                    data[1][i]['column'] = allCol[i]['COLUMN_NAME'];
                    for (let j = 0; j < temp.length; j++) {   
                        let check = 0;
                        // let decode = await this.getCheckData(`select GRANTED_ROLE, ADMIN_OPTION from dba_role_privs where grantee = '${user}'`);
                        // for (let l = 0; l < decode.length; l++) {
                        //     if (decode[l]['GRANTED_ROLE'] == temp[j]['ROLE']) {
                        //         if (decode[l]['ADMIN_OPTION'] == 'YES') {
                        //             check = 1;
                        //         }
                        //     }
                        // }

                        if (temp[j]['COLUMN_NAME'] == allCol[i]['COLUMN_NAME']) {
                            if (temp[j]['PRIVILEGE'] == 'UPDATE') {
                                data[1][i]['update'] = 1;
                                data[1][i]['allowU'] = 0;
                            }
                            else if (temp[j]['PRIVILEGE'] == 'INSERT') {
                                data[1][i]['insert'] = 1;
                                data[1][i]['allowI'] = 0;
                            }

                            if (temp[j]['GRANTABLE'] == 'YES') {
                                data[1][i]['grantU'] = 1;
                            }
                            else if (temp[j]['GRANTABLE'] == 'YES') {
                                data[1][i]['grantI'] = 1;
                            }

                            // if (check == 1) {
                            //     data[1][i]['allowgS'] = 0;
                            //     data[1][i]['allowgU'] = 0;
                            //     data[1][i]['grantU'] = 1;
                            //     data[1][i]['grantS'] = 1;
                            // }
                        }
                        // else if (temp[j]['COLUMN_NAME'] == null) {
                        //     if (temp[j]['PRIVILEGE'] == 'UPDATE') {
                        //         data[1][i]['update'] = 1;
                        //         data[1][i]['allowU'] = 0;
                        //     }
                        //     else if (temp[j]['PRIVILEGE'] == 'SELECT') {
                        //         data[1][i]['select'] = 1;
                        //         data[1][i]['allowS'] = 0;
                        //     }

                        //     if (temp[j]['GRANTABLE'] == 'YES') {
                        //         data[1][i]['grantU'] = 1;
                        //     }
                        //     else if (temp[j]['GRANTABLE'] == 'YES') {
                        //         data[1][i]['grantS'] = 1;
                        //     }

                        //     // if (check == 1) {
                        //     //     data[1][i]['allowgS'] = 0;
                        //     //     data[1][i]['allowgU'] = 0;
                        //     //     data[1][i]['grantU'] = 1;
                        //     //     data[1][i]['grantS'] = 1;
                        //     // }
                        // }
                    }
                }

                console.log(data)
            //}
        //}

        // let isData = await this.getCheckData(`select column_name, privilege, grantable from dba_col_privs where
        // grantee = '${user}' and table_name = '${this.allTable[pos]}'`);     
        
        // for (let i = 0; i < allCol.length; i++) {
        //     data[1][i]['column'] = allCol[i]['COLUMN_NAME'];
        //     for (let j = 0; j < isData.length; j++) {     
        //         if (isData[j]['COLUMN_NAME'] == allCol[i]['COLUMN_NAME']) {
        //             let res = '';
        //             if (isData[j]['PRIVILEGE'] == 'UPDATE') {
        //                 data[1][i]['update'] = 1;
        //             }
        //             else if (isData[j]['PRIVILEGE'] == 'SELECT') {
        //                 data[1][i]['select'] = 1;
        //             }

        //             if (isData[j]['GRANTABLE'] == 'YES') {
        //                 data[1][i]['grantU'] = 1;
        //             }
        //             else if (isData[j]['GRANTABLE'] == 'YES') {
        //                 data[1][i]['grantS'] = 1;
        //             }
        //         }
        //     }
        // }

        // query = `select privilege, grantable from sys.DBA_TAB_PRIVS
        //     where grantee = '${user}' and table_name = '${this.allTable[pos]}'`;
        // isData = await this.getCheckData(query);

        // for (let i = 0; i < isData.length; i++) {
        //     if (isData[i]['PRIVILEGE'] == 'SELECT') {
        //         if (isData[i]['GRANTABLE'] == 'NO') {
        //             for (let j = 0; j < allCol.length; j++) {
        //                 data[1][j]['select'] = 1;
        //             }
        //         }
        //         else {
        //             for (let j = 0; j < allCol.length; j++) {
        //                 data[1][j]['select'] = 1;
        //                 data[1][j]['grantS'] = 1;
        //             }
        //         }
        //     }
        //     else if (isData[i]['PRIVILEGE'] == 'UPDATE') {
        //         if (isData[i]['GRANTABLE'] == 'NO') {
        //             for (let j = 0; j < allCol.length; j++) {
        //                 data[1][j]['update'] = 1;
        //             }
        //         }
        //         else {
        //             for (let j = 0; j < allCol.length; j++) {
        //                 data[1][j]['update'] = 1;
        //                 data[1][j]['grantU'] = 1;
        //             }
        //         }
        //     }
        // }

        return data;
    },

    setRoleColRole: async function (role, table, arrDML) {
        let pos = this.allTable.indexOf(table.toUpperCase());
        let decode;
        let saveData = await this.getCheckData(`select column_name, privilege, grantable from role_tab_privs
        where role = upper('${'role_qlbenhvien_' + role}') and table_name = upper('${this.allTable[pos]}')`);

        if (pos > -1) {
            let count = 0;
            //let data = await this.getData(`select column_name, privilege from DBA_COL_PRIVS where grantee = '${user.toUpperCase()}' and table_name = '${this.allTable[pos]}'`);
            decode = await this.checkData(`revoke update on C##ADMIN.${this.allTable[pos]} from ${'role_qlbenhvien_' + role}`);
            decode = await this.checkData(`revoke insert on C##ADMIN.${this.allTable[pos]} from ${'role_qlbenhvien_' + role}`);

            for (let i = 0; i < arrDML.length; i++) {

                if (arrDML[i]['grant']) {
                    decode = await this.checkData(`grant update (${arrDML[i]['col']}) on C##ADMIN.${this.allTable[pos]} to ${'role_qlbenhvien_' + role} with grant option`);
                }
                else {
                    decode = await this.checkData(`grant ${arrDML[i]['dml']} (${arrDML[i]['col']}) on C##ADMIN.${this.allTable[pos]} to ${'role_qlbenhvien_' + role}`);
                }
            }
        }

        for (let i = 0; i < saveData.length; i++) {
            if (saveData[i]['COLUMN_NAME'] == null) {
                decode = await this.checkData(`grant ${saveData[i]['PRIVILEGE']} on C##ADMIN.${this.allTable[pos]} to ${'role_qlbenhvien_' + role}`);
            }
        }
    },
};
