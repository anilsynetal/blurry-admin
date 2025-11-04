$(document).ready(function () {

    const contactFields = [
        '#mobile', '#mobile_number', '#phone', '#contact_number', '#customer_contact',
        '#alternate_contact', '#emergency_contact', '#official_contact', '#party_telephone_number',
        '#party_mobile_number'
    ];

    const handleMobileValidation = (event) => {
        const regex = /^[6-9]/;
        let fail = false;

        $('.has_error_contact').remove(); // Remove previous error messages

        contactFields.forEach((field) => {
            const contactNumber = $(field).val();
            if (contactNumber && !regex.test(contactNumber)) {
                $(field).after('<div class="text-danger has_error_contact">Please enter a valid mobile number starting with 6, 7, 8, or 9.</div>');
                fail = true;
            } else {
                $(field).next('.has_error_contact').remove();
            }
        });

        if (fail) event.preventDefault();
    };

    // Mobile validation
    $(document).on('input', contactFields.join(', '), handleMobileValidation);

    // Remove error messages on focus
    $(document).on('input', 'input, textarea', function () {
        $(this).next('.has_error, .has_error_status').remove();
        $(this).closest('.form-group').find('.has_error, .has_error_status').remove();
        $(this).css('border-color', '#ced4da');
    });

    //Remove error messages on change
    $(document).on('change', 'select', function () {
        $(this).closest('.form-group').find('.has_error,.has_error_status').remove();
        $(this).css('border-color', '#ced4da');
    });

    $(document).ready(function () {
        let form = $("form[name=master_form]");
        let saveButton = form.find("button[type=submit]"); // Find the Save button

        // Initially disable the save button
        saveButton.prop("disabled", true);

        // Enable button when any select field changes
        form.find("select").on("change", function () {
            saveButton.prop("disabled", false);
        });

        // Enable button when any input field gets focus
        form.find("input").on("focus", function () {
            saveButton.prop("disabled", false);
        });

        // Enable button when any textarea gets focus
        form.find("textarea").on("focus", function () {
            saveButton.prop("disabled", false);
        });

        // Enable button when any theme color radio button is selected
        $(".theme-color a").on("click", function () {
            saveButton.prop("disabled", false);
        });

    });


    // Form validation and submission
    $(document).on('submit', "form[name=master_form]", function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        let fail = false;

        $('.has_error').remove();

        $(this).find('select, textarea, input').each(function () {
            if ($(this).prop('required') && !$(this).val()) {
                fail = true;
                const name = $(this).attr('name').replace(/\[\d+\]/g, '').replace(/_id/g, '').replace(/_/g, ' ').toLowerCase();
                const defaultMessage = `Please enter ${name}`;
                // If closest div has class input-group then append error message after that div else append to the closest form-group
                if ($(this).closest('.input-group').length) {
                    $(this).closest('.input-group').after(`<div class="text-danger has_error">${$(this).data('error') || defaultMessage}</div>`);
                } else {
                    $(this).closest('.form-group').append(`<div class="text-danger has_error">${$(this).data('error') || defaultMessage}</div>`);
                }
            }
            // Check min length and max length
            if ($(this).attr('minlength') && $(this).val().length < $(this).attr('minlength') && $(this).val() != '') {
                fail = true;
                if ($(this).closest('.input-group').length) {
                    $(this).closest('.input-group').after(`<div class="text-danger has_error">Minimum ${$(this).attr('minlength')} characters required</div>`);
                } else {
                    $(this).closest('.form-group').append(`<div class="text-danger has_error">Minimum ${$(this).attr('minlength')} characters required</div>`);
                }
            }
            if ($(this).attr('maxlength') && $(this).val().length > $(this).attr('maxlength') && $(this).val() != '') {
                fail = true;
                if ($(this).closest('.input-group').length) {
                    $(this).closest('.input-group').after(`<div class="text-danger has_error">Maximum ${$(this).attr('maxlength')} characters allowed</div>`);
                } else {
                    $(this).closest('.form-group').append(`<div class="text-danger has_error">Maximum ${$(this).attr('maxlength')} characters allowed</div>`);
                }
            }
        });

        if (!fail) {
            $.ajax({
                type: $(this).attr('method'),
                url: $(this).attr('action'),
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                beforeSend: function () { $("#overlay").show(); $("button[type='submit']").prop("disabled", true); },
                success: function (data, status, xhr) {
                    handleFormSuccess(data, xhr);
                },
                complete: function () { $("#overlay").hide(); $("button[type='submit']").prop("disabled", false); }
            }).fail(handleFormError);
        } else {
            // Focus on first error field
            $(this).find('.has_error').first().prev().focus();
        }
    });
    //Search Doctor Availability
    $(document).on('click', '#search-doctor-btn', function () {
        $(".error-search_date").text('');
        var selected_date = $("#search_date").val();
        if (selected_date == '') {
            $(".error-search_date").text("The search date field is required!")
            return false
        }
        var url = $(this).data('url') + "/?search_date=" + selected_date;
        $.ajax({
            type: "get",
            url,
            beforeSend: function () {
                $("#overlay").css("display", "block");
            },
            success: function (response) {
                $("#input-div-modal").html(response);
                $("#time").closest('.form-group').hide();
            },
            complete: function () {
                // Hide loader
                $("#overlay").css("display", "none");
            }
        });
    });

    //Get Availablity Doctor Time
    $(document).on('change', '#doctor_id', function () {
        var selected_date = $("#search_date").val();
        var doctor_id = $(this).val();
        var url = $(this).data('url') + "/?doctor_id=" + doctor_id + "&search_date=" + selected_date;
        $.ajax({
            type: "get",
            url,
            beforeSend: function () {
                $("#overlay").css("display", "block");
            },
            success: function (response) {
                $("#time").closest('.form-group').show();
                $("#time").attr('min', response.start_time).attr('max', response.end_time)
                $("#available_time").html('<p class="alert alert-warning">Doctor available between <strong>' + response.start_time + '</strong> to <strong>' + response.end_time + '</strong></p>')
            },
            complete: function () {
                // Hide loader
                $("#overlay").css("display", "none");
            }
        });
    });
    $(document).on('change', '#time', function () {
        $(".has_error").remove();
        const selectedTime = this.value;
        const minTime = $(this).attr('min');
        const maxTime = $(this).attr('max');

        if (selectedTime < minTime || selectedTime > maxTime) {
            $("#time").after('<div class="has_error">Please select a time between ' + minTime + ' and ' + maxTime + '.</div>');
            this.value = '';
        }
    });
    // Handle form success response
    const handleFormSuccess = (data, xhr) => {
        if (xhr.status === 400) {
            showErrors(data.error);
        } else if (xhr.status === 500) {
            notify(data.status, data.message);
        } else {
            playSuccess();
            notify(data.status, data.message);
            // $("form[name=master_form]")[0].reset();
            if (data.redirect) {
                setTimeout(() => {
                    if (data.refresh) {
                        window.location.reload(true); // Force a hard refresh to clear cache
                    } else {
                        window.location.href = data.url || window.location.reload();
                    }
                }, 1000);
            } else if (data.is_logout) {
                $(".logout-form").submit();
            } else {
                if ($(".quick-add-record").length && data.result) {
                    const eId = $(".quick-add-record").attr('id');
                    var select_id = $('#' + eId);

                    if (data.result.status == 1) {

                        var newOption = new Option(data.result.name, data.result.id, true, true);
                        // Quick it to the select
                        // $('#' + eId)
                        //     .append(newOption)
                        //     .trigger('change');


                        if (select_id.hasClass('searchSelect')) {
                            var newOption = {
                                value: data.result.id,
                                label: data.result.name,
                                selected: true
                            };
                            let selectElement = document.querySelector('.searchSelect');
                            var selectId = $(selectElement).attr('id');
                            if (choicesInstances[eId]) {

                                choicesInstances[eId].setChoices(
                                    [newOption],
                                    'value',
                                    'label',
                                    false
                                );


                            }
                        } else {
                            select_id.append(new Option(data.result.name, data.result.id, true, true)).trigger('change');
                        }


                    }
                    //Close the modal
                    const modelId = $(".quick-add-record").closest('.modal').attr('id');
                    $(".quick-add-record").removeClass("quick-add-record");
                    const openedModelId = modelId.replace("Quick", "");
                    $("#" + modelId).modal('hide');
                    $("#" + openedModelId).modal('show');
                } else {
                    if (typeof data_table !== 'undefined' && data_table !== null) {
                        data_table.ajax.reload();
                        if ($(".modal").length) {
                            $(".modal").modal('hide');
                        }
                    }
                }
            }
        }
    };

    // Handle form error response
    const handleFormError = (response, status, error) => {
        const data = response.responseJSON;
        if (status === 'error') {
            playError();
            if (!data.errors && data.message) {
                notify(status, data.message);
            }
            showErrors(data.errors);
            $("#overlay").hide();
        }
    };

    // Display error messages
    const showErrors = (errors) => {
        $.each(errors, (i, val) => {
            const input = $(`input[name=${i}], textarea[name=${i}], select[name=${i}]`);
            if (input.closest('.input-group').length) {
                input.closest('.input-group').after(`<div class="text-danger has_error">${val}</div>`);
            } else {
                input.closest('.form-group').append(`<div class="text-danger has_error">${val}</div>`);
            }
        });
    };




    // Load record into modal
    const loadModalRecord = (modalId, url) => {
        $.ajax({
            type: "get",
            url,
            success: function (response) {
                $(modalId).find(".modal-content").html(response);
                $(modalId).modal('show');
                $('.searchSelect').each(function () {
                    var selectId = $(this).attr('id');

                    choicesInstances[selectId] = null;

                    if (!choicesInstances[selectId]) {
                        choicesInstances[selectId] = new Choices(this, {
                            shouldSort: false,
                            searchEnabled: true,
                            removeItemButton: false,
                            itemSelectText: '',
                        });
                    }
                });
                if ($('.datepicker-basic').length > 0) {
                    if ($('.datepicker-basic').val()) {
                        flatpickr('.datepicker-basic', {
                            dateFormat: "d-m-Y",
                            defaultDate: new Date($('.datepicker-basic').val())
                        });
                    } else {
                        flatpickr('.datepicker-basic', {
                            dateFormat: "d-m-Y",
                            defaultDate: new Date()
                        });
                    }
                }
                setTimeout(() => {
                    $(modalId).find('input[type=text], input[type=email], input[type=number], input[type=password]').filter(':visible:not(.datepicker-basic):first').focus();
                }, 500);

            }
        });
    };

    const loadModalRecordQuick = (modalId, url, eId) => {
        const openedModalId = modalId.replace("Quick", "");
        $.ajax({
            type: "get",
            url,
            success: function (response) {
                $(modalId).find(".modal-content").html(response);
                $(openedModalId).modal('hide');
                $(modalId).find('.modal-footer').find('.modal-close').attr('data-openedmodalid', openedModalId);
                $(modalId).modal('show');
                if ($('.datepicker-basic').val()) {
                    flatpickr('.datepicker-basic', {
                        dateFormat: "d-m-Y",
                        defaultDate: new Date($('.datepicker-basic').val())
                    });
                } else {
                    flatpickr('.datepicker-basic', {
                        dateFormat: "d-m-Y",
                        defaultDate: new Date()
                    });
                }
                setTimeout(() => {
                    $(modalId).find('input[type=text], input[type=email], input[type=number], input[type=password]').filter(':visible:not(.datepicker-basic):first').focus();
                    $(modalId).find('.modal-content').append('<input type="hidden" class="quick-add-record"  id="' + eId + '">');
                }, 500);

            }
        });
    };

    $(document).on('click', '.loadRecordModal, .loadRecordModalLarge, .viewRecordModal, .loadRecordModalPassword', function (e) {
        var modalId = $(this).hasClass('loadRecordModal') ? '#commonModal' : '#commonModalLarge';
        modalId = $(this).hasClass('loadRecordModalPassword') ? '#passwordModal' : modalId;
        loadModalRecord(modalId, $(this).data('url'));
    });

    $(document).on('click', '.loadRecordModalQuick, .loadRecordModalLargeQuick', function (e) {
        const modalId = $(this).hasClass('loadRecordModalQuick') ? '#commonModalQuick' : '#commonModalLargeQuick';
        const eId = $(this).data('masterid');
        loadModalRecordQuick(modalId, $(this).data('url'), eId);
    });

    // Status update toggle
    const updateStatus = (url, element) => {
        updateStatusAlert(function () {
            $.ajax({
                type: "get",
                url,
                success: function (data, status, xhr) {
                    notify(data.status, data.message);
                    if (xhr.status === 200) {
                        playSuccess();
                        if (data.redirect) {
                            window.location.reload();
                        } else {
                            data_table.ajax.reload();
                        }
                    }
                }
            });
        });
    };

    $(document).on('click', '.update_status', function () {
        updateStatus($(this).data('url'), this);
    });

    $(document).on('change', '.other_status', function () {
        const url = $(this).data('url');
        updateStatus(url, this);
    });

    // Delete record
    $(document).on('click', '.delete_record', function () {
        const url = $(this).data('url');
        const tr = $(this).closest('tr');
        deleteAlert(function () {
            $.ajax({
                type: "POST",
                url,
                data: { _method: "DELETE", _token: $("meta[name='csrf-token']").attr("content") },
                success: function (data, status, xhr) {
                    notify(data.status, data.message);
                    if (xhr.status === 200) {
                        playSuccess();
                        if (data.redirect) {
                            window.location.reload();
                        } else {
                            if (typeof data_table !== 'undefined' && data_table !== null) {
                                data_table.ajax.reload();
                            } else {
                                if (tr.length) {
                                    tr.remove();
                                } else {
                                    window.location.reload();
                                }
                            }
                        }
                    }
                }
            }).fail(handleFormError);
        });
    });

    //Sync Language Data
    $(document).on('click', '.sync', function () {
        const url = $(this).data('url');
        syncAlert(function () {
            $.ajax({
                type: "GET",
                url,
                beforeSend: function () {
                    $("#overlay").show();
                },
                success: function (data, status, xhr) {
                    notify(data.status, data.message);
                    if (xhr.status === 200) {
                        if (data.redirect) {
                            setTimeout(() => {
                                window.location.href = data.url || window.location.reload();
                            }, 1000);
                        }
                    }
                },
                complete: function () {
                    $("#overlay").hide();
                }

            }).fail(handleFormError);
        });
    });

    // Restore record
    $(document).on('click', '.restore_record', function () {
        const url = $(this).data('url');
        restoreAlert(function () {
            $.ajax({
                type: "GET",
                url,
                success: function (data, status, xhr) {
                    notify(data.status, data.message);
                    if (xhr.status === 200) {
                        if (data.redirect) {
                            window.location.reload();
                        } else {
                            data_table.ajax.reload();
                        }
                    }
                }
            });
        });
    });

    //Onchange country get district
    if ($("#country_id").length == 0) {
        $(document).on('change', '#country_id', function () {
            var country = $(this).val();
            var url = $(this).data('url');
            var append_id = $(this).data('append_id');
            if (country != undefined && url != undefined && append_id != undefined) {
                getAjaxData(url, country, append_id);
            }
        });
    }

    // Onchange office type id get office for model
    if ($("#state_id").length == 0) {
        $(document).on('change', '#state_id', function () {
            var state = $(this).val();
            var url = $(this).data('url');
            var append_id = $(this).data('append_id');
            if (state != undefined && url != undefined && append_id != undefined) {
                getAjaxData(url, state, append_id);
            }
        });
    }

    // Onchange main menu id get sub menu for model
    if ($("#main_menu_id").length == 0) {
        $(document).on('change', '#main_menu_id', function () {
            var main_menu = $(this).val();
            var url = $(this).data('url');
            var append_id = $(this).data('append_id');
            if (main_menu != undefined && url != undefined && append_id != undefined) {
                getAjaxData(url, main_menu, append_id);
            }
        });
    }

    // onchange subject get sub subject
    $(document).on('change', '#case_subject_id', function () {
        var subject = $(this).val();
        var url = $(this).data('url');
        var append_id = $(this).data('append_id');
        if (subject != undefined && url != undefined && append_id != undefined) {
            getAjaxData(url, subject, append_id);
        }
    });

    // onchange department get sub department
    $(document).on('change', '.department', function () {
        var department = $(this).val();
        var url = $(this).data('url');
        var append_id = $(this).data('append_id');
        if (department != undefined && url != undefined && append_id != undefined) {
            getAjaxData(url, department, append_id);
        }
    })

    // Onchange office type  get office for form
    $(document).on('change', '.office_type', function () {
        var office_type = $(this).val();
        var url = $(this).data('url');
        var append_id = $(this).data('append_id');
        if (office_type != undefined && url != undefined && append_id != undefined) {
            getAjaxData(url, office_type, append_id);
        }
    });

    // on change district get oic master data for form
    $(document).on('change', '#district_id', function () {
        var district = $(this).val();
        var url = $(this).data('url');
        var append_id = $(this).data('append_id');
        if (district != undefined && url != undefined && append_id != undefined) {
            getAjaxData(url, district, append_id);
        }
    });

    // change court get location from court district mapping
    $(document).on('change', '#court_id', function () {
        var court = $(this).val();
        var url = $(this).data('url');
        var append_id = $(this).data('append_id');
        if (court != undefined && url != undefined && append_id != undefined) {
            getAjaxData(url, court, append_id);
        }
    });

    // get division by state
    $(document).on('change', '#state_id', function () {
        var state = $(this).val();
        var url = $(this).data('url');
        var append_id = $(this).data('append_id');
        if (state != undefined && url != undefined && append_id != undefined) {
            getAjaxData(url, state, append_id);
        }
    })

    // change employee_id and get employee data
    $(document).on('change', '#oic_user_id', function () {
        var url = $(this).data('url');
        var id = $(this).val();
        if (url != undefined && id != undefined) {
            // var data =  getDetailAjaxData(url, id);
            $.ajax({
                type: "get",
                url: url,
                data: {
                    id: id
                },
                beforeSend: function () {
                    $("#overlay").css("display", "block");
                },
                success: function (data) {

                    if (data) {
                        var name = data.name;
                        var mobile = data.mobile;
                        var emmail = data.email;
                        var designation_id = data.designation_id;
                        var department_id = data.department_id;
                        $("#name").val(name).attr("readonly", true);
                        $("#mobile_number").val(mobile).attr("readonly", true);
                        $("#emmail").val(emmail).attr("readonly", true);
                        $("#designation_id").val(designation_id);
                        $("#department_id").val(department_id);
                    }

                },
                complete: function () {
                    // Hide loader
                    $("#overlay").css("display", "none");
                }
            });

        }


    });

    // Check All Checkboxes
    $(document).on('click', '.select_all', function () {
        let $row = $(this).closest('tr');
        let $tbody = $row.closest('tbody');

        // Check/uncheck all checkboxes in the current row
        $row.find('.permission-checkbox').prop('checked', this.checked);
        let menu_name = $(this).data('module');
        // Find the associated main module checkbox (only for this module)
        let $mainModuleCheckbox = $tbody.find('.main-module-' + menu_name).first();
        if (this.checked) {
            $mainModuleCheckbox.prop('checked', true);
        } else {
            let anySubChecked = $(this).closest('tbody').find(`[data-module="${menu_name}"]:checked`).length > 0;
            $mainModuleCheckbox.prop('checked', anySubChecked);
        }
    });

    // Uncheck Select All if any checkbox is unchecked
    $(document).on('click', '.permission-checkbox', function () {
        var menu_name = $(this).data('module');

        if (!this.checked) {
            $(this).closest('tr').find('.select_all').prop('checked', false);
        } else {
            // If all checkboxes are checked, check the Select All checkbox
            var $row = $(this).closest('tr');
            var $selectAll = $row.find('.select_all');
            var $relatedCheckboxes = $row.find('.permission-checkbox').not('.select_all');

            if ($relatedCheckboxes.length === $relatedCheckboxes.filter(':checked').length) {
                $selectAll.prop('checked', true);
            }
        }

        // Check or uncheck the main module checkbox
        var $mainModuleCheckbox = $(this).closest('tbody').find('.main-module-' + menu_name);

        if ($(this).is(':checked')) {
            $mainModuleCheckbox.prop('checked', true);
        } else {
            // Corrected selector: Use proper attribute selector and ensure the element is wrapped in jQuery
            let anySubChecked = $(this).closest('tbody').find(`[data-module="${menu_name}"]:checked`).length > 0;
            $mainModuleCheckbox.prop('checked', anySubChecked);
        }
    });


    $(document).on('click', '.main-module-checkbox', function () {
        let module_name = $(this).data('mainmodule');
        //if unchecked then uncheck all checkboxes data-module
        if (!this.checked) {
            $(this).closest('tbody').find(`[data-module="${module_name}"]`).prop('checked', false);
            // Uncheck all "Select All" checkboxes in this module
            $(this).closest('tbody').find('.select_all').prop('checked', false);
        }
    }
    );

    // On page load: Check if all checkboxes in a row are selected, then select "Select All"
    $('.select_all').each(function () {
        var $row = $(this).closest('tr');
        var $relatedCheckboxes = $row.find('.permission-checkbox').not('.select_all');

        if ($relatedCheckboxes.length === $relatedCheckboxes.filter(':checked').length) {
            $(this).prop('checked', true);
            // Check the main module checkbox
            var menu_name = $(this).data('module');
            var $mainModuleCheckbox = $row.closest('tbody').find('.main-module-' + menu_name);
            $mainModuleCheckbox.prop('checked', true);
        }
    });
});

