const express = require('express');
const router = express.Router();
const Usercontrollers = require('../controllers/controller.js');
const { catchErrors } = require('../errorhandlers');
router.post('/AddTuna',catchErrors(Usercontrollers.AddTuna));
router.post('/GetTuna',catchErrors(Usercontrollers.GetTuna));
router.post('/QueryTuna',catchErrors(Usercontrollers.QueryTuna));
router.post('/ChangeHolder',catchErrors(Usercontrollers.ChangeHolder));
router.post('/RegisterAdmin',catchErrors(Usercontrollers.RegisterAdmin));
router.post('/RegisterUser',catchErrors(Usercontrollers.RegisterUser));
router.post('/UserLogin',catchErrors(Usercontrollers.UserLogin));
module.exports = router ;