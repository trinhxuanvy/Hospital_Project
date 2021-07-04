var express = require('express');
var oracledb = require('../backend/data');
var jwt = require('jsonwebtoken');
var setup = require('./setup');
//var conn = require('../backend/oracledb');
var router = express.Router();

// GET home page
router.get('/', async function (req, res, next) {
    let idUser = '';
    try {
        let tokenUser = await req.cookies.is_;
        let reTokenUser = jwt.verify(tokenUser, 'abcd1234', function (err, result) {
            if (err) {
                return 0;
            }
            else {
                return result;
            }
        });
        if (reTokenUser == 0) {
            
        }
        else {
            let getUser = reTokenUser['getUser'];
            let redir = setup.getRedirect(getUser);
            idUser = getUser[0]['IDNHANVIEN'];
            
            res.render('index', { redir, idUser });
        }     
    } catch (error) {
        res.render('index', { idUser });
    }
});


router.post('/', async function (req, res, next) {


});

// GET login page
router.get('/login', async function (req, res, next) {
    let statusLogin = await req.cookies.statusLogin;

    res.render('login', { statusLogin });
});

// POST and check user
router.post('/user', async function (req, res, next) {
    let user = req.body.user;
    let password = req.body.password;

    if (setup.checkInput(user) || setup.checkInput(password)) {
        res.cookie('statusLogin', 'false');
        res.redirect('/login');
    }
    else {
        let userLogin = await oracledb.userLogin(user, password);
        if (userLogin == true) {   
            let megreUser = new setup.User(user, password);
            let tokenMegreUser = jwt.sign({ megreUser }, 'abcd1234', { algorithm: 'HS256', expiresIn: '3h' });
            res.cookie('flag', tokenMegreUser);

            if (user == 'admin' && password == 'abcd1234')
            {
                
                res.redirect('admin/user');
            }
            else {
                let query = `select granted_role, idnhanvien from sys.dba_role_privs drp, c##admin.nhanvien anv
                                    where lower(drp.grantee) = lower('${'c##' + user}') and
                                        lower(drp.grantee) = lower(anv.username)`;
                let getUser = await oracledb.getCheckData(query);

                let tokenUser = jwt.sign({ getUser }, 'abcd1234', { algorithm: 'HS256', expiresIn: '3h' });
                
                res.cookie('is_', tokenUser);
                res.cookie('statusLogin', 'true');
                res.cookie('redirect', 'true');

                res.redirect('/');
            }
        }
        else {
            res.cookie('statusLogin', 'false');
            res.redirect('/login');
        }
    }
});

// GET service page
router.get('/service', function (req, res, next) {
    res.render('service');
});

// GET admin page