//Initialize DataTable
function initializeTable(tableId, ajaxUrl, columns, buttons = []) {
    if ($(tableId).length) {
        let leftColumnsCount = columns.filter(col => col.freeze).length;
        return $(tableId).DataTable({
            processing: true,
            serverSide: true,
            scrollY: "75vh",
            scrollX: true,
            responsive: false,
            autoWidth: false,
            aLengthMenu: [
                [-1, 10, 25, 50, 100, 200],
                ["All", 10, 25, 50, 100, 200]
            ],
            pageLength: 10,
            paging: true,
            scrollCollapse: true,
            ajax: {
                url: ajaxUrl,
                type: 'POST',
                data: function (d) {
                    var api = new $.fn.dataTable.Api(tableId);
                    d._token = $('meta[name="csrf-token"]').attr('content');
                    if ($("#status_filter").length) {
                        d.status_filter = $("#status_filter").val();
                    }
                    api.columns().every(function (i) {
                        if (columns[i].is_select_search && $('select', $(api.column(i).footer())).val()) {
                            d[api.column(i).dataSrc() + '_search'] = $('select', $(api.column(i).footer())).val();
                        }
                    });
                },
                error: function (xhr, error, thrown) {
                    if (xhr.status === 419 || xhr.status === 401) {
                        //  alert('Your session has expired. You will be redirected to the login page.');
                        window.location.href = '/login';
                    } else {
                        alert('Failed to load data. Please refresh the page or contact support.');
                    }
                }
            },
            dom: '<"top"lfB>rt<"bottom"ip><"clear">',
            buttons: buttons,
            aaSorting: [],
            columns: columns,
            fixedHeader: true,
            fixedColumns: {
                leftColumns: leftColumnsCount
            },
            createdRow: function (row, data, dataIndex) {
                columns.forEach((col, index) => {
                    if (col.wrap) {
                        $('td:eq(' + index + ')', row).addClass('dt-wrap');
                    }
                });
            },
            headerCallback: function (thead, data, start, end, display) {
                $(thead).find('th').each(function (index) {
                    $(this).html(columns[index].title);
                });
            },
            initComplete: function () {
                this.api().columns().every(function () {
                    var column = this;
                    var columnOptions = columns[this.index()];
                    if (columnOptions.searchable !== false) {
                        if (columnOptions.is_input_search) {
                            $('<input type="text" class="form-control" placeholder="Search by ' + columnOptions.name + '" />')
                                .appendTo($(column.footer()).empty())
                                .on('keyup', function () {
                                    var val = $.fn.dataTable.util.escapeRegex(
                                        $(this).val()
                                    );
                                    column.search(val ? val : '', true, false).draw();
                                    // Force redraw & column adjustment
                                    setTimeout(() => {
                                        column.draw();
                                        $(tableId).DataTable().columns.adjust().draw();
                                    }, 200);
                                });
                        } else {
                            var select = $('<select class="form-select"><option value="">All</option></select>')
                                .appendTo($(column.footer()).empty())
                                .on('change', function () {
                                    var val = $.fn.dataTable.util.escapeRegex(
                                        $(this).val()
                                    );
                                    column.search(val ? '^' + val + '$' : '', true, false).draw();
                                });

                            column.data().unique().sort().each(function (d, j) {
                                select.append('<option value="' + d + '">' + d + '</option>')
                            });
                        }
                    }
                });
            },
            drawCallback: function (settings) {
                var api = this.api();
                var searchVal = api.search().trim();

                if (searchVal) {
                    // Escape special characters for regex
                    var escapedSearch = searchVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    var regex = new RegExp('(' + escapedSearch + ')', 'gi');

                    api.rows({ page: 'current' }).every(function () {
                        var row = this.node();
                        $(row).find('td').each(function (index) {
                            // Skip action column and any other columns with raw HTML
                            if (columns[index].data === 'action' || columns[index].data === 'image' || columns[index].data === 'status') {
                                return;
                            }

                            var cell = $(this);
                            var originalText = cell.text();
                            var highlightedText = originalText.replace(regex, '<span class="highlight">$1</span>');
                            cell.html(highlightedText);
                        });
                    });
                }
            }
        });
    }
    return null;
}

