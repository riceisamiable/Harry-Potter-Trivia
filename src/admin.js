
let answers = []
let scoreColumns = []
let lastSelected
let selectTeams = {}

function createSelectData(selected){
  selectTeams = {
    results: [{
      text: 'Not Certified',
      children: []
    },
    {
      text: 'Certified',
      children: []
    }
    ]
  }
  //console.log(selectTeams)

  // Create data for Select2 Drop Down
  for (let i = 0; i < answers.length; i++) {
    const selectTemplate = {
      id: '',
      text: ''
    }

    selectTemplate.id = i
    selectTemplate.text = answers[i].name
    if(selected){
      if(selected === answers[i].name){
        selectTemplate["selected"] = true
      }
    }

    if (!answers[i].certified) {
      selectTeams.results[0].children.push(selectTemplate)
    } else {
      selectTeams.results[1].children.push(selectTemplate)
    }
  }

  //console.log(selectTeams)
}


function searchData (key, array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].name === key) {
      return i
    }
  }
}


function showScoreTab(teamname){

  $('#tabs a[href="#Scoring"]').tab('show')
  createSelectData(teamname);
  $("#mySelect2").html("")
  $('#mySelect2').select2({
    data: selectTeams.results
    //placeholder: 'Select an option'
  })
  lastSelected = teamname;
  let team  = searchData(teamname, answers)
  datatable.refresh(answers[team].answers, scoreColumns);
  //$('#mySelect2').val('10');
  //console.log(teamname)

  for (let i = 0; i < answers[team].answers.length; i++){
    if(answers[team].answers[i][2]){
      datatable.style.setStyle(`.dt-cell--row-`+i, {backgroundColor: '#b0f7c3'})
    } else {
      datatable.style.setStyle(`.dt-cell--row-`+i, {backgroundColor: '#ffffff'})

    }
  }

}

let datatable

