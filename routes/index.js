var express = require('express');
var oracledb = require('../backend/data');
var jwt = require('jsonwebtoken');
var setup = require('./setup');
const { render } = require('ejs');

var router = express.Router();

// GET home page
router.get('/', async function (req, res, next) {
  res.render('index');
});

// GET login page
router.get('/login', async function (req, res, next) {
  let statusLogin = await req.cookies.statusLogin;

  res.render('login', { statusLogin });
});

// POST and check user
router.post('/admin/user', async function (req, res, next) {
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

      let tokenMegreUser = jwt.sign({ megreUser }, 'vychuoi123', { algorithm: 'HS256', expiresIn: '1h' });
      res.cookie('flag', tokenMegreUser);
      res.cookie('statusLogin', 'true');
      res.cookie('redirect', 'true');
      res.redirect('/admin/user');
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
    //setup.getUserNameObject(getUser);
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

router.get('/admin/logout', function (req, res, next) {
  res.clearCookie('flag');
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

router.get('/page/doctor', async function (req, res, next) {
  let getItem = '';
  getItem = req.query;
  let data;
  if (getItem != '') {
    data = await oracledb.getData(`select * from C##ADMIN.BENHNHAN where FN_CONVERT_TO_VN(lower(TENBENHNHAN)) like '%${setup.removeVietnameseTones(getItem['search']).toLowerCase()}%'`);
  }
  else {
    data = await oracledb.getData(`select * from C##ADMIN.BENHNHAN`);
  }
    data = data.slice(0, 8);
  res.render('doctor-page', { data });
});

module.exports = router;