//Common function to get data from ajax
function getAjaxData(url, id, append_id = null, append_id2 = null) {
    $.ajax({
        type: "get",
        url: url,
        data: {
            id: id
        },
        beforeSend: function () {
            $("#overlay").css("display", "block");
        },
        success: function (data) {
            var list = '';
            list += '<option value="">Please select</option>';
            if (data.length > 0) {
                $.each(data, function (k, v) {

                    list += '<option value="' + v.id + '">' + v.name + '</option>';
                });
            } else {
                if (id != '') {
                    list += '<option value="">No Data Found!</option>';
                }
            }


            $selectElement = $("#" + append_id);
            // $selectElement.html(list); // Append new options

            if ($selectElement.hasClass('searchSelect')) {

                var selectId = $selectElement.attr('id');


                choicesInstances[selectId].setChoices(
                    data.map(item => ({
                        value: item.id,
                        label: item.name
                    })),
                    'value',
                    'label',
                    true
                );


            } else {
                $("#" + append_id).html(list);
            }

        },
        complete: function () {
            // Hide loader
            $("#overlay").css("display", "none");
        }
    });
}

// validate mobile number input to insert number and + befour the number
$(document).ready(function () {
    $(document).on('input', '.mobile-number', function () {
        let value = $(this).val();

        value = value.replace(/[^+\d]/g, '');
        if ((value.match(/\+/g) || []).length > 1) {
            value = value.replace(/\+/g, '').replace(/^/, '+');
        }
        if (value.length > 13) {
            value = value.substring(0, 13);
        }
        $(this).val(value);
    });

    //OnClick modal-close check openedmodalid and close the modal
    $(document).on('click', '.modal-close', function () {
        var openedModalId = $(this).data('openedmodalid');
        $(openedModalId).modal('show');
        //Close the modal
        $(this).closest('.modal').modal('hide');
    });
});


