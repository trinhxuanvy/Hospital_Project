var express = require('express');
var oracledb = require('../backend/data');
var jwt = require('jsonwebtoken');
var setup = require('./setup');

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

    isCheck = function (err)  {
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
    res.render('user', { user: getUser, isCheck : isCheck(), view : view() });
  }
  else {
    res.redirect('/login');
  }
});

router.get('/admin/user/:username/detail', async function (req, res, next) {
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
    let user = await req.params.username;
    let allRole = await oracledb.getAllRole(setup.setUserName(user).toUpperCase());

    let saveSuccess = await req.cookies.saveSuccess;
    let message = await req.cookies.message;
    // Lấy bảng nhân viên
    let roleColEmp = await oracledb.getRoleUser(
      `select COLUMN_NAME from all_tab_columns where table_name = upper('${setup.setUserName(user) + '_VIEW'}')`
    );
    let tokenColEmp = await jwt.verify(roleColEmp, 'Vychuoi123', { algorithms: 'HS256' });
    let fullEmp = setup.tableEmp(tokenColEmp.data);
    // Lấy role
    let role = await oracledb.getRoleUser(
      `select GRANTED_ROLE from DBA_ROLE_PRIVS where grantee = upper('${setup.setUserName(user)}')`
    );
    let tokenRole = await jwt.verify(role, 'Vychuoi123', { algorithms: 'HS256' });
    let fullRole = setup.role(tokenRole.data);

    res.cookie('message', '');

    res.render('user-role', { user, saveSuccess, message, fullEmp, fullRole, allRole });
  }
  else {
    res.redirect('/login');
  }
});

router.post('/admin/user/:username/detail', async function (req, res, next) {
  let getIn = req.params;
  res.cookie('saveSuccess', 'true');
  res.cookie('message', 'true');
  res.redirect(`${getIn.username}`);
});

router.get('/admin/user/:username/role-back', async function (req, res, next) {
  res.redirect('/admin/user');
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
