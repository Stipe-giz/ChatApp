const CLIENT_ID = 'iCfWgj3Gath60D8I'

const drone = new ScaleDrone(CLIENT_ID, {
  data: {
    name: getRandomName(),
    color: getRandomColor(),
  },
})

let members = []

drone.on('open', error => {
  if (error) {
    return console.error(error)
  }
  console.log('Successfully connected to Scaledrone')

  const room = drone.subscribe('observable-room')
  room.on('open', error => {
    if (error) {
      return console.error(error)
    }
    console.log('Successfully joined room')
  })

  room.on('members', m => {
    members = m
    updateMembersDOM()
  })

  room.on('member_join', member => {
    members.push(member)
    updateMembersDOM()
  })

  room.on('member_leave', ({ id }) => {
    const index = members.findIndex(member => member.id === id)
    members.splice(index, 1)
    updateMembersDOM()
  })

  room.on('data', (text, member) => {
    if (member) {
      addMessageToListDOM(text, member)
    } else {
    }
  })
})

drone.on('close', event => {
  console.log('Connection was closed', event)
})

drone.on('error', error => {
  console.error(error)
})

function getRandomName() {
  const adjs = ['autumn', 'hidden', 'misty', 'silent', 'summer', 'delicate', 'quiet', 'white', 'cool', 'spring']
  const nouns = ['waterfall', 'river', 'breeze', 'moon', 'rain', 'wind', 'sea', 'morning', 'snow', 'lake']
  return adjs[Math.floor(Math.random() * adjs.length)] + '_' + nouns[Math.floor(Math.random() * nouns.length)]
}

function getRandomColor() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16)
}

const DOM = {
  membersCount: document.querySelector('.members-count'),
  membersList: document.querySelector('.members-list'),
  messages: document.querySelector('.messages'),
  input: document.querySelector('.message-form__input'),
  form: document.querySelector('.message-form'),
}

DOM.form.addEventListener('submit', sendMessage)

function sendMessage() {
  const value = DOM.input.value
  if (value === '') {
    return
  }
  DOM.input.value = ''
  drone.publish({
    room: 'observable-room',
    message: value,
  })
}

function createMemberElement(member) {
  const { name, color } = member.clientData
  const el = document.createElement('div')
  el.appendChild(document.createTextNode(name))
  el.className = 'member'
  el.style.color = color
  return el
}

function updateMembersDOM() {
  DOM.membersCount.innerText = `${members.length} users in room:`
  DOM.membersList.innerHTML = ''
  members.forEach(member => DOM.membersList.appendChild(createMemberElement(member)))
}

function createMessageElement(text, member) {
  const el = document.createElement('div')
  el.appendChild(createMemberElement(member))
  el.appendChild(document.createTextNode(text))
  el.className = 'message'
  return el
}

function addMessageToListDOM(text, member) {
  const el = DOM.messages
  const wasTop = el.scrollTop === el.scrollHeight - el.clientHeight
  el.appendChild(createMessageElement(text, member))
  if (wasTop) {
    el.scrollTop = el.scrollHeight - el.clientHeight
  }
}
