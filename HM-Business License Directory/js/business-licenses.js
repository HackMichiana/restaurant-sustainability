/**
 * @author Russell Loniello <Rloniello@gmail.com>
 * @author Hack Michiana  <http://hackmichiana.org/>
 * @file Manage Business licenses from South Bend Data Portal
 * Licensed under MIT
 *
 */




/* Golbal variables*/
var lastFID = 0;                              //used to increment ajax call to server
var businesses = [];                          //An Array of 'Business' objects

//Selection lists for multi-select form fields:
var statusSelection = [];
var licenseTypeSelection = [];
var citySelection = [];

//Selection list selections, what the user has selected from the fieldsets:
var statusSelections;
var licenseTypeSelectio;
var citySelections;

//our ajax request object
var request = new XMLHttpRequest();
// a response object
var response;

/*
  This function Fires after the request is returned.
*/
request.onload = function() {

  if (request.status === 200) {
    /*
    The request was successful
    */
    response = JSON.parse(request.responseText);
    //for each feature in features, passed as business add it to businesses
    response.features.forEach(function(business){
      /*
      Dynamically create options for search selections (multi-select)
        set the status description to the next (last 0+1 etc) index of each selection
        filter the selection to get only unique values.
        sort the list with standard alphabetical sort.
      */
      statusSelection[statusSelection.length] = business.attributes.License_Status_Description;
      statusSelection = statusSelection.filter((v, i, a) => a.indexOf(v) === i);
      statusSelection.sort();

      licenseTypeSelection[licenseTypeSelection.length] = business.attributes.Classification_Description;
      licenseTypeSelection = licenseTypeSelection.filter((v, i, a) => a.indexOf(v) === i);
      licenseTypeSelection.sort();

      citySelection[citySelection.length] = business.attributes.City;
      citySelection = citySelection.filter((v, i, a) => a.indexOf(v) === i);
      citySelection.sort();

      //create a new business listing.
      let listing = business.attributes;
      businesses.push(listing); //add it to businesses.
      this.addListingToTable(listing); //add it to the table.
    });

    //from the unique selection lists above, populate each multi-select
    populateMultiSelect('statusSelection', statusSelection);
    populateMultiSelect('licenseTypeSelection', licenseTypeSelection);
    populateMultiSelect('citySelection', citySelection);

  } else {
    /*
    The request Failed
    i.e. if (request.status !== 200)
    */
    promptErrorWith("An Unknown Error Occured While Retrieving The Data")
  }

  /*
   Since there are about 15k records, and we can only pull 2000
   at a time we need make another request for the data from the lastFID + 500

   Check to see if the there are features in the request, if none, we are done.
    otherwise, set lastFID and make a request for more data.
  */
  if(response.features.length > 0){
    lastFID = response.features[response.features.length - 1].attributes.FID
    getMoreData();
  } else {
    //otherwise we are done loading data..
    //remove 'loading' div
    document.getElementById('loader').remove();
    document.getElementById('updateButton').disabled = false;
  }


} //end of onload




/**
 * addListingToTable - Adds a business listing object to the html table
 *
 * @param  {object} business object containing properties of a business.
 */
function addListingToTable(business) {
  /*
  ***Table Structure***
  <tr>
  <td>FID #</td>
  <td>Business Name</td>
  <td><a href="#">Address</a></td>    Street_Address + City + State + Zip, linked to google
  <td>Phone</td>                      Business_Phone_Number
  <td>Issue Date</td>                 Issue_Date ::hover -> License_Expir_Date
  <td><a href="#">More Info</a></td>  Created Dynamically
  </tr>
  */
  var newTableRow = document.createElement('tr');

  /*
  The map address contains spaces
  that need to be replaced with '+' signs
  so that we can query google maps for them.
  */
  var dirtyMapAddress =  business.Business_Name + '+'
  + business.Street_Address + '+'
  + business.City + '+'
  + business.State + '+'
  + business.Zip;
  var mapAddress = dirtyMapAddress.split(' ').join('+');

  //business.Issue_Date is a ISO Timestamp aka numeric '1592340523902'
  //needs to be converted to a human readable format.
  var issueDate = formatDate(new Date(business.Issue_Date))


  //If the business has no address, do not create a link for google maps.
  if(business.Street_Address === "0 OUTSIDE CITY LIMITS") {
    newTableRow.innerHTML =
    '<td style="width:  5%">' + business.FID + '</td>'
    + '<td style="width:  12.66%">' + business.Business_Name + '</td>'
    + '<td style="width:  14.66%">'
    + business.Street_Address + ', '
    + business.City + ', '
    + business.State + ' '
    + business.Zip + ' '
    + '</td>'
    + '<td style="width:  10%">' + business.Business_Phone_Number + '</td>'
    + '<td style="width:  10%">' + issueDate + '</td>'
    + '<td style="width:  10%">' + business.License_Status_Description + '</td>'
  } else {
    newTableRow.innerHTML =
    '<td style="width:  5%">' + business.FID + '</td>'
    + '<td style="width:  12.66%">' + business.Business_Name + '</td>'
    + '<td style="width:  14.66%">'
    + '<a href="' + 'https://www.google.com/maps/search/' + mapAddress + '" target="_blank">'
    + business.Street_Address + ', '
    + business.City + ', '
    + business.State + ' '
    + business.Zip + ' '
    + '</a>'
    + '</td>'
    + '<td style="width:  10%">' + business.Business_Phone_Number + '</td>'
    + '<td style="width:  10%">' + issueDate + '</td>'
    + '<td style="width:  10%">' + business.License_Status_Description + '</td>';
  }

  document.querySelector('tbody').appendChild(newTableRow);
}



