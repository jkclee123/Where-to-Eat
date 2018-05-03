module.exports = [
  {
    _id: Math.round(Math.random() * 1000000),
    text: 'Hi I am WhereToEat, your personal resturant search assistant.',
    createdAt: new Date(),
    user: {
      _id: 2,
      name: 'React Native',
    },
    sent: true,
    received: true,
    // location: {
    //   latitude: 48.864601,
    //   longitude: 2.398704
    // },
  }
];