// GET admin-manage-user
router.get('/admin/user', async function (req, res, next) {
    try {
        let tokenFlag = req.cookies.flag;
        let reTokenFlag = jwt.verify(tokenFlag, 'abcd1234', function (err, result) {
            if (err) {
                return 0;
            }
            else {
                return 1;
            }
        });

        if (reTokenFlag != 0) {
            let user = '';
            let getUser = await oracledb.getCheckData(`select idnhanvien, username, tennhanvien, vaitro from c##admin.nhanvien order by idnhanvien desc`);
            for (let i = 0; i < getUser.length; i++) {
                getUser[i]['USERNAME'] = getUser[i]['USERNAME'].slice(3, getUser[i]['USERNAME'].length);
            }
            let dv = await oracledb.getCheckData(`select * from c##admin.donvi`);
            let vt = [
                { name: 'Quản Lý Tài Vụ' },
                { name: 'NV Tài Vụ' },
                { name: 'Bác sĩ' },
                { name: 'NV Tiếp Tân Và Điều Phối' },
                { name: 'NV Kế Toán' },
                { name: 'NV Bán Thuốc' },
                { name: 'Quản Lý Tài Nguyên Và Nhân Sự' },
                { name: 'Quản Lý Chuyên Môn' },
            ]
            res.render('user', { user: getUser, vt, dv });
        }
        else {
            res.redirect('/login');
        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }
    
});

// ================================ Set Role => User ==================================

router.get('/admin/user/:username/detail/:role', async function (req, res, next) {
    try {
        let tokenFlag = req.cookies.flag;
        let reTokenFlag = jwt.verify(tokenFlag, 'abcd1234', function (err, result) {
            if (err) {
                return 0;
            }
            else {
                return 1;
            }
        });

        if (reTokenFlag != 0) {
            let role = req.params.role;
            let user = req.params.username;
            let allRole, fullRole;
            let type = 0;
    
            if (role == 'role') {
                // Lấy role
                fullRole = await oracledb.getAllRole(setup.setUserName(user).toUpperCase());
                // Tạo biến typeR
                res.cookie('typeR', 1);
                type = 1;
            }

            let saveSuccess = await req.cookies.saveSuccess;
            let message = await req.cookies.message;

            res.cookie('message', '');
            res.render('user-role', { user, saveSuccess, message, fullRole, allRole, role, type });
        }
        else {
            //res.clearCookie('flag');
            res.redirect('/login');
        }
    } catch (error) {
        //res.clearCookie('flag');
        res.redirect('/login');
    }
    
});

router.post('/admin/user/:username/detail/:role', async function (req, res, next) {
    try {
        let tokenFlag = req.cookies.flag;
        let reTokenFlag = jwt.verify(tokenFlag, 'abcd1234', function (err, result) {
            if (err) {
                return 0;
            }
            else {
                return 1;
            }
        });

        if (reTokenFlag != 0) {
            let getIn = req.body;
            let role = req.params.role;
            let userName = req.params.username;
            let typeRole = req.cookies.typeR;

            if (typeRole == 1) {
                let arr = setup.getRole(getIn);
                try {
                    let run = await oracledb.setUpdateRole(setup.setUserName(userName).toUpperCase(), arr);
                    res.cookie('saveSuccess', true);
                } catch (error) {
                    res.cookie('saveSuccess', false);
                }
            }
            res.cookie('message', true);
            res.redirect(`${req.params.role}`);
        }
        else {
            res.clearCookie('flag');
            res.redirect('/login');
        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.get('/admin/user/:username/detail/role/:table', async function (req, res, next) {
    let flag = req.cookies.flag;
    let tokenFlag = jwt.verify(flag, 'abcd1234', function (err, result) {
        if (err) {
            return 0;
        }
        else {
            return 1;
        }
    });

    if (tokenFlag != 0) {
        let table = req.params.table;
        let user = req.params.username;
        let allRole, fullRole;
        let type = 0;
        let tableHasSign;

        if ((pos = oracledb.allTable.indexOf(table.toUpperCase())) > -1) {
            tableHasSign = oracledb.allTableHasSign[pos];
            allRole = await oracledb.getAllRoleTable(setup.setUserName(user).toUpperCase(), table.toUpperCase());
            // Tạo biến typeR
            res.cookie('typeR', 2);
            type = 2;
        }

        let saveSuccess = await req.cookies.saveSuccess;
        let message = await req.cookies.message;

        res.cookie('message', '');
        res.render('user-table', { user, saveSuccess, message, fullRole, allRole, table, tableHasSign, type });
    }
    else {
        res.redirect('/login');
    }
});

router.post('/admin/user/:username/detail/role/:table', async function (req, res, next) {
    let getIn = req.body;
    let tableName = req.params.table;
    let userName = req.params.username;
    let typeRole = req.cookies.typeR;
    if (typeRole == 2) {
        let arr = setup.getTableArrDML(getIn);
        try {
            let decode = await oracledb.setUpdateRoleTable(setup.setUserName(userName).toUpperCase(), tableName.toUpperCase(), arr);
            res.cookie('saveSuccess', true);
        } catch (error) {
            res.cookie('saveSuccess', false);
        }
    }

    res.cookie('message', true);
    res.redirect(`${tableName}`);
});

router.get('/admin/user/:username/detail/column/:tablename', async function (req, res, next) {
    let flag = req.cookies.flag;
    let tokenFlag = jwt.verify(flag, 'abcd1234', function (err, result) {
        if (err) {
            return 0;
        }
        else {
            return 1;
        }
    });

    if (tokenFlag != 0) {
        let tableName = req.params.tablename;
        let user = req.params.username;
        let allRole, role, tokenRole, fullRole;
        let tableHasSign = '';
        let type = 0;
        let arrColRol = [];
        if (1 == 1) {
            arrColRol = await oracledb.getAllRoleCol(setup.setUserName(user).toUpperCase(), tableName);
            res.cookie('typeR', 3);
            type = 3;
        }
        let saveSuccess = await req.cookies.saveSuccess;
        let message = await req.cookies.message;

        res.cookie('message', '');
        res.render('user-column', { user, saveSuccess, message, fullRole, allRole, tableName, tableHasSign, type, arrColRol });
    }
    else {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.post('/admin/user/:username/detail/column/:tablename', async function (req, res, next) {
    let flag = req.cookies.flag;
    let tokenFlag = jwt.verify(flag, 'abcd1234', function (err, result) {
        if (err) {
            return 0;
        }
        else {
            return 1;
        }
    });
    if (tokenFlag == 1) {
        let getIn = req.body;
        let tableName = req.params.tablename;
        let userName = req.params.username;
        let typeRole = req.cookies.typeR;
        let arrDML;
        if (3 == 3) {
            arrDML = setup.getArrDML(getIn);
    
            let run = await oracledb.setUpdateRolCol(setup.setUserName(userName).toUpperCase(), tableName.toUpperCase(), arrDML);
        }
    
        res.cookie('message', true);
        res.redirect(`${tableName}`);
    }
    else {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

// ================================= Set Role => Role =================================

router.get('/admin/role', async function (req, res, next) {
    try {
        let tokenFlag = req.cookies.flag;
        let reTokenFlag = jwt.verify(tokenFlag, 'abcd1234', function (err, result) {
            if (err) {
                return 0;
            }
            else {
                return 1;
            }
        });

        if (reTokenFlag != 0) {
            let role = await oracledb.getCheckData(`select distinct(role) from dba_roles where role like upper('role_qlbenhvien_%')`);
            console.log(role)
            let idRole = [];
            for (let i = 0; i < role.length; i++) {
                idRole.push(role[i]['ROLE'].slice(16).toLocaleLowerCase());
            }
            console.log(idRole)
            res.render('admin-role', { role, idRole });
        }
        else {
            res.redirect('/login');
        }
    } catch (error) {
        //res.clearCookie('flag');
        res.redirect('/login');
    }
    
});

router.get('/admin/role/:role/:table', async function (req, res, next) {
    let flag = req.cookies.flag;
    let tokenFlag = jwt.verify(flag, 'abcd1234', function (err, result) {
        if (err) {
            return 0;
        }
        else {
            return 1;
        }
    });

    if (tokenFlag != 0) {
        let table = req.params.table;
        let role = req.params.role;
        let allRole;
        let Rtype = 0;
        let tableHasSign;

        if ((pos = oracledb.allTable.indexOf(table.toUpperCase())) > -1) {
            tableHasSign = oracledb.allTableHasSign[pos];
            allRole = await oracledb.getAllRoleTableRole(role, table.toUpperCase());
            console.log(allRole)
            // Tạo biến typeR
            res.cookie('Rtype', 1);
            Rtype = 1;
        }

        let saveSuccess = await req.cookies.saveSuccess;
        let message = await req.cookies.message;

        res.cookie('message', '');
        res.render('role-table', { role, saveSuccess, message, allRole, table, tableHasSign, Rtype });
    }
    else {
        res.redirect('/login');
    }
});

router.post('/admin/role/:role/:table', async function (req, res, next) {
    let getIn = req.body;
    let table = req.params.table;
    let role = req.params.role;
    let typeRole = req.cookies.Rtype;
    console.log(getIn)
    if (typeRole == 1) {
        console.log('dsdadasa')
        let arr = setup.getTableArrDML(getIn);
        try {
            let decode = await oracledb.setAllRoleTableRole(role, table, arr);
            res.cookie('saveSuccess', true);
        } catch (error) {
            res.cookie('saveSuccess', false);
        }
    }

    res.cookie('message', true);
    res.redirect(`${table}`);
});

router.get('/admin/role/:role/:table/column', async function (req, res, next) {
    let flag = req.cookies.flag;
    let tokenFlag = jwt.verify(flag, 'abcd1234', function (err, result) {
        if (err) {
            return 0;
        }
        else {
            return 1;
        }
    });

    if (tokenFlag != 0) {
        let table = req.params.table;
        let role = req.params.role;
        let allRole;
        let Rtype = 0;
        let arrColRol = [];
        if (1 == 1) {
            arrColRol = await oracledb.getAllRoleColRole(role, table);
            res.cookie('Rtype', 2);
            Rtype = 2;
        }
        let saveSuccess = await req.cookies.saveSuccess;
        let message = await req.cookies.message;

        res.cookie('message', '');
        res.render('role-column', { role, saveSuccess, message, allRole, table, Rtype, arrColRol });
    }
    else {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.post('/admin/role/:role/:table/column', async function (req, res, next) {
    let flag = req.cookies.flag;
    let tokenFlag = jwt.verify(flag, 'abcd1234', function (err, result) {
        if (err) {
            return 0;
        }
        else {
            return 1;
        }
    });
    if (tokenFlag == 1) {
        let getIn = req.body;
        let table = req.params.table;
        let role = req.params.role;
        let typeRole = req.cookies.Rtype;
        let arrDML;
        if (typeRole == 2) {
            arrDML = setup.getArrDML2(getIn);
    
            let run = await oracledb.setRoleColRole(role, table, arrDML);
        }

        res.cookie('message', true);
        res.redirect(`/admin/role/${role}/${table}/column`);
    }
    else {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.post('/admin/role/add', async function (req, res, next) {
    let flag = req.cookies.flag;
    let tokenFlag = jwt.verify(flag, 'abcd1234', function (err, result) {
        if (err) {
            return 0;
        }
        else {
            return 1;
        }
    });
    if (tokenFlag == 1) {
        let role = req.body.addRole.toLowerCase();
        console.log(role);
        let insert = await oracledb.setData(`begin create_role(:myRole); end;`, { myRole: role });
        //insert = await oracledb.checkData(`grant create session to c##vychuoioke`);
        //insert = await oracledb.checkData(`create role role_qlbenhvien_abc`);
        //console.log(insert)
        res.cookie('message', true);
        res.redirect(`/admin/role`);
    }
    else {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.get('/admin/role/:idRole/delete/this', async function (req, res, next) {
    let flag = req.cookies.flag;
    let tokenFlag = jwt.verify(flag, 'abcd1234', function (err, result) {
        if (err) {
            return 0;
        }
        else {
            return 1;
        }
    });
    if (tokenFlag == 1) {
        let role = 'role_qlbenhvien_' + req.params.idRole;
        console.log(role);
        let insert = await oracledb.setData(`begin drop_role(:id); end;`, { id: role });

        res.redirect(`/admin/role`);
    }
    else {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.post('/admin/user/add', async function (req, res, next) {
    let flag = req.cookies.flag;
    let tokenFlag = jwt.verify(flag, 'abcd1234', function (err, result) {
        if (err) {
            return 0;
        }
        else {
            return 1;
        }
    });
    if (tokenFlag == 1) {
        let role = req.body;
        console.log(role);
        let getID = await oracledb.getCheckData(`select max(idnhanvien) as max from c##admin.nhanvien`);
        console.log(getID)
        let insert = await oracledb.getDataTest(`insert into c##admin.nhanvien (idnhanvien, username, tennhanvien, donvi, vaitro)
        values(:idnv, :username, :ten, :dv, :vt)`,
        {
            idnv: getID[0]['MAX'] + 1,
            username: role['addUName'].toUpperCase(),
            ten: role['addName'],
            dv: role['addDv'],
            vt: role['addVt']
        });
        console.log(insert)
        let idU = await oracledb.getCheckData(`select idnhanvien from c##admin.nhanvien where username = upper('${role['addUName']}')`)
        insert = await oracledb.setData(`begin create_user(:name, :pass); end;`, { name: role['addUName'], pass: getID[0]['MAX'] + 1 });

        res.redirect(`/admin/user`);
    }
    else {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

// ===================================== Audit ========================================

router.get('/admin/audit/fga', async function (req, res, next) {
    let flag = req.cookies.flag;
    let tokenFlag = jwt.verify(flag, 'abcd1234', function (err, result) {
        if (err) {
            return 0;
        }
        else {
            return 1;
        }
    });
    if (tokenFlag == 1) {
        let getItem = req.query, data = [];
        let date = new Date(getItem['addDate']);
        let getDay = date.getDate();
        if (getDay < 10) {
            getDay = '0' + getDay.toString();
        }
        let getMonth = date.getMonth() + 1;
        if (getMonth < 10) {
            getMonth = '0' + getMonth.toString();
        }
    
        data = await oracledb.getCheckData(`select TIMESTAMP, DB_USER, OBJECT_SCHEMA, 
        OBJECT_NAME, POLICY_NAME, SQL_TEXT from dba_fga_audit_trail
        where to_char(timestamp, 'dd') = '${getDay}'
        and to_char(timestamp, 'mm') = '${getMonth}'
        and to_char(timestamp, 'yyyy') = '${date.getFullYear()}' and object_name = '${getItem['addTable']}'`);
        setup.convertDate(data);

        let table = await oracledb.getCheckData(`select table_name from all_tables where owner = 'C##ADMIN'`);

        res.render('audit', { data, table });
    }
    else {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.get('/admin/audit/standand', async function (req, res, next) {
    let flag = req.cookies.flag;
    let tokenFlag = jwt.verify(flag, 'abcd1234', function (err, result) {
        if (err) {
            return 0;
        }
        else {
            return 1;
        }
    });
    if (tokenFlag == 1) {
        let getItem = req.query, data = [];
        let date = new Date(getItem['addDate']);
        let getDay = date.getDate();
        if (getDay < 10) {
            getDay = '0' + getDay.toString();
        }
        let getMonth = date.getMonth() + 1;
        if (getMonth < 10) {
            getMonth = '0' + getMonth.toString();
        }

        data = await oracledb.getCheckData(`select TIMESTAMP, USERNAME, OWNER, OBJ_NAME, ACTION_NAME from DBA_AUDIT_TRAIL
        where to_char(timestamp, 'dd') = '${getDay}'
        and to_char(timestamp, 'mm') = '${getMonth}'
        and to_char(timestamp, 'yyyy') = '${date.getFullYear()}'`);
        setup.convertDate(data);
        // and object_name = '${getItem['addTable']}'
        //let table = await oracledb.getCheckData(`select table_name from all_tables where owner = 'C##ADMIN'`);

        res.render('audit-standand', { data });
    }
    else {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

// ====================================================================================

router.get('/logout', function (req, res, next) {
    res.clearCookie('flag');
    res.clearCookie('is_');
    res.redirect('/login');
});

// ======================= User =====================================
router.get('/user', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] != '') {
                let idUser = reToken[k]['IDNHANVIEN'];
                let getData = await oracledb.getCheckData(`select nv.*, dv.tendonvi from c##admin.nhanvien nv, c##admin.donvi dv where nv.idnhanvien = ${idUser} and nv.donvi = dv.iddonvi`);
                if (getData.length > 0) {
                    getData[0]['USERNAME'] = getData[0]['USERNAME'].slice(3).toLowerCase();
                    setup.convertDate(getData);
                    getData[0]['LUONG'] = setup.setMoney(getData[0]['LUONG']);
                }
                console.log(getData)
                res.render('my-user', { idUser, redir, getData });
                break;
            }
        }     
    } catch (error) {
        //res.clearCookie('flag');
        res.redirect('/login');
    }

});

router.post('/user/update', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);
        console.log('dsdasd');
        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] != '') {
                let idUser = reToken[k]['IDNHANVIEN'];
                let getItem = req.body;
                console.log(getItem)
                let query= `update c##admin.nhanvien set tennhanvien = :ten, diachi = :dc, sdt = :dt, namsinh = to_date(:ngay, 'dd/mm/yyyy') where idnhanvien = ${idUser}`;
                let decode = await oracledb.setCheckDataOfUser(user, password, query,
                    {
                        ten: getItem['addName'],
                        dc: getItem['addAd'],
                        dt: getItem['addPhone'],
                        ngay: getItem['addDate']
                    });
                    console.log(decode)
                if (getItem['addP'].length > 0) {
                    //let decode = await oracledb.changePass(user, password);
                    let update = await oracledb.changePass(user, password, getItem['addP']);
                    console.log(update);
                    //await update.changePassword(user, password, getItem['addP']);
                    //await update.release();
                    //console.log(update)
                    res.clearCookie('flag');
                    res.redirect('/login');
                }
                else {
                    res.redirect('/user');
                }
                break;
            }
        }     
    } catch (error) {
        //res.clearCookie('flag');
        res.redirect('/login');
    }

});

// ======================== Lich truc =====================================

router.get('/schedule', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] != '') {
                let idUser = reToken[k]['IDNHANVIEN'], query, getItem = req.query;
                query = `select distinct(nv.vaitro) from c##admin.lichtruc lt, c##admin.nhanvien nv where lt.idnhanvien = nv.idnhanvien`;
                
                let vaitro = await oracledb.getCheckDataOfUser(user, password, query);
                console.log(vaitro);

                let getMonth = getItem['addMon'];
                if (getItem['addMon'] < 10) {
                    getMonth = '0' + getItem['addMon'].toString();
                }
                query = `select * from c##admin.lichtruc where`;
                
                if (getItem['addEmp'] != 'all') {
                    query += ` idnhanvien = ${getItem['addEmp']}`;
                }
                else {
                    query += ` 1 = 1`;
                }
                query += ` and to_char(ngaybatdau, 'mm') = '${getMonth}'
                and to_char(ngaybatdau, 'yyyy') = '${getItem['addY']}'`;
                
                console.log(query)

                let data = await oracledb.getCheckDataOfUser(user, password ,query);
                console.log(data);

                if (data.length > 0) {
                    setup.convertDate(data);
                }

                res.render('lichtruc', { idUser, redir, vaitro, data });
                break;
            }
        }     
    } catch (error) {
        //res.clearCookie('flag');
        res.redirect('/login');
    }

});

router.post('/schedule', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] != '') {
                let idUser = reToken[k]['IDNHANVIEN'], query;
                let hint = '';
                let search = req.body.query.toLowerCase();
                console.log(req.body)
                if (search.length > 0) {
                    if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_QUANLYTAINGUYENNHANSU') {
                        query = `select tt.idnhanvien from c##admin.lichtruc tt, c##admin.nhanvien nv where nv.idnhanvien = tt.idnhanvien and upper(nv.vaitro) = '${search.toUpperCase()}' group by tt.idnhanvien order by idnhanvien asc`;
                        console.log(query)
                    }
                    else {
                        query = `select tt.idnhanvien from c##admin.lichtruc tt group by tt.idnhanvien order by idnhanvien asc`;
                    }
                    let data = await oracledb.getCheckDataOfUser(user, password, query);
                    if (data.length > 0) {
                        hint += `<option value="all">Tất cả</option>`;
                        for (let i = 0; i < data.length; i++) {
                            hint += `<option value="${data[i]['IDNHANVIEN']}">${data[i]['IDNHANVIEN']}</option>`;
                        }
                    }
                    else {
                        hint += `<option value="all">Tất cả</option>`;
                    }
                    console.log(hint)
                    res.send(hint);
                }
                break;
            }
        }     
    } catch (error) {
        //res.clearCookie('flag');
        res.redirect('/login');
    }

});


// ====================================================================


router.get('/doctor/patient/page-:number', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[5] == 1) {
            for (let k = 0; k < reToken.length; k++) {
                if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_BACSI') {
                    let getItem = req.query;
                    let page = req.params.number;
                    let idUser = reToken[k]['IDNHANVIEN'];
                    
                    if (page < 1) {
                        page = 1;
                    }
                    let data, isSearch = 0, search, query;
                    if ((search = getItem['search']) != null) {
                        isSearch = 1;
                        query = `select distinct bn.*
                                    from c##admin.benhnhan bn, c##admin.hosobenhan hsba
                                    where hsba.bsdieutri = ${idUser} and hsba.idbenhnhan = bn.idbenhnhan
                                    and c##admin.fn_convert_to_vn(lower(bn.tenbenhnhan)) like '%${setup.removeVietnameseTones(getItem['search']).toLowerCase()}%' order by bn.idbenhnhan asc`;
                        data = await oracledb.getCheckDataOfUser(user, password, query);
                    }
                    else {
                        query = `select distinct bn.*  from c##admin.hosobenhan hsbn, 
                                    c##admin.benhnhan bn where hsbn.bsdieutri = ${idUser} and 
                                    hsbn.idbenhnhan = bn.idbenhnhan order by bn.idbenhnhan asc`;
                        data = await oracledb.getCheckDataOfUser(user, password, query);
                    }
    
                    let r = data.length % 8;
                    let numPage = Math.floor(data.length / 8);
                    if (data.length != 0) {
                        if (r > 0) {
                            numPage += 1;
                        }
                        if (page > numPage) {
                            page = numPage;
                        }
                        let startPage = (page - 1) * 8;
                        let endPage = page * 8;
                        data = data.slice(startPage, endPage);
                    }
                    else {
                        page = req.params.number * 1;
                    }
        
                    if (isSearch == 1)
                    {
                        page = 1;
                    }
                    res.render('doctor-page', { data, page, numPage, isSearch, search, redir, idUser });
                    break;
                }
            }
        }
        else {
            res.clearCookie('flag');
            res.redirect('/login');
        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }

});

router.post('/doctor/patient/page-:number', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[5] == 1) {
            for (let k = 0; k < reToken.length; k++) {
                if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_BACSI') {
                    let idUser = reToken[k]['IDNHANVIEN'];
                    let hint = '';
                    let search = req.body.query.toLowerCase();
                    if (search.length > 0) {
                        let query = `select distinct bn.* from c##admin.benhnhan bn, c##admin.hosobenhan hsba
                                        where hsba.bsdieutri = ${idUser} and hsba.idbenhnhan = bn.idbenhnhan and
                                        c##admin.fn_convert_to_vn(lower(bn.tenbenhnhan)) like '%${setup.removeVietnameseTones(search)}%' order by bn.idbenhnhan asc`;
                        let data = await oracledb.getCheckDataOfUser(user, password, query);
                        if (data.length > 0) {
                            data = data.slice(0, 6);
                            for (let i = 0; i < data.length; i++) {
                                hint += `<a href="/doctor/patient/${data[i]['IDBENHNHAN']}/bill-drug/0" class="link-item-search">${data[i]['TENBENHNHAN']}</a>`;
                            }
                        }
                        else {
                            hint += `<p class="link-item-search">Không tìm thấy</p>`;
                        }
                        res.send(hint);
                    }
                    break;
                }
            }
        }
        else {
            res.clearCookie('flag');
            res.redirect('/login');
        } 
    }
    catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.get('/doctor/patient/:id/bill-drug/:number', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[5] == 1) {
            for (let k = 0; k < reToken.length; k++) {
                if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_BACSI') {
                    let id = req.params.id, number = req.params.number, query, idUser = reToken[k]['IDNHANVIEN'];
                    
                    if (isNaN(id * 1) != true && isNaN(number * 1) != true) {
                        query = `select * from c##admin.hosobenhan hsba, c##admin.donthuoc dt
                                    where hsba.idbenhnhan = ${id} and hsba.bsdieutri = ${idUser} and
                                    hsba.idhosobenhan = dt.idhosobenhan and dt.iddonthuoc = ${number}`;
                        let check = await oracledb.getCheckDataOfUser(user, password, query);
    
                        if (check.length != 0 || number == 0) {
                            query = `select distinct bn.*  from c##admin.hosobenhan hsbn, c##admin.benhnhan bn
                                        where hsbn.bsdieutri = ${idUser} and hsbn.idbenhnhan = ${id} and
                                        hsbn.idbenhnhan = bn.idbenhnhan order by bn.idbenhnhan asc`;
                            let patient = await oracledb.getCheckDataOfUser(user, password, query);
    
                            if (patient.length == 0) {
                                res.render('404');
                            }
                            else {
                                query = `select * from c##admin.hosobenhan where idbenhnhan = ${id} and bsdieutri = ${idUser}`;
                                let allFile = await oracledb.getCheckDataOfUser(user, password, query);
                                
                                query = `select dt.* from c##admin.hosobenhan hs, c##admin.donthuoc dt
                                            where dt.idhosobenhan = hs.idhosobenhan and hs.idbenhnhan = ${id} and
                                            hs.bsdieutri = ${idUser} order by dt.iddonthuoc desc`;
                                let bill = await oracledb.getCheckDataOfUser(user, password, query);
                                console.log(bill);
    
                                query = `select ctdt.*, t.tenthuoc, t.donvitinh from c##admin.hosobenhan hsba, c##admin.donthuoc dt, c##admin.chitietdonthuoc ctdt, c##admin.thuoc t
                                            where hsba.idhosobenhan = dt.idhosobenhan and hsba.bsdieutri = ${idUser} and dt.iddonthuoc = ctdt.iddonthuoc
                                            and ctdt.iddonthuoc = ${number} and ctdt.idthuoc = t.idthuoc`;
                                let deDes = await oracledb.getCheckDataOfUser(user, password, query);
    
                                query = `select * from c##admin.thuoc order by tenthuoc`;
                                let drug = await oracledb.getCheckDataOfUser(user, password, query);
    
                                query = `select c##admin.xem_ketluanbs(hsba.idhosobenhan) as ketluanbs from c##admin.hosobenhan hsba, c##admin.donthuoc dt
                                            where hsba.bsdieutri = ${idUser} and hsba.idbenhnhan = ${id} and
                                            hsba.idhosobenhan = dt.idhosobenhan and dt.iddonthuoc = ${number}`;
                                let cmtDoc = await oracledb.getCheckDataOfUser(user, password, query);
    
                                if (cmtDoc.length == 0) {
                                    cmtDoc = [];
                                    cmtDoc.push({ KETLUANBS: '' });
                                }
    
                                if (bill.length > 0)
                                {
                                    setup.convertDate(bill);
                                }
    
                                if (allFile.length > 0) {
                                    setup.convertDate(allFile);
                                }
                                res.render('prescription', { drug, id, allFile, deDes, number, cmtDoc, patient, bill, idUser, redir });
                            }
                        }
                        else {
                            res.render('404');
                        }
                        break;
                    }
                    else {
                        res.render('404');
                    }
                }
            }
        }
        else {
            res.clearCookie('flag');
            res.redirect('/login');
        } 
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }

});

router.post('/doctor/patient/:id/bill-drug/:number', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[5] == 1) {
            for (let k = 0; k < reToken.length; k++) {
                if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_BACSI') {
                    let id = req.params.id, number = req.params.number, query, idUser = reToken[k]['IDNHANVIEN'], reqBody = req.body;;
                    let idDrug = [], numberUse = [], idFile = [], idNewDrug = [], numberNewUse = [], diagnose = '';
                    for (let i in reqBody) {
                        if (i.indexOf('idDrug') > -1) {
                            if (reqBody[`${i}`] != '') {
                                let pos = i.indexOf('_');
                                idFile.push(i.slice(pos + 1))
                                pos = reqBody[`${i}`].indexOf('-');
                                idDrug.push(reqBody[`${i}`].slice(pos + 2));
                            }
                            else {
                                idDrug = [], numberUse = [], idFile = [], idNewDrug = [], numberNewUse = [], diagnose = '';
                                break;
                            }
                        }
                        else if (i.indexOf('numberUse') > -1) {
                            if ((reqBody[`${i}`] * 1) >= 0 && reqBody[`${i}`] != '') {
                                numberUse.push(reqBody[`${i}`]);
                            }
                            else {
                                idDrug = [], numberUse = [], idFile = [], idNewDrug = [], numberNewUse = [], diagnose = '';
                                break;
                            }
                        }
                        else if (i.indexOf('diagnose') > -1) {
                            if (setup.checkInput(reqBody[`${i}`]) == true) {
                                idDrug = [], numberUse = [], idFile = [], idNewDrug = [], numberNewUse = [], diagnose = '';
                                break;
                            }
                            else {
                                diagnose = reqBody[`${i}`];
                            }
                        }
                        else if (i.indexOf('idNewDrug') > -1) {
                            if (reqBody[`${i}`] != '') {
                                let pos = reqBody[`${i}`].indexOf('-');
                                idNewDrug.push(reqBody[`${i}`].slice(pos + 2));
                            }
                            else {
                                idDrug = [], numberUse = [], idFile = [], idNewDrug = [], numberNewUse = [], diagnose = '';
                                break;
                            }
                        }
                        else if (i.indexOf('numberNewUse') > -1 && reqBody[`${i}`] != '') {
                            if ((reqBody[`${i}`] * 1) >= 0) {
                                numberNewUse.push(reqBody[`${i}`]);
                            }
                            else {
                                idDrug = [], numberUse = [], idFile = [], idNewDrug = [], numberNewUse = [], diagnose = '';
                                break;
                            }
                        }
                        else if (i.indexOf('hsba') > -1) {
                            let date = new Date();
                            let idbn = reqBody[`${i}`];
                            let strDate = `to_date('${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}', 'yyyy/mm/dd hh24:mi:ss')`
                            
                            query = `insert into c##admin.donthuoc(idhosobenhan, ngaylap) values (:idhsba, ${strDate})`;
                            let insert = await oracledb.setCheckDataOfUser(user, password, query, { idhsba: idbn });
                            console.log(insert)
                        }
                    }
    
                    query = `select * from c##admin.hosobenhan hsba, c##admin.donthuoc dt
                                where hsba.idbenhnhan = ${id} and hsba.bsdieutri = ${idUser} and
                                hsba.idhosobenhan = dt.idhosobenhan and dt.iddonthuoc = ${number}`;
                    let check = await oracledb.getCheckDataOfUser(user, password, query);
    
                    if (check.length != 0 || number != 0) {
                        for (let i = 0; i < idDrug.length; i++) {
                            query = `update c##admin.chitietdonthuoc set idthuoc = :idt, soluong = :sl 
                                        where idchitietdonthuoc = :idct`;
                            let update = await oracledb.setCheckDataOfUser(user, password, query, { idt: idDrug[i], sl: numberUse[i], idct: idFile[i] });
                        }
    
                        for (let i = 0; i < idNewDrug.length; i++) {  
                            query =  `insert into c##admin.chitietdonthuoc(iddonthuoc, idthuoc, soluong) values (:iddt, :idt, :sl)`;
                            console.log(query)
                            let insert = await oracledb.setCheckDataOfUser(user, password, query, { iddt: number, idt: idNewDrug[i], sl: numberNewUse[i] });
                        }
    
                        query = `select idhosobenhan from c##admin.donthuoc where iddonthuoc = ${number}`;
                        let paFile = await oracledb.getCheckDataOfUser(user, password, query);
    
                        if (diagnose != '' && paFile.length > 0) {
                            query = `update c##admin.hosobenhan set ketluanbs = :kl
                                        where idhosobenhan = :idhsba`
                            let update = await oracledb.setCheckDataOfUser(user, password, query, { kl: diagnose, idhsba: paFile[0]['IDHOSOBENHAN'] });
                        }
                    }
    
                    res.redirect(`/doctor/patient/${id}/bill-drug/${number}`);
                    break;
                }
            }
        }
        else {
            res.clearCookie('flag');
            res.redirect('/login');
        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }

});