$(function () {
  'use strict'

  let token
  let data = []
  let team = {}
  let qSubmitted
  let qGraded
  let leaderBoardData =[]
  let scoring = {}
  let qScores = {}
  let totalScore
  let colIndex
  let rowIndex
  const sheet = 'https://docs.google.com/spreadsheets/d/1GFGtldKSDSSbL2z0B_QvUWCqBTW5LtHlcPUHozd0Q5A/edit?usp=sharing'

   scoreColumns = [{name:'Question',
                    width: 90,
                    editable: false},
                    {name:'Answer',
                    width: 500,
                    editable: false,
                    align: 'left'},
                    {name:'Score',
                    width: 100} ]

  const leaderColumns = [{name:'Team',
                    width: 350,
                    editable: false},
                    {name:'Total Score',
                    width: 120,
                    editable: false},
                    {name:'Q\'s Submitted',
                    width: 140,
                    editable: false},
                    {name:'Q\'s Scored',
                    width: 120,
                    editable: false}  ]



  function calcQGraded(){
    for (let i = 0; i < answers.length; i++){
      qGraded = 0
      for (let  n = 0; n < answers[i].answers.length; n++){
        if(answers[i].answers[n][2] || answers[i].answers[n][2] === 0  ){
          qGraded = qGraded + 1
          console.log(answers[i].answers[n][0])
          console.log(answers[i].answers[n][2])
        }
          answers[i].qGraded = qGraded
      }
    }
  }

  function calcQSubmitted(){
    for (let i = 0; i < answers.length; i++){
      qSubmitted = 0
      for (let n = 0; n < answers[i].answers.length; n++){
        if(answers[i].answers[n][1]){
          qSubmitted = qSubmitted + 1
        }
        answers[i].qSubmitted = qSubmitted
      }
    }
  }

  function calcScores(){
    for(let i = 0; i < answers.length; i ++ ){
      totalScore = 0
      for (let o = 0; o < answers[i].answers.length; o++ ){
        let s = answers[i].answers[o][2];
        s = s ? s: 0;
        totalScore = totalScore + s;
        //console.log(totalScore)
      }
      answers[i].score = totalScore
    }
  }

  function createLeaderBoardData(){
    leaderBoardData = []
    for( let l = 0; l < answers.length; l++){
      leaderBoardData.push(['<a href="javascript: showScoreTab(\'' + answers[l].name + '\')">'+ answers[l].name + '</a>', answers[l].score, answers[l].qSubmitted, answers[l].qGraded]);

    }
  }

function searchSelectData(teamName, cert_cat){
  for (let i = 0; i < selectTeams.results[cert_cat].children.length; i++){
    if(selectTeams.results[cert_cat].children[i].text === teamName){
      return i
    }
  }
}

function calcCertButton(position){
  if(answers[position].certified === true ){
    $("#certify_btn").text('Un-Certify Team Score')
    $("#certify_btn").attr('class', 'btn btn-outline-success')
  } else {
    $("#certify_btn").text('Certify Team Score')
    $("#certify_btn").attr('class', 'btn btn-secondary')
  }
}

//Scoring Datatable
  datatable = new DataTable('#datatable', {
    columns: scoreColumns,   //['Question', 'Answer', 'Score'],
    data: null,
    inlineFilters: true,
    showTotalRow: true,
    disableReorderColumn: true,
    getEditor: (colIndex, rowIndex, value, parent, column, row, data) => {
        // colIndex, rowIndex of the cell being edited
        // value: value of cell before edit
        // parent: edit container (use this to append your own custom control)
        // column: the column object of editing cell
        // row: the row of editing cell
        // data: array of all rows

        const $input = document.createElement('input');
        $input.type = 'number';
        $input.classList = 'dt-input'
        parent.appendChild($input);

        return {
            // called when cell is being edited
            initValue(value) {
                $input.focus();
                $input.value = value
            },
            // called when cell value is set
            setValue(value) {
                $input.value = value
            },
            // value to show in cell
            getValue() {
                return $input.value
            }
        }
    },
    hooks: {
        columnTotal(columnValues, cell) {
            if (cell.colIndex === 3) {
                // calculated average for 5th column
                const sum = columnValues.reduce((acc, value) => {
                    if (typeof value === 'number') {
                        return acc + value
                    }
                    return acc
                }, 0);
                return sum
            }
            if (cell.colIndex === 2) {
                return 'Total'
            }
        }
    }
  });

//Leader Board Datatable
  const leaderboard = new DataTable('#leaderDatatable', {
    columns: leaderColumns,   //['Question', 'Answer', 'Score'],
    data: null,
    inlineFilters: true,
    showTotalRow: false,
    disableReorderColumn: true,
    //layout: 'fluid'
  });

  // if user is running mozilla then use it's built-in WebSocket
  window.WebSocket = window.WebSocket || window.MozWebSocket

  // if browser doesn't support WebSocket, just show some notification and exit
  if (!window.WebSocket) {
    content.html($('<p>', {
      text: 'Sorry, but your browser doesn\'t ' +
        'support WebSockets.'
    }))
    input.hide()
    $('span').hide()
    return
  }

  // open connection
  var connection = new WebSocket(
    window.location.hostname === 'localhost'
      ? 'ws://127.0.0.1:1337'
      : 'ws://134.122.29.209:1337'
  )

  connection.onopen = function () {
    // first we want users to enter their names
    connection.send(JSON.stringify({
      type: 'Auth',
      data: 'Admin'
    }))
    console.log('Admin Credentials Sent')
  }

  connection.onerror = function (error) {
    // just in there were some problems with conenction...
    content.html($('<p>', {
      text: 'Sorry, but there\'s some problem with your ' +
        'connection or the server is down.'
    }))
  }

  // most important part - incoming messages
  connection.onmessage = function (message) {
    // try to parse JSON message. Because we know that the server always returns
    // JSON this should work without any problem but we should make sure that
    // the massage is not chunked or otherwise damaged.

    //Check if items in Data exists

    try {
      var json = JSON.parse(message.data)
    } catch (e) {
      console.log('This doesn\'t look like a valid JSON: ', message.data)
      return
    }

    if (json.Type === 'Answers') {
      data = json.Data
      //console.log(data)
      console.log('Wizarding Data Received!')

      if(data[0]) {
        //Transform the Data for Datatable and Select
        for (let i = 0; i < data.length; i++) {
          team = {}
          team.name = data[i].TeamName
          team.answers = []

          // This is to save the scoring already done.
          const teamCheck = searchData(data[i].TeamName, answers)
          if (teamCheck >= 0) {
            qScores = {}
            totalScore = 0
            for (let o = 0; o < answers[teamCheck].answers.length; o++ ){
              let q = answers[teamCheck].answers[o][0]
              let s = answers[teamCheck].answers[o][2];
              qScores[q] = s
              s = s ? s: 0;
              totalScore = totalScore + s;
              //console.log(totalScore)
            }
            team.score = totalScore
            team.certified = answers[teamCheck].certified
          } else {
            team.score = 0
            team.certified = false
            team.qSubmitted = 7
            team.qGraded = 0
          }

          //console.log(team)

          const sections = Object.keys(data[i].TrivSections).length
          //  let obj = Object.values(data[i].TrivSections)

          for (let p = 0; p < sections; p++) {
            const obj = Object.entries(data[i].TrivSections[p + 1])

            for (let q = 0; q < obj.length; q++) {
               if (teamCheck >= 0) {
                  let s = qScores[obj[q][0]]

                  s = s ? s: ""
                  obj[q].push(s)
               }
              //obj[q].push(5);
              //console.log(obj[q])
              team.answers.push(obj[q])
            }
          }

          if (teamCheck >= 0) {
            answers[teamCheck] = team
            //console.log('beep')
          } else {
            answers.push(team)
            //console.log('boop')
          }

          //console.log(team.answers)
        }
        calcQGraded()
        calcQSubmitted()

        answers.sort((a, b) => (a.name > b.name) ? 1 : -1)
          //console.log(answers)

          selectTeams = {
            results: [{
              text: 'Not Certified',
              children: []
            },
            {
              text: 'Certified',
              children: []
            }
            ]
          }

          //console.log(selectTeams)

          // Create data for Select2 Drop Down
          for (let i = 0; i < answers.length; i++) {
            const selectTemplate = {
              id: '',
              text: ''
            }

            selectTemplate.id = i
            selectTemplate.text = answers[i].name
            if(lastSelected){
              if(lastSelected === answers[i].name){
                selectTemplate["selected"] = true
              }
            }

            if (!answers[i].certified) {
              selectTeams.results[0].children.push(selectTemplate)
            } else {
              selectTeams.results[1].children.push(selectTemplate)
            }
          }

          //console.log(selectTeams)


        //Destroy Select2 Element
        $("#mySelect2").html("")

        //Re Create Select2 Element
        $('#mySelect2').select2({
          data: selectTeams.results,
          //placeholder: 'Select an option'
        })

        if(lastSelected) {
            const position = searchData(lastSelected, answers)
            datatable.refresh(answers[position].answers,scoreColumns)

            for (let i = 0; i < answers[position].answers.length; i++){
              if(answers[position].answers[i][2]){
                datatable.style.setStyle(`.dt-cell--row-`+i, {backgroundColor: '#b0f7c3'})
              } else {
                datatable.style.setStyle(`.dt-cell--row-`+i, {backgroundColor: '#ffffff'})

              }
            }

        } else {
            datatable.refresh(answers[0].answers,scoreColumns)
            lastSelected = answers[0].name

            for (let i = 0; i < answers[0].answers.length; i++){
              if(answers[0].answers[i][2]){
                datatable.style.setStyle(`.dt-cell--row-`+i, {backgroundColor: '#b0f7c3'})
              } else {
                datatable.style.setStyle(`.dt-cell--row-`+i, {backgroundColor: '#ffffff'})

              }
            }
        }

        /*leaderBoardData = []
        for( let l = 0; l < answers.length; l++){
          leaderBoardData.push([answers[l].name, answers[l].score])
        }*/
          createLeaderBoardData()
          leaderboard.refresh(leaderBoardData, leaderColumns)
          leaderboard.sortColumn(2,'desc')
          //console.log(leaderBoardData)


      }
    }

// This is to handle data coming from a second person grading answers
    if (json.Type === 'GradedData') {
      //
      let changedAnswers = JSON.stringify(json.Data)
      let localAnswers = JSON.stringify(answers)
      let dmp = new diff_match_patch();
      let diff = dmp.diff_main(localAnswers, changedAnswers);
      dmp.diff_cleanupSemantic(diff);
      let patches = dmp.patch_make(localAnswers, changedAnswers, diff)
      let results = dmp.patch_apply(patches, localAnswers);
      results = JSON.parse(results[0])
      answers = results

      calcQGraded()
      calcQSubmitted()
      createLeaderBoardData()
      leaderboard.refresh(leaderBoardData, leaderColumns)
      leaderboard.sortColumn(2,'desc')



      if(lastSelected) {
          const position = searchData(lastSelected, answers)
          datatable.refresh(answers[position].answers,scoreColumns)

          createSelectData(lastSelected)
          $("#mySelect2").html("")
          //Re Create Select2 Element
          $('#mySelect2').select2({
            data: selectTeams.results
          })

          calcCertButton(position)

          for (let i = 0; i < answers[position].answers.length; i++){
            if(answers[position].answers[i][2]){
              datatable.style.setStyle(`.dt-cell--row-`+i, {backgroundColor: '#b0f7c3'})
            } else {
              datatable.style.setStyle(`.dt-cell--row-`+i, {backgroundColor: '#ffffff'})
            }
          }
      } else {

        //Recreate the DropDown Selector
        createSelectData(answers[0].name);
        $("#mySelect2").html("")
        $('#mySelect2').select2({
          data: selectTeams.results
        })
        //console.log(selectTeams)

        calcCertButton(0);

          datatable.refresh(answers[0].answers,scoreColumns)
          lastSelected = answers[0].name
          for (let i = 0; i < answers[0].answers.length; i++){
            if(answers[0].answers[i][2]){
              datatable.style.setStyle(`.dt-cell--row-`+i, {backgroundColor: '#b0f7c3'})
            } else {
              datatable.style.setStyle(`.dt-cell--row-`+i, {backgroundColor: '#ffffff'})
            }
          }
        }
    }


      if (json.Type === 'clients') {
        console.log('clients here')
        console.log(json.Data);
      }

  }

  $('#authButton').click(function () {
    token = $('#authToken').val()
    connection.send(JSON.stringify({
      type: 'Auth',
      data: token
    }))
    console.log('sent')
  })

  $('#mySelect2').on('select2:select', function (e) {
    const name = e.params.data.text
    //Global Variable for when Select2 is recreated
    lastSelected = name
    const position = searchData(name, answers)
    //Recreate Datatable on new selection.
    datatable.refresh(answers[position].answers, scoreColumns);
    //console.log(datatable.getRows())
    for (let i = 0; i < answers[position].answers.length; i++){
      if(answers[position].answers[i][2]){
        datatable.style.setStyle(`.dt-cell--row-`+i, {backgroundColor: '#b0f7c3'})
      } else {
        datatable.style.setStyle(`.dt-cell--row-`+i, {backgroundColor: '#ffffff'})

      }
    }

    calcCertButton(position)

  })


//Event to Find when a table cell is edited
$('body').on('focusout', '.dt-cell--editing', function() {
    rowIndex = $(this).attr('data-row-index')
    colIndex = $(this).attr('data-col-index')
    //console.log(rowIndex+' , '+ colIndex)
});


//Event that grabs new value in cell after editing
$('body').on('change', '.dt-input', function(){
  let newValue = parseInt($(this).val());
  console.log(newValue)
  let team = searchData(lastSelected, answers)
  console.log(team)
  if (isNaN(newValue)){
    //When user deletes a score remove it from answers array
    answers[team].answers[rowIndex].splice(2,1)
  } else {
    if(answers[team].answers[rowIndex][2] >= 0){

      answers[team].answers[rowIndex][2] = newValue
    } else {
      answers[team].answers[rowIndex].push(newValue)
    }
  }
  //Refresh table to recalculate total
  datatable.refresh(answers[team].answers, scoreColumns);

  for (let i = 0; i < answers[team].answers.length; i++){
    if(answers[team].answers[i][2]){
      //Change color background of row to green
      datatable.style.setStyle(`.dt-cell--row-`+i, {backgroundColor: '#b0f7c3'})
    } else {
      //Change color background of row back to white
      datatable.style.setStyle(`.dt-cell--row-`+i, {backgroundColor: '#ffffff'})

    }
  }
  //console.log(answers[team].answers);
  //console.log(answers[team].answers[rowIndex])
  //console.log(answers[team]);

  //Refresh The Leaderboard after new score are entered.

  calcScores()
  calcQGraded()
  calcQSubmitted()
  createLeaderBoardData()
  leaderboard.refresh(leaderBoardData, leaderColumns)
  leaderboard.sortColumn(2,'desc')



  //Send Graded answers to server.
  connection.send(JSON.stringify(
    { type: 'Graded', data: answers }));

  // Change Background of row to green after score has been entered
  //datatable.style.setStyle(`.dt-cell--row-`+rowIndex, {backgroundColor: '#b0f7c3'})
});


$('#certify_btn').click(function(){
  if( $("#certify_btn").text() === 'Certify Team Score'){
    $("#certify_btn").text('Un-Certify Team Score')
    $("#certify_btn").attr('class', 'btn btn-outline-success');
    let teamIndex = searchData(lastSelected, answers)
    answers[teamIndex].certified = true
  } else {
    $("#certify_btn").text('Certify Team Score')
    $("#certify_btn").attr('class', 'btn btn-secondary');
    let teamIndex = searchData(lastSelected, answers)
    answers[teamIndex].certified = false
  }

  createSelectData(lastSelected)
  $("#mySelect2").html("")
  //Re Create Select2 Element
  $('#mySelect2').select2({
    data: selectTeams.results
  })

  connection.send(JSON.stringify(
    { type: 'Graded', data: answers }));

} );

$('#uncert_btn').click(function(){
  console.log('penis here')
  for (let i = 0; i < answers.length; i++){
    answers[i].certified = false
  }
  createSelectData(lastSelected)
  $("#mySelect2").html("")
  //Re Create Select2 Element
  $('#mySelect2').select2({
    data: selectTeams.results
  })

  connection.send(JSON.stringify(
    { type: 'Graded', data: answers }));
})
    //  $('#tabs a[href="#Admin"]').tab('show')


  /**
   * This method is optional. If the server wasn't able to respond to the
   * in 3 seconds then show some error message to notify the user that
   * something is wrong.
   */
  setInterval(function () {
    if (connection.readyState !== 1) {
      status.text('Error')
      input.attr('disabled', 'disabled').val('Unable to comminucate ' +
        'with the WebSocket server.')
    }
  }, 3000)
})
