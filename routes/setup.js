var jwt = require('jsonwebtoken');

module.exports = {


    User: function (userName, passWord) {
        this.userName = userName;
        this.passWord = passWord;
    },

    checkToken: function (token) {
        let tokenFlag = jwt.verify(token, 'vychuoi123', function (err, result) {
            if (err) {
                return 0;
            }
            else {
                return 1;
            }
        });
    },

    getRole: function (arr) {
        let result = [];
        for (let i in arr) {
            if (i.indexOf('ROLE_QLBENHVIEN_') > -1) {
                result.push(i);
            }
        }
        console.log(result)
        return result;
    },

    getArrCol: function (arr) {
        let result = [];
        for (let i in arr) {
            if (i.indexOf('col') > -1) {
                result.push(i.slice(4));
            }
        }
        return result;
    },
    // 0: không có, 1: select, 2: select grant
    createArr: function (arr) {
        let obj = {
            col: '',
            dml: '',
            grant: 0,
        };
        arr.push(obj);
    },

    getArrDML: function (arr) {
        let result = [];
        for (let i of Object.entries(arr)) {
            console.log(i);
            if (i[1].indexOf('col') > -1) {
                let flag = i[1].slice(0, 1), obj;
                if (flag != 'g') {
                    if (flag == 's') {
                        obj = {
                            col: '',
                            dml: '',
                            grant: 0,
                        };
                    }
                    else 
                    if (flag == 'u') {
                        obj = {
                            col: i[1].slice(4),
                            dml: 'update',
                            grant: 0,
                        };
                    }
                }
                else if (flag == 'g') {
                    flag = i[1].slice(1, 2);
                    if (flag == 's') {
                        obj = {
                            col: '',
                            dml: '',
                            grant: 0,
                        };
                    }
                    else 
                    if (flag == 'u') {
                        obj = {
                            col: i[1].slice(5),
                            dml: 'update',
                            grant: 1,
                        };
                    }
                }
                result.push(obj);
            }
        }
        return result;
    },

    getArrDML2: function (arr) {
        let result = [];
        for (let i of Object.entries(arr)) {
            console.log(i);
            if (i[1].indexOf('col') > -1) {
                let flag = i[1].slice(0, 1), obj;
                if (flag != 'g') {
                    if (flag == 'i') {
                        obj = {
                            col: i[1].slice(4),
                            dml: 'insert',
                            grant: 0,
                        };
                    }
                    else 
                    if (flag == 'u') {
                        obj = {
                            col: i[1].slice(4),
                            dml: 'update',
                            grant: 0,
                        };
                    }
                }
                else if (flag == 'g') {
                    flag = i[1].slice(1, 2);
                    if (flag == 'i') {
                        obj = {
                            col: i[1].slice(5),
                            dml: 'insert',
                            grant: 0,
                        };
                    }
                    else 
                    if (flag == 'u') {
                        obj = {
                            col: i[1].slice(5),
                            dml: 'update',
                            grant: 1,
                        };
                    }
                }
                result.push(obj);
            }
        }
        return result;
    },

    getTableArrDML: function (arr) {
        let result = [];
        for (let i of Object.entries(arr)) {
            if (i[1].indexOf('table') > -1) {
                let flag = i[1].slice(0, 1), obj;
                if (flag != 'p') {
                    if (flag == 's') {
                        obj = {
                            dml: 'select',
                            grant: 0,
                        };
                    }
                    else if (flag == 'u') {
                        obj = {
                            dml: 'update',
                            grant: 0,
                        };
                    }
                    else if (flag == 'i') {
                        obj = {
                            dml: 'insert',
                            grant: 0,
                        };
                    }
                    else if (flag == 'd') {
                        obj = {
                            dml: 'delete',
                            grant: 0,
                        };
                    }
                }
                else if (flag == 'p') {
                    flag = i[0].slice(1, 2);
                    if (flag == 's') {
                        obj = {
                            dml: 'select',
                            grant: 1,
                        };
                    }
                    else if (flag == 'u') {
                        obj = {
                            dml: 'update',
                            grant: 1,
                        };
                    }
                    else if (flag == 'i') {
                        obj = {
                            dml: 'insert',
                            grant: 1,
                        };
                    }
                    else if (flag == 'd') {
                        obj = {
                            dml: 'delete',
                            grant: 1,
                        };
                    }
                }
                result.push(obj);
            }
        }
        return result;
    },

    getRedirect: function (obj) {
        let redir = [0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < obj.length; i++) {
            if (obj[i]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_QUANLYTAINGUYENNHANSU') {
                redir[0] = 1;
            }
            else if (obj[i]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_QUANLYTAIVU') {
                redir[1] = 1;
            }
            else if (obj[i]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_QUANLYCHUYENMON') {
                redir[2] = 1;
            }
            else if (obj[i]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_KETOAN') {
                redir[3] = 1;
            }
            else if (obj[i]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_BANTHUOC') {
                redir[4] = 1;
            }
            else if (obj[i]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_BACSI') {
                redir[5] = 1;
            }
            else if (obj[i]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_TAIVU') {
                redir[6] = 1;
            }
            else if (obj[i]['GRANTED_ROLE'] == 'ROLE_QLBENHVIEN_TIEPTAN') {
                redir[7] = 1;
            }
        }
        return redir;
    },

    checkInput: function (string) {
        let format = /[!@#$%^&*()_+-=\[]{};':"\|,.<>\/?]/;
        return format.test(string) ? true : false;
    },

    getUserName: function (string) {
        return string != '' ? string.slice(3, string.length) : '';
    },

    setUserName: function (string) {
        return 'C##' + string;
    },

    getUserNameObject: function (obj) {
        for (let item in obj) {
            obj[item]['GRANTEE'] = this.getUserName(obj[item]['GRANTEE'])
        }
    },

    createArr: function (number) {
        let arr = [];
        for (let i = 0; i < number; i++) {
            arr.push(0);
        }
        return arr;
    },

    removeVietnameseTones: function (str) {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
        str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
        str = str.replace(/đ/g,"d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        // Some system encode vietnamese combining accent as individual utf-8 characters
        // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
        str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
        // Remove extra spaces
        // Bỏ các khoảng trắng liền nhau
        str = str.replace(/ + /g," ");
        str = str.trim();
        // Remove punctuations
        // Bỏ dấu câu, kí tự đặc biệt
        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
        return str;
    },

    convertDate: function (obj) {
        for (let i = 0; i < obj.length; i++) {
            if (obj[i]['NGAY'] != null) {
                let date = new Date(obj[i]['NGAY']);
                obj[i]['NGAY'] = date.getDate().toString() + '/' + (date.getMonth() + 1).toString() + '/' + date.getFullYear().toString();
            }
            else if (obj[i]['NAMSINH'] != null) {
                let date = new Date(obj[i]['NAMSINH']);
                obj[i]['NAMSINH'] = date.getDate().toString() + '/' + (date.getMonth() + 1).toString() + '/' + date.getFullYear().toString();
            }
            else if (obj[i]['NGAYTAO'] != null) {
                let date = new Date(obj[i]['NGAYTAO']);
                obj[i]['NGAYTAO'] = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${date.getDate().toString()}/${(date.getMonth() + 1).toString()}/${date.getFullYear().toString()}`;
            }
            else if (obj[i]['NGAYBATDAU'] != null) {
                let date = new Date(obj[i]['NGAYBATDAU']);
                obj[i]['NGAYBATDAU'] = `${date.getDate().toString()}/${(date.getMonth() + 1).toString()}/${date.getFullYear().toString()}`;
            }
            else if (obj[i]['NGAYKHAM'] != null) {
                let date = new Date(obj[i]['NGAYKHAM']);
                obj[i]['NGAYKHAM'] = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${date.getDate().toString()}/${(date.getMonth() + 1).toString()}/${date.getFullYear().toString()}`;
            }
            else if (obj[i]['NGAYLAP'] != null) {
                let date = new Date(obj[i]['NGAYLAP']);
                obj[i]['NGAYLAP'] = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${date.getDate().toString()}/${(date.getMonth() + 1).toString()}/${date.getFullYear().toString()}`;
            }
            else if (obj[i]['TIMESTAMP'] != null) {
                let date = new Date(obj[i]['TIMESTAMP']);
                obj[i]['TIMESTAMP'] = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${date.getDate().toString()}/${(date.getMonth() + 1).toString()}/${date.getFullYear().toString()}`;
            }
            if (obj[i]['NGAYKETTHUC'] != null) {
                let date = new Date(obj[i]['NGAYKETTHUC']);
                obj[i]['NGAYKETTHUC'] = `${date.getDate().toString()}/${(date.getMonth() + 1).toString()}/${date.getFullYear().toString()}`;
            }
        }
    },

    setMoney: function (money) {
        return money.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    },

    getMoney: function (obj) {
        for (let i = 0; i < obj.length; i++) {
            if (obj[i]['LUONG'] != null) {
                obj[i]['LUONG'] = this.setMoney(obj[i]['LUONG']);
            }
        }
    }
};