router.get('/service/:idService', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[5] == 0) {
            res.clearCookie('flag');
            res.redirect('/login');
        }

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_BACSI') {
                let idUser = reToken[k]['IDNHANVIEN'];
                let query = `select iddichvu from c##admin.dichvu`;
                let idService = await oracledb.getCheckDataOfUser(user, password, query);

                res.render('service-page', { idService: idService[0]['IDDICHVU'], redir, idUser });
                break;
            }
        }

    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.get('/phamarcy/bill-drug/page-:number', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[4] == 0) {
            res.clearCookie('flag');
            res.redirect('/login');
        }

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_BANTHUOC') {
                let getItem = req.query;
                let page = req.params.number;
                let idUser = reToken[k]['IDNHANVIEN'];
                let data, isSearch = 0, search, query;
                if ((search = getItem['search']) != null) {
                    isSearch = 1;
                    query = `select dt.*, bn.*, to_date(dt.ngaylap, 'YYYY-MM-DD') as ngay from C##ADMIN.donthuoc dt, C##ADMIN.BANTHUOCVATAIVU_HOSOBENHAN_VIEW hsba, C##ADMIN.benhnhan bn
                                where dt.idhosobenhan = hsba.idhosobenhan and hsba.idbenhnhan = bn.idbenhnhan and IDDONTHUOC like '%${setup.removeVietnameseTones(search)}%'
                                order by dt.iddonthuoc desc`
                    data = await oracledb.getCheckDataOfUser(user, password, query);
                }
                else {
                    query = `select dt.*, bn.*, to_date(dt.ngaylap) as ngaytao from C##ADMIN.donthuoc dt, C##ADMIN.BANTHUOCVATAIVU_HOSOBENHAN_VIEW hsba, C##ADMIN.benhnhan bn
                    where dt.idhosobenhan = hsba.idhosobenhan and hsba.idbenhnhan = bn.idbenhnhan
                    order by dt.iddonthuoc desc`;
                    console.log(query);
                    data = await oracledb.getCheckDataOfUser(user, password, query);
                }
                console.log(data);
                if (data.length != 0) {
                    setup.convertDate(data);
                }

                if (page < 1) {
                    page = 1;
                }   

                let r = data.length % 12;
                let numPage = Math.floor(data.length / 12);

                if (data.length != 0) {
                    if (r > 0) {
                        numPage += 1;
                    }
                    if (page > numPage) {
                        page = numPage;
                    }
                    let startPage = (page - 1) * 12;
                    let endPage = page * 12;
                    data = data.slice(startPage, endPage);
                }
                else {
                    page = req.params.number * 1;
                }
                page = isSearch == 1 ? 1 : page;
                res.render('phamarcy-page', { data, page, numPage, isSearch, search, redir, idUser });
                break;
            }
        }
    } catch (error) {
        ///res.clearCookie('flag');
        res.redirect('/login');
    }

});

