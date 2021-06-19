var express = require('express');
var oracledb = require('../backend/data');
var jwt = require('jsonwebtoken');
var setup = require('./setup');

var router = express.Router();

// GET home page
router.get('/', async function (req, res, next) {
    let iddoctor = staff = '';
    try {
        let tokenIdUser = await req.cookies.is_;
        let isCheck = jwt.verify(tokenIdUser, 'vychuoi123', function (err, result) {
            if (err) {
                return 0;
            }
            else {
                return result;
            }
        });
        if (isCheck == 0) {
            res.clearCookie('flag');
        }
        else {
            iddoctor = tokenIdUser.slice(tokenIdUser.length - 8, tokenIdUser.length);
            let reTokenIdUser = jwt.verify(tokenIdUser, 'vychuoi123');
            iddoctor = reTokenIdUser['getId'];
            staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${iddoctor}`);
            iddoctor = tokenIdUser.slice(tokenIdUser.length - 8, tokenIdUser.length);
            if (staff.length > 0) {
                staff = staff[0]['VAITRO'].toLowerCase();
                console.log(staff);
            }
        }
        res.render('index', { iddoctor, staff });
    } catch (error) {
        res.clearCookie('flag');
        res.render('index', { iddoctor });
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
            console.log(user.length);
            let getUsername = await oracledb.getCheckData(`select idnhanvien, vaitro from C##ADMIN.NhanVien where username = '${user.toUpperCase()}'`);
            let getId = getUsername.length > 0 ? getUsername[0]['IDNHANVIEN'] : '';

            let tokenIdUser = jwt.sign({ getId }, 'vychuoi123', { algorithm: 'HS256', expiresIn: '1d' });
            let tokenMegreUser = jwt.sign({ megreUser }, 'vychuoi123', { algorithm: 'HS256', expiresIn: '1d' });
            res.cookie('is_', tokenIdUser);
            res.cookie('statusLogin', 'true');
            res.cookie('redirect', 'true');

            let sliceToken = tokenIdUser.slice(tokenIdUser.length - 8, tokenIdUser.length);
            console.log(sliceToken);
            let roleUser = await getUsername.length > 0 ? getUsername[0]['VAITRO'] : '';
            if (roleUser == 'Bác sĩ') {
                res.redirect(`/doctor/${sliceToken}/patient/page-1`);
            }
            else if (roleUser.toLowerCase() == 'NV Kế Toán'.toLowerCase()) {
                res.redirect(`/`);
            }
            else if (roleUser.toLowerCase() == 'NV Bán Thuốc'.toLowerCase()) {
                res.redirect(`/phamarcy/${sliceToken}/drug-bill/page-1`);
            }
            else if (roleUser.toLowerCase() == 'NV Tài Vụ'.toLowerCase()) {
                res.redirect(`/`);
            }
            else if (roleUser.toLowerCase() == 'NV Điều Phối'.toLowerCase()) {
                res.redirect(`/`);
            }
            else if (roleUser.toLowerCase() == 'Quản Lý'.toLowerCase()) {
                res.redirect(`/`);
            }
            else if (roleUser.toLowerCase() == 'NV Dịch Vụ'.toLowerCase()) {
                res.redirect(`/`);
            }
            else {
                res.cookie('flag', tokenMegreUser);
                res.redirect('/admin/user');
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
    let check = req.cookies.check;
    let reCheck = '';
    let isCheck = '';
    let view = '';

    if (check != '') {
        reCheck = jwt.verify(check, 'Vychuoi123', function (err, decoded) {
            return err ? '' : decoded;
        });

        isCheck = function (err) {
            try {
                return reCheck.view[0]['USERNAME'];
            } catch (error) {
                return '';
            }
        };

        view = function () {
            try {
                return reCheck.view[0];
            } catch (error) {
                return '';
            }
        };
    }

    let flag = req.cookies.flag;
    let tokenFlag = jwt.verify(flag, 'vychuoi123', function (err, result) {
        if (err) {
            return 0;
        }
        else {
            return 1;
        }
    });

    if (tokenFlag != 0) {
        let getUser = await oracledb.getCheckData(`select idnhanvien, username, tennhanvien, vaitro from C##ADMIN.NHANVIEN`);
        res.render('user', { user: getUser, isCheck: isCheck(), view: view() });
    }
    else {
        res.redirect('/login');
    }
});

router.get('/admin/user/:username/detail/:tablename', async function (req, res, next) {
    let flag = req.cookies.flag;
    let tokenFlag = jwt.verify(flag, 'vychuoi123', function (err, result) {
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
        if (tableName == 'role') {
            // Lấy role
            fullRole = await oracledb.getAllRole(setup.setUserName(user).toUpperCase());
            // Tạo biến typeR
            res.cookie('typeR', 1);
            type = 1;
        }
        else if ((pos = oracledb.allTable.indexOf(tableName.toUpperCase())) > -1) {
            tableHasSign = oracledb.allTableHasSign[pos];
            allRole = await oracledb.getAllRoleTable(setup.setUserName(user).toUpperCase(), tableName.toUpperCase());
            // Tạo biến typeR
            res.cookie('typeR', 2);
            type = 2;
        }
        else if (tableName.indexOf('col') > -1) {
            arrColRol = await oracledb.getAllRoleCol(setup.setUserName(user).toUpperCase(), tableName);
            res.cookie('typeR', 3);
            type = 3;
        }
        let saveSuccess = await req.cookies.saveSuccess;
        let message = await req.cookies.message;

        res.cookie('message', '');
        res.render('user-role', { user, saveSuccess, message, fullRole, allRole, tableName, tableHasSign, type, arrColRol });
    }
    else {
        res.redirect('/login');
    }
});

router.post('/admin/user/:username/detail/:tablename', async function (req, res, next) {
    let getIn = req.body,
        tableName = req.params.tablename,
        userName = req.params.username,
        typeRole = req.cookies.typeR,
        arrCol, arrDML;
    if (typeRole == 1) {
        let arr = setup.getRole(getIn);
        try {
            let run = await oracledb.setUpdateRole(setup.setUserName(userName).toUpperCase(), arr);
            res.cookie('saveSuccess', true);
        } catch (error) {
            res.cookie('saveSuccess', false);
        }
    }
    else if (typeRole == 2) {
        let arr = setup.getTableArrDML(getIn);
        try {
            let decode = await oracledb.setUpdateRoleTable(setup.setUserName(userName).toUpperCase(), tableName.toUpperCase(), arr);
            res.cookie('saveSuccess', true);
        } catch (error) {
            res.cookie('saveSuccess', false);
        }
    }
    else if (typeRole == 3) {
        arrDML = setup.getArrDML(getIn);
        let run = await oracledb.setUpdateRolCol(setup.setUserName(userName).toUpperCase(), tableName.toUpperCase(), arrDML);
    }

    res.cookie('message', true);
    res.redirect(`${req.params.tablename}`);
});

router.get('/logout', function (req, res, next) {
    res.clearCookie('flag');
    res.clearCookie('is_');
    res.redirect('/login');
});

router.get('/admin/user/:username/info', async function (req, res, next) {
    let user = req.params.username;
    let query = `select * from C##ADMIN.NHANVIEN where USERNAME = '${user}'`;
    let view = await oracledb.getData(query);
    let token = jwt.sign({ view }, 'Vychuoi123', { algorithm: 'HS256', expiresIn: '3h' })
    res.cookie('check', token);
    res.redirect(`/admin/user/${user}/detail/role`);
});

router.get('/doctor/:iddoctor/patient/page-:number', async function (req, res, next) {
    try {
        let tokenIdUser = await req.cookies.is_;
        let getItem = req.query;
        let iddoctor = req.params.iddoctor;
        let page = req.params.number;
        if (tokenIdUser.slice(tokenIdUser.length - 8, tokenIdUser.length) == iddoctor) {
            let reTokenIdUser = jwt.verify(tokenIdUser, 'vychuoi123');
            iddoctor = reTokenIdUser['getId'];
            let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${iddoctor}`);
            if (staff[0]['VAITRO'].toLowerCase() == 'Bác sĩ'.toLowerCase()) {
                if (page < 1) {
                    page = 1;
                }
                let data, isSearch = 0, search;
                if ((search = getItem['search']) != null) {
                    isSearch = 1;
                    data = await oracledb.getCheckData(`select distinct bn.* from C##ADMIN.BENHNHAN bn, C##ADMIN.hosobenhan hsba where hsba.bsdieutri = ${iddoctor} and hsba.idbenhnhan = bn.idbenhnhan and FN_CONVERT_TO_VN(lower(bn.TENBENHNHAN)) like '%${setup.removeVietnameseTones(getItem['search']).toLowerCase()}%' order by bn.IDBENHNHAN asc`);
                }
                else {
                    data = await oracledb.getCheckData(`select distinct bn.*  from C##ADMIN.hosobenhan hsbn, C##ADMIN.benhnhan bn where hsbn.bsdieutri = ${iddoctor} and hsbn.idbenhnhan = bn.idbenhnhan order by bn.idbenhnhan asc`);
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
                iddoctor = req.params.iddoctor;
                res.render('doctor-page', { data, page, numPage, isSearch, search, iddoctor });
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

router.post('/doctor/:iddoctor/patient/page-:number', async function (req, res, next) {
    let iddoctor = req.params.iddoctor;
    res.redirect(`/doctor/${iddoctor}/patient/page-${req.params.number}`);
});

router.get('/doctor/:iddoctor/patient/:id/bill-drug/:number', async function (req, res, next) {
    try {
        let tokenIdUser = await req.cookies.is_;
        let iddoctor = req.params.iddoctor;
        let id = req.params.id;
        let number = req.params.number;
        if (tokenIdUser.slice(tokenIdUser.length - 8, tokenIdUser.length) == iddoctor) {
            let reTokenIdUser = jwt.verify(tokenIdUser, 'vychuoi123');
            iddoctor = reTokenIdUser['getId'];

            let check = await oracledb.getCheckData(`select * from C##ADMIN.hosobenhan hsba, C##ADMIN.donthuoc dt where hsba.idbenhnhan = ${id} and hsba.bsdieutri = ${iddoctor} and hsba.idhosobenhan = dt.idhosobenhan and dt.iddonthuoc = ${number}`);

            if (isNaN(id * 1) != true && isNaN(number * 1) != true) {
                if (check.length != 0 || number == 0) {
                    let patient = await oracledb.getCheckData(`select distinct bn.*  from C##ADMIN.hosobenhan hsbn, C##ADMIN.benhnhan bn where hsbn.bsdieutri = ${iddoctor} and hsbn.idbenhnhan = ${id} and hsbn.idbenhnhan = bn.idbenhnhan order by bn.idbenhnhan asc`);
                    if (patient.length == 0) {
                        res.render('404');
                    }
                    else {
                        let allFile = await oracledb.getCheckData(`select * from C##ADMIN.HOSOBENHAN where IDBENHNHAN = ${id} and bsdieutri = ${iddoctor}`);
                        let bill = await oracledb.getCheckData(`select dt.* from C##ADMIN.HOSOBENHAN hs, C##ADMIN.DONTHUOC dt where dt.iDHOSOBENHAN = hs.IDHOSOBENHAN and hs.IDBENHNHAN = ${id} and hs.bsdieutri = ${iddoctor} order by dt.iddonthuoc desc`);
                        let deDes = await oracledb.getCheckData(`select ctdt.*, t.TENTHUOC, t.DONVITINH from C##ADMIN.HOSOBENHAN hsba, C##ADMIN.donthuoc dt, C##ADMIN.CHITIETDONTHUOC ctdt, C##ADMIN.THUOC t
            where hsba.IDHOSOBENHAN = dt.idhosobenhan and hsba.bsdieutri = ${iddoctor} and dt.iddonthuoc = ctdt.iddonthuoc
            and ctdt.IDDONTHUOC = ${number} and ctdt.IDTHUOC = t.IDTHUOC`);
                        let drug = await oracledb.getCheckData(`select * from C##ADMIN.THUOC order by tenthuoc`);
                        let cmtDoc = await oracledb.getCheckData(`select KETLUANBS from C##ADMIN.HOSOBENHAN hsba, C##ADMIN.DONTHUOC dt where hsba.bsdieutri = ${iddoctor} and hsba.IDBENHNHAN = ${id} and hsba.IDHOSOBENHAN = dt.IDHOSOBENHAN and dt.IDDONTHUOC = ${number}`);
                        console.log(cmtDoc)
                        if (number == 0) {
                            //cmtDoc[0]['KETLUANBS'] = '';
                        }
                        if (cmtDoc.length == 0) {
                            cmtDoc = [];
                            cmtDoc.push({ KETLUANBS: '' });
                        }
                        iddoctor = req.params.iddoctor;
                        res.render('prescription', { drug, id, allFile, deDes, number, cmtDoc, patient, bill, iddoctor });
                    }
                }
                else {
                    res.render('404');
                }
            }
            else {
                res.render('404');
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

router.post('/doctor/:iddoctor/patient/:id/bill-drug/:number', async function (req, res, next) {
    try {
        let tokenIdUser = await req.cookies.is_;
        let iddoctor = req.params.iddoctor;
        let id = req.params.id;
        let number = req.params.number;
        if (tokenIdUser.slice(tokenIdUser.length - 8, tokenIdUser.length) == iddoctor) {
            let reTokenIdUser = jwt.verify(tokenIdUser, 'vychuoi123');
            iddoctor = reTokenIdUser['getId'];

            let reqBody = req.body;
            let idDrug = [], numberUse = [], idFile = [], idNewDrug = [], numberNewUse = [], diagnose = '';
            let count = 0;
            console.log(reqBody)
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
                    console.log(strDate)
                    let insert = await oracledb.getDataTest(`insert into C##ADMIN.DONTHUOC(IDHOSOBENHAN, NGAYTAO) values (:idhsba, ${strDate})`,
                        { idhsba: idbn });
                }
            }
            let check = await oracledb.getCheckData(`select * from C##ADMIN.hosobenhan hsba, C##ADMIN.donthuoc dt where hsba.idbenhnhan = ${id} and hsba.bsdieutri = ${iddoctor} and hsba.idhosobenhan = dt.idhosobenhan and dt.iddonthuoc = ${number}`);

            if (check.length != 0 || number == 0) {
                for (let i = 0; i < idDrug.length; i++) {
                    let update = await oracledb.getDataTest(`update C##ADMIN.CHITIETDONTHUOC set IDTHUOC = :idt, SOLUONG = :sl 
          where IDCHITIETDONTHUOC = :idct`,
                        { idt: idDrug[i], sl: numberUse[i], idct: idFile[i] });
                }

                for (let i = 0; i < idNewDrug.length; i++) {
                    let insert = await oracledb.getDataTest(`insert into C##ADMIN.chitietdonthuoc(IDDONTHUOC, IDTHUOC, SOLUONG) values (:iddt, :idt, :sl)`,
                        { iddt: number, idt: idNewDrug[i], sl: numberNewUse[i] });
                }

                let paFile = await oracledb.getCheckData(`select IDHOSOBENHAN from C##ADMIN.DONTHUOC where IDDONTHUOC = ${number}`);
                if (diagnose != '' && paFile.length > 0) {
                    let update = await oracledb.getDataTest(`update C##ADMIN.HOSOBENHAN set KETLUANBS = :kl
          where IDHOSOBENHAN = :idhsba`,
                        { kl: diagnose, idhsba: paFile[0]['IDHOSOBENHAN'] });
                }
            }
            iddoctor = req.params.iddoctor;
            res.redirect(`/doctor/${iddoctor}/patient/${id}/bill-drug/${number}`);
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

router.get('/phamarcy/:iddoctor/drug-bill/page-:number', async function (req, res, next) {
    try {
        let tokenIdUser = await req.cookies.is_;
        let getItem = req.query;
        let iddoctor = req.params.iddoctor;
        let page = req.params.number;
        if (tokenIdUser.slice(tokenIdUser.length - 8, tokenIdUser.length) == iddoctor) {
            let reTokenIdUser = jwt.verify(tokenIdUser, 'vychuoi123');
            iddoctor = reTokenIdUser['getId'];
            let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${iddoctor}`);
            if (staff[0]['VAITRO'].toLowerCase() == 'NV Bán Thuốc'.toLowerCase()) {
                if (page < 1) {
                    page = 1;
                }
                let data, isSearch = 0, search;
                if ((search = getItem['search']) != null) {
                    isSearch = 1;
                    data = await oracledb.getCheckData(`select dt.*, bn.*, to_date(dt.ngaytao, 'YYYY-MM-DD') as ngay from C##ADMIN.donthuoc dt, C##ADMIN.hosobenhan hsba, C##ADMIN.benhnhan bn
                    where dt.idhosobenhan = hsba.idhosobenhan and hsba.idbenhnhan = bn.idbenhnhan and IDDONTHUOC like '${setup.removeVietnameseTones(search)}'
                    order by dt.iddonthuoc desc`);
                }
                else {
                    data = await oracledb.getCheckData(`select dt.*, bn.*, to_date(dt.ngaytao) as ngaytao from C##ADMIN.donthuoc dt, C##ADMIN.hosobenhan hsba, C##ADMIN.benhnhan bn
                    where dt.idhosobenhan = hsba.idhosobenhan and hsba.idbenhnhan = bn.idbenhnhan
                    order by dt.iddonthuoc desc`);
                }

                if (data.length != 0) {
                    setup.convertDate(data);
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
                iddoctor = req.params.iddoctor;
                res.render('phamarcy-page', { data, page, numPage, isSearch, search, iddoctor });
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

router.post('/phamarcy/:iddoctor/drug-bill/page-:number', async function (req, res, next) {
    try {
        let tokenIdUser = await req.cookies.is_;
        let getItem = req.query;
        let iddoctor = req.params.iddoctor;
        let page = req.params.number;
        if (tokenIdUser.slice(tokenIdUser.length - 8, tokenIdUser.length) == iddoctor) {
            let reTokenIdUser = jwt.verify(tokenIdUser, 'vychuoi123');
            iddoctor = reTokenIdUser['getId'];
            let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${iddoctor}`);
            if (staff[0]['VAITRO'].toLowerCase() == 'NV Bán Thuốc'.toLowerCase()) {
                let hint = '';
                let response = '';
                let search = req.body.query.toLowerCase();
                if (search.length > 0) {
                    let data = await oracledb.getCheckData(`select dt.*, bn.*, to_date(dt.ngaytao, 'YYYY-MM-DD') as ngay from C##ADMIN.donthuoc dt, C##ADMIN.hosobenhan hsba, C##ADMIN.benhnhan bn
                    where dt.idhosobenhan = hsba.idhosobenhan and hsba.idbenhnhan = bn.idbenhnhan and IDDONTHUOC like '%${setup.removeVietnameseTones(search)}%'
                    order by dt.iddonthuoc desc`);
                    if (data.length > 0) {
                        data = data.slice(0, 6);
                        for (let i = 0; i < data.length; i++) {
                            hint += `<a href="/phamarcy/${req.params.iddoctor}/drug-bill/page-${req.params.number}/${data[i]['IDDONTHUOC']}" class="link-item-search">${data[i]['IDDONTHUOC']}</a>`;
                        }
                    }
                    else {
                        hint += `<p class="link-item-search">Không tìm thấy</p>`;
                    }
                    res.send(hint);
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

router.get('/phamarcy/:iddoctor/drug-bill/page-:number/:id', async function (req, res, next) {
    try {
        let tokenIdUser = await req.cookies.is_;
        let getItem = req.query;
        let iddoctor = req.params.iddoctor;
        let page = req.params.number;
        if (tokenIdUser.slice(tokenIdUser.length - 8, tokenIdUser.length) == iddoctor) {
            let reTokenIdUser = jwt.verify(tokenIdUser, 'vychuoi123');
            iddoctor = reTokenIdUser['getId'];
            let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${iddoctor}`);
            if (staff[0]['VAITRO'].toLowerCase() == 'NV Bán Thuốc'.toLowerCase()) {
                let data, isSearch = 0, search;
                data = await oracledb.getCheckData(`select ctdt.*, t.*, bn.*, to_date(dt.ngaytao) as ngay from C##ADMIN.chitietdonthuoc ctdt, C##ADMIN.donthuoc dt, C##ADMIN.hosobenhan hsba, C##ADMIN.benhnhan bn, C##ADMIN.thuoc t
                where ctdt.iddonthuoc = dt.iddonthuoc and dt.idhosobenhan = hsba.idhosobenhan and hsba.idbenhnhan = bn.idbenhnhan and t.idthuoc = ctdt.idthuoc
                and ctdt.iddonthuoc = 100 order by idchitietdonthuoc desc`);
                setup.convertDate(data);
                console.log(data);
                iddoctor = req.params.iddoctor;
                res.render('prescription-details', { data, page, iddoctor });
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

module.exports = router;
