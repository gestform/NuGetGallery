﻿$(function () {
    'use strict';
    var _autocompleteTimeout = 0;
    var _autocompleteDelay = 100; //ms
    var _resultsCache = {};
    var _maxResults = 9;
    var _lastIndex = 0;

    function hookAutocomplete(maxResults) {
        _resultsCache.results = ko.observable();
        $(document).keydown(function (e) {
            if (e.keyCode === 27) {
                removeOldAutocompleteResults();
                e.stopPropagation();
            }
        });

        $("#autocomplete-results-container").keydown(function (e) {
            if (e.keyCode === 40) {
                if (_lastIndex < $("#autocomplete-results-list").children().length - 1) {
                    _lastIndex++;

                    $("#autocomplete-results-list").children()[_lastIndex].focus();
                } else if (_lastIndex == $("#autocomplete-results-list").children().length - 1) {
                    $("#search").focus();
                    _lastIndex = 0;
                }
                e.preventDefault();
            }
            else if (e.keyCode === 38) {
                if (_lastIndex > 0) {
                    _lastIndex--;
                    $("#autocomplete-results-list").children()[_lastIndex].focus();
                } else if (_lastIndex == 0) {
                    $("#search").focus();
                }

                e.preventDefault();
            }
            else if (e.keyCode === 9) {
                removeOldAutocompleteResults();
            }
        });

        $("#autocomplete-results-container").focusin(function (e) {
            $("#autocomplete-results-list").children()[_lastIndex].focus();
        });

        var searchBox = $("#search");
        searchBox.on("keyup", function (e) {
            clearTimeout(_autocompleteTimeout);
            if (e.keyCode === 27 || $(this).val().length < 1) {
                removeOldAutocompleteResults();
                e.stopPropagation();;
                return;
            }

            if ((e.keyCode >= 46 && e.keyCode <= 90)        //delete, 0-9, a-z
                || (e.keyCode >= 96 && e.keyCode <= 111)    //numpad
                || (e.keyCode >= 186)                       //punctuation
                || (e.keyCode == 8))                        //backspace
            {
                _autocompleteTimeout = setTimeout(doSearch.bind(this, maxResults), _autocompleteDelay);
            }
        });

        searchBox.keydown(function (e) {
            if (e.keyCode == 40) {
                $("#autocomplete-results-container").focus();
                e.preventDefault();
            }
            else if (e.keyCode == 38 && _lastIndex == 0) {
                _lastIndex = $("#autocomplete-results-list").children().length - 1;
                $("#autocomplete-results-container").focus();
                e.preventDefault();
            }
            else if (e.keyCode === 9) {
                removeOldAutocompleteResults();
            }
        })
    }

    function removeOldAutocompleteResults() {
        var oldBox = $("#autocomplete-results");
        oldBox.remove();
        $("#autocomplete-results-container").hide();

        _lastIndex = 0;
        _autocompleteTimeout = 0;
    }

    function doSearch(maxResults) {
        var currInput = $("#search").val();
        if (currInput.length < 1) {
            return;
        }

        var requestUrl = "/api/v2/package-ids?partialId=" + currInput + "&semVerLevel=2.0.0";
        $.ajax({
            url: requestUrl,
            method: "GET",
            success: function (data, status) {
                if (data.length < 1) {
                    return;
                }

                $("#autocomplete-results-container").show();

                _resultsCache.results({ data: data.slice(0, maxResults) });

                var container = $("#autocomplete-results");
                if (container.length < 1) {
                    container = document.createElement("div");
                    $(container).attr("id", "autocomplete-results");
                    $(container).attr("data-bind", "template: { name: 'autocomplete-results-template', data: results }");
                    $("#autocomplete-results-container").append(container);

                    ko.applyBindings(_resultsCache, container);
                }

                for (var i = 0; i < data.length; i++) {
                    var id = data[i];
                    var temp = _resultsCache[safeId(id)];
                    if (!temp) {
                        _resultsCache[safeId(id)] = ko.observable(id);
                    }
                }

                setupAllAuxData(data.slice(0, maxResults));
            }
        });
    }

    function setupAllAuxData(idList) {
        var requestUrl = "/api/v2/package-details?searchString=";
        for (var i = 0; i < idList.length; i++) {
            var tempId = idList[i];
            var searchData = _resultsCache[safeId(tempId)];
            if (typeof searchData() == "string") {
                requestUrl += "packageId:" + idList[i] + " ";
            }

            appendAuxData(idList[i]);
        }


        $.ajax({
            url: requestUrl,
            method: "GET",
            success: function (data, status) {
                var dataList = data.Data;
                for (var i = 0; i < dataList.length; i++) {
                    var dataBlock = dataList[i];
                    var someId = dataBlock.PackageRegistration.Id;

                    _resultsCache[safeId(someId)](dataBlock);
                }
            }
        });
    }

    function appendAuxData(id) {
        var testNotExist = $("#autocomplete-results-row-" + jquerySafeId(id)).length < 1;

        if (testNotExist) {
            var container = document.createElement("div");
            $(container).attr("id", "autocomplete-results-row-" + id);
            $(container).attr("data-bind", "template: { name: 'autocomplete-results-row', data: " + safeId(id) + " }");
            var parent = $("#autocomplete-container-" + jquerySafeId(id));
            parent.append(container);

            ko.applyBindings(_resultsCache, container);
        }
    }

    function jquerySafeId(id) {
        return id.replace(/\./g, "\\.");
    }

    function safeId(id) {
        return id.replace(/(\.|-)/g, "");
    }

    hookAutocomplete(_maxResults);
});