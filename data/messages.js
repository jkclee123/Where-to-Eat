module.exports = [
  {
    _id: Math.round(Math.random() * 1000000),
    text: 'Hi I am WhereToEat, your personal resturant search assistant.\nDo you know what resturant you are looking for?',
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
