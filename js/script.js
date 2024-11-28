/*
    File: script.js
    GUI Assignment: HW4 CUsing the jQuery Plugin/UI with Your Dynamic Table    
    Nikolas Haddock, UMass Lowell Computer Science, 
    nikolas_haddock@student.uml.edu 
    Copyright (c) 2024 by Nikolas Haddock.  All rights reserved.
    This JavaScript file gathers input from an HTML form, validates
    the input using JQuery Validation, and then dynamically builds a multiplication 
    table. It also dynamically creates tabs to save tables and sets up slides both 
    using JQuery's UI library. It binds the inputs for the form with the sliders and
    creates the table as the inputs change. It creates a tab dynamically that can remove 
    multiple tabs at once. 
*/
$(document).ready(function(){
    // Added method to check that start is less than end
    $.validator.addMethod("lessThan", function(value, element, param) {
        var target = $(param);
        if (this.settings.onfocusout) {
            target.off(".validate-lessThan").on("blur.validate-lessThan", function() {
                $(element).valid();
            });
        }
        return Number(value) <= Number(target.val());
    });
    
    $('#multiplication-form').validate({ 
        rules: {
            hStart: {
                required: true,
                range: [-50, 50],
                lessThan: "#hEnd"
            },
            hEnd: {
                required: true,
                range: [-50, 50]
            },
            vStart: {
                required: true,
                range: [-50, 50],
                lessThan: "#vEnd"
            },
            vEnd: {
                required: true,
                range: [-50, 50]
            }
        },
        messages: {
            hStart: {
                required: "Please enter a starting row value.",
                range: "Value must be between -50 and 50.",
                lessThan: "Starting row must be less than or equal to ending row."
            },
            hEnd: {
                required: "Please enter an ending row value.",
                range: "Value must be between -50 and 50."
            },
            vStart: {
                required: "Please enter a starting column value.",
                range: "Value must be between -50 and 50.",
                lessThan: "Starting column must be less than or equal to ending comlumn."
            },
            vEnd: {
                required: "Please enter an ending column value.",
                range: "Value must be between -50 and 50."
            }
        }
    });
    
    var tabIds = []; // Array to keep track of tab IDs
    var hStart = 0, hEnd = 0, vStart = 0, vEnd = 0;

    // initializes slider;
    $( "#slider1" ).slider({
       range: true,
       min: -50,
       max: 50,
       values: [0, 5], // makes it easier to grab sliders
       animate:"slow",
       orientation: "horizontal",
       step: 1,
       // sets slider values on start
       create: function(event, ui) {
          const values = $(this).slider("option", "values");
          $("#slider1 a:first").text(values[0]);
          $("#slider1 a:last").text(values[1]);
       }, 
       // binds the values when the input changes the slider
       change: function( event, ui ) {
          hStart = ui.values[0];
          hEnd = ui.values[1];
          updateTable();
       }, 
       // updates all values while sliding
       slide: function(event, ui) {
          $("#slider1 a:first").text(ui.values[0]);
          $("#slider1 a:last").text(ui.values[1]);
          $("#hStart").val(ui.values[0]);
          $("#hEnd").val(ui.values[1]);
          hStart = ui.values[0];
          hEnd = ui.values[1];
          updateTable();
       }
    });
    // same as above but for second slider
    $("#slider2").slider({
       range: true,
       min: -50,
       max: 50,
       values: [0, 5],
       animate:"slow",
       orientation: "horizontal",
       step: 1,
       create: function(event, ui) {
          const values = $(this).slider("option", "values");
          $("#slider2 a:first").text(values[0]);
          $("#slider2 a:last").text(values[1]);
       },
       change: function( event, ui ) {
          vStart = ui.values[0];
          vEnd = ui.values[1];
          updateTable();
       }, 
       slide: function(event, ui) {
          $("#slider2 a:first").text(ui.values[0]);
          $("#slider2 a:last").text(ui.values[1]);
          $("#vStart").val(ui.values[0]);
          vStart = ui.values[0];
          $("#vEnd").val(ui.values[1]);
          vEnd = ui.values[1];
          updateTable();
       }
       
    });

    // updates the values and sliders when input changes
    $("#hStart").on("change", function () {
        let inputValue = Number($(this).val());

        // ensure the value stays within range and doesn't exceed hEnd's value
        if (inputValue < -50) inputValue = -50;
        if (inputValue > 50) inputValue = 50;
        // moves both handles if needed
        if (inputValue > $("#slider1").slider("values", 1)) {
            $("#hEnd").val(inputValue); // Push hEnd forward if needed
            $("#slider1").slider("values", 1, inputValue);
            $("#slider1 a:last").text(inputValue);
        }
        $("#slider1 a:first").text(inputValue);

        // Update the slider handle
        $("#slider1").slider("values", 0, inputValue);
        $(this).val(inputValue);
    });
    // same as above
    $("#hEnd").on("change", function () {
        let inputValue = Number($(this).val());

        if (inputValue > 50) inputValue = 50;
        if (inputValue < -50) inputValue = -50;
        if (inputValue < $("#slider1").slider("values", 0)) {
            $("#hStart").val(inputValue);
            $("#slider1").slider("values", 0, inputValue);
            $("#slider1 a:first").text(inputValue);
        }
        $("#slider1 a:last").text(inputValue);
        $("#slider1").slider("values", 1, inputValue);
        $(this).val(inputValue);
    });
    // same as above
    $("#vStart").on("change", function () {
        let inputValue = Number($(this).val());

        if (inputValue > 50) inputValue = 50;
        if (inputValue < -50) inputValue = -50;
        if (inputValue > $("#slider2").slider("values", 1)) {
            $("#vEnd").val(inputValue);
            $("#slider2").slider("values", 1, inputValue);
            $("#slider2 a:last").text(inputValue);
        }
        $("#slider2 a:first").text(inputValue);

        $("#slider2").slider("values", 0, inputValue);
        $(this).val(inputValue);
    });
    // same as above
    $("#vEnd").on("change", function () {
        let inputValue = Number($(this).val());

        if (inputValue > 50) inputValue = 50;
        if (inputValue < -50) inputValue = -50;
        if (inputValue < $("#slider2").slider("values", 0)) {
            $("#vStart").val(inputValue);
            $("#slider2").slider("values", 0, inputValue);
            $("#slider2 a:first").text(inputValue);
        }
        $("#slider2 a:last").text(inputValue);

        $("#slider2").slider("values", 1, inputValue);
        $(this).val(inputValue);
    });
    
    var tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>x</span></li>",
    tabCounter = 1;

  var tabs = $( "#tabs" ).tabs();

  // adds new tab using the input from the form
  function addTab() {
    if(!$('#multiplication-form').valid() ) // validates form before proceeding
        return;
    var label = "Table " + tabCounter,
      id = "tabs-" + tabCounter, // u
      li = $( tabTemplate.replace( /#\{href\}/g, "#" + id ).replace( /#\{label\}/g, label ) );
      const tableContentHtml = createTable(hStart, hEnd, vStart, vEnd);

    tabs.find( ".ui-tabs-nav" ).append( li );
    tabs.append( "<div id='" + id + "'><h4>Row: " + hStart + " to " + hEnd + ", Column: " + vStart + " to " + vEnd + 
        "</h4><div class='table-container'><table>" + tableContentHtml + "</table></div></div>" );
    tabs.tabs( "refresh" );
    tabCounter++;
    
    // keeps track of new id names
    tabIds.push({ id: id, label: label });

    // if manage tabs tab is open, update it
    if ($("#manage-tabs").length > 0) {
        updateTabsList();
    }
  }
    // checks validaion and then adds tab
    $( "#add_tab" ).on( "click", function(e) {
        e.preventDefault();
        if ($('#multiplication-form').valid()) {
            addTab();
        }
    });
    
    // clears all values and updates the table
    $("#clear_form").on( "click", function(e) {
        $("#multiplication-form").find("input").val(""); // Clear all input values
        hStart = 0, hEnd = 0, vStart = 0, vEnd = 0;
        $("#slider1").slider("values", [0, 0]);
        $("#slider2").slider("values", [0, 0]);
        $("#slider1 a").text(0);
        $("#slider2 a").text(0);
        updateTable();
        e.preventDefault();
    });

  // removing a tab
  tabs.on("click", "span.ui-icon-close", function() {
    var panelId = $(this).closest("li").remove().attr("aria-controls");
    $("#" + panelId).remove();

     // remove the tab from the tabIds array
     tabIds = tabIds.filter(function(tab) {
        return tab.id !== panelId;
    });

    tabs.tabs("refresh");

    // update the tabs list in manage tabs if it exists
    if ($("#manage-tabs").length > 0) {
        updateTabsList();
    }

    // if there are no tabs, close delete tabs tab
    if (tabIds.length === 0) {
        $("#tabs li[aria-controls='manage-tabs']").remove();
        $("#manage-tabs").remove();
        tabs.tabs("refresh");
    }
  });

  // creates manage tabs so user can delete more than one at a time
  $("#create-manage-tabs").on("click", function() {
    if (tabIds.length === 0)
        return;
    // check if the manage tabs tab already exists
    if ($("#manage-tabs").length === 0) {
        // Add the "Manage Tabs" tab
        var li = $("<li><a href='#manage-tabs'>Manage Tabs</a><span class='ui-icon ui-icon-close' role='presentation'>x</span></li>");
        tabs.find(".ui-tabs-nav").prepend(li); // puts it infront for easy access
        tabs.append("<div id='manage-tabs'><div id='tabs-list-container'></div><button id='delete-selected-tabs'>Delete Selected Tabs</button></div>");
        tabs.tabs("refresh");

        // event handler for deleting selected tabs
        $("#delete-selected-tabs").on("click", function() {
            // find all checked checkboxes
            var selectedTabs = [];
            $("#manage-tabs .tab-checkbox:checked").each(function() {
                selectedTabs.push($(this).val());
            });

            // if there are no tabs selected, don't continue
            if (selectedTabs.length === 0) {
                return;
            }

            // remove selected tabs
            selectedTabs.forEach(function(tabId) {
                // remove the tab and its content
                $("#tabs li[aria-controls='" + tabId + "']").remove();
                $("#" + tabId).remove();

                // remove from the tabIds array
                tabIds = tabIds.filter(function(tab) {
                    return tab.id !== tabId;
                });
            });

            tabs.tabs("refresh");
            updateTabsList(); // update the tabs list

            // temove the manage tabs tab if no tabs are left
            if (tabIds.length === 0) {
                $("#tabs li[aria-controls='manage-tabs']").remove();
                $("#manage-tabs").remove();
                tabs.tabs("refresh");
            }
        });

        // update the tabs list
        updateTabsList();
    }

    // switch to the manage tabs tab
    var index = $("#tabs a[href='#manage-tabs']").parent().index();
    tabs.tabs("option", "active", index);
});
    // updates table usinf the create table function
    function updateTable() {
        const tableHtml = createTable(hStart, hEnd, vStart, vEnd);
        $("#edit-table").html(`<table>${tableHtml}</table>`);
    }

    // function to update the tabs list in manage tabs
    function updateTabsList() {
        var tabsListContainer = $("#tabs-list-container");
        tabsListContainer.empty(); // Clear existing content

        if (tabIds.length === 0) {
            tabsListContainer.append("<p>No tabs available.</p>");
            $("#delete-selected-tabs").hide(); // hides button to avoid confusion
            return;
        }
        // adds each tab to a list with checkboxes
        var list = $("<ul></ul>");
        tabIds.forEach(function(tab) {
            var listItem = $("<li></li>");
            var checkbox = $("<input type='checkbox' class='tab-checkbox'>").val(tab.id);
            listItem.append(checkbox).append(" " + tab.label);
            list.append(listItem);
        });
        tabsListContainer.append(list);
        $("#delete-selected-tabs").show(); // shows button
    }   
    
});
function createTable(hStart, hEnd, vStart, vEnd) {
        let html = '<tr><th></th>';

        // Header row
        for (let h = hStart; h <= hEnd; h++)
            html += `<th>${h}</th>`;
        html += '</tr>';

        // Rows for each value in the vertical range
        for (let v = vStart; v <= vEnd; v++) {
            html += `<tr><th>${v}</th>`;
            for (let h = hStart; h <= hEnd; h++) {
                html += `<td>${h * v}</td>`;
            }
            html += '</tr>';
        }
        return html;
    }