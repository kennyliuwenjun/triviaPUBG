const moment = require('moment');
const _ = require('underscore')


const generateMessage = (from, text, admin, gg) => {
  return {
    from,
    text,
    admin,
    gg,
    createdAt: moment().valueOf()
  };
};

const generateLocationMessage = (from, latitude, longitude) => {
  return {
    from,
    url: `https://www.google.com/maps?q=${latitude},${longitude}`,
    createdAt: moment().valueOf()
  };
};

const generateButtonMessage = (data,ready) => {
  return {
    ready,
    answers: _.shuffle([...data.results[0].incorrect_answers, data.results[0].correct_answer]),
    createdAt: moment().valueOf()
  }
}

module.exports = {generateMessage, generateLocationMessage, generateButtonMessage};
