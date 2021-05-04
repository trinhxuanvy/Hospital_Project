src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"

$(document).ready(function () {
    // Xử lý header fixed
    $(function () {
        var header = $('.header-container');
        var offset = $(header).offset();
        var topHeader = offset.top;
        

        $(window).scroll(function () {
            let topWindow = $(this).scrollTop();;

            if (topWindow > topHeader) {
                $(header).addClass('header-container-fixed');
            }
            else {
                $(header).removeClass('header-container-fixed');
            }
        });
    });

    // Xử lý menu responsive opacity 1
    $(function () {
        let menuTop = $('.menu-top');
        let btnActiveMenu = $('.toggle-top');

        $(btnActiveMenu).click(function (e) {
            e.preventDefault();
            let flag = $(menuTop).hasClass('menu-top-fixed');
            if (flag) {
                $('.bar:nth-child(1)').removeClass('bar-1');
                $('.bar:nth-child(2)').removeClass('bar-2');
                $('.bar:nth-child(3)').removeClass('bar-3');
                $(menuTop).removeClass('menu-top-fixed');
            }
            else {
                $('.bar:nth-child(1)').addClass('bar-1');
                $('.bar:nth-child(2)').addClass('bar-2');
                $('.bar:nth-child(3)').addClass('bar-3');
                $(menuTop).addClass('menu-top-fixed');
            }
        });
    });

    // Xử lý thông báo thành công thất bại
    $(function () {
        setTimeout(
            function () {
                $('.message-container').addClass('message-none');
            },
            1000
        )
    });

    // Xử lý hiện thị theo option table
    $(function () {
        let getTable = $('.chech-box-form-active .table-check-box');
        let choose = $('#option-table');

        $(choose).change(function (e) {
            e.preventDefault();
            let val = $(this).val();

            $(getTable).removeClass('display-block');

            switch (val) {
                case 'Dịch vụ': {
                    $(getTable[0]).addClass('display-block');
                    break;
                }
                case 'Nhân viên': {
                    $(getTable[1]).addClass('display-block');
                    break;
                }
                case 'Bệnh nhân': {
                    $(getTable[2]).addClass('display-block');
                    break;
                }
                case 'Chấm công': {
                    $(getTable[3]).addClass('display-block');
                    break;
                }
                case 'Đơn thuốc': {
                    $(getTable[4]).addClass('display-block');
                    break;
                }
                case 'Phòng': {
                    $(getTable[5]).addClass('display-block');
                    break;
                }
                case 'Thuốc': {
                    $(getTable[6]).addClass('display-block');
                    break;
                }
                case 'Đơn vị': {
                    $(getTable[7]).addClass('display-block');
                    break;
                }
                case 'Hóa đơn': {
                    $(getTable[8]).addClass('display-block');
                    break;
                }
                case 'Lịch trực': {
                    $(getTable[9]).addClass('display-block');
                    break;
                }
                case 'Hồ sơ dịch vụ': {
                    $(getTable[10]).addClass('display-block');
                    break;
                }
                case 'Hồ sơ bệnh nhân': {
                    $(getTable[11]).addClass('display-block');
                    break;
                }
                case 'Chi tiết đơn thuốc': {
                    $(getTable[12]).addClass('display-block');
                    break;
                }
                case 'Chi tiết hóa đơn': {
                    $(getTable[13]).addClass('display-block');
                    break;
                }
                default: {
                    break;
                }
            }
        });
    });

    // Xử header trang admin
    $(function () {
        let header = $('.admin-form-header');
        let posHeader = $(header).position();
        let topHeader = posHeader.top;

        $(window).scroll(function () {
            let topWindow = $(this).scrollTop();;

            if (topWindow > topHeader) {
                //$(header).addClass('header-admin-fixed');
            }
            else {
                $(header).removeClass('header-admin-fixed');
            }
        });
    });

    // Hàm bỏ dấu tiếng Việt
    function removeVietnameseTones(str) {
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
    }

    // Hàm lọc table
    $(function () {
        let search = $('.admin-container .box-find .form-find input');
        let rowTable = document.querySelectorAll('.admin-container .table-box tbody tr');

        $(search).keyup(function (e) {
            e.preventDefault();
            let val = $(this).val().toLowerCase();

            $(rowTable).filter(function () {
                let rowText = $(this).text().toLowerCase();

                $(this).toggle(removeVietnameseTones(rowText).indexOf(removeVietnameseTones(val)) > -1)
            });
        });
    });
});