$(function () {
  'use strict'
  let answers
  let token
  let teamName
  let teamMembers
  let teamEmail
  let btn_click
  let data = {
    TeamID: '',
    TeamName: '',
    TeamMembers: '',
    Email: '',
    TrivSections: {
      1: {
        'Q1-1': '',
        'Q1-2': '',
        'Q1-3': '',
        'Q1-4': '',
        'Q1-5': '',
        'Q1-6': '',
        'Q1-7': ''
      },
      2: {
        'Q2-1': '',
        'Q2-2': '',
        'Q2-3': '',
        'Q2-4': '',
        'Q2-5': '',
        'Q2-6': '',
        'Q2-7': ''
      },
      3: {
        'Q3-1': '',
        'Q3-2': '',
        'Q3-3': '',
        'Q3-4': '',
        'Q3-5': '',
        'Q3-6': '',
        'Q3-7': ''
      },
      4: {
        'Q4-1': '',
        'Q4-2': '',
        'Q4-3': '',
        'Q4-4': '',
        'Q4-5': '',
        'Q4-6': '',
        'Q4-7': ''
      },
      5: {
        'Q5-1': '',
        'Q5-2': '',
        'Q5-3': '',
        'Q5-4': '',
        'Q5-5': '',
        'Q5-6': '',
        'Q5-7': ''
      },
      6: {
        'Q6-1': '',
        'Q6-2': '',
        'Q6-3': '',
        'Q6-4': '',
        'Q6-5': '',
        'Q6-6': '',
        'Q6-7': ''
      },
      7: {
        'Q7-1': '',
        'Q7-2': '',
        'Q7-3': '',
        'Q7-4': '',
        'Q7-5': '',
        'Q7-6': '',
        'Q7-7': '',
        'Q7-8': '',
        'Q7-9': '',
        'Q7-10': '',
        'Q7-11': '',
        'Q7-12': '',
        'Q7-13': '',
        'Q7-14': '',
        'Q7-15': '',
        'Q7-16': '',
        'Q7-17': '',
        'Q7-18': '',
        'Q7-19': '',
        'Q7-20': ''

      }
    },
      ButtonClick:[]
  }

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

    try {
      var json = JSON.parse(message.data)
    } catch (e) {
      console.log('This doesn\'t look like a valid JSON: ', message.data)
      return
    }

    if(json === 'Reset Tokens'){
      window.localStorage.removeItem('HPTriviaTK')
    }

    //console.log(json)
    if(json === 'Welcome Wizard!'){
     token = window.localStorage.getItem('HPTriviaTK');
      if(!token){
        connection.send(JSON.stringify(
          { type: 'Token', data: 'No Token' }))
          console.log('No Token, Requesting Token')
      } else {
        connection.send(JSON.stringify(
          { type: 'Token', data: token }))
          console.log('Token Exists, Providing Token')
          console.log(token + ' is this session\'s token.')
      }
    }


    if (json.Type === 'Auth'){
    window.localStorage.setItem('HPTriviaTK', json.Data);
    token = window.localStorage.getItem('HPTriviaTK');
    console.log(token + ' is this session\'s token.')
    };

    if (json.Type === 'Previously Submitted'){
      console.log('Previously Submitted')
      //console.log(json.Data)
      data = json.Data
      $('#teamName').val(json.Data.TeamName);
      $('#teamMembers').val(json.Data.TeamMembers);
      $('#teamEmail').val(json.Data.Email);
      $('#teamName').attr('disabled', 'disabled')
      $('#teamMembers').attr('disabled', 'disabled')
      $('#teamEmail').attr('disabled', 'disabled')
      //console.log(Object.keys(data.TrivSections))

      for (const key in data.TrivSections) {
        const TrivSection = data.TrivSections[key]
        for (const prop in TrivSection) {
          const value = TrivSection[prop]
          //console.log(value)
          if(value || value === 0 ){
            $(`#${prop}`).val(value)
            $(`#${prop}`).attr('disabled', 'disabled')
          }
        }
      }

      for (let i = 0; i < data.ButtonClick.length; i++){
        let btn = '#sub'+ data.ButtonClick[i]
        let check = '#check' + data.ButtonClick[i]
        $(btn).attr('disabled', 'disabled')
        console.log('Button:'+ btn + ' was previously clicked')
        $(check).css('visibility', 'visible')
      }


    }

    if(json.Type === 'forceSubmit'){
     // Do Stuff Here
     null
    }

    if(json.Type === 'Reenable'){
     // Do Stuff Here
     null
    }

    if(json.Type === 'Reconnect'){
     // Do Stuff Here
     null

     answers === json.Data ;

     //1) Input Team Name/ Info into correct feilds
     //2) Input previously submitted answers into feilds
     //3) Disable feilds that have already been submitted.

    }


  }

  $('#authModal').modal('hide')

  // Submit Authentication Button
  $('#authButton').click(function () {
    token = $('#authToken').val()
    connection.send(JSON.stringify(
      { type: 'Auth', data: token }))
    console.log('sent')
  })

  // Submit Answers by Section
  $('.sub').click(function () {
    const reg = /\d+/g
    const section = $(this).attr('id').match(reg)
    //console.log(section)
    const check = '#check' + section
    const inputs = 'div#answers' + section + ' input'
    if(!$('#teamName').val().trim()){
      alert('You can not submit answers without a Team Name. After you submit, you will no longer be able to change your name. ')
      return
    }
    $('#teamName').attr('disabled', 'disabled')
    $('#teamMembers').attr('disabled', 'disabled')
    $('#teamEmail').attr('disabled', 'disabled')
    for (let i = 0; i < $(inputs).length; i++) {
      const j = i + 1
      const v = 'Q' + section + '-' + j
      const p = '#' + v
      console.log(p)
      let ans = $(p).val()
      if(!$(p).val()){
        ans = '[No Answer Provided]'
      }
      data.TrivSections[section][v] = ans
      $(p).attr('disabled', 'disabled')
      // console.log(data.TrivSections[1][v]);
    }
    data.TeamID = token
    data.ButtonClick.push(parseInt(section))
    let button = '#sub' + section
    $(button).attr('disabled', 'disabled')
    $(check).css('visibility', 'visible')
    console.log(data)

    connection.send(JSON.stringify(
      { type: 'Submit', data: data }))
    console.log('Answers from Section' + section + ' sent.')
  })

  // Team Name - Fires Everytime the focus leaves the input form
  $('#teamName').focusout(function () {
    teamName = $('#teamName').val()
    data.TeamName = teamName
    console.log('Hence forth, this Team shall be known as: ' + teamName)
  })

  // Team Members - Fires Everytime the focus leaves the input form
  $('#teamMembers').focusout(function () {
    teamMembers = $('#teamMembers').val()
    data.TeamMembers = teamMembers
    console.log('Warlocks and Witches: ' + teamMembers)
  })

  // Team Members - Fires Everytime the focus leaves the input form
  $('#teamEmail').focusout(function () {
    teamEmail = $('#teamEmail').val()
    data.Email = teamEmail
    console.log('Another email we can sell for profit! : ' + teamEmail)
  })


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