// input values sanitized
$(document).on("input", "input[type='text']", function () {
    let value = $(this).val();

    let $inputField = $(this);

    // Skip validation if the field was originally a password field
    if ($inputField.data("original-type") === "password") {
        return;
    }

    // Allowed characters: Letters, numbers, space, and specific special characters
    // let sanitizedValue = value.replace(/[^a-zA-Z0-9.\-_@?\s,'"()\[\]{}:;\/]/g, '');
    let sanitizedValue = value;
    // let maxLength = 220; // Character limit
    let maxLength = $(this).is("textarea") ? 1000 : 220;

    // Remove previous error messages
    $(this).next(".has_error_text").remove();

    // If input exceeds maxLength, trim it and show an error
    if (sanitizedValue.length > maxLength) {
        sanitizedValue = sanitizedValue.substring(0, maxLength);
        $(this).after('<div class="text-danger has_error_text">Maximum ' + maxLength + ' characters allowed.</div>');
    }

    // Set sanitized value back to the input field
    $(this).val(sanitizedValue);

    // Show error only for invalid characters (not length-related)
    if (value !== sanitizedValue && value.length <= maxLength) {
        $(this).after('<div class="text-danger has_error_text">Only letters, numbers, space, dot (.), hyphen (-), underscore (_), @, ?, and special characters like " \' ( ) [ ] { } : ; / are allowed.</div>');
    }
});

