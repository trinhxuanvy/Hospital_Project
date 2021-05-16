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
            if (i.indexOf('_ROLE') > -1) {
                result.push(i);
            }
        }
        return result
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
        console.log(arr)
        for (let i in arr) {
            if (i.indexOf('col') > -1) {
                let flag = i.slice(0, 1), obj;
                if (flag != 'g') {
                    if (flag == 's') {
                        obj = {
                            col: i.slice(4),
                            dml: 'select',
                            grant: 0,
                        };
                    }
                    else if (flag == 'u') {
                        obj = {
                            col: i.slice(4),
                            dml: 'update',
                            grant: 0,
                        };
                    }
                }
                else if (flag == 'g') {
                    flag = i.slice(1, 2);
                    if (flag == 's') {
                        obj = {
                            col: i.slice(5),
                            dml: 'select',
                            grant: 1,
                        };
                    }
                    else if (flag == 'u') {
                        obj = {
                            col: i.slice(5),
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
        for (let i in arr) {
            if (i.indexOf('table') > -1) {
                let flag = i.slice(0, 1), obj;
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
                    flag = i.slice(1, 2);
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

    checkInput: function (string) {
        let format = /[ !@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]/;
        return format.test(string) ? true : false;
    },

    getUserName: function (string) {
        return string != '' ? string.slice(3, string.length) : '';
    },

    setUserName: function (string) {
        return 'c##' + string;
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



    tableEmp: function (obj) {
        let arr = this.createArr(8);

        for (let item of obj) {
            switch (item.COLUMN_NAME) {
                case 'IDNHANVIEN': {
                    arr[0] = 1;
                    break;
                }
                case 'TENNHANVIEN': {
                    arr[1] = 1;
                    break;
                }
                case 'DONVI': {
                    arr[2] = 1;
                    break;
                }
                case 'VAITRO': {
                    arr[3] = 1;
                    break;
                }
                case 'NAMSINH': {
                    arr[4] = 1;
                    break;
                }
                case 'DIACHI': {
                    arr[5] = 1;
                    break;
                }
                case 'SDT': {
                    arr[6] = 1;
                    break;
                }
                case 'LUONG': {
                    arr[7] = 1;
                    break;
                }
                default: break;
            }
        }
        return arr;
    },

    tablePat: function (obj) {
        let arr = this.createArr(5);

        for (let item of obj) {
            switch (item.COLUMN_NAME) {
                case 'IDBENHNHAN': {
                    arr[0] = 1;
                    break;
                }
                case 'TENBENHNHAN': {
                    arr[1] = 1;
                    break;
                }
                case 'NAMSINH': {
                    arr[2] = 1;
                    break;
                }
                case 'DIACHI': {
                    arr[3] = 1;
                    break;
                }
                case 'SDT': {
                    arr[4] = 1;
                    break;
                }
                default: break;
            }
        }
        return arr;
    },

    tableSer: function (obj) {
        let arr = this.createArr(2);

        for (let item of obj) {
            switch (item.COLUMN_NAME) {
                case 'IDDICHVU': {
                    arr[0] = 1;
                    break;
                }
                case 'TENDICHVU': {
                    arr[1] = 1;
                    break;
                }
                default: break;
            }
        }
        return arr;
    },

    tableWork: function (obj) {
        let arr = this.createArr(4);

        for (let item of obj) {
            switch (item.COLUMN_NAME) {
                case 'IDCHAMCONG': {
                    arr[0] = 1;
                    break;
                }
                case 'IDNHANVIEN': {
                    arr[1] = 1;
                    break;
                }
                case 'NGAYBATDAU': {
                    arr[2] = 1;
                    break;
                }
                case 'NGAYKETTHUC': {
                    arr[3] = 1;
                    break;
                }
                default: break;
            }
        }
        return arr;
    },

    tableDetailBillDrug: function (obj) {
        let arr = this.createArr(4);

        for (let item of obj) {
            switch (item.COLUMN_NAME) {
                case 'IDCHITIETDONTHUOC': {
                    arr[0] = 1;
                    break;
                }
                case 'IDDONTHUOC': {
                    arr[1] = 1;
                    break;
                }
                case 'IDTHUOC': {
                    arr[2] = 1;
                    break;
                }
                case 'SOLUONG': {
                    arr[3] = 1;
                    break;
                }
                default: break;
            }
        }
        return arr;
    },

    tableDetailBill: function (obj) {
        let arr = this.createArr(4);

        for (let item of obj) {
            switch (item.COLUMN_NAME) {
                case 'IDCHITIETHOADON': {
                    arr[0] = 1;
                    break;
                }
                case 'IDCHITIETDICHVU': {
                    arr[1] = 1;
                    break;
                }
                case 'IDHOADON': {
                    arr[2] = 1;
                    break;
                }
                case 'DONGIA': {
                    arr[3] = 1;
                    break;
                }
                default: break;
            }
        }
        return arr;
    },

    tableBillDrug: function (obj) {
        let arr = this.createArr(3);

        for (let item of obj) {
            switch (item.COLUMN_NAME) {
                case 'IDDONTHUOC': {
                    arr[0] = 1;
                    break;
                }
                case 'IDHOSOBENHNHAN': {
                    arr[1] = 1;
                    break;
                }
                case 'LIEUDUNG': {
                    arr[2] = 1;
                    break;
                }
                default: break;
            }
        }
        return arr;
    },

    tableUnit: function (obj) {
        let arr = this.createArr(2);

        for (let item of obj) {
            switch (item.COLUMN_NAME) {
                case 'IDDONVI': {
                    arr[0] = 1;
                    break;
                }
                case 'TENDONVI': {
                    arr[1] = 1;
                    break;
                }
                default: break;
            }
        }
        return arr;
    },

    tableBill: function (obj) {
        let arr = this.createArr(5);

        for (let item of obj) {
            switch (item.COLUMN_NAME) {
                case 'IDHOADON': {
                    arr[0] = 1;
                    break;
                }
                case 'IDHOSOBENHNHAN': {
                    arr[1] = 1;
                    break;
                }
                case 'NHANVIENLAP': {
                    arr[2] = 1;
                    break;
                }
                case 'NGAYLAP': {
                    arr[3] = 1;
                    break;
                }
                case 'TONGTIEN': {
                    arr[4] = 1;
                    break;
                }
                default: break;
            }
        }
        return arr;
    },

    tableFilePat: function (obj) {
        let arr = this.createArr(7);

        for (let item of obj) {
            switch (item.COLUMN_NAME) {
                case 'IDHOSOBENHNHAN': {
                    arr[0] = 1;
                    break;
                }
                case 'IDBENHNHAN': {
                    arr[1] = 1;
                    break;
                }
                case 'BSDIEUTRI': {
                    arr[2] = 1;
                    break;
                }
                case 'NVDIEUPHOI': {
                    arr[3] = 1;
                    break;
                }
                case 'TINHTRANGBANDAU': {
                    arr[4] = 1;
                    break;
                }
                case 'NGAYKHAM': {
                    arr[5] = 1;
                    break;
                }
                case 'KETLUANBS': {
                    arr[6] = 1;
                    break;
                }
                default: break;
            }
        }
        return arr;
    },

    tableFillSer: function (obj) {
        let arr = this.createArr(6);

        for (let item of obj) {
            switch (item.COLUMN_NAME) {
                case 'IDCHITIETDICHVU': {
                    arr[0] = 1;
                    break;
                }
                case 'IDDICHVU': {
                    arr[1] = 1;
                    break;
                }
                case 'IDHOSOBENHNHAN': {
                    arr[2] = 1;
                    break;
                }
                case 'NHANVIENTH': {
                    arr[3] = 1;
                    break;
                }
                case 'NGAYTH': {
                    arr[4] = 1;
                    break;
                }
                case 'KETQUA': {
                    arr[5] = 1;
                    break;
                }
                default: break;
            }
        }
        return arr;
    },

    tableCel: function (obj) {
        let arr = this.createArr(5);

        for (let item of obj) {
            switch (item.COLUMN_NAME) {
                case 'IDLICHTRUC': {
                    arr[0] = 1;
                    break;
                }
                case 'IDPHONG': {
                    arr[1] = 1;
                    break;
                }
                case 'IDNHANVIEN': {
                    arr[2] = 1;
                    break;
                }
                case 'NGAYBATDAU': {
                    arr[3] = 1;
                    break;
                }
                case 'NGAYKETTHUC': {
                    arr[4] = 1;
                    break;
                }
                default: break;
            }
        }
        return arr;
    },

    tableRoom: function (obj) {
        let arr = this.createArr(2);

        for (let item of obj) {
            switch (item.COLUMN_NAME) {
                case 'IDPHONG': {
                    arr[0] = 1;
                    break;
                }
                case 'TENPHONG': {
                    arr[1] = 1;
                    break;
                }
                default: break;
            }
        }
        return arr;
    },

    tableDrug: function (obj) {
        let arr = this.createArr(5);

        for (let item of obj) {
            switch (item.COLUMN_NAME) {
                case 'IDTHUOC': {
                    arr[0] = 1;
                    break;
                }
                case 'TENTHUOC': {
                    arr[1] = 1;
                    break;
                }
                case 'DONVITINH': {
                    arr[2] = 1;
                    break;
                }
                case 'CHIDINHTHUOC': {
                    arr[3] = 1;
                    break;
                }
                case 'DONGIA': {
                    arr[4] = 1;
                    break;
                }
                default: break;
            }
        }
        return arr;
    },

    role: function (obj) {
        let arr = this.createArr(7);

        for (let item of obj) {
            switch (item.GRANTED_ROLE) {
                case 'DOCTOR_ROLE': {
                    arr[0] = 1;
                    break;
                }
                case 'PRECEPTIONIST_ROLE': {
                    arr[1] = 1;
                    break;
                }
                case 'PARAMEDIC_ROLE': {
                    arr[2] = 1;
                    break;
                }
                case 'ACCOUNTANCE_ROLE': {
                    arr[3] = 1;
                    break;
                }
                case 'PHARMACY_ROLE': {
                    arr[4] = 1;
                    break;
                }
                case 'MANAGERMENT_ROLE': {
                    arr[5] = 1;
                    break;
                }
                case 'FINANCE_ROLE': {
                    arr[6] = 1;
                    break;
                }
                default: break;
            }
        }
        console.log(arr);
        return arr;
    },
};