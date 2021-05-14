var express = require('express');
var oracledb = require('../backend/data');
var jwt = require('jsonwebtoken');
var setup = require('./setup');
const { allTable } = require('../backend/data');

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
        return setup.getUserName(reCheck.view[0]['USERNAME']);
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
    let getUser = await oracledb.getAllofUser(`select username from all_users where username like 'C##MYUSERS%'`)

    setup.getUserNameObject(getUser);
    res.render('user', { user: getUser, isCheck: isCheck(), view: view() });
  }
  else {
    res.redirect('/login');
  }
});

router.get('/admin/user/:username/detail/:tablename', async function (req, res, next) {
  let ok = [];
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
    let numColRol = 0;
    if (tableName == 'role') {
      // Lấy role
      role = await oracledb.getRoleUser(
        `select GRANTED_ROLE from DBA_ROLE_PRIVS where grantee = upper('${setup.setUserName(user)}')`
      );
      tokenRole = await jwt.verify(role, 'Vychuoi123', { algorithms: 'HS256' });
      fullRole = setup.role(tokenRole.data);
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
    console.log(arrColRol)
    let saveSuccess = await req.cookies.saveSuccess;
    let message = await req.cookies.message;

    res.cookie('message', '');
    console.log(message, saveSuccess);
    let oo = oracledb.allColumn[1];
    console.log(arrColRol);
    res.render('user-role', { user, saveSuccess, message, fullRole, allRole, tableName, tableHasSign, type, arrColRol, oo });
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
    if (getIn['roleDoctor']) {
      arrGr.push('DOCTOR_ROLE');
    }
    else {
      arrRe.push('DOCTOR_ROLE');
    }
    if (getIn['roleReception']) {
      arrGr.push('PRECEPTIONIST_ROLE');
    }
    else {
      arrRe.push('PRECEPTIONIST_ROLE');
    }
    if (getIn['roleManage']) {
      arrGr.push('MANAGERMENT_ROLE');
    }
    else {
      arrRe.push('MANAGERMENT_ROLE');
    }
    if (getIn['roleService']) {
      arrGr.push('PARAMEDIC_ROLE');
    }
    else {
      arrRe.push('PARAMEDIC_ROLE');
    }
    if (getIn['roleFinancial']) {
      arrGr.push('FINANCE_ROLE');
    }
    else {
      arrRe.push('FINANCE_ROLE');
    }
    if (getIn['roleAccountant']) {
      arrGr.push('ACCOUNTANCE_ROLE');
    }
    else {
      arrRe.push('ACCOUNTANCE_ROLE');
    }
    if (getIn['roleBuyDrug']) {
      arrGr.push('PHARMACY_ROLE');
    }
    else {
      arrRe.push('PHARMACY_ROLE');
    }
    try {
      let run = await oracledb.setUpdateRole(setup.setUserName(userName).toUpperCase(), tableName, arrGr, arrRe);
      res.cookie('saveSuccess', true);
    } catch (error) {
      res.cookie('saveSuccess', false);
    }
  }
  else if (typeRole == 2) {
    console.log(getIn)
    let arr = setup.getTableArrDML(getIn);
    console.log(arr)
    try {
      let decode = await oracledb.setUpdateRoleTable(setup.setUserName(userName).toUpperCase(), tableName.toUpperCase(), arr);
      res.cookie('saveSuccess', true);
    } catch (error) {
      res.cookie('saveSuccess', false);
    }
  }
  else if (typeRole == 3) {
    arrCol = setup.getArrCol(getIn);
    arrDML = setup.getArrDML(getIn);
    console.log(arrDML)
    let l = await oracledb.setUpdateRolCol(setup.setUserName(userName).toUpperCase(), tableName, arrCol, arrDML);
    
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
  let query = `select * from ${setup.setUserName(user).toUpperCase() + '_VIEW'}`;
  let view = await oracledb.getData(query);
  console.log(view)
  let token = jwt.sign({ view }, 'Vychuoi123', { algorithm: 'HS256', expiresIn: '3h' })
  res.cookie('check', token);
  res.redirect('/admin/user');
});

module.exports = router;