// for email validation
$(document).on("input", "input[type='email']", function () {
    let value = $(this).val();

    // Allowed characters for email: Letters, numbers, dot (.), underscore (_), hyphen (-), plus (+), and @ (only once)
    let sanitizedValue = value.replace(/[^a-zA-Z0-9.@+_-]/g, '');

    let maxLength = 220; // Email character limit
    let emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Basic email pattern

    // Remove previous error messages
    $(this).next(".has_error_email").remove();

    // Trim value if it exceeds max length
    if (sanitizedValue.length > maxLength) {
        sanitizedValue = sanitizedValue.substring(0, maxLength);
        $(this).after('<div class="text-danger has_error_email">Maximum 220 characters allowed.</div>');
    }

    // Set sanitized value back to the input field
    $(this).val(sanitizedValue);

    // Validate proper email format
    if (value !== sanitizedValue && value.length <= maxLength) {
        $(this).after('<div class="text-danger has_error_email">Invalid characters in email. Allowed: letters, numbers, dot (.), hyphen (-), underscore (_), plus (+), and @.</div>');
    } else if (value.length > 0 && !emailRegex.test(value)) {
        $(this).after('<div class="text-danger has_error_email">Please enter a valid email address (e.g., example@domain.com).</div>');
    }
});

// validate file type input

