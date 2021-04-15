var express = require('express');
var oracledb = require('../backend/data');
var jwt = require('jsonwebtoken');
var event = require('events');
var setup = require('./setup');

var myEvent = new event.EventEmitter();
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
    res.cookie('statusLogin', 'true');
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
  let obj = [
    {
      username: 'Trình Xuân Vỹ',
      nameaccount: 'C##MYUSERS1',
      position: 'Bác Sĩ'
    },
    {
      username: 'Ừng Văn Tuấn',
      nameaccount: 'C##MYUSERS10',
      position: 'Bác Sĩ'
    }
  ];
  console.log(obj[3]);
  if (obj[2] != '') {
    console.log('ok');
  }
  setup.getUserNameObject(obj);
  res.render('user', { user: obj });
});

router.get('/admin/user/:username', async function (req, res, next) {
  let user = await req.params.username;

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
  res.render('user-role', { user, saveSuccess, message, fullEmp, fullRole });
});

router.post('/admin/user/:username', async function (req, res, next) {
  let getIn = req.params;
  res.cookie('saveSuccess', 'true');
  res.cookie('message', 'true');
  res.redirect(`${getIn.username}`);
});

module.exports = router;
