$(function () {
  'use strict'
  let answers
  let token
  let teamName
  let teamMembers
  let teamEmail
  const data = {
    TeamID: '',
    TeamName: 'Kurz',
    TeamMembers: 'David, Bobbin, Kia, Ben',
    Email: 'kurz@kurz.com',
    TrivSections: {
      1: {
        Q1: '',
        Q2: '',
        Q3: '',
        Q4: '',
        Q5: '',
        Q6: '',
        Q7: ''
      },
      2: {
        Q8: '',
        Q9: '',
        Q10: '',
        Q11: '',
        Q12: '',
        Q13: '',
        Q14: ''
      },
      3: {
        Q15: '',
        Q16: '',
        Q17: '',
        Q18: '',
        Q19: '',
        Q20: '',
        Q21: ''
      },
      4: {
        Q22: '',
        Q23: '',
        Q24: '',
        Q25: '',
        Q26: '',
        Q27: '',
        Q28: ''
      },
      5: {
        Q29: '',
        Q30: '',
        Q31: '',
        Q32: '',
        Q33: '',
        Q34: '',
        Q35: ''
      },
      6: {
        Q36: '',
        Q37: '',
        Q38: '',
        Q39: '',
        Q40: '',
        Q41: '',
        Q42: ''
      },
      7: {
        Q43: '',
        Q44: '',
        Q45: '',
        Q46: '',
        Q47: '',
        Q48: '',
        Q49: ''
      }
    }
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
  var connection = new WebSocket('ws://127.0.0.1:1337')


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
    console.log(json)

    if (json.Type === 'Auth') {
      console.log('here')
      if (json.Data === 'Accepted') {
        console.log(' and here')
        $('#authModal').modal('hide')
        console.log('Authentication Success')
      } else {
        $('#authfail').css('visibility', 'visible')
        console.log('Authentication Failed')
      }
    };

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
      const j = ((section - 1) * 7) + (i + 1)
      const v = 'Q' + j
      const p = '#' + v
      data.TrivSections[section][v] = $(p).val()
      $(p).attr('disabled', 'disabled')
      // console.log(data.TrivSections[1][v]);
    }

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