router.post('/phamarcy/bill-drug/page-:number', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[4] == 0) {
            res.clearCookie('flag');
            res.redirect('/login');
        }

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_BANTHUOC') {
                let idUser = reToken[k]['IDNHANVIEN'];
                let hint = '';
                let search = req.body.query.toLowerCase();

                if (search.length > 0) {
                    let query = `select dt.*, bn.*, to_date(dt.ngaylap, 'YYYY-MM-DD') as ngay from C##ADMIN.donthuoc dt, C##ADMIN.BANTHUOCVATAIVU_HOSOBENHAN_VIEW hsba, C##ADMIN.benhnhan bn
                                    where dt.idhosobenhan = hsba.idhosobenhan and hsba.idbenhnhan = bn.idbenhnhan and IDDONTHUOC like '%${setup.removeVietnameseTones(search)}%'
                                    order by dt.iddonthuoc desc`
                    let data = await oracledb.getCheckDataOfUser(user, password, query);

                    if (data.length > 0) {
                        data = data.slice(0, 6);
                        for (let i = 0; i < data.length; i++) {
                            hint += `<a href="/phamarcy/bill-drug/page-${req.params.number}/${data[i]['IDDONTHUOC']}" class="link-item-search">${data[i]['IDDONTHUOC']}</a>`;
                        }
                    }
                    else {
                        hint += `<p class="link-item-search">Không tìm thấy</p>`;
                    }
                    res.send(hint);
                }
                break;
            }
        }
    } catch (error) {
        ///res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.get('/phamarcy/bill-drug/page-:number/:id', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[4] == 0) {
            res.clearCookie('flag');
            res.redirect('/login');
        }

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_BANTHUOC') {
                let data, isSearch = 0, search, idUser = reToken[k]['IDNHANVIEN'];
                let query = `select ctdt.*, t.*, bn.*, to_date(dt.ngaylap) as ngay from C##ADMIN.chitietdonthuoc ctdt, C##ADMIN.donthuoc dt, C##ADMIN.BANTHUOCVATAIVU_HOSOBENHAN_VIEW hsba, C##ADMIN.benhnhan bn, C##ADMIN.thuoc t
                where ctdt.iddonthuoc = dt.iddonthuoc and dt.idhosobenhan = hsba.idhosobenhan and hsba.idbenhnhan = bn.idbenhnhan and t.idthuoc = ctdt.idthuoc
                and ctdt.iddonthuoc = ${req.params.id} order by idchitietdonthuoc desc`;

                data = await oracledb.getCheckDataOfUser(user, password, query);

                if (data.length == 0) {
                    res.render('404');
                }

                query = `select distinct c##admin.tinhtienthuoc(iddonthuoc) as tongtien from c##admin.chitietdonthuoc where iddonthuoc = ${req.params.id}`;
                let money = await oracledb.getCheckDataOfUser(user, password, query);
                console.log(query)
                if (money.length > 0) {
                    if (money[0]['TONGTIEN'] != null) {
                        money = setup.setMoney(money[0]['TONGTIEN']);
                    }
                    else {
                        money = 0;
                    }     
                }
                else {
                    money = 0;
                }

                setup.convertDate(data);

                let page = req.params.number;
                res.render('prescription-details', { data, page, idUser, redir, money });
            }
            break;

        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.get('/reception', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[7] == 0) {
            res.clearCookie('flag');
            res.redirect('/login');
        }

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_TIEPTAN') {
                let idUser = reToken[k]['IDNHANVIEN'];
                let query = `select * from c##admin.benhnhan where `;
                let datePatient = req.query.datePatient || '';
                let namePatient = req.query.namePatient || '';
                if (namePatient != '') {
                    query += `c##admin.fn_convert_to_vn(lower(tenbenhnhan)) like '%${setup.removeVietnameseTones(namePatient.toLowerCase())}%'`;
                }
                else {
                    query += `1 = 1`;
                }

                if (datePatient != '') {
                    query += ` and trunc(namsinh) = to_date('${datePatient}','yyyy-mm-dd')`;
                }
                else {
                    query += ` and 1 = 1`;
                }

                query += ` order by idbenhnhan desc`;

                let data = [];
                if (namePatient != '' || datePatient != '') {
                    data = await oracledb.getCheckDataOfUser(user, password, query);
                }
                
                query = `select count(*) as sum from c##admin.benhnhan`;
                let numData = await oracledb.getCheckDataOfUser(user, password, query);
                console.log(numData)

                setup.convertDate(data);
                res.render('reception-page', { redir, idUser, numData, data });

                break;
            }
        }
    } catch (error) {
        ///res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.post('/reception', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[7] == 0) {
            res.clearCookie('flag');
            res.redirect('/login');
        }

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_TIEPTAN') {
                let idUser = reToken[k]['IDNHANVIEN'];
                let getItem = req.body;
                let query = `insert into c##admin.benhnhan(tenbenhnhan, namsinh, diachi, sdt)
                                values (:ten, to_date(:ns, 'yyyy-mm-dd hh24:mi:ss'), :dc, :sdt)`
                let insert = await oracledb.setCheckDataOfUser(user, password, query,
                { 
                    ten: getItem['addNamePatient'],
                    ns: getItem['addDatePatient'],
                    dc: getItem['addRePatient'],
                    sdt: getItem['addPhonePatient']
                });

            
                res.redirect('/reception');

                break;
            }
        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.get('/reception/patient/:id/delete', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[7] == 0) {
            res.clearCookie('flag');
            res.redirect('/login');
        }

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_TIEPTAN') {
                let idPat = req.params.id || '';
                let query = `delete from C##ADMIN.benhnhan where idbenhnhan = :idbn`;
                let decode = await oracledb.setCheckDataOfUser(user, password, query, { idbn: idPat });
                res.redirect(`/reception`)

                break;
            }
        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.get('/reception/patient/:idPatient', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[7] == 0) {
            res.clearCookie('flag');
            res.redirect('/login');
        }

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_TIEPTAN') {
                let idPatient = req.params.idPatient || '', query;
                let idUser = reToken[k]['IDNHANVIEN'];

                query = `select tenbenhnhan from c##admin.benhnhan where idbenhnhan = ${idPatient}`;
                let patient = await oracledb.getCheckDataOfUser(user, password, query);

                if (patient.length == 0) {
                    res.render('404');
                }
                
                query = `select idnhanvien, tennhanvien from c##admin.nhanvien where lower(vaitro) = lower('Bác sĩ')`;
                let allDoctor = await oracledb.getCheckDataOfUser(user, password, query);

                res.render('reception-detail', { redir, idUser, idPatient, allDoctor, patient });
                break;
            }
        }
    } catch (error) {
        ///res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.post('/reception/patient/:idPatient', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[7] == 0) {
            res.clearCookie('flag');
            res.redirect('/login');
        }

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_TIEPTAN') {
                let idPatient = req.params.idPatient || '', query;
                let idUser = reToken[k]['IDNHANVIEN'];
                let getItem = req.body;

                query = `insert into c##admin.hosobenhan(idbenhnhan, bsdieutri, nvdieuphoi, tinhtrangbandau, ngaykham)
                            values (:idP, :idD, :idE, :st, to_date(:nk, 'yyyy-mm-dd hh24:mi:ss'))`;

                let insert = await oracledb.setCheckDataOfUser(user, password, query,
                { 
                    idP: idPatient,
                    idD: getItem['addDoctor'],
                    idE: idUser,
                    st: getItem['addStatus'],
                    nk: getItem['addDateExam']
                });
                res.redirect(`/reception/patient/${idPatient}`);
                break;
            }
        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.get('/finance', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[3] == 0) {
            res.clearCookie('flag');
            res.redirect('/login');
        }

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_KETOAN') {
                let idUser = reToken[k]['IDNHANVIEN'];
                let idEmp = req.query.idEmployee || '', nameEmp = req.query.nameEmployee || '';
                let isMon = req.cookies.month || '', isYear = req.cookies.year || '';
                let query = '';
                if (isMon != '' && isYear != '') {
                    query = `select nv.idnhanvien, nv.tennhanvien, nv.luong, count(*) as songay from c##admin.nhanvien nv, c##admin.chamcong cc
                                where cc.idnhanvien = nv.idnhanvien and to_char(ngaybatdau, 'mm') = '${isMon}'
                                and to_char(ngaybatdau, 'yyyy') = '${isYear}'`;
                    if (nameEmp != '') {
                        query += ` and c##admin.fn_convert_to_vn(lower(nv.tennhanvien)) like '%${setup.removeVietnameseTones(nameEmp.toLowerCase())}%'`;
                    }
                    else {
                        query += ` and 1 = 1`;
                    }
        
                    if (idEmp != '') {
                        query += ` and nv.idnhanvien like '%${idEmp}%'`;
                    }
                    else {
                        query += ` and 1 = 1`;
                    }
        
                    query += ` group by nv.idnhanvien, nv.tennhanvien, nv.luong order by nv.idnhanvien asc`;
                }

                let data = [];
                if (nameEmp != '' || idEmp != '') {
                    data = await oracledb.getCheckDataOfUser(user, password, query);
                }
                else {
                    query = `select nv.idnhanvien, nv.tennhanvien, c##admin.tinhluong(nv.idnhanvien, nv.luong, ${req.query['monSet']}, ${req.query['yearSet']}) as luong, count(*) as songay from c##admin.nhanvien nv, c##admin.chamcong cc
                                where cc.idnhanvien = nv.idnhanvien and to_char(ngaybatdau, 'mm') = '${req.query['monSet']}'
                                and to_char(ngaybatdau, 'yyyy') = '${req.query['yearSet']}'
                                group by nv.idnhanvien, nv.tennhanvien, nv.luong order by nv.idnhanvien asc`;
                    console.log(query);
                    data = await oracledb.getCheckDataOfUser(user, password, query);
                    //console.log(data);
                    setup.getMoney(data);
                }
                
                query = `select count(*) as sum from c##admin.nhanvien`;
                let numData = await oracledb.getCheckDataOfUser(user, password, query);

                let month = req.query.monSet || isMon, year = req.query.yearSet || isYear;
                res.cookie('month', month);
                res.cookie('year', year);

                res.render('finance-page', { redir, idUser, numData, data, month, year });
                break;
            }
        }
    } catch (error) {
        //res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.get('/finance/employee/:id', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[3] == 0) {
            res.clearCookie('flag');
            res.redirect('/login');
        }

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_KETOAN') {
                let idUser = reToken[k]['IDNHANVIEN'], idEmp = req.params.id || '', query = '';

                let isMon = req.cookies.month || '', isYear = req.cookies.year || '';
                if (isMon != '' && isYear != '') {
                    query = `select nv.idnhanvien, nv.tennhanvien, nv.luong, count(*) as songay from c##admin.nhanvien nv, c##admin.chamcong cc
                                where cc.idnhanvien = nv.idnhanvien and to_char(ngaybatdau, 'mm') = '${isMon}'
                                and to_char(ngaybatdau, 'yyyy') = '${isYear}'`;

                    if (idEmp != '') {
                        query += ` and nv.idnhanvien = '${idEmp}'`;
                    }
                    else {
                        query += ` and 1 = 1`;
                    }
        
                    query += ` group by nv.idnhanvien, nv.tennhanvien, nv.luong`;
                }

                let data = [];
                if (idEmp != '') {
                    data = await oracledb.getCheckDataOfUser(user, password, query);

                    if (data.length == 0) {
                        res.render('404');
                    }
                }
                
                let month = isMon || '', year = isYear || '';

                query = `select nv.idnhanvien, nv.tennhanvien, cc.idchamcong, cc.ngaybatdau from C##ADMIN.nhanvien nv, C##ADMIN.chamcong cc
                            where cc.idnhanvien = nv.idnhanvien and to_char(ngaybatdau, 'mm') = '${isMon}'
                            and to_char(ngaybatdau, 'yyyy') = '${isYear}' and nv.idnhanvien = '${idEmp}' order by cc.ngaybatdau asc`
                let fullData = await oracledb.getCheckDataOfUser(user, password, query);

                if (fullData.length == 0) {
                    res.render('404');
                }
                else {
                    setup.convertDate(fullData);

                    query = `select distinct c##admin.tinhluong(${idEmp}, nv.luong, ${month}, ${year}) as luong
                                from c##admin.nhanvien nv where nv.idnhanvien = ${idEmp}`;

                    let money = await oracledb.getCheckDataOfUser(user, password, query);
                    if (money.length > 0) {
                        setup.getMoney(money);
                    }

                    res.render('finance-detail', { redir, idUser, fullData, data, month, year, money });
                }
                
                break;
            }
        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.post('/finance/employee/:id/add', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[3] == 0) {
            res.clearCookie('flag');
            res.redirect('/login');
        }

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_KETOAN') {
                let idUser = reToken[k]['IDNHANVIEN'], idEmp = req.params.id || '', query = '';

                let getBody = req.body;
                console.log(getBody);
                query = `insert into c##admin.chamcong(idnhanvien, ngaybatdau, ngayketthuc) values(:idnv, to_date(:nbd, 'yyyy-mm-dd'), to_date(:nkt, 'yyyy-mm-dd'))`;
                let insert = await oracledb.setCheckDataOfUser(user, password, query, { idnv: idEmp, nbd: getBody['addStart'], nkt: getBody['addEnd'] });

                res.redirect(`/finance/employee/${idEmp}`);
                break;
            }
        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.post('/finance/employee/:id/fix', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[3] == 0) {
            res.clearCookie('flag');
            res.redirect('/login');
        }

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_KETOAN') {
                let idUser = reToken[k]['IDNHANVIEN'], idEmp = req.params.id || '', query = '';

                let getBody = req.body;
                console.log(getBody);
                query = `update c##admin.chamcong set ngaybatdau = to_date('${getBody['fixStart']}', 'yyyy-mm-dd'), ngayketthuc = to_date('${getBody['fixEnd']}', 'yyyy-mm-dd') where idchamcong = ${getBody['fixId']}`;
                console.log(query);
                let update = await oracledb.setCheckDataOfUser(user, password, query, { });
                console.log(update)
                res.redirect(`/finance/employee/${idEmp}`);
                break;
            }
        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.get('/finance/employee/:id/delete/:idDelete', async function (req, res, next) {
    try {
        let token = await req.cookies.flag;
        let reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['megreUser'];
        let user = 'C##' + reToken['userName'], password = reToken['passWord'];

        token = await req.cookies.is_;
        reToken = jwt.verify(token, 'abcd1234');
        reToken = reToken['getUser'];
        let redir = setup.getRedirect(reToken);

        if (redir[3] == 0) {
            res.clearCookie('flag');
            res.redirect('/login');
        }

        for (let k = 0; k < reToken.length; k++) {
            if (reToken[k]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_KETOAN') {
                let idEmp = req.params.id || '', idDelete = req.params.idDelete, query;

                query = `delete from c##admin.chamcong where idchamcong = :idcc`;
                let decode = await oracledb.setCheckDataOfUser(user, password, query, { idcc: idDelete });
                console.log(decode)
                res.redirect(`/finance/employee/${idEmp}`);
                break;
            }
        }
    } catch (error) {
        ///res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.post('/finance/employee/:id', async function (req, res, next) {
    try {
        let token = req.cookies.is_;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'] || '';
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        let idEmp = req.params.id || '';
        if (staff[0]['VAITRO'].toLowerCase() == 'NV Kế toán'.toLowerCase()) {
            let decode = await oracledb.getDataTest(`update C##ADMIN.nhanvien set luong = ${req.body.saEmployee} where idnhanvien = :idnv`, { idnv: idEmp });
            res.redirect(`/finance/employee/${idEmp}`)
        }
        else {
            res.clearCookie('flag');
            res.redirect('/login');
        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

module.exports = router;
