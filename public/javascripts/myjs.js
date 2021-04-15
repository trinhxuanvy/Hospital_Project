$(document).ready(function () {
    // Xử lý header fixed
    $(function () {
        let header = $('.header-container')
        let posHeader = $(header).position();
        let topHeader = posHeader.top;

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
            if(flag) {
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
        setTimeout (
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

            switch(val) {
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

 
});