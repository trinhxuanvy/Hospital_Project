var express = require('express');
var oracledb = require('../backend/data');
var jwt = require('jsonwebtoken');
var setup = require('./setup');
const { query } = require('express');

var router = express.Router();

// GET home page
router.get('/', async function (req, res, next) {
    let idStaff = staff = '';
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
            idStaff = tokenIdUser.slice(tokenIdUser.length - 8, tokenIdUser.length);
            let reTokenIdUser = jwt.verify(tokenIdUser, 'vychuoi123');
            idStaff = reTokenIdUser['getId'];
            staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
            idStaff = tokenIdUser.slice(tokenIdUser.length - 8, tokenIdUser.length);
            if (staff.length > 0) {
                staff = staff[0]['VAITRO'].toLowerCase();
                console.log(staff);
            }
        }
        res.render('index', { idStaff, staff });
    } catch (error) {
        res.clearCookie('flag');
        res.render('index', { idStaff });
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
            let getUsername = await oracledb.getCheckData(`select idnhanvien, vaitro from C##ADMIN.NhanVien where username = '${user.toUpperCase()}'`);
            let getId = getUsername.length > 0 ? getUsername[0]['IDNHANVIEN'] : '';

            let tokenIdUser = jwt.sign({ getId }, 'vychuoi123', { algorithm: 'HS256', expiresIn: '1d' });
            let tokenMegreUser = jwt.sign({ megreUser }, 'vychuoi123', { algorithm: 'HS256', expiresIn: '1d' });
            
            res.cookie('is_', tokenIdUser);
            res.cookie('statusLogin', 'true');
            res.cookie('redirect', 'true');

            let roleUser = await getUsername.length > 0 ? getUsername[0]['VAITRO'] : '';

            if (roleUser == 'Bác sĩ') {
                res.redirect(`/doctor/patient/page-1`);
            }
            else if (roleUser.toLowerCase() == 'NV Kế Toán'.toLowerCase()) {
                res.redirect(`/finance`);
            }
            else if (roleUser.toLowerCase() == 'NV Bán Thuốc'.toLowerCase()) {
                res.redirect(`/phamarcy/bill-drug/page-1`);
            }
            else if (roleUser.toLowerCase() == 'NV Tài Vụ'.toLowerCase()) {
                res.redirect(`/`);
            }
            else if (roleUser.toLowerCase() == 'NV Điều Phối'.toLowerCase()) {
                res.redirect(`/reception`);
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

router.get('/doctor/patient/page-:number', async function (req, res, next) {
    try {
        let token = await req.cookies.is_;
        let getItem = req.query;
        let page = req.params.number;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'];
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        if (staff[0]['VAITRO'].toLowerCase() == 'Bác sĩ'.toLowerCase()) {
            if (page < 1) {
                page = 1;
            }
            let data, isSearch = 0, search;
            if ((search = getItem['search']) != null) {
                isSearch = 1;
                data = await oracledb.getCheckData(`select distinct bn.* from C##ADMIN.BENHNHAN bn, C##ADMIN.hosobenhan hsba where hsba.bsdieutri = ${idStaff} and hsba.idbenhnhan = bn.idbenhnhan and FN_CONVERT_TO_VN(lower(bn.TENBENHNHAN)) like '%${setup.removeVietnameseTones(getItem['search']).toLowerCase()}%' order by bn.IDBENHNHAN asc`);
            }
            else {
                data = await oracledb.getCheckData(`select distinct bn.*  from C##ADMIN.hosobenhan hsbn, C##ADMIN.benhnhan bn where hsbn.bsdieutri = ${idStaff} and hsbn.idbenhnhan = bn.idbenhnhan order by bn.idbenhnhan asc`);
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

            staff = staff[0]['VAITRO'].toLowerCase();
            idStaff = req.params.idStaff;
            res.render('doctor-page', { data, page, numPage, isSearch, search, idStaff, staff  });
        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }

});

router.post('/doctor/patient/page-:number', async function (req, res, next) {
    try {
        let token = await req.cookies.is_;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'];
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        if (staff[0]['VAITRO'].toLowerCase() == 'Bác sĩ'.toLowerCase()) {
            let hint = '';
            let search = req.body.query.toLowerCase();
            console.log(search);
            if (search.length > 0) {
                let data = await oracledb.getCheckData(`select distinct bn.* from C##ADMIN.BENHNHAN bn, C##ADMIN.hosobenhan hsba where hsba.bsdieutri = ${idStaff} and hsba.idbenhnhan = bn.idbenhnhan and FN_CONVERT_TO_VN(lower(bn.TENBENHNHAN)) like '%${setup.removeVietnameseTones(search)}%' order by bn.IDBENHNHAN asc`);
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
        let token = await req.cookies.is_;
        let id = req.params.id;
        let number = req.params.number;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'];
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        if (staff[0]['VAITRO'].toLowerCase() == 'Bác Sĩ'.toLowerCase()) {
            let check = await oracledb.getCheckData(`select * from C##ADMIN.hosobenhan hsba, C##ADMIN.donthuoc dt where hsba.idbenhnhan = ${id} and hsba.bsdieutri = ${idStaff} and hsba.idhosobenhan = dt.idhosobenhan and dt.iddonthuoc = ${number}`);

            if (isNaN(id * 1) != true && isNaN(number * 1) != true) {
                if (check.length != 0 || number == 0) {
                    let patient = await oracledb.getCheckData(`select distinct bn.*  from C##ADMIN.hosobenhan hsbn, C##ADMIN.benhnhan bn where hsbn.bsdieutri = ${idStaff} and hsbn.idbenhnhan = ${id} and hsbn.idbenhnhan = bn.idbenhnhan order by bn.idbenhnhan asc`);
                    if (patient.length == 0) {
                        res.render('404');
                    }
                    else {
                        let allFile = await oracledb.getCheckData(`select * from C##ADMIN.HOSOBENHAN where IDBENHNHAN = ${id} and bsdieutri = ${idStaff}`);
                        let bill = await oracledb.getCheckData(`select dt.* from C##ADMIN.HOSOBENHAN hs, C##ADMIN.DONTHUOC dt where dt.iDHOSOBENHAN = hs.IDHOSOBENHAN and hs.IDBENHNHAN = ${id} and hs.bsdieutri = ${idStaff} order by dt.iddonthuoc desc`);
                        let deDes = await oracledb.getCheckData(`select ctdt.*, t.TENTHUOC, t.DONVITINH from C##ADMIN.HOSOBENHAN hsba, C##ADMIN.donthuoc dt, C##ADMIN.CHITIETDONTHUOC ctdt, C##ADMIN.THUOC t
                        where hsba.IDHOSOBENHAN = dt.idhosobenhan and hsba.bsdieutri = ${idStaff} and dt.iddonthuoc = ctdt.iddonthuoc
                        and ctdt.IDDONTHUOC = ${number} and ctdt.IDTHUOC = t.IDTHUOC`);
                        let drug = await oracledb.getCheckData(`select * from C##ADMIN.THUOC order by tenthuoc`);
                        let cmtDoc = await oracledb.getCheckData(`select KETLUANBS from C##ADMIN.HOSOBENHAN hsba, C##ADMIN.DONTHUOC dt where hsba.bsdieutri = ${idStaff} and hsba.IDBENHNHAN = ${id} and hsba.IDHOSOBENHAN = dt.IDHOSOBENHAN and dt.IDDONTHUOC = ${number}`);

                        if (number == 0) {
                            //cmtDoc[0]['KETLUANBS'] = '';
                        }
                        if (cmtDoc.length == 0) {
                            cmtDoc = [];
                            cmtDoc.push({ KETLUANBS: '' });
                        }
                        idStaff = req.params.idStaff;

                        if (bill.length > 0)
                        {
                            setup.convertDate(bill);
                        }

                        staff = staff[0]['VAITRO'].toLowerCase();
                        res.render('prescription', { drug, id, allFile, deDes, number, cmtDoc, patient, bill, idStaff, staff });
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

router.post('/doctor/patient/:id/bill-drug/:number', async function (req, res, next) {
    try {
        let token = await req.cookies.is_;
        let id = req.params.id;
        let number = req.params.number;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'];
        let reqBody = req.body;
        let idDrug = [], numberUse = [], idFile = [], idNewDrug = [], numberNewUse = [], diagnose = '';
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        if (staff[0]['VAITRO'].toLowerCase() == 'Bác Sĩ'.toLowerCase()) {
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
                    let insert = await oracledb.getDataTest(`insert into C##ADMIN.DONTHUOC(IDHOSOBENHAN, NGAYTAO) values (:idhsba, ${strDate})`,
                        { idhsba: idbn });
                }
            }
            let check = await oracledb.getCheckData(`select * from C##ADMIN.hosobenhan hsba, C##ADMIN.donthuoc dt where hsba.idbenhnhan = ${id} and hsba.bsdieutri = ${idStaff} and hsba.idhosobenhan = dt.idhosobenhan and dt.iddonthuoc = ${number}`);

            if (check.length != 0 || number != 0) {
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
            idStaff = req.params.idStaff;
            res.redirect(`/doctor/patient/${id}/bill-drug/${number}`);
        }
        else{
            res.clearCookie('flag');
            res.redirect('/login');
        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }

});

router.get('/phamarcy/bill-drug/page-:number', async function (req, res, next) {
    try {
        let token = await req.cookies.is_;
        let getItem = req.query;
        let page = req.params.number;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'];
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        if (staff[0]['VAITRO'].toLowerCase() == 'NV Bán Thuốc'.toLowerCase()) {
            let data, isSearch = 0, search;
            if ((search = getItem['search']) != null) {
                isSearch = 1;
                data = await oracledb.getCheckData(`select dt.*, bn.*, to_date(dt.ngaytao, 'YYYY-MM-DD') as ngay from C##ADMIN.donthuoc dt, C##ADMIN.hosobenhan hsba, C##ADMIN.benhnhan bn
                where dt.idhosobenhan = hsba.idhosobenhan and hsba.idbenhnhan = bn.idbenhnhan and IDDONTHUOC like '%${setup.removeVietnameseTones(search)}%'
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

            staff = staff[0]['VAITRO'].toLowerCase();
            res.render('phamarcy-page', { data, page, numPage, isSearch, search, staff, idStaff });
        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }

});

router.post('/phamarcy/bill-drug/page-:number', async function (req, res, next) {
    try {
        let token = await req.cookies.is_;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'];
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        if (staff[0]['VAITRO'].toLowerCase() == 'NV Bán Thuốc'.toLowerCase()) {
            let hint = '';
            let search = req.body.query.toLowerCase();
            if (search.length > 0) {
                let data = await oracledb.getCheckData(`select dt.*, bn.*, to_date(dt.ngaytao, 'YYYY-MM-DD') as ngay from C##ADMIN.donthuoc dt, C##ADMIN.hosobenhan hsba, C##ADMIN.benhnhan bn
                where dt.idhosobenhan = hsba.idhosobenhan and hsba.idbenhnhan = bn.idbenhnhan and IDDONTHUOC like '%${setup.removeVietnameseTones(search)}%'
                order by dt.iddonthuoc desc`);
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
        }
    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }
});

router.get('/phamarcy/bill-drug/page-:number/:id', async function (req, res, next) {
    try {
        let token = await req.cookies.is_;
        let page = req.params.number;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'];
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        if (staff[0]['VAITRO'].toLowerCase() == 'NV Bán Thuốc'.toLowerCase()) {
            let data, isSearch = 0, search;
            data = await oracledb.getCheckData(`select ctdt.*, t.*, bn.*, to_date(dt.ngaytao) as ngay from C##ADMIN.chitietdonthuoc ctdt, C##ADMIN.donthuoc dt, C##ADMIN.hosobenhan hsba, C##ADMIN.benhnhan bn, C##ADMIN.thuoc t
            where ctdt.iddonthuoc = dt.iddonthuoc and dt.idhosobenhan = hsba.idhosobenhan and hsba.idbenhnhan = bn.idbenhnhan and t.idthuoc = ctdt.idthuoc
            and ctdt.iddonthuoc = 100 order by idchitietdonthuoc desc`);
            setup.convertDate(data);
            idStaff = req.params.idStaff;
            staff = staff[0]['VAITRO'].toLowerCase();
            res.render('prescription-details', { data, page, idStaff, staff });
        }

    } catch (error) {
        res.clearCookie('flag');
        res.redirect('/login');
    }

});

router.get('/reception', async function (req, res, next) {
    try {
        let token = req.cookies.is_;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'] || '';
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        let datePatient = req.query.datePatient || '';
        let namePatient = req.query.namePatient || '';
        if (staff[0]['VAITRO'].toLowerCase() == 'NV Điều phối'.toLowerCase()) {
            let query = `select * from C##ADMIN.benhnhan where `;
            if (namePatient != '') {
                query += `fn_convert_to_vn(lower(tenbenhnhan)) like '%${setup.removeVietnameseTones(namePatient.toLowerCase())}%'`;
            }
            else {
                query += `1 = 1`;
            }

            if (datePatient != '') {
                query += ` and trunc(namsinh) = TO_DATE('${datePatient}','yyyy-mm-dd')`;
            }
            else {
                query += ` and 1 = 1`;
            }

            query += ` order by idbenhnhan desc`;
            let data = [];
            if (namePatient != '' || datePatient != '') {
                data = await oracledb.getCheckData(query);
            }
            
            let numData = await oracledb.getCheckData(`select count(*) as sum from C##ADMIN.benhnhan`);

            setup.convertDate(data);
            staff = staff[0]['VAITRO'].toLowerCase();
            res.render('reception-page', { idStaff, staff, numData, data });
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

router.post('/reception', async function (req, res, next) {
    try {
        let token = req.cookies.is_;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'] || '';
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        let getItem = req.body;
        if (staff[0]['VAITRO'].toLowerCase() == 'NV Điều phối'.toLowerCase()) {
            let insert = await oracledb.getDataTest(`insert into C##ADMIN.benhnhan(tenbenhnhan, namsinh, diachi, sdt) values (:ten, to_date(:ns, 'yyyy-mm-dd hh24:mi:ss'), :dc, :sdt)`,
            { ten: getItem['addNamePatient'], ns: getItem['addDatePatient'], dc: getItem['addRePatient'], sdt: getItem['addPhonePatient'] });

            
            res.redirect('/reception');
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

router.get('/reception/patient/:id/delete', async function (req, res, next) {
    try {
        let token = req.cookies.is_;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'] || '';
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        let idPat = req.params.id || '';
        console.log(idPat)
        if (staff[0]['VAITRO'].toLowerCase() == 'NV Điều phối'.toLowerCase()) {
            let decode = await oracledb.getDataTest(`delete from C##ADMIN.benhnhan where idbenhnhan = :idbn`, { idbn: idPat });
            res.redirect(`/reception`)
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

router.get('/reception/patient/:idPatient', async function (req, res, next) {
    try {
        let token = req.cookies.is_;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'] || '';
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        let idPatient = req.params.idPatient || '';
        if (staff[0]['VAITRO'].toLowerCase() == 'NV Điều phối'.toLowerCase()) {
            let patient = await oracledb.getCheckData(`select tenbenhnhan from C##ADMIN.benhnhan where idbenhnhan = ${idPatient}`)
            let allDoctor = await oracledb.getCheckData(`select idnhanvien, tennhanvien from C##ADMIN.nhanvien where lower(vaitro) = lower('Bác sĩ')`);

            staff = staff[0]['VAITRO'].toLowerCase();
            res.render('reception-detail', { idStaff, staff, idPatient, allDoctor, patient });
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

router.post('/reception/patient/:idPatient', async function (req, res, next) {
    try {
        let token = req.cookies.is_;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'] || '';
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        let getItem = req.body;
        let idPatient = req.params.idPatient;
        if (staff[0]['VAITRO'].toLowerCase() == 'NV Điều phối'.toLowerCase()) {
            let insert = await oracledb.getDataTest(`insert into C##ADMIN.hosobenhan(idbenhnhan, bsdieutri, nvdieuphoi, tinhtrangbandau, ngaykham) values (:idP, idD, idE, :st, to_date(:nk, 'yyyy-mm-dd hh24:mi:ss'))`,
            { idP: req.params.idPatient, idD: getItem['addDoctor'], idE: staff, st: getItem['addStatus'], nk: getItem['addDateExam'] });
            res.redirect(`/reception/patient/${idPatient}`);
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

router.get('/finance', async function (req, res, next) {
    try {
        let token = req.cookies.is_;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'] || '';
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        let idEmp = req.query.idEmployee || '';
        let nameEmp = req.query.nameEmployee || '';
        if (staff[0]['VAITRO'].toLowerCase() == 'NV Kế toán'.toLowerCase()) {
            let isMon = req.cookies.month || '', isYear = req.cookies.year || '';
            let query = '';
            if (isMon != '' && isYear != '') {
                query = `select nv.idnhanvien, nv.tennhanvien, nv.luong, count(*) as songay from C##ADMIN.nhanvien nv, C##ADMIN.chamcong cc
                where cc.idnhanvien = nv.idnhanvien and to_char(ngaybatdau, 'mm') = '${isMon}'
                and to_char(ngaybatdau, 'yyyy') = '${isYear}'`;
                if (nameEmp != '') {
                    query += ` and fn_convert_to_vn(lower(nv.tennhanvien)) like '%${setup.removeVietnameseTones(nameEmp.toLowerCase())}%'`;
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
            console.log(query)
            let data = [];
            if (nameEmp != '' || idEmp != '') {
                data = await oracledb.getCheckData(query);
                console.log(data);
            }
            else {
                data = await oracledb.getCheckData(`select nv.idnhanvien, nv.tennhanvien, nv.luong, count(*) as songay from C##ADMIN.nhanvien nv, C##ADMIN.chamcong cc
                where cc.idnhanvien = nv.idnhanvien and to_char(ngaybatdau, 'mm') = '${req.query['monSet']}'
                and to_char(ngaybatdau, 'yyyy') = '${req.query['yearSet']}'
                group by nv.idnhanvien, nv.tennhanvien, nv.luong order by nv.idnhanvien asc`)
            }
            
            let numData = await oracledb.getCheckData(`select count(*) as sum from C##ADMIN.nhanvien`);
            let month = req.query.monSet || isMon, year = req.query.yearSet || isYear;
            res.cookie('month', month);
            res.cookie('year', year);
            staff = staff[0]['VAITRO'].toLowerCase();
            res.render('finance-page', { idStaff, staff, numData, data, month, year });
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

router.get('/finance/employee/:id', async function (req, res, next) {
    try {
        let token = req.cookies.is_;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'] || '';
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        let idEmp = req.params.id || '';
        if (staff[0]['VAITRO'].toLowerCase() == 'NV Kế toán'.toLowerCase()) {
            let isMon = req.cookies.month || '', isYear = req.cookies.year || '';
            let query = '';
            if (isMon != '' && isYear != '') {
                query = `select nv.idnhanvien, nv.tennhanvien, nv.luong, count(*) as songay from C##ADMIN.nhanvien nv, C##ADMIN.chamcong cc
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
                data = await oracledb.getCheckData(query);
                console.log(data);
            }
            
            let month = isMon || '', year = isYear || '';

            let fullData = await oracledb.getCheckData(`select nv.idnhanvien, nv.tennhanvien, cc.idchamcong, cc.ngaybatdau from C##ADMIN.nhanvien nv, C##ADMIN.chamcong cc
            where cc.idnhanvien = nv.idnhanvien and to_char(ngaybatdau, 'mm') = '${isMon}'
            and to_char(ngaybatdau, 'yyyy') = '${isYear}' and nv.idnhanvien = '${idEmp}'`);
            setup.convertDate(fullData);
            staff = staff[0]['VAITRO'].toLowerCase();
            res.render('finance-detail', { idStaff, staff, fullData, data, month, year });
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

router.get('/finance/employee/:id/delete/:idDelete', async function (req, res, next) {
    try {
        let token = req.cookies.is_;
        let reToken = jwt.verify(token, 'vychuoi123');
        let idStaff = reToken['getId'] || '';
        let staff = await oracledb.getCheckData(`select vaitro from C##ADMIN.NhanVien where IDNHANVIEN = ${idStaff}`);
        let idEmp = req.params.id || '';
        let idDelete = req.params.idDelete;
        if (staff[0]['VAITRO'].toLowerCase() == 'NV Kế toán'.toLowerCase()) {
            let decode = await oracledb.getDataTest(`delete from C##ADMIN.chamcong where idchamcong = :idcc`, { idcc: idDelete });
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
