//src = "https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"

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

    // Xử lý slide
    $(function () {
        $('.index-page .categories-1 .owl-carousel').owlCarousel({
            loop: true,
            nav: true,
            autoplay: true,
            dots: false,
            responsive: {
                0: {
                    items: 1,
                },
                600: {
                    items: 1
                },
                1000: {
                    items: 1
                }
            }
        })
    });

    $(function () {
        $('.index-page .categories-2 .owl-carousel').owlCarousel({
            loop: true,
            nav: true,
            margin: 20,
            autoplay: true,
            dots: false,
            responsive: {
                0: {
                    items: 1,
                },
                600: {
                    items: 2
                },
                1000: {
                    items: 4
                }
            }
        })
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
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
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
        str = str.replace(/ + /g, " ");
        str = str.trim();
        // Remove punctuations
        // Bỏ dấu câu, kí tự đặc biệt
        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
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

    $(function () {
        let itemG = $('.detail-item-checkbox-content input.grant-role');
        let itemR = $('.detail-item-checkbox-content input.role');
        for (let i = 0; i < itemG.length; i++) {
            $(itemG[i]).change(function (e) {
                e.preventDefault();
                if (itemR[i].checked == false) {
                    itemG[i].checked = false;
                }
            });
            $(itemR[i]).change(function (e) {
                e.preventDefault();
                if (itemR[i].checked == false) {
                    itemG[i].checked = false;
                }
            });
        }
    });

    $(function () {
        let itemG = $('input.grant-role');
        let itemR = $('input.role');
        for (let i = 0; i < itemG.length; i++) {
            $(itemG[i]).change(function (e) {
                e.preventDefault();
                if (itemR[i].checked == false) {
                    itemG[i].checked = false;
                }
            });
            $(itemR[i]).change(function (e) {
                e.preventDefault();
                if (itemR[i].checked == false) {
                    itemG[i].checked = false;
                }
            });
        }
    });

    // Hàm sử lý user
    $(function () {
        let item = $('.container-user');
        let isClick = $('.btn-show-user');
        let boxUser = $('.content-user');

        $(isClick[0]).click(function (e) {
            e.preventDefault();
            let hasClass = $('.container-user').hasClass('show');
            if (hasClass == 0) {
                $(item[0]).addClass('show');
                $(boxUser[0]).css('opacity', '1');
            }
            else {
                $(item[0]).removeClass('show');
                $(boxUser[0]).css('opacity', '0.5');
            }
        });
    });

    // Hàm delete item
    function DeleteBillDrug() {
        let del = $('.form-box-detail .form-item .delete');
        let item = $('.form-box-detail .form-item .item-delete');
        for (let i = 0; i < del.length; i++) {
            $(del[i]).click(function (e) {
                e.preventDefault();
                $(item[i]).remove();
            });
        }
    }
    // Hàm thêm item khi nhấn btn
    $(function () {
        let btn = $('.form-box-detail .form-item .btn-add-item');
        let select = $('.form-box-detail .form-item .select-des');
        let count = 1;

        $(btn[0]).click(function (e) {
            e.preventDefault();
            console.log(btn[0], 'aaa')
            let itemPar = $('.form-box-detail .form-item:nth-child(2)');
            let itemChi = `<div class="item-detail item-delete">
                <p class="title-item-detail">Tên thuốc</p>
                <div class="detail">
                    <label for="idNewDrug_${count}"></label>
                    <div class="box-detail">
                        <input class="input-des" type="text" value="" id="idNewDrug_${count}" name="idNewDrug_${count}">
                        <select class="select-des">
                            ${$(select[0]).html()}
                        </select>
                    </div>
                </div>
                <div class="detail">
                    <p class="title-detail">Liều lượng</p>
                    <label for="numberNewUse_${count}"></label>
                    <input class="number" type="text" id="numberNewUse_${count}" name="numberNewUse_${count}" value="0">
                    <p class="unit">Đơn vị tính:</p>
                </div>
                <button title="xóa" type="button" class="delete"><i class="fa fa-times" aria-hidden="true"></i></button>
            </div>`;
            $(btn).before(itemChi);
            count++;
            console.log()
            return [HandleBillDrug(), DeleteBillDrug()];
        });
    });

    $(function () {
        let btn = $('.menu-box-item .btn-add-item');
        $(btn[0]).click(function (e) {
            e.preventDefault();
            let box = $('.menu-box-item .box-add-item');
            let isClass = $(box[0]).hasClass('display');
            if (isClass) {
                $(box[0]).removeClass('display');
            }
            else {
                $(box[0]).addClass('display');
            }
        });

        let btnClose = $('.menu-box-item .close');
        $(btnClose[0]).click(function (e) {
            e.preventDefault();
            let box = $('.menu-box-item .box-add-item');
            let isClass = $(box[0]).hasClass('display');
            if (isClass) {
                $(box[0]).removeClass('display');
            }
            else {
                $(box[0]).addClass('display');
            }
        });
    });

    // Hàm xử lý đơn thuốc
    function HandleBillDrug() {
        let input = $('.input-des');
        let select = $('.select-des');
        let unit = $('.form-box-detail .unit');
        let arr = [];
        for (let i = 0; i < select.length; i++) {
            arr.push($(input[i]).val())
        }
        for (let i = 0; i < select.length; i++) {
            $(select[i]).val($(input[i]).val());
            $(select[i]).change(function (e) {
                e.preventDefault();
                let val = $(select[i]).val();
                $(input[i]).val(val.slice(0, val.length - 7));
                $(unit[i]).html('Đon vị tính: ' + val.slice(val.length - 5));
            });
            let temp = $(input[i]).val();
            $(input[i]).keyup(function (e) {
                let val = $(select[i]).val();
                if (val != null) {
                    $(input[i]).val(val.slice(0, val.length - 7));
                    $(unit[i]).html('Đơn vị tính: ' + val.slice(val.length - 5));
                }
                else {
                    $(input[i]).val(arr[i]);
                    $(unit[i]).html('Đơn vị tính: ');
                }
            });
        }
    };

    HandleBillDrug();

    $(function () {
        let itemDr = $('.container-item .categories-2 .body-item .item .menu-item .box-item .box-item-link');
        for (let i = 0; i < itemDr.length; i++) {
            $(itemDr[i]).hover(function () {
                // over
                $(this).addClass('bg-item-active');
            }, function () {
                // out
                $(this).removeClass('bg-item-active');
            }
            );
        }
    });

    $(function () {
        let itemBtn = $('.reception-page .categories-2 .body .item:nth-child(2) .box-function .function-item:nth-child(2) .btn-add');

        $(itemBtn[0]).click(function (e) { 
            e.preventDefault();
            let paRent = $('.reception-page .categories-3');
            let isParent = $(paRent[0]).hasClass('active');

            if (isParent) {
                $(paRent[0]).removeClass('active');
            }
            else {
                $(paRent[0]).addClass('active');
            }
        });

        let reItemBtn = $('.reception-page .categories-3 .body .btn-back');
        $(reItemBtn[0]).click(function (e) { 
            e.preventDefault();
            let paRent = $('.reception-page .categories-3');
            let isParent = $(paRent[0]).hasClass('active');

            if (isParent) {
                $(paRent[0]).removeClass('active');
            }
        });
    });

    function GetInputPharmacy() {
        let searchBox = $('#autocomplete');
        let inputBox = $('#searchPhamarcy');

        $(inputBox).keyup(function (e) {
            let str = $(this).val();
            let href = window.location.href;

            if (str.length === 0) {
                $(searchBox).css('display', 'none');
            }
            else {
                $(searchBox).css('display', 'flex');
            }

            $.ajax({
                url: href,
                contentType: "application/json",
                method: "POST",
                data: JSON.stringify({ query: str }),
                success: function (response) {
                    $(searchBox).html(response);
                }
            });
        });

    }

    function GetInputDoctor() {
        let searchBox = $('#autocomplete');
        let inputBox = $('#search');

        $(inputBox).keyup(function (e) {
            let str = $(this).val();
            let href = window.location.href;

            if (str.length === 0) {
                $(searchBox).css('display', 'none');
            }
            else {
                $(searchBox).css('display', 'flex');
            }

            $.ajax({
                url: href,
                contentType: "application/json",
                method: "POST",
                data: JSON.stringify({ query: str }),
                success: function (response) {
                    $(searchBox).html(response);
                }
            });
        });
    }

    GetInputDoctor();
    GetInputPharmacy();
});