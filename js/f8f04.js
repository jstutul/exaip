jQuery(function ($) {
    "use strict";
    $(document).ready(function () {
        $(
            ".new-tm-top .sendamount_curr,.new-tm-top #fromcountry,.new-tm-top #tocountry, .compare-widget .sendamount_curr,.compare-widget #fromcountry,.compare-widget #tocountry"
        )
            .select2({
                templateResult: select3CopyClasses,
                templateSelection: select3CopyClasses,
                minimumResultsForSearch: 0,
                theme: "default select2-w-search",
            })
            .on("select2:open", function (e) {
                var searchbox = document.querySelector(
                    ".select2-w-search .select2-search__field"
                );
                if (searchbox && searchbox.focus) {
                    searchbox.focus();
                    window.setTimeout(() => {
                        if (
                            document.querySelector(
                                ".select2-w-search .select2-search__field"
                            )
                        ) {
                            document
                                .querySelector(
                                    ".select2-w-search .select2-search__field"
                                )
                                .focus();
                        }
                    }, 50);
                }
            });

        $(".new-tm-top #fromcountry, .compare-widget #fromcountry").on(
            "select2:select",
            function (e) {
                if (e && e.params && e.params.data) {
                    var fromId = e.params.data.id;
                    var toId = $(".new-tm-top #tocountry").val();
                    if ($(".compare-widget #tocountry").length) {
                        toId = $(".compare-widget #tocountry").val();
                    }
                    var currencyId = jQuery("[name=sendamount_curr]").val();

                    if (
                        fromId &&
                        toId &&
                        currencyId &&
                        currencyId !== fromId &&
                        currencyId !== toId
                    ) {
                        jQuery("[name=sendamount_curr]")
                            .val(fromId)
                            .trigger("change");
                    }
                }
            }
        );

        $(".new-tm-top #tocountry, .compare-widget #tocountry").on(
            "select2:select",
            function (e) {
                if (e && e.params && e.params.data) {
                    var fromId = $(".new-tm-top #fromcountry").val();
                    if ($(".compare-widget #fromcountry").length) {
                        fromId = $(".compare-widget #fromcountry").val();
                    }
                    var toId = e.params.data.id;
                    var currencyId = jQuery("[name=sendamount_curr]").val();

                    if (
                        fromId &&
                        toId &&
                        currencyId &&
                        currencyId !== fromId &&
                        currencyId !== toId
                    ) {
                        jQuery("[name=sendamount_curr]")
                            .val(fromId)
                            .trigger("change");
                    }
                }
            }
        );

        function select3CopyClasses(data, container) {
            if (data.element) {
                if ($(container).hasClass("flag-icon-available")) {
                    var className;
                    $.each(
                        $($(container).prop("classList")),
                        function (k, className) {
                            if (className.substring(0, 5) === "flag-")
                                $(container).removeClass(className);
                        }
                    );
                }
                $(container).addClass($(data.element).attr("class"));
            }
            return data.text;
        }

        jQuery(document).on("click", ".provider-leanmore-popup", function (e) {
            var data_leanmore = $(this).attr("data-leanmore");
            jQuery("#" + data_leanmore).modal("show");
        });
        //window.addEventListener("load", function (event) {
        var updatebtn = $(".new-transmoney .new-update-cs-money");
        if ($(".new-transmoney #send-money-form").attr("data-on")) {
            var updatebtn = $(".new-update-cs-money");
            if (
                (!updatebtn || !updatebtn.length) &&
                $(".provider-compare-rates-submit").length
            ) {
                updatebtn = $(".provider-compare-rates-submit");
            }

            var load_type = "default";
            var wp_action = $(".new-transmoney #send-money-form").data(
                "wp-action"
            );
            new_update_cs_money_ajax(updatebtn, load_type, false, wp_action);
            updatebtn.trigger("click", 0);
        }
        //});

        // $(document).on("click", ".new-update-cs-money", function (e) {
        //     e.preventDefault();
        //     if ($("#sendamount_display").val() == "") {
        //         $("#sendamount_display").css("border-bottom", "1px solid red");
        //         return false;
        //     }
        //     var updatebtn = $(this);
        //     var sendamount_display = $("#sendamount_display").val();
        //     $("#sendamount").val(sendamount_display.replace(/[^0-9.-]+/g, ""));
        //     var load_type = "update";
        //     new_update_cs_money_ajax(updatebtn, load_type, true);
        //     return false;
        // });

        $(document).on(
            "change",
            ".sendamount_curr, .fromcountry, .tocountry",
            function () {
                $(this).parents(".new-ts-wrap").find(".new-tm-bottom").html("");
            }
        );

        //Initialize select2
        $(
            "#smoneycheck,#rmoneycountry,#rmoneycurr,#tvq1,#tvq2,.smoneycurr,#form-curr,#exchange-method"
        ).select2({ minimumResultsForSearch: -1 });

        $("#form-curr").select2({
            templateResult: select2CopyClasses,
            templateSelection: select2CopyClasses,
        });
        function select2CopyClasses(data, container) {
            if (data.element) {
                if ($(container).hasClass("flag-icon")) {
                    var className;
                    $.each(
                        $($(container).prop("classList")),
                        function (k, className) {
                            if (className.substring(0, 5) == "flag-")
                                $(container).removeClass(className);
                        }
                    );
                }
                $(container).addClass($(data.element).attr("class"));
            }
            return data.text;
        }

        // Bind GTM dataLayer events
        jQuery("body").on("click", "[data-tracking-event]", function () {
            try {
                var eventName = jQuery(this).data("tracking-event");
                var dataLayerEvent = {
                    event: eventName,
                };

                if (eventName === "table-button-clicked") {
                    dataLayerEvent.position =
                        jQuery(this).data("tracking-position");
                    dataLayerEvent.provider =
                        jQuery(this).data("tracking-provider");
                }

                var dataLayer = (window.dataLayer = window.dataLayer || []);
                dataLayer.push(dataLayerEvent);
            } catch (e) {}
        });
    });

    function disablermoneysend() {
        $("#send-money-form .rmoneycurr option").each(function () {
            var $thisOption = $(this);
            if (
                $thisOption.val() == $("#send-money-form #rmoneycountry").val()
            ) {
                $thisOption.attr("disabled", "disabled");
            } else {
                $thisOption.removeAttr("disabled");
            }
        });
        $(".rmoneycurr").select2({ minimumResultsForSearch: -1 });
    }
    function disablermoneyr() {
        $("#rmoneycountry option").each(function () {
            var $thisOption = $(this);
            if ($thisOption.val() == $("#send-money-form .rmoneycurr").val()) {
                $thisOption.attr("disabled", "disabled");
            } else {
                $thisOption.removeAttr("disabled");
            }
        });
        $("#rmoneycountry").select2({ minimumResultsForSearch: -1 });
    }
});