/**
 * formatDate - Formats a date to a human readable string.
 *
 * @param  {Date} date The date object to format.
 * @return {String}      Human readable string of the date.
 */
function formatDate(date) {
  var monthNames = [
    "Jan.", "Feb.", "Mar.",
    "Apr.", "May ", "Jun.", "Jul.",
    "Aug.", "Sep.", "Oct.",
    "Nov.", "Dec."
  ];
  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}


/**
 * populateMultiSelect - sets the options for a multi-select.
 *
 * @param  {String} field the id of multi-select field.
 * @param  {[String]} options an array of options to be added
 */
function populateMultiSelect(field, options){
  if (!field){
    //do nothing
  } else {
      var selector = document.getElementById(field);
      selector.options.length = 0;

      for (let i = 0; i <= options.length; i++){
          let opt = document.createElement('option');
          opt.value = options[i];
          opt.innerHTML = options[i];
          selector.appendChild(opt);
      }
  }
}

/**
 * getSelectValuesfor - gets the user selected options for a multi-select.
 *
 * @param  {String} field the id of multi-select field.
 * @return  {[String]} user selected options from the select field.
 */
function getSelectValuesfor(field) {
  if (!field){
    //do nothing.
  } else {
    var selector = document.getElementById(field);

    var result = [];
    var options = selector && selector.options;
    var opt;

    for (var i=0, iLen=options.length; i<iLen; i++) {
      opt = options[i];

      if (opt.selected) {
        result.push(opt.value || opt.text);
      }
    }
    return result;
  }
}

/**
 * updateTableResults - Updates the table after user presses 'update'
 *
 */
function updateTableResults() {
  statusSelections = getSelectValuesfor('statusSelection');
  licenseTypeSelections = getSelectValuesfor('licenseTypeSelection');
  citySelections = getSelectValuesfor('citySelection');

  var results = [];

  //filter businesses
    results = businesses.filter(function(b) {
      if(statusSelections.includes(b.License_Status_Description) && licenseTypeSelections.includes(b.Classification_Description) && citySelections.includes(b.City)) {
          return true
      }
    });


  if(results.length <= 0) {
    //dont update the table. error message
    promptErrorWith("0 Results For That Query");
  } else {
    //update table
      //get the old table body
    var tbody = document.querySelector('tbody');
    var newtablebody = document.createElement('tbody');
    tbody.parentNode.replaceChild(newtablebody, tbody);

    let shouldShowDuplicates = document.getElementById('showDuplicates').checked;

    //should we show Duplicates?, if not filter them out.
    if(shouldShowDuplicates) {
      updateResult(results.length);
      for(let i = 0; i < results.length; i++) {
        addListingToTable(results[i]);
        }
      } else  {

          var unique = {}; //Individual values not distinct
          var distinct = []; //distinct objects containing unique values.
          //for each result
          for( var i in results ) {
              //Cross reference phone number to records,
              // if one like it doesn't exist already, add it to distinct
            if( typeof(unique[results[i].Business_Phone_Number]) == "undefined"){
              distinct.push(results[i]);
            }
            unique[results[i].Business_Phone_Number] = 0;
          }
          //update the table.
          for(let i = 0; i < distinct.length; i++) {
            addListingToTable(distinct[i])
            }
            //update results text field
            updateResult(distinct.length);
          }
      }

  }


//we dont want to block the main thread.
async function getData() {
  request.open('GET',
  'https://services1.arcgis.com/0n2NelSAfR7gTkr1/arcgis/rest/services/Business_Licenses/FeatureServer/0/query?where=FID' + ' > ' + lastFID + ' AND FID <= ' + (lastFID + 500) + '&outFields=*&outSR=4326&f=json',
  true);

  //comment out the following line to quickly edit ui without making requests
  request.send();
}

/**
* getMoreData - Fetches more data from the API Server.
*
*/
function getMoreData() {
  //so long as we are getting listings, continue...
  if(response.features.length > 0){
    let percent = (lastFID / 15000) * 100;

    percent = Math.floor(percent);
      if(percent > 100) {
          percent = 100;
        }
      document.getElementById('loaderText').textContent = "Loading " + percent + "%";

      updateResult(businesses.length);
      getData();
    }
    //else stop.
}

/**
* exportResults - Exports Results (table listings) to CSV
*
*/
function exportResults() {
  alert("This feature is not implemented yet :'( ")
}


/**
* updateResult - updates the results text with number of results.
* @param  {Integer} count the number of returned results from query.
*/
function updateResult(count) {
  document.getElementById('resultCount').textContent = "Results: " + count;
}


/**
* promptErrorWith - Prompts the user with a div above the data table, disappears after 5 seconds.
* @param {String} message the message to the user.
*/
function promptErrorWith(message) {
  var prompt = document.getElementById('prompt');
  prompt.className = "col-6 offset-3 mt-3 alert alert-danger text-center";
  prompt.textContent =  message;

  setTimeout(function(){
    document.getElementById('prompt').innerHTML = '';
    document.getElementById('prompt').className = '';
  }, 5000);

}



getData();
