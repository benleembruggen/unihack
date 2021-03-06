const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const { callFoodApi } = require('../utils/foodApi');
const Item = require('../models/Item');

const cartRouter = express.Router();

cartRouter.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findById({ _id: req.user._id })
      .populate('cart')
      .exec((err, document) => {
        if (err)
          res.status(500).json({
            message: { msgBody: 'Error fetching cart', msgError: true },
          });
        else {
          res.status(200).json({ cart: document.cart, authenticate: true });
        }
      });
  }
);

cartRouter.post(
  '/item',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { name, quantity: stringQuantity, measure } = req.body;
    const quantity = parseFloat(stringQuantity);

    const { cart } = await User.findById({ _id: req.user._id }).populate(
      'cart'
    );

    const { hints } = await callFoodApi('food', { ingr: name });
    if (hints.length === 0) {
      res.status(500).json({
        message: { msgBody: "Can't find item", msgError: true },
      });
      return;
    }
    if (hints.length > 1) {
      console.warn('More than one food returned, just using the first one');
    }

    const { foodId, label } = hints[0].food;
    const { measures } = hints[0];

    const duplicateItem = cart.find(
      ({ name: existingItemName }) => label === existingItemName
    );

    if (duplicateItem && duplicateItem.preferredMeasure === measure) {
      await Item.findByIdAndUpdate(duplicateItem._id, {
        quantity: duplicateItem.quantity + quantity,
      });
      res.status(200).json({
        message: {
          msgBody: 'Successfully updated item',
          msgError: false,
        },
      });
      return;
    }

    const measureInfo = measures.find(({ label }) => label === measure);

    if (!measureInfo) throw new Error('Invalid measure provided');

    const itemData = {
      name: label,
      foodId,
      quantity,
      preferredMeasure: measure,
      weightPerMeasure: measureInfo.weight,
      img: `https://spoonacular.com/cdn/ingredients_100x100/${label.toLowerCase()}.jpg`,
    };

    const item = new Item(itemData);
    item.save((err) => {
      if (err)
        res.status(500).json({
          message: { msgBody: 'Error has occurred 1', msgError: true },
        });
      else {
        req.user.cart.push(item);
        req.user.save((err) => {
          if (err)
            res.status(500).json({
              message: { msgBody: 'Error has occurred 2', msgError: true },
            });
          else
            res.status(200).json({
              message: {
                msgBody: 'Successfully added item',
                msgError: false,
              },
            });
        });
      }
    });
  }
);

module.exports = cartRouter;
