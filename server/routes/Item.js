
const { callFoodApi } = require('../utils/foodApi');
const express = require('express');
const passport = require('passport');


const itemRouter = express.Router();

itemRouter.get(
  '/suggest',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { name } = req.query;
    const { hints } = await callFoodApi('food', { ingr: name });
    // We need return the preferred measures here too.
    res.json(hints);
  }
);


module.exports = itemRouter;
