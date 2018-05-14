module.exports = [
  {
    _id: Math.round(Math.random() * 1000000),
    text: 'In which district you are looking for a resturant?',
    createdAt: new Date(),
    user: {
      _id: 2,
      name: 'RChat Bot',
    },
    sent: true,
    received: true,
    // location: {
    //   latitude: 48.864601,
    //   longitude: 2.398704
    // }
  },
  {
    _id: Math.round(Math.random() * 1000000),
    text: 'I can help you search for resturant based on your preferences and calorie intake target. So you can stay healthy :)',
    createdAt: new Date(),
    user: {
      _id: 2,
      name: 'Chat Bot',
    },
    sent: true,
    received: true,
    // location: {
    //   latitude: 48.864601,
    //   longitude: 2.398704
    // },
  },
  {
    _id: Math.round(Math.random() * 1000000),
    text: 'Hi I am WhereToEat, your personal resturant search assistant.',
    createdAt: new Date(),
    user: {
      _id: 2,
      name: 'Chat Bot',
    },
    sent: true,
    received: true,
    // location: {
    //   latitude: 48.864601,
    //   longitude: 2.398704
    // },
  }

];