$(document).on("change", "input[type='file']", function () {
    let disallowedExtensions = ["exe", "bat", "sh"]; // Disallowed file types
    let file = this.files[0];

    // Remove any previous error messages
    $(this).next(".has_error_file").remove();

    if (file) {
        let fileName = file.name;
        let fileExtension = fileName.split(".").pop().toLowerCase();

        if (disallowedExtensions.includes(fileExtension)) {
            $(this).after('<div class="text-danger has_error_file">File type not allowed!</div>');
            $(this).val(""); // Clear the selected file
        }
    }
});

$(document).ready(function () {
    $(document).on('input', 'input[type="number"]', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    //Manage Booking Status
    $(document).on('change', '.booking-status', function () {
        if ($(this).val() == 2) {
            $("#rejection_reason-section").show();
        } else {
            $("#rejection_reason-section").hide();
        }
    });
})

function toggleEyeButton(button_id, input_id) {
    var input_id = $('#' + input_id);
    var button_id = $('#' + button_id);
    if (!input_id.data("original-type")) {
        input_id.data("original-type", input_id.attr("type"));
    }
    if (input_id.attr('type') == 'password') {
        input_id.attr('type', 'text');
        button_id.html('<i class="mdi mdi-eye-off"></i>');
    } else {
        input_id.attr('type', 'password');
        button_id.html('<i class="mdi mdi-eye-outline"></i>');
    }
}

function playSuccess() {
    var audio = document.getElementById("audio");
    audio.play();
}

function playError() {
    var error = document.getElementById("error");
    error.play();
}